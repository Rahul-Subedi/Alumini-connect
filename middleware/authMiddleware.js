// middleware/authMiddleware.js
const User = require('../models/User');

const requireAdmin = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/login');
        }
        const user = await User.findById(req.session.userId);
        if (user && user.role === 'admin') {
            next();
        } else {
            res.status(403).send("Access Denied: You do not have permission to view this page.");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    res.redirect('/login');
};

module.exports = { requireAdmin, isAuthenticated };