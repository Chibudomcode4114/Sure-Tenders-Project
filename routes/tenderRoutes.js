const express = require('express');
const tenderController = require('../controllers/tenderController');
const authController = require('../controllers/authController');
// const reviewController = require('./../controllers/reviewController')
const reviewRouter = require('./reviewRoutes')

const router = express.Router();

// router.param('id', tenderController.checkID)

// POST /tender/234fad4/reviews
// GET /tender/234fad4/reviews

// router
//   .route('/:tenderId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   )

router.use('/:tenderId/reviews', reviewRouter)

router
  .route('/top-5-cheap')
  .get(tenderController.aliasTopTenders, tenderController.getAllTenders);

router.route('/tender-stats').get(tenderController.getTenderStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tenderController.getMonthlyPlan
  );

router
  .route('/tenders-location/:distance/center/:latlng/unit/:unit',)
  .get(tenderController.getTendersWithin)

router
  .route('/distances/:latlng/unit/:unit')
  .get(tenderController.getDistances)

router
  .route('/')
  .get(tenderController.getAllTenders)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tenderController.createTender
  );

router
  .route('/:id')
  .get(tenderController.getTender)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tenderController.updateTender
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tenderController.deleteTender
  );



module.exports = router;
