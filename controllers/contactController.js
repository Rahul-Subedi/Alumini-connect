const ContactMessage = require('../models/ContactMessage');

const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please fill out all fields.' });
    }

    const newContactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    res.status(200).json({ message: 'Thank you for your message! We will get back to you soon.' });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
};

module.exports = { submitContactForm };
