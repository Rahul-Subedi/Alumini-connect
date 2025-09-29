// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // This transporter configuration is updated for production reliability.
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,      // Correct port for secure SMTP
        secure: true,   // Use SSL/TLS
        auth: {
            user: process.env.EMAIL_USER, // Your email from .env
            pass: process.env.EMAIL_PASS, // Your 16-digit Google App Password from .env
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