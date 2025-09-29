// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Message = require('../models/Message');

// Middleware to ensure user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    res.status(401).json({ message: 'Not authenticated' });
};

router.use(isAuthenticated);

// GET /api/messages/threads
router.get('/threads', async (req, res) => {
    try {
        const userId = req.session.userId;
        const messages = await Message.find({ $or: [{ sender: userId }, { receiver: userId }]})
            .sort('timestamp').populate('sender receiver', 'name');
        
        const threads = {};
        messages.forEach(msg => {
            const partner = msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;
            if (partner) {
                threads[partner._id] = { partnerId: partner._id, partnerName: partner.name };
            }
        });
        res.json(Object.values(threads));
    } catch (err) { 
        console.error("Error fetching message threads:", err);
        res.status(500).json({ message: 'Server error.' }); 
    }
});

// ADDED: New route to get a list of users who have sent you messages
// GET /api/messages/senders
router.get('/senders', async (req, res) => {
    try {
        // Find all unique sender IDs from messages sent to the current user
        const senderIds = await Message.distinct('sender', { receiver: req.session.userId });
        res.json(senderIds);
    } catch (err) {
        console.error("Error fetching message senders:", err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/messages/:otherUserId
router.get('/:otherUserId', async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ sender: req.session.userId, receiver: req.params.otherUserId }, { sender: req.params.otherUserId, receiver: req.session.userId }]
        }).sort('timestamp');
        res.json(messages);
    } catch (err) { 
        console.error("Error fetching messages:", err);
        res.status(500).json({ message: 'Server error.' }); 
    }
});

module.exports = router;