const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false,
    },
    passwordChangedAt: Date,
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            //This only works on CREATE AND SAVE!!!
            validator: function (value) {
                return value === this.password;
            },
            message: 'Passwords do not match',
        },
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre('save', async function (next) {
    // Only run this function if password is modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000
    next()
})

userSchema.pre(/^find/, function (next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
})

// Define a method on the user schema to check if the candidate password matches the stored user password
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    // Compare the candidate password with the stored user password hashed and stored in the database.
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        // Convert passwordChangedAt timestamp from milliseconds to seconds for comparison
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        return JWTTimestamp < changedTimestamp;
    }
    // False means not changed
    return false;
};

/*
 * Create a password reset token for the user
 * Generate a random token, hash it, and set the expiration time
 * Returns the unhashed reset token for further processing
 */
userSchema.methods.createPasswordResetToken = function () {
    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the reset token using sha256 algorithm
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // console.log({ resetToken }, this.passwordResetToken);

    // Set the expiration time for the password reset token
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    // Return the unhashed reset token
    return resetToken;
};

// Implement the comparison logic using bcrypt.compare()
const User = mongoose.model('User', userSchema);

module.exports = User;
