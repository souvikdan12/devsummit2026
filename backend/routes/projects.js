const express = require('express');
const router = express.Router();
const { generateJSON } = require('../services/geminiService');
const prompts = require('../services/promptBuilder');

// POST /api/projects - Get project suggestions (Feature 8)
router.post('/', async (req, res) => {
  try {
    const { resume_text, desired_role, missing_skills } = req.body;

    if (!resume_text || !desired_role) {
      return res.status(400).json({ error: 'resume_text and desired_role are required' });
    }

    const prompt = prompts.projectSuggestions(
      resume_text,
      desired_role,
      missing_skills || []
    );
    const result = await generateJSON(prompt);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Project suggestions error:', error);
    res.status(500).json({ error: 'Project suggestions failed: ' + error.message });
  }
});

module.exports = router;
