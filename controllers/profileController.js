// controllers/profileController.js
const User = require('../models/User');

// @desc    Display the logged-in user's own profile page
// @route   GET /profile
const viewMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).select('-password');
        if (user) {
            res.render('profile', { isLoggedIn: true, user: user, profileUser: user });
        } else {
            res.redirect('/login');
        }
    } catch (err) {
        console.error("Error fetching own profile:", err);
        res.redirect('/login');
    }
};

// @desc    Display another user's profile page
// @route   GET /profile/:id
const viewUserProfile = async (req, res) => {
    try {
        const profileUser = await User.findById(req.params.id).select('-password');
        const currentUser = await User.findById(req.session.userId).select('-password');
        
        if (!profileUser) {
            return res.status(404).send('User not found');
        }
        res.render('profile', { isLoggedIn: true, user: currentUser, profileUser: profileUser });
    } catch (err) {
        console.error("Error fetching other user's profile:", err);
        res.redirect('/search');
    }
};

// @desc    Update user profile information
// @route   POST /profile/update
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (user) {
            user.name = req.body.name || user.name;
            user.location = req.body.location || user.location;
            user.job_title = req.body.job_title || user.job_title;
            user.current_company = req.body.current_company || user.current_company;
            user.linkedin_url = req.body.linkedin_url || user.linkedin_url;
            user.contact = req.body.contact || user.contact;
            user.bio = req.body.bio || user.bio;
            await user.save();
            res.redirect("/profile");
        } else {
            res.status(404).send("User not found");
        }
    } catch (err) {
        res.status(500).send("Error updating profile.");
    }
};

// @desc    Update user profile picture
// @route   POST /profile/picture
const updateProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.redirect('/profile');
        }
        const user = await User.findById(req.session.userId);
        if (user) {
            // Assuming req.file.path is the URL from Cloudinary
            user.profilePictureUrl = req.file.path; 
            await user.save();
            res.redirect('/profile');
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        res.status(500).send("Error updating profile picture.");
    }
};

// START: New function to add experience
const addExperience = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (user) {
            const newExperience = {
                company_name: req.body.company_name,
                job_title: req.body.job_title,
                start_date: req.body.start_date,
                end_date: req.body.end_date || null
            };
            user.past_companies.push(newExperience);
            await user.save();
            res.redirect('/profile');
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        console.error("Error adding experience:", error);
        res.status(500).send("Error adding experience.");
    }
};
// END: New function to add experience

// START: New function to delete experience
const deleteExperience = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (user) {
            // Pull the experience sub-document from the array
            user.past_companies.pull({ _id: req.params.exp_id });
            await user.save();
            res.redirect('/profile');
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        console.error("Error deleting experience:", error);
        res.status(500).send("Error deleting experience.");
    }
};
// END: New function to delete experience


module.exports = {
    viewMyProfile,
    viewUserProfile,
    updateUserProfile,
    updateProfilePicture,
    addExperience,    // Export new function
    deleteExperience  // Export new function
};