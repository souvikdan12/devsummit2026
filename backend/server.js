const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/analyze', require('./routes/analyze'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/compare', require('./routes/compare'));
app.use('/api/simulate', require('./routes/simulate'));
app.use('/api/coverletter', require('./routes/coverletter'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/resume', require('./routes/resume'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Resume Analyzer API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.log('\n⚠️  WARNING: GEMINI_API_KEY not configured in .env file');
    console.log('   Get your free key at: https://aistudio.google.com/\n');
  } else {
    console.log('✅ Gemini API key configured\n');
  }
});
