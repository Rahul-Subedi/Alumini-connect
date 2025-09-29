// controllers/donationController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Campaign = require('../models/campaignModel');
const Donation = require('../models/donationModel');

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay order
// @route   POST /api/donations/order
const createOrder = async (req, res) => {
    try {
        const options = {
            amount: Number(req.body.amount * 100), // amount in the smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_order_${new Date().getTime()}`
        };
        const order = await instance.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Razorpay order creation error:", error);
        res.status(500).send("Server Error");
    }
};

// @desc    Verify the payment signature and save the donation
// @route   POST /api/donations/verify
const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, campaignId, amount } = req.body;
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        // Payment is authentic, now save it to the database
        await Donation.create({
            amount,
            campaign: campaignId,
            donor: req.session.userId,
            razorpay: {
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature
            }
        });

        // Also update the campaign's raised amount and donor count
        await Campaign.findByIdAndUpdate(campaignId, {
            $inc: { raised: Number(amount), donors: 1 }
        });

        res.json({ message: "Payment successful and verified!" });
    } else {
        res.status(400).json({ message: "Payment verification failed." });
    }
};

module.exports = { createOrder, verifyPayment };