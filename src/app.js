const express = require('express');
const cors = require('cors');

const app = express();

// --- Middleware ---
// Allow requests from the frontend
app.use(cors());
// Parse request body as JSON
app.use(express.json());

// --- Routes ---
// Root route
app.get('/', (req, res) => {
  res.send('YasuiPractice API Server is running!');
});

// API routes for quiz functionality
const quizRoutes = require('./routes/quiz');
app.use('/api/quiz', quizRoutes);

module.exports = app;
