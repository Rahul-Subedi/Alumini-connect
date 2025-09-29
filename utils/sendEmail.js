const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    console.log('--- Attempting to send email ---');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Loaded' : 'MISSING!');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Loaded' : 'MISSING!');

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,      // Using the alternative secure port
        secure: false,  // This must be false for port 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        await transporter.verify();
        console.log('Nodemailer transporter is verified and ready to send emails.');
    } catch (error) {
        console.error('Nodemailer transporter verification failed:', error);
        throw new Error('Email transporter verification failed. Check credentials and server network rules.');
    }

    const mailOptions = {
        from: `Alumni Connect <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully! Message ID:', info.messageId);
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
};

module.exports = sendEmail;