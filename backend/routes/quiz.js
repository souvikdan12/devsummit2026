const express = require('express');
const router = express.Router();
const { generateJSON } = require('../services/geminiService');
const prompts = require('../services/promptBuilder');

// POST /api/quiz/generate - Generate MCQ questions (Feature 2)
router.post('/generate', async (req, res) => {
  try {
    const { skills, count = 10, difficulty = 'mixed' } = req.body;

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ error: 'skills array is required' });
    }

    const prompt = prompts.quizGeneration(skills, count, difficulty);
    const result = await generateJSON(prompt);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: 'Quiz generation failed: ' + error.message });
  }
});

module.exports = router;
