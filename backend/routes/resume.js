const express = require('express');
const router = express.Router();
const { generateJSON } = require('../services/geminiService');
const prompts = require('../services/promptBuilder');

// POST /api/resume - Generate ATS-friendly resume (Feature 9)
router.post('/', async (req, res) => {
  try {
    const { resume_text, target_role, company_name, company_type, job_description } = req.body;

    if (!resume_text || !target_role || !company_name) {
      return res.status(400).json({ error: 'resume_text, target_role, and company_name are required' });
    }

    const prompt = prompts.resumeBuilder(
      resume_text,
      target_role,
      company_name,
      company_type || 'Product-based',
      job_description || ''
    );
    const result = await generateJSON(prompt);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Resume builder error:', error);
    res.status(500).json({ error: 'Resume generation failed: ' + error.message });
  }
});

module.exports = router;
