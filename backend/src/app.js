const express = require('express');
const app = express();
require('dotenv').config();
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');
const cors = require('cors');


// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'https://memora-ai.netlify.app' || 'http://localhost:5173',
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

module.exports = app;