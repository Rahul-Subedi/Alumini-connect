const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Log the credentials to make sure they are loaded correctly
    console.log('--- Attempting to send email ---');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Loaded' : 'MISSING!');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Loaded' : 'MISSING!');

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 2. Verify the connection and credentials
    try {
        await transporter.verify();
        console.log('Nodemailer transporter is verified and ready to send emails.');
    } catch (error) {
        console.error('Nodemailer transporter verification failed:', error);
        // Throw an error to stop the process if verification fails
        throw new Error('Email transporter verification failed. Check credentials and server network rules.');
    }

    const mailOptions = {
        from: `Alumni Connect <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // 3. Send the email and log the result
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully! Message ID:', info.messageId);
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error; // Re-throw the error to be caught by the controller
    }
};

module.exports = sendEmail;