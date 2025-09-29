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
    const userExists = await User.findOne({ email });
    if (userExists && userExists.verification.status === 'verified') {
      return res.render('login', { error: 'A verified user with this email already exists.' });
    }

    let user = userExists || new User({ email });

    user.set({ name, password, institute, role, batch, contact });
    user.verification = {
        status: 'pending_email',
        otp: crypto.randomInt(100000, 999999).toString(),
        otpExpires: Date.now() + 10 * 60 * 1000
    };
    await user.save();
    
    const message = `Your verification code is: ${user.verification.otp}`;
    await sendEmail({ email: user.email, subject: 'Alumni Connect - Email Verification', message });

    res.redirect(`/verify?email=${encodeURIComponent(user.email)}`);
  } catch (error) {
    console.error('Registration Error:', error);
    res.render('login', { error: 'Could not send verification email. Please check server credentials.' });
  }
};

// ADDED: Path 2: Register with personal email and document
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
            name,
            email, // Personal email
            password,
            institute,
            batch,
            branch,
            contact,
            role: 'alumni', // This path is only for alumni
            verification: {
                status: 'pending_approval',
                documentUrl: req.file.path // URL from Cloudinary
            }
        });
        await user.save();

        // Redirect to a success/pending page (we can create this later)
        res.send('<h1>Thank you!</h1><p>Your registration has been submitted and is pending admin approval. You will be notified via email once your account is verified.</p><a href="/login">Back to Login</a>');

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
        res.render('verify', { email, error: 'An server error occurred.' });
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
              errorMsg = 'Please verify your email with the OTP.';
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