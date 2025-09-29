// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", // Or your email provider's SMTP server
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER, // Your email from .env file
            pass: process.env.EMAIL_PASS, // Your email password or app password from .env
        },
    });

    const mailOptions = {
        from: `Alumni Connect <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;