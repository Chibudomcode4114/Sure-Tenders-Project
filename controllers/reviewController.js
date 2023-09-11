const Review = require('./../models/reviewModel')
// const catchAsync = require('./../utils/catchAsync');
// const AppError = require('./../utils/appError');
const factory = require('./../controllers/handlerFactory')

exports.setTenderUserIds = (req, res, next) => {
    // Allow nested routes
    if (!req.body.tender) req.body.tender = req.params.tenderId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);