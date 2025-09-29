// utils/sendEmail.js
const sgMail = require('@sendgrid/mail');

// Set the API key from your environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (options) => {
    // Construct the email message
    const msg = {
        to: options.email,
        from: {
            name: 'Alumni Connect',
            email: process.env.EMAIL_USER // Your verified sender email
        },
        subject: options.subject,
        text: options.message,
    };

    try {
        console.log('--- Attempting to send email via SendGrid ---');
        await sgMail.send(msg);
        console.log('Email sent successfully via SendGrid!');
    } catch (error) {
        console.error('Error sending email via SendGrid:', error);
        // This helps debug if the error is from SendGrid's side
        if (error.response) {
            console.error(error.response.body)
        }
        throw new Error('Failed to send email.');
    }
};

module.exports = sendEmail;