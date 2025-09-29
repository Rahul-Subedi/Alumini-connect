// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', {
    expiresIn: '30d',
  });
};

// Path 1: Register with institute email and OTP
const registerUser = async (req, res) => {
  const { name, email, password, institute, role, batch, contact } = req.body;
  try {
    let user = await User.findOne({ email });

    // Case 1: User exists and is already verified
    if (user && user.verification.status === 'verified') {
      return res.render('login', { error: 'A verified user with this email already exists.' });
    }

    // Case 2: User does not exist, so create a new one
    if (!user) {
      user = new User({ email });
    }

    // Prepare user data but DO NOT save yet
    user.set({ name, password, institute, role, batch, contact });
    const otp = crypto.randomInt(100000, 999999).toString();
    user.verification = {
        status: 'pending_email',
        otp: otp,
        otpExpires: Date.now() + 10 * 60 * 1000 // OTP expires in 10 minutes
    };
    
    const message = `Your verification code is: ${user.verification.otp}`;
    
    // --- START: CRITICAL LOGIC CHANGE ---
    // First, try to send the email.
    await sendEmail({ email: user.email, subject: 'Alumni Connect - Email Verification', message });
    
    // Only if the email is sent successfully, save the user to the database.
    await user.save();
    
    // Then, redirect to the OTP verification page.
    res.redirect(`/verify?email=${encodeURIComponent(user.email)}`);
    // --- END: CRITICAL LOGIC CHANGE ---

  } catch (error) {
    // This will now catch the email failure and show a clear error to the user without saving the user.
    console.error('Registration Error:', error);
    res.render('login', { error: 'Could not send verification email. Please check your credentials and Google Account security settings.' });
  }
};

// Path 2: Register with personal email and document
const registerWithDocument = async (req, res) => {
    const { name, email, password, institute, batch, branch, contact } = req.body;
    try {
        if (!req.file) {
            return res.render('register-document', { error: 'Verification document is required.' });
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.render('register-document', { error: 'A user with this email already exists.' });
        }
        const user = new User({
            name, email, password, institute, batch, branch, contact,
            role: 'alumni',
            verification: {
                status: 'pending_approval',
                documentUrl: req.file.path
            }
        });
        await user.save();
        res.send('<h1>Thank you!</h1><p>Your registration is pending admin approval. You will be notified via email.</p><a href="/login">Back to Login</a>');
    } catch (error) {
        console.error('Document Registration Error:', error);
        res.render('register-document', { error: 'An error occurred during registration.' });
    }
};

const verifyUser = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({
            email,
            'verification.otp': otp,
            'verification.otpExpires': { $gt: Date.now() }
        });
        if (!user) {
            return res.render('verify', { email, error: 'Invalid or expired OTP.' });
        }
        user.verification.status = 'verified';
        user.verification.otp = undefined;
        user.verification.otpExpires = undefined;
        await user.save();
        req.session.userId = user._id;
        res.redirect('/profile');
    } catch (error) {
        res.render('verify', { email, error: 'A server error occurred.' });
    }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.verification.status !== 'verified') {
          let errorMsg = 'Your account is not verified.';
          if (user.verification.status === 'pending_approval') {
              errorMsg = 'Your account is pending admin approval.';
          } else if (user.verification.status === 'pending_email') {
              res.redirect(`/verify?email=${encodeURIComponent(user.email)}`);
              return;
          }
          return res.render('login', { error: errorMsg });
      }
      
      req.session.userId = user._id;
      
      if (user.role === 'admin') {
          res.redirect('/admin/dashboard');
      } else {
          res.redirect('/profile');
      }
    } else {
      res.render('login', { error: 'Invalid email or password' });
    }
  } catch (error) {
    res.render('login', { error: 'An error occurred' });
  }
};

module.exports = { registerUser, verifyUser, loginUser, registerWithDocument };