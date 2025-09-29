// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    institute: { type: String, required: true },
    batch: { type: String, required: true },
    contact: { type: String, required: true },
    // MODIFIED: Added 'admin' to the list of allowed roles
    role: { 
      type: String, 
      enum: ['alumni', 'student', 'admin'], 
      required: true 
    },
    branch: { type: String },
    location: { type: String },
    bio: { type: String },
    job_title: { type: String },
    current_company: { type: String },
    past_companies: [{
        company_name: String,
        job_title: String,
        start_date: Date,
        end_date: Date,
      }],
    linkedin_url: { type: String },
    github_url: { type: String },
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    profilePictureUrl: {
        type: String,
        default: ''
    },
    verification: {
        status: {
            type: String,
            enum: ['pending_email', 'pending_approval', 'verified', 'rejected'],
            default: 'pending_email'
        },
        otp: { type: String },
        otpExpires: { type: Date },
        documentUrl: { type: String }
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});
 
// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;