// routes/alumniRoutes.js
const express = require('express');
const router = express.Router();
const { searchAlumni } = require('../controllers/alumniController');

// MODIFIED: The route is now simply '/'
// The full path will be '/api/alumni' because of how it's used in server.js
router.get('/', searchAlumni);

module.exports = router;