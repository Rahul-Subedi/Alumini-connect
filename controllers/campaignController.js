// controllers/campaignController.js
const Campaign = require('../models/campaignModel');

// @desc    Fetch all active campaigns
// @route   GET /api/campaigns
const getAllCampaigns = async (req, res) => {
    console.log("[DEBUG] The '/api/campaigns' route was hit. Executing getAllCampaigns function...");
    try {
        const query = { isActive: true };
        console.log("[DEBUG] Executing database query:", query);
        
        const campaigns = await Campaign.find(query).sort({ createdAt: -1 });
        
        console.log(`[DEBUG] Query finished. Found ${campaigns.length} campaigns.`);
        
        res.json(campaigns);
    } catch (error) {
        console.error("[DEBUG] An error occurred in the campaign controller:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAllCampaigns
};