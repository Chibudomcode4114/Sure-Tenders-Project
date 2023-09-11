const AppError = require('../utils/appError');
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync');
const factory = require('./../controllers/handlerFactory')

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Crreate error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError(`This route is not for password Updates. Please use /updateMyPassword`, 400));
    }

    //2) Filter out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    // 3) Update user documents
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })

    res.status(204).json({
        status: 'success',
        data: null
    })
})

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//     const users = await User.find();

//     // SEND QUERY
//     res.status(200).json({
//         status: 'success',
//         results: users.length,
//         data: {
//             users
//         }
//     })
// })

// exports.getUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'Route not yet defined'
//     })
// }

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please use /signup instead'
    });
};

// Sign-Up Controller(Added by me)
exports.getSignupForm = (req, res) => {
    res.status(200).render('signup', {
        title: 'Create an account'
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body;

    // Create a new user in the database
    const newUser = await User.create({ name, email, password });

    // Optionally, you might want to log the user in automatically after signup

    res.status(201).render('account', {
        title: 'Your account',
        user: newUser
    });
    console.log(newUser)
    // Redirect the user to their dashboard
    res.redirect('/login'); // Replace with your actual dashboard route
});


exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
// Do not Update passwords with dis
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)