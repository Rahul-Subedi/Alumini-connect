// routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const { 
    viewMyProfile,
    viewUserProfile,
    updateUserProfile, 
    updateProfilePicture,
    addExperience,      // Import new function
    deleteExperience    // Import new function
} = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');

// All routes in this file require a user to be logged in
router.use(isAuthenticated);

// GET route to view the logged-in user's own profile
router.get('/', viewMyProfile);

// GET route to view another user's profile
router.get('/:id', viewUserProfile);

// POST route to handle profile information update
router.post("/update", updateUserProfile);

// POST route to handle profile picture upload
router.post("/picture", upload.single('profilePicture'), updateProfilePicture);

// START: New route to add an experience
router.post('/experience', addExperience);
// END: New route to add an experience

// START: New route to delete an experience
router.post('/experience/delete/:exp_id', deleteExperience);
// END: New route to delete an experience

module.exports = router;