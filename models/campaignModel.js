// models/campaignModel.js
const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Academic', 'Development', 'Social']
    },
    image: {
        type: String, // We'll store the image URL here
        required: true
    },
    goal: {
        type: Number,
        required: true
    },
    raised: {
        type: Number,
        default: 0
    },
    donors: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', campaignSchema);
module.exports = Campaign;