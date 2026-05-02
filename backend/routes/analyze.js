const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { extractAndCleanup } = require('../services/pdfParser');
const { generateJSON } = require('../services/geminiService');
const prompts = require('../services/promptBuilder');

// POST /api/analyze - Upload PDF and get extracted text
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF resume' });
    }

    const { desired_role, company_type, specific_company } = req.body;

    if (!desired_role) {
      return res.status(400).json({ error: 'Please specify a desired role' });
    }

    // Extract text from PDF
    const resumeText = await extractAndCleanup(req.file.path);

    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({ error: 'Could not extract sufficient text from the PDF. Please upload a valid resume.' });
    }

    // Return extracted text and basic info for frontend to use in subsequent calls
    res.json({
      success: true,
      data: {
        resume_text: resumeText,
        desired_role,
        company_type: company_type || '',
        specific_company: specific_company || '',
        character_count: resumeText.length,
      },
    });
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: 'Failed to process resume: ' + error.message });
  }
});

// POST /api/analyze/dashboard - Combined analysis (ALL 4 dashboard features in ONE API call)
router.post('/dashboard', async (req, res) => {
  try {
    const { resume_text, desired_role, company_type, specific_company } = req.body;
    if (!resume_text || !desired_role) {
      return res.status(400).json({ error: 'resume_text and desired_role are required' });
    }

    const companyCtx = specific_company
      ? `Target Company: ${specific_company} (${company_type || 'Product-based'})`
      : `Target Company Type: ${company_type || 'Product-based'}`;

    // One single mega-prompt that returns all 4 analyses at once
    const combinedPrompt = `You are an expert career advisor, technical recruiter, and resume screening AI.
Analyze this resume and return a SINGLE JSON object containing ALL 4 analyses below.

RESUME:
${resume_text}

DESIRED ROLE: ${desired_role}
${companyCtx}

Return a JSON object with these 4 top-level keys:

{
  "tools": {
    "current_tools": [{"name": "string", "category": "string"}],
    "missing_tools": [
      {
        "name": "string",
        "category": "Languages|Frameworks|Databases|DevOps|Cloud|Tools|Testing|Other",
        "importance": "critical|recommended|nice-to-have",
        "description": "Why this tool is needed (1 sentence)",
        "learning_resource": "URL to free resource"
      }
    ],
    "summary": "2-sentence skill gap summary"
  },
  "roles": {
    "matching_roles": [
      {
        "role": "Job Title",
        "match_percentage": 85,
        "key_matching_skills": ["skill1", "skill2"],
        "why_good_fit": "1 sentence"
      }
    ],
    "short_term_roadmaps": [
      {
        "role": "Job Title",
        "duration": "1-3 months",
        "weeks": [
          {
            "week": "Week 1-2",
            "focus": "Topic",
            "tasks": ["task1", "task2"],
            "resources": ["resource - URL"]
          }
        ]
      }
    ],
    "long_term_roadmap": {
      "desired_role": "${desired_role}",
      "total_duration": "6-12 months",
      "phases": [
        {
          "phase_name": "Phase Name",
          "duration": "Month 1-2",
          "skills_to_learn": ["skill1"],
          "projects": ["project"],
          "milestones": ["milestone"],
          "resources": ["resource - URL"]
        }
      ]
    }
  },
  "company": {
    "company_priorities": [
      {
        "area": "string",
        "importance": "critical|high|medium",
        "description": "Why valued"
      }
    ],
    "resume_strengths": [
      {
        "area": "string",
        "evidence": "What demonstrates this",
        "rating": "strong|adequate|weak"
      }
    ],
    "resume_gaps": [
      {
        "area": "string",
        "what_to_add": "Specific suggestion",
        "priority": "high|medium|low"
      }
    ],
    "resume_tips": ["tip1"],
    "interview_prep": [
      {
        "area": "string",
        "focus_topics": ["topic1"],
        "preparation_time": "2-4 weeks",
        "resources": ["resource - URL"]
      }
    ],
    "overall_readiness": 65,
    "summary": "2-sentence assessment"
  },
  "compare": {
    "overall_match": 72,
    "categories": [
      {
        "name": "Technical Skills",
        "match_percentage": 75,
        "present": ["skill1"],
        "missing": ["skill2"],
        "suggestions": ["suggestion"]
      }
    ],
    "top_improvements": ["improvement1", "improvement2", "improvement3"],
    "summary": "2-sentence assessment"
  }
}

Be specific, practical, and realistic. Include 8-12 missing tools, 5 matching roles, 3 short-term roadmaps, 4-6 long-term phases, and 6 comparison categories. Keep it concise but complete.`;

    console.log('📊 Running combined dashboard analysis (single API call)...');
    const startTime = Date.now();
    const result = await generateJSON(combinedPrompt);
    console.log(`✅ Dashboard analysis completed in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Dashboard analysis error:', error);
    res.status(500).json({ error: 'Dashboard analysis failed: ' + error.message });
  }
});

// POST /api/analyze/tools - Get missing tools/technologies (Feature 1)
router.post('/tools', async (req, res) => {
  try {
    const { resume_text, desired_role } = req.body;
    if (!resume_text || !desired_role) {
      return res.status(400).json({ error: 'resume_text and desired_role are required' });
    }

    const prompt = prompts.toolSuggestions(resume_text, desired_role);
    const result = await generateJSON(prompt);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Tool analysis error:', error);
    res.status(500).json({ error: 'Tool analysis failed: ' + error.message });
  }
});

// POST /api/analyze/roles - Get role suggestions + roadmaps (Feature 3)
router.post('/roles', async (req, res) => {
  try {
    const { resume_text, desired_role } = req.body;
    if (!resume_text || !desired_role) {
      return res.status(400).json({ error: 'resume_text and desired_role are required' });
    }

    const prompt = prompts.roleSuggestions(resume_text, desired_role);
    const result = await generateJSON(prompt);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Role analysis error:', error);
    res.status(500).json({ error: 'Role analysis failed: ' + error.message });
  }
});

// POST /api/analyze/company - Company-oriented analysis (Feature 4)
router.post('/company', async (req, res) => {
  try {
    const { resume_text, company_type, specific_company } = req.body;
    if (!resume_text || !company_type) {
      return res.status(400).json({ error: 'resume_text and company_type are required' });
    }

    const prompt = prompts.companyAnalysis(resume_text, company_type, specific_company || '');
    const result = await generateJSON(prompt);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Company analysis error:', error);
    res.status(500).json({ error: 'Company analysis failed: ' + error.message });
  }
});

module.exports = router;
