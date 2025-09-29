// routes/donationRoutes.js
const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/donationController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// All donation routes require a user to be logged in
router.use(isAuthenticated);

router.post('/order', createOrder);
router.post('/verify', verifyPayment);

module.exports = router;