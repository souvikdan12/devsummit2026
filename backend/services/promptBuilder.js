/**
 * Prompt templates for all 8 AI features
 * Each function returns a structured prompt string for Gemini
 */

// Feature 1: Tool & Technology Suggestions
function toolSuggestions(resumeText, desiredRole) {
  return `You are an expert career advisor and technical recruiter. Analyze this resume against the desired job role.

RESUME:
${resumeText}

DESIRED ROLE: ${desiredRole}

Analyze and return a JSON object with this exact structure:
{
  "current_tools": [{"name": "string", "category": "string"}],
  "missing_tools": [
    {
      "name": "string",
      "category": "Languages|Frameworks|Databases|DevOps|Cloud|Tools|Testing|Other",
      "importance": "critical|recommended|nice-to-have",
      "description": "Why this tool is needed for the role (1 sentence)",
      "learning_resource": "URL to a free learning resource"
    }
  ],
  "summary": "Brief 2-sentence summary of the skill gap analysis"
}

Be specific and practical. Include 8-15 missing tools across different categories. Prioritize tools that are most commonly required in job postings for this role.`;
}

// Feature 2: Skill Testing MCQ Generation
function quizGeneration(skills, count = 10, difficulty = 'mixed') {
  return `You are a technical interviewer. Generate ${count} multiple-choice questions to test proficiency in these skills: ${skills.join(', ')}.

Difficulty level: ${difficulty} (if mixed, include beginner, intermediate, and advanced questions)

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "question": "string",
      "options": {
        "a": "string",
        "b": "string",
        "c": "string",
        "d": "string"
      },
      "correct_answer": "a|b|c|d",
      "difficulty": "beginner|intermediate|advanced",
      "skill": "The specific skill being tested",
      "explanation": "Why the correct answer is correct (2-3 sentences)"
    }
  ]
}

Make questions practical and relevant to real-world scenarios. Avoid trivially obvious answers. Ensure distractors are plausible.`;
}

// Feature 3: Role Suggestions + Career Roadmaps
function roleSuggestions(resumeText, desiredRole) {
  return `You are a senior career counselor. Analyze this resume and provide role suggestions with roadmaps.

RESUME:
${resumeText}

DESIRED ROLE: ${desiredRole}

Return a JSON object with this exact structure:
{
  "matching_roles": [
    {
      "role": "Job Title",
      "match_percentage": 85,
      "key_matching_skills": ["skill1", "skill2"],
      "why_good_fit": "1 sentence explanation"
    }
  ],
  "short_term_roadmaps": [
    {
      "role": "Job Title",
      "duration": "1-3 months",
      "weeks": [
        {
          "week": "Week 1-2",
          "focus": "Topic area",
          "tasks": ["task1", "task2"],
          "resources": ["resource name - URL"]
        }
      ]
    }
  ],
  "long_term_roadmap": {
    "desired_role": "${desiredRole}",
    "total_duration": "6-12 months",
    "phases": [
      {
        "phase_name": "Foundation",
        "duration": "Month 1-2",
        "skills_to_learn": ["skill1", "skill2"],
        "projects": ["project description"],
        "milestones": ["milestone1"],
        "resources": ["resource - URL"]
      }
    ]
  }
}

Suggest 5 matching roles sorted by match percentage. Provide 3 short-term roadmaps for the top 3 roles. The long-term roadmap should have 4-6 phases.`;
}

// Feature 4: Company-Oriented Resume Analysis
function companyAnalysis(resumeText, companyType, specificCompany = '') {
  const companyContext = specificCompany
    ? `Target Company: ${specificCompany} (${companyType})`
    : `Target Company Type: ${companyType}`;

  return `You are an expert recruiter who has worked at top tech companies. Analyze this resume for company-specific fit.

RESUME:
${resumeText}

${companyContext}

Return a JSON object with this exact structure:
{
  "company_priorities": [
    {
      "area": "DSA & Problem Solving|System Design|Projects|Open Source|Communication|etc.",
      "importance": "critical|high|medium",
      "description": "Why this company values this"
    }
  ],
  "resume_strengths": [
    {
      "area": "string",
      "evidence": "What in the resume demonstrates this",
      "rating": "strong|adequate|weak"
    }
  ],
  "resume_gaps": [
    {
      "area": "string",
      "what_to_add": "Specific improvement suggestion",
      "priority": "high|medium|low"
    }
  ],
  "resume_tips": [
    "Specific actionable tip for tailoring the resume"
  ],
  "interview_prep": [
    {
      "area": "DSA|System Design|Behavioral|Technical|etc.",
      "focus_topics": ["topic1", "topic2"],
      "preparation_time": "2-4 weeks",
      "resources": ["resource - URL"]
    }
  ],
  "overall_readiness": "percentage 0-100",
  "summary": "2-3 sentence overall assessment"
}

Be specific to the company type. For MAANG, emphasize DSA, system design, and coding rounds. For startups, emphasize versatility and shipping speed. For service companies, emphasize certifications and breadth.`;
}

// Feature 5: Resume vs Requirements Comparison
function resumeComparison(resumeText, desiredRole, targetCompany = '') {
  const companyContext = targetCompany ? `\nTarget Company: ${targetCompany}` : '';

  return `You are a resume screening AI used by top companies. Compare this resume against job requirements.

RESUME:
${resumeText}

DESIRED ROLE: ${desiredRole}${companyContext}

Return a JSON object with this exact structure:
{
  "overall_match": 72,
  "categories": [
    {
      "name": "Technical Skills",
      "match_percentage": 75,
      "present": ["skill1", "skill2"],
      "missing": ["skill3", "skill4"],
      "suggestions": ["Specific improvement suggestion"]
    },
    {
      "name": "Experience Level",
      "match_percentage": 60,
      "present": ["2 years web dev"],
      "missing": ["Leadership experience"],
      "suggestions": ["Take lead on a team project"]
    },
    {
      "name": "Education",
      "match_percentage": 80,
      "present": ["B.Tech CS"],
      "missing": [],
      "suggestions": []
    },
    {
      "name": "Projects",
      "match_percentage": 65,
      "present": ["E-commerce app"],
      "missing": ["System design project", "Open source contribution"],
      "suggestions": ["Build a distributed system project"]
    },
    {
      "name": "Certifications",
      "match_percentage": 40,
      "present": [],
      "missing": ["AWS Certified", "relevant cert"],
      "suggestions": ["Get AWS Cloud Practitioner certification"]
    },
    {
      "name": "Soft Skills",
      "match_percentage": 70,
      "present": ["teamwork"],
      "missing": ["leadership mentions"],
      "suggestions": ["Add metrics showing leadership impact"]
    }
  ],
  "top_improvements": [
    "Most impactful improvement #1",
    "Most impactful improvement #2",
    "Most impactful improvement #3"
  ],
  "summary": "2-3 sentence assessment"
}

Be realistic with percentages. A fresh graduate applying for senior role should get lower scores. Be specific in suggestions.`;
}

// Feature 6: Career Path Simulation
function careerSimulation(resumeText, desiredRole) {
  return `You are a career path strategist. Create a detailed career simulation showing progression from current state to the desired role.

RESUME:
${resumeText}

DESIRED ROLE: ${desiredRole}

Return a JSON object with this exact structure:
{
  "current_state": {
    "estimated_level": "Junior|Mid|Senior|Lead",
    "current_eligibility": 35,
    "strongest_areas": ["area1", "area2"],
    "key_gaps": ["gap1", "gap2"]
  },
  "simulation_path": [
    {
      "phase": 1,
      "title": "Foundation Building",
      "duration_weeks": 6,
      "description": "What you'll accomplish in this phase",
      "skills_gained": ["skill1", "skill2"],
      "activities": ["Build X project", "Complete Y course", "Practice Z"],
      "eligibility_after": 50,
      "roles_unlocked": ["Junior Developer", "Intern at X"],
      "milestone": "Can solve medium-level coding problems"
    }
  ],
  "total_duration_months": 9,
  "final_eligibility": 92,
  "success_factors": [
    "Key factor that will determine success"
  ],
  "alternative_paths": [
    {
      "path_name": "Fast Track (Intensive)",
      "duration_months": 5,
      "tradeoff": "Requires 6+ hours daily commitment"
    },
    {
      "path_name": "Part-time Path",
      "duration_months": 14,
      "tradeoff": "2-3 hours daily, suitable for working professionals"
    }
  ]
}

Create 5-7 phases showing gradual progression. Make eligibility percentages realistic and progressive. Include specific, actionable activities in each phase.`;
}

// Feature 7: Cover Letter Generation (role + company oriented)
function coverLetter(resumeText, desiredRole, companyName, companyType, jobRole = '', jobDescription = '') {
  const roleContext = jobRole ? jobRole : desiredRole;
  const jdBlock = jobDescription
    ? `\nJOB DESCRIPTION PROVIDED BY USER:\n${jobDescription}\n\nUse the above job description to identify the exact skills, responsibilities, and keywords the employer is looking for. Weave these naturally into the cover letter.`
    : '';

  return `You are a professional career coach who specializes in writing tailored, compelling cover letters.

RESUME:
${resumeText}

TARGET JOB ROLE: ${roleContext}
COMPANY: ${companyName}
COMPANY TYPE: ${companyType}
${jdBlock}

IMPORTANT INSTRUCTIONS:
1. The cover letter MUST be tailored to BOTH the specific job role ("${roleContext}") AND the company ("${companyName}").
2. Open with a strong hook referencing the specific role and company — do NOT use generic openings.
3. Map 3-5 of the candidate's strongest skills and achievements from the resume directly to what this role demands.
4. Use role-specific keywords and industry terminology relevant to "${roleContext}".
5. Show understanding of what "${companyName}" (${companyType}) values — culture, mission, and work style.
6. The letter MUST be between 250 and 400 words — this is a strict professional requirement.
7. Close with a confident, forward-looking call to action.

Tone guidelines:
- MAANG/Big Tech: Professional, technically confident, metric-driven
- Startup: Innovative, passionate, versatile, growth-minded
- Enterprise/Corporate: Formal, structured, process-oriented
- Product-based: User-centric, impact-focused, collaborative
- Fintech: Analytical, detail-oriented, regulatory-aware
- Service-based: Client-focused, adaptable, delivery-oriented

Return a JSON object with this exact structure:
{
  "cover_letter": "Full cover letter text with proper formatting. Use \\n for line breaks between paragraphs.",
  "tone_used": "Professional & Technical|Innovative & Passionate|Formal & Structured",
  "key_highlights": [
    "Key point emphasized in the letter"
  ],
  "customization_tips": [
    "Tip for further personalizing this letter"
  ],
  "word_count": 300,
  "role_keywords_used": ["keyword1", "keyword2"],
  "strength_areas": ["What this letter does well"],
  "format_notes": "Any notes about the format used"
}

The cover letter should be between 250 and 400 words — count carefully. Reference specific skills and achievements from the resume that align with this role. Address potential gaps diplomatically. Make it compelling, genuine, and highly specific to this role at this company — not generic.`;
}

// Feature 9: ATS-Friendly Resume Builder
function resumeBuilder(resumeText, targetRole, companyName, companyType = 'Product-based', jobDescription = '') {
  const jdBlock = jobDescription
    ? `\nJOB DESCRIPTION:\n${jobDescription}\n\nUse the above job description to tailor skills, keywords, and bullet points precisely to what this employer is looking for.`
    : '';

  return `You are an expert resume writer and ATS (Applicant Tracking System) optimization specialist.

Using the candidate's existing resume below, generate an ATS-friendly, professionally structured resume tailored specifically for the role of "${targetRole}" at "${companyName}" (${companyType}).

EXISTING RESUME:
${resumeText}

TARGET ROLE: ${targetRole}
COMPANY: ${companyName}
COMPANY TYPE: ${companyType}
${jdBlock}

IMPORTANT ATS OPTIMIZATION RULES:
1. Use standard section headings (Professional Summary, Skills, Experience, Projects, Education) — ATS parsers rely on these.
2. Include relevant keywords from the target role throughout naturally — do NOT keyword-stuff.
3. Quantify achievements with numbers, percentages, and metrics wherever possible.
4. Use action verbs to start each bullet point (Developed, Implemented, Optimized, Led, etc.).
5. Keep formatting simple — no tables, columns, or graphics (plain text optimized).
6. Tailor the skills section to highlight skills that match ${companyName}'s tech stack and industry demands.
7. Reword existing experiences to emphasize relevance to "${targetRole}".
8. Only include TRUE skills from the candidate's resume — do NOT fabricate skills they don't have.

Return a JSON object with this exact structure:
{
  "professional_summary": "A 3-4 sentence professional summary tailored to the role and company",
  "skills": {
    "technical": ["skill1", "skill2"],
    "tools_platforms": ["tool1", "tool2"],
    "soft_skills": ["skill1", "skill2"]
  },
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start - End",
      "bullets": [
        "Action verb + what you did + result/impact with metrics"
      ]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "tech_stack": ["tech1", "tech2"],
      "description": "1-2 sentence description emphasizing relevance to target role",
      "highlights": ["Key achievement or feature"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University Name",
      "year": "Year",
      "relevant_coursework": ["course1", "course2"]
    }
  ],
  "certifications": ["cert1", "cert2"],
  "ats_score": 85,
  "keywords_used": ["keyword1", "keyword2"],
  "optimization_tips": ["Tip for further improving ATS compatibility"]
}

Only include sections that have data from the original resume. Do NOT invent experience or skills the candidate does not have. Reword and optimize what exists.`;
}

// Feature 8: Project Suggestions
function projectSuggestions(resumeText, desiredRole, missingSkills = []) {
  const gapsContext = missingSkills.length > 0
    ? `\nIDENTIFIED SKILL GAPS: ${missingSkills.join(', ')}`
    : '';

  return `You are a senior developer and mentor. Suggest portfolio projects that will strengthen this resume for the desired role.

RESUME:
${resumeText}

DESIRED ROLE: ${desiredRole}${gapsContext}

Return a JSON object with this exact structure:
{
  "projects": [
    {
      "title": "Project Name",
      "description": "2-3 sentence description of what to build",
      "tech_stack": ["React", "Node.js", "MongoDB"],
      "difficulty": "beginner|intermediate|advanced",
      "estimated_hours": 40,
      "skills_demonstrated": ["skill1", "skill2", "skill3"],
      "why_impressive": "Why this project stands out for recruiters",
      "resume_impact_score": 85,
      "key_features": ["feature1", "feature2", "feature3"],
      "learning_outcomes": ["What you'll learn by building this"]
    }
  ],
  "recommendation_summary": "2-3 sentences on how these projects collectively strengthen the resume",
  "build_order": ["Project 1 title", "Project 2 title", "...in recommended order"]
}

Suggest 6-8 projects. Range from beginner to advanced. Each project should fill specific skill gaps. Make projects realistic and completable. Include at least one system design project and one full-stack project.`;
}

module.exports = {
  toolSuggestions,
  quizGeneration,
  roleSuggestions,
  companyAnalysis,
  resumeComparison,
  careerSimulation,
  coverLetter,
  resumeBuilder,
  projectSuggestions,
};
