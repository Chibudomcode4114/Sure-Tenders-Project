const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Tender = require('./../../models/tenderModel')
const User = require('./../../models/userModel')
const Review = require('./../../models/reviewModel')

dotenv.config({ path: './config.env' })

const DB = process.env.DATABASE.replace('<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('DB connections Successful!!')
    });

// READ JSON FILE
const tenders = JSON.parse(fs.readFileSync(`${__dirname}/tenders.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'))

// IMPORT DATA INTO DB
const importData = async () => {
    try {
        await Tender.create(tenders)
        await User.create(users, { validateBeforeSave: false })
        await Review.create(reviews)
        console.log('Data Successfully Loaded!!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
}

// DELETE ALL DATA FROM DB
const deleteData = async () => {
    try {
        await Tender.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data Successfully deleted!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
}

if (process.argv[2] === '--import') {
    importData()
} else if (process.argv[2] === '--delete') {
    deleteData()
};
