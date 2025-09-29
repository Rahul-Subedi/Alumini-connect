// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboard, approveUser, rejectUser } = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/authMiddleware');

// All routes in this file are protected and require admin access
router.use(requireAdmin);

// @desc    Display the main admin dashboard
// @route   GET /admin/dashboard
router.get('/dashboard', getDashboard);

// @desc    Approve a pending user
// @route   POST /admin/users/approve/:id
router.post('/users/approve/:id', approveUser);

// @desc    Reject a pending user
// @route   POST /admin/users/reject/:id
router.post('/users/reject/:id', rejectUser);

module.exports = router;