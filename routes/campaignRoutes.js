// routes/campaignRoutes.js
const express = require('express');
const router = express.Router();
const { getAllCampaigns } = require('../controllers/campaignController');

// This route is public for anyone to see the campaigns
router.get('/', getAllCampaigns);

module.exports = router;