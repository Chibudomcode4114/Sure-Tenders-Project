const express = require('express')
const authController = require('../controllers/authController')
const viewsController = require('../controllers/viewsController')
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewsController.getOverview)

router.get('/tender/:slug', authController.isLoggedIn, viewsController.getTender)

router.get('/signup')
    .get(userController.getSignupForm)
    .post(userController.signup);


router.get('/login', authController.isLoggedIn, viewsController.getLoginForm)

router.get('/me', authController.protect, viewsController.getAccount);

router.post(
    '/submit-user-data',
    authController.protect,
    viewsController.updateUserData
);
module.exports = router