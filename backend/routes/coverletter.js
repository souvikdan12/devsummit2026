const express = require('express');
const router = express.Router();
const { generateText } = require('../services/geminiService');
const prompts = require('../services/promptBuilder');

// POST /api/coverletter - Generate cover letter (Feature 7)
router.post('/', async (req, res) => {
  try {
    const { resume_text, desired_role, company_name, company_type, job_role, job_description } = req.body;

    if (!resume_text || !desired_role || !company_name) {
      return res.status(400).json({ error: 'resume_text, desired_role, and company_name are required' });
    }

    const prompt = prompts.coverLetter(
      resume_text,
      desired_role,
      company_name,
      company_type || 'Product-based',
      job_role || '',
      job_description || ''
    );
    const result = await generateText(prompt);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Cover letter error:', error);
    res.status(500).json({ error: 'Cover letter generation failed: ' + error.message });
  }
});

module.exports = router;
