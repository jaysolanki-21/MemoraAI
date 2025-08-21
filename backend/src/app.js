const express = require('express');
const app = express();
require('dotenv').config();
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');


// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);


module.exports = app;