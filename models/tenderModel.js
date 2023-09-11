const mongoose = require('mongoose')
const slugify = require('slugify')
// const validator = require('validator')
// const User = require('./userModel');



const tenderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tender Must Have a Name'],
        unique: true,
        trim: true,
        maxlength: [48, 'A Tender must have less or exactly 40 characters'],
        minlength: [6, 'A Tender name must have more or exactly 6 characters']
        // validate: [validator.isAlpha, 'Tender name must only contain characters'],
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, "Each Tender must have its Duration"]
    },
    maxGroupSize: {
        type: Number,
        required: [true, "You must state the number of people required"]
    },
    difficulty: {
        type: String,
        required: [true, "A tender must state its difficulty"],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0 '],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val = 10) / 10 //
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: [true, 'A tender must have price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                // This only point to current doc on the new document creation
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, "A tender must have a description"]
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, "A tender must have a cover image"]
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTender: {
        type: Boolean,
        default: false
    },
    startLocation: {
        // GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                description: String,
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides:
        [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            }
        ]
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

// tenderSchema.index({ price: 1 })
tenderSchema.index({ price: 1, ratingsAverage: -1 });
tenderSchema.index({ slug: 1 })
tenderSchema.index({ startLocation: '2dsphere' })

tenderSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
})

// tenderSchema.virtual('reviews', {
//     ref: 'Review'
// })

// Virtual Populate
tenderSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tender',
    localField: '_id'
})

// DOCUMENT MIDDLEWARE: only executes before .save() and .create()
tenderSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    // console.log(this);
    next()
});



// tenderSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// });

// tenderSchema.pre('save', function (next) {
//     console.log('Will save document...');
//     next();
// })

// tenderSchema.post('save', function (doc, next) {
//     console.log(doc);
//     next()
// })

// Query Middleware
tenderSchema.pre(/^find/, function (next) {
    this.find({ secretTender: { $ne: true } })

    this.start = Date.now()
    next()
});

tenderSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    })
    next()
})


tenderSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    next()
});


// AGGREGATION MIDDLEWARE
// tenderSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({ $match: { secretTender: { $ne: true } } })

//     console.log(this.pipeline())
//     next()
// })

const Tender = mongoose.model('Tender', tenderSchema)

module.exports = Tender;