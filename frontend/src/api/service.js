const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  // Backend retries on quota errors with backoff, so requests can take a while
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000); // 2 min timeout

  const config = {
    headers: { 'Content-Type': 'application/json' },
    signal: controller.signal,
    ...options,
  };

  try {
    const res = await fetch(url, config);
    clearTimeout(timeoutId);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The AI service may be busy — please try again.');
    }
    throw err;
  }
}

// Upload resume PDF and get extracted text
export async function uploadResume(file, desiredRole, companyType = '', specificCompany = '') {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('desired_role', desiredRole);
  if (companyType) formData.append('company_type', companyType);
  if (specificCompany) formData.append('specific_company', specificCompany);

  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

// Combined dashboard analysis (all 4 features in ONE API call — fast!)
export async function getDashboardAnalysis(resumeText, desiredRole, companyType = '', specificCompany = '') {
  return request('/analyze/dashboard', {
    method: 'POST',
    body: JSON.stringify({
      resume_text: resumeText,
      desired_role: desiredRole,
      company_type: companyType || 'Product-based',
      specific_company: specificCompany,
    }),
  });
}

// Feature 1: Tool suggestions
export async function getToolSuggestions(resumeText, desiredRole) {
  return request('/analyze/tools', {
    method: 'POST',
    body: JSON.stringify({ resume_text: resumeText, desired_role: desiredRole }),
  });
}

// Feature 2: Quiz generation
export async function generateQuiz(skills, count = 10, difficulty = 'mixed') {
  return request('/quiz/generate', {
    method: 'POST',
    body: JSON.stringify({ skills, count, difficulty }),
  });
}

// Feature 3: Role suggestions
export async function getRoleSuggestions(resumeText, desiredRole) {
  return request('/analyze/roles', {
    method: 'POST',
    body: JSON.stringify({ resume_text: resumeText, desired_role: desiredRole }),
  });
}

// Feature 4: Company analysis
export async function getCompanyAnalysis(resumeText, companyType, specificCompany = '') {
  return request('/analyze/company', {
    method: 'POST',
    body: JSON.stringify({ resume_text: resumeText, company_type: companyType, specific_company: specificCompany }),
  });
}

// Feature 5: Resume comparison
export async function getResumeComparison(resumeText, desiredRole, targetCompany = '') {
  return request('/compare', {
    method: 'POST',
    body: JSON.stringify({ resume_text: resumeText, desired_role: desiredRole, target_company: targetCompany }),
  });
}

// Feature 6: Career simulation
export async function getCareerSimulation(resumeText, desiredRole) {
  return request('/simulate', {
    method: 'POST',
    body: JSON.stringify({ resume_text: resumeText, desired_role: desiredRole }),
  });
}

// Feature 7: Cover letter (role + company oriented)
export async function generateCoverLetter(resumeText, desiredRole, companyName, companyType = 'Product-based', jobRole = '', jobDescription = '') {
  return request('/coverletter', {
    method: 'POST',
    body: JSON.stringify({ resume_text: resumeText, desired_role: desiredRole, company_name: companyName, company_type: companyType, job_role: jobRole, job_description: jobDescription }),
  });
}

// Feature 8: Project suggestions
export async function getProjectSuggestions(resumeText, desiredRole, missingSkills = []) {
  return request('/projects', {
    method: 'POST',
    body: JSON.stringify({ resume_text: resumeText, desired_role: desiredRole, missing_skills: missingSkills }),
  });
}

// Feature 9: Resume builder
export async function generateResume(resumeText, targetRole, companyName, companyType = 'Product-based', jobDescription = '') {
  return request('/resume', {
    method: 'POST',
    body: JSON.stringify({ resume_text: resumeText, target_role: targetRole, company_name: companyName, company_type: companyType, job_description: jobDescription }),
  });
}
