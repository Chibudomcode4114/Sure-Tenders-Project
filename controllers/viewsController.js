const Tender = require('../models/tenderModel')
const catchAsync = require('../utils/catchAsync')
const User = require('../models/userModel');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res) => {
    //1) Get Tender data from collection
    const tenders = await Tender.find()

    // 2 Build template
    // 3 Render that template using tender data

    res.status(200).render('overview', {
        title: 'All Tenders',
        tenders
    })
})

exports.getTender = catchAsync(async (req, res, next) => {
    // 1) Get the data, for the requested tender (including reviews and guides)
    const tender = await Tender.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });



    if (!tender) {
        return next(new AppError('There is no tender with that name.', 404));
    }
    // 2) Build template

    // 3) Render template using data from 1)
    res.status(200).render('tender', {
        title: `${tender.name} tender`,
        tender
    })
})



exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account'
    });
};


exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account'
    });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            email: req.body.email
        },
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser
    });
});