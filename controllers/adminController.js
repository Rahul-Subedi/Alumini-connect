// controllers/adminController.js
const User = require('../models/User');

const getDashboard = async (req, res) => {
    try {
        const pendingUsers = await User.find({ 'verification.status': 'pending_approval' });
        res.render('admin_dashboard', { 
            user: req.session.user,
            pendingUsers: pendingUsers 
        });
    } catch (error) {
        console.error("Admin dashboard error:", error);
        res.status(500).send("Server Error");
    }
};

const approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user && user.verification.status === 'pending_approval') {
            user.verification.status = 'verified';
            await user.save();
        }
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error("User approval error:", error);
        res.redirect('/admin/dashboard');
    }
};

// MODIFIED: This function now deletes the user instead of marking them as rejected
const rejectUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user && user.verification.status === 'pending_approval') {
            // This will remove the user document from the database entirely
            await User.findByIdAndDelete(req.params.id);
        }
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error("User rejection error:", error);
        res.redirect('/admin/dashboard');
    }
};

module.exports = {
    getDashboard,
    approveUser,
    rejectUser
};