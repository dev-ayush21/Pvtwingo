require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
app.use(cors());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again after 15 minutes',
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API Routes ---
app.use('/auth', limiter, authRoutes); // Apply limiter to auth routes
app.use('/api', limiter, apiRoutes);   // Apply limiter to api routes

// --- Serve Frontend Pages ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// --- Server Startup ---
app.listen(PORT, () => {
    console.log(`🚀 VESHUxWINGO Predictor server running on http://localhost:${PORT}`);
});