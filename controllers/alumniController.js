// controllers/alumniController.js
const User = require('../models/User');

// @desc    Search for alumni with filters
// @route   GET /api/alumni
const searchAlumni = async (req, res) => {
  try {
    // MODIFIED: This now checks the correct verification status path
    const filter = {
        'verification.status': 'verified' // Checks for 'verified' status inside the 'verification' object
    };

    if (req.query.name) {
        filter.name = new RegExp(req.query.name, 'i'); // Case-insensitive search
    }
    if (req.query.institute) {
        filter.institute = req.query.institute;
    }
    if (req.query.branch) {
        filter.branch = req.query.branch;
    }
    if (req.query.batch) {
        filter.batch = req.query.batch;
    }
    if (req.query.current_company) {
        filter.current_company = new RegExp(req.query.current_company, 'i');
    }
    if (req.query.location) {
        filter.location = new RegExp(req.query.location, 'i');
    }

    const alumni = await User.find(filter).select('-password -verification -__v'); // Exclude sensitive fields
    res.status(200).json(alumni);

  } catch (error) {
    console.error('Alumni search error:', error);
    res.status(500).json({ message: 'Server error while searching for alumni.' });
  }
};

module.exports = { searchAlumni };