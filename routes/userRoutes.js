// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to ensure user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    res.status(401).json({ message: 'Not authenticated' });
};

router.use(isAuthenticated);

// GET /api/user/id
router.get('/id', (req, res) => {
    res.json({ userId: req.session.userId });
});

// GET /api/user/:id/details
router.get('/:id/details', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('name email linkedin_url');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) { 
        console.error("Error fetching user details:", err);
        res.status(500).json({ message: 'Server Error' }); 
    }
});

module.exports = router;