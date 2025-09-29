// routes/authRoutes.js
const express = require('express');
const router = express.Router();
// ADDED: Import the new controller and upload middleware
const { registerUser, loginUser, verifyUser, registerWithDocument } = require('../controllers/authController');
const upload = require('../config/cloudinary');

// @desc    Register a new user (via institute email & OTP)
// @route   POST /auth/register
router.post('/register', registerUser);

// ADDED: New route to handle document upload registration
// @desc    Register a new user (via document upload)
// @route   POST /auth/register-document
router.post('/register-document', upload.single('document'), registerWithDocument);

// @desc    Verify a new user (submits OTP)
// @route   POST /auth/verify
router.post('/verify', verifyUser);

// @desc    Login user
// @route   POST /auth/login
router.post('/login', loginUser);

module.exports = router;