const nodemailer = require('nodemailer')

const sendEmail = async options => {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        // host: "sandbox.smtp.mailtrap.io",
        host: process.env.EMAIL_HOST,
        // port: 2525,
        port: process.env.EMAIL_PORT,
        auth: {
            // user: "d5285e904fe978",
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
            // pass: "548c8add709e53"
        }
    });

    // 2) Define the Email option
    const mailOptions = {
        from: 'Chibudom Chibudom <uzo@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
        //HTML later
    }

    // 3) Actuall send the mail
    await transporter.sendMail(mailOptions)
};

module.exports = sendEmail;