// review/ rating / createdAt / ref to tender / ref to user
const mongoose = require('mongoose')
const Tender = require('./tenderModel')

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    // The 'tender' field stores the ID of the associated tender object.
    tender: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tender',
      required: [true, 'Review must belong to a tender']
    },
    // The 'user' field stores the ID of the associated user object.
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a User']
    },
    // These fields establish connections between the review and tender/user models.


  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// reviewSchema.index({ tender: 1, user: 1 }, { unique: true });
reviewSchema.index({ tender: 1, user: 1 }, { unique: true });


reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tender',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // })

  this.populate({
    path: 'user',
    select: 'name photo'
  })
  next()
})

reviewSchema.statics.calcAverageRatings = async function (tenderId) {
  const stats = await this.aggregate([
    // Aggregation Pipline
    {
      $match: { tender: tenderId }
    },
    {
      $group: {
        _id: '$tender',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  // console.log(stats);

  if (stats.length > 0) {
    await Tender.findByIdAndUpdate(tenderId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tender.findByIdAndUpdate(tenderId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.tender);
});

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  // console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tender);
});

reviewSchema.statics.calcAverageRatings = async function (tenderId) {
  const stats = await this.aggregate([
    {
      $match: { tender: tenderId }
    },
    {
      $group: {
        _id: `$tender`,
        nRating: { $sum: 1 },
        avgRating: { $avg: `$rating` }
      }
    }
  ])
  console.log(stats);
}

reviewSchema.post('save', function () {
  //  this points to the current review
  this.constructor.calcAverageRatings(this.tender);
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review;