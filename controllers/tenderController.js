const Tender = require('./../models/tenderModel')
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./../controllers/handlerFactory')

exports.aliasTopTenders = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next();
}


exports.getAllTenders = factory.getAll(Tender)
// exports.getAllTenders = catchAsync(async (req, res, next) => {
//     const features = new APIFeatures(Tender.find(), req.query)
//         .filter()
//         .sort()
//         .limitFields()
//         .paginate();
//     const tenders = await features.query;


//     // SEND QUERY
//     res.status(200).json({
//         status: 'success',
//         results: tenders.length,
//         data: {
//             tenders
//         }
//     })
// });

exports.getTender = factory.getOne(Tender, { path: 'reviews' })
// exports.getTender = catchAsync(async (req, res, next) => {
//     const tender = await Tender.findById(req.params.id).populate('reviews')
//     //  Tender.findone{_id: req.params.id};

//     if (!tender) {
//         return next(new AppError('No tender found with that ID', 404))
//     }

//     res.status(200).json({
//         status: 'success',
//         data: {
//             tender
//         }
//     })
// })


exports.createTender = factory.createOne(Tender)
// exports.createTender = catchAsync(async (req, res, next) => {
//     const newTender = await Tender.create(req.body);

//     res.status(201).json({
//         status: 'success',
//         data: {
//             tender: newTender
//         }
//     });
// })

exports.updateTender = factory.updateOne(Tender)
// exports.updateTender = catchAsync(async (req, res, next) => {
//     const tender = await Tender.findByIdAndUpdate(req.params.id);

//     if (!tender) {
//         return next(new AppError('No tender found with that ID', 404))
//     }

//     res.status(204).json({
//         status: 'success',
//         data: {
//             tender
//         }
//     });
// });


exports.deleteTender = factory.deleteOne(Tender)
// exports.deleteTender = catchAsync(async (req, res, next) => {
//     const tender = await Tender.findByIdAndDelete(req.params.id);

//     if (!tender) {
//         return next(new AppError('No tender found with that ID', 404))
//     }

//     res.status(204).json({
//         status: 'success',
//         data: null
//     })
// })

exports.getTenderStats = catchAsync(async (req, res, next) => {
    const stats = await Tender.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTenders: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
        // {
        //     $match: { _id: { $ne: 'EASY' } }
        // }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {

    const year = req.params.year * 1; // 2021

    const plan = await Tender.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTenderStarts: { $sum: 1 },
                tenders: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTenderStarts: -1 }
        },
        {
            $limit: 12
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });
});

// /tenders-within?distance=233&center=-40,45&unit=mi
// /tenders-within/233/center/-40,45/unit/mi
exports.getTendersWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        next(
            new AppError(
                'Please provide latitude and longitude in the format of : lat,lng.',
                400
            )
        )
    }

    const tenders = await Tender.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
        status: 'success',
        results: tenders.length,
        data: {
            data: tenders
        }
    })
})

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.00062137 : 0.001;

    if (!lat || !lng) {
        next(
            new AppError(
                'Please provide latitude and longitude in the format of : lat,lng.',
                400
            )
        )
    }

    const distances = await Tender.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    })
})
