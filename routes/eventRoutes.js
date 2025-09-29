const express = require("express");
const router = express.Router();
const Event = require("../models/eventModel");
const User = require("../models/User");

// Middleware to check if user is an admin
const requireAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.session.userId);
        if (user && user.role === 'admin') {
            next();
        } else {
            res.status(403).send("You do not have permission to view this page.");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

// GET route to show the form for creating an event (Admin only)
router.get("/create", requireAdmin, async (req, res) => {
    const user = await User.findById(req.session.userId);
    res.render("create_event", { user });
});

// POST route to handle new event creation (Admin only)
router.post("/create", requireAdmin, async (req, res) => {
    try {
        const { title, date, location, description } = req.body;
        const newEvent = new Event({
            title,
            date,
            location,
            description,
            createdBy: req.session.userId
        });
        await newEvent.save();
        res.redirect("/events");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating event. Please try again.");
    }
});

// GET route to display all events (Publicly viewable)
router.get("/", async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        let user = null;
        let isLoggedIn = false; // Define isLoggedIn here
        if (req.session.userId) {
            user = await User.findById(req.session.userId);
            if (user) {
                isLoggedIn = true; // Set isLoggedIn if a user is found
            }
        }
        res.render("events", { events, user, isLoggedIn }); // Pass isLoggedIn to the template
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching events. Please try again.");
    }
});

module.exports = router;
