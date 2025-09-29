// server.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/database');
const twilio = require('twilio');
const multer = require('multer');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ===================================
// Import Models and Middleware
// ===================================
const User = require('./models/User');
const Message = require('./models/Message');
const { isAuthenticated } = require('./middleware/authMiddleware');

// ===================================
// Import Routes
// ===================================
const authRoutes = require('./routes/authRoutes');
const alumniRoutes = require('./routes/alumniRoutes');
const profileRoutes = require('./routes/profileRoutes');
const contactRoutes = require('./routes/contactRoutes');
const eventRoutes = require("./routes/eventRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const donationRoutes = require("./routes/donationRoutes");

// Connect to the database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ===================================
// Middleware Setup
// ===================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// UPDATE THIS SESSION CONFIGURATION
app.set('trust proxy', 1); // IMPORTANT: Add this line for production
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallbacksecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URI 
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Multer Setup for file uploads (in memory) ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Gemini AI Setup ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// ===================================
// View Routes (EJS)
// ===================================

const renderAuthenticatedPage = async (req, res, viewName, data = {}) => {
    try {
        const user = await User.findById(req.session.userId).select('name email');
        res.render(viewName, { isLoggedIn: true, user, ...data });
    } catch (error) {
        console.error(`Error rendering page ${viewName}:`, error);
        res.redirect('/login');
    }
};

app.get('/', async (req, res) => {
  let isLoggedIn = false;
  let user = null;
  if (req.session.userId) {
    isLoggedIn = true;
    user = await User.findById(req.session.userId).select('name');
  }
  try {
    const stats = {
        alumniCount: await User.countDocuments({ 'verification.status': 'verified' }),
        instituteCount: 50,
        companyCount: 5000
    };
    res.render('index', { isLoggedIn, user, stats });
  } catch (error) {
      res.render('index', { isLoggedIn, user, stats: {} });
  }
});

app.get('/login', (req, res) => res.render('login', { error: null }));
app.get('/verify', (req, res) => {
    const email = req.query.email;
    if (!email) return res.redirect('/login');
    res.render('verify', { email, error: null });
});
app.get('/register-document', (req, res) => {
    res.render('register-document', { error: null });
});

app.get('/search', isAuthenticated, (req, res) => renderAuthenticatedPage(req, res, 'search'));
app.get('/contact', isAuthenticated, (req, res) => renderAuthenticatedPage(req, res, 'contact'));
app.get('/interview', isAuthenticated, (req, res) => renderAuthenticatedPage(req, res, 'video-interview'));
app.get('/messages', isAuthenticated, (req, res) => renderAuthenticatedPage(req, res, 'messages_list'));
app.get('/messages/:otherUserId', isAuthenticated, (req, res) => {
  renderAuthenticatedPage(req, res, 'messages', { otherUserId: req.params.otherUserId });
});
app.get('/giving-back', isAuthenticated, (req, res) => {
    renderAuthenticatedPage(req, res, 'giving-back', {
        razorpayKeyId: process.env.RAZORPAY_KEY_ID
    });
});

// Route to display the resume scanner page
app.get('/resume-scanner', isAuthenticated, (req, res) => {
  renderAuthenticatedPage(req, res, 'resume-scanner', { result: null });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// ===================================
// API and Feature Routes
// ===================================
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/contact', contactRoutes);
app.use('/events', eventRoutes);
app.use('/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/user', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRoutes);

// --- TWILIO VIDEO TOKEN ROUTE ---
app.post('/api/interview/token', isAuthenticated, async (req, res) => {
    const { roomName } = req.body;
    const user = await User.findById(req.session.userId).select('name');
    const identity = user ? user.name.replace(/\s/g, '_') : `User${req.session.userId}`;

    const AccessToken = twilio.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    const videoGrant = new VideoGrant({
        room: roomName,
    });

    const token = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY_SID,
        process.env.TWILIO_API_KEY_SECRET,
        { identity: identity }
    );

    token.addGrant(videoGrant);

    res.json({ token: token.toJwt() });
});

// --- AI RESUME SCANNER ROUTE ---
app.post('/api/scan-resume', isAuthenticated, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No resume file uploaded.');
        }

        const resumeData = await pdf(req.file.buffer);
        const resumeText = resumeData.text;
        const { jobDescription } = req.body;

        const prompt = `
            Analyze the following resume against the provided job description and act as an expert ATS (Applicant Tracking System).
            **Resume Text:** ${resumeText}
            **Job Description:** ${jobDescription}
            **Instructions:**
            1. Calculate an ATS compatibility score as a percentage (e.g., 85%). The score should reflect keyword matching, skills alignment, and overall fit.
            2. Provide a brief summary of the resume's strengths for this specific job.
            3. Provide a brief summary of areas for improvement to better match the job description.
            Return the response in a JSON format like this:
            { "score": 85, "strengths": "The resume strongly highlights experience in Node.js and database management, which are key requirements.", "improvements": "To improve, add more quantifiable results to project descriptions and include keywords like 'agile methodologies' from the job description." }
        `;
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const analysisResult = JSON.parse(text);

        await renderAuthenticatedPage(req, res, 'resume-scanner', { result: analysisResult });

    } catch (error) {
        console.error("DETAILED SCANNER ERROR:", error);
        await renderAuthenticatedPage(req, res, 'resume-scanner', {
            result: {
                score: 'Error',
                strengths: 'Could not analyze the resume.',
                improvements: 'There was an error processing your request. The AI may have been unable to parse the response into the correct format. Please try again.'
            }
        });
    }
});


// ===================================
// Socket.IO (Real-time Chat)
// ===================================
io.on('connection', (socket) => {
  socket.on('join', (userId) => socket.join(userId));
  socket.on('privateMessage', async ({ senderId, receiverId, content }) => {
    try {
      const message = new Message({ sender: senderId, receiver: receiverId, content });
      await message.save();
      io.to(receiverId).emit('privateMessage', message);
      io.to(senderId).emit('privateMessage', message);
    } catch (err) { console.error('Error saving message:', err); }
  });
});

// ===================================
// Error Handling
// ===================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// ===================================
// Server Start
// ===================================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);