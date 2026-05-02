import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { generateResume } from '../api/service';

export default function ResumeBuilderPage() {
  const { resumeData } = useResume();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [targetRole, setTargetRole] = useState(resumeData?.desired_role || '');
  const [companyName, setCompanyName] = useState(resumeData?.specific_company || '');
  const [companyType, setCompanyType] = useState(resumeData?.company_type || 'Product-based');
  const [jobDescription, setJobDescription] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('all');

  if (!resumeData) return (
    <div className="page-container">
      <div className="need-resume">
        <h3>📄 No Resume Uploaded</h3>
        <p>Upload your resume first to build an ATS-optimized version.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Go to Upload</button>
      </div>
    </div>
  );

  async function handleGenerate() {
    if (!targetRole.trim()) { setError('Please enter a target role'); return; }
    if (!companyName.trim()) { setError('Please enter a company name'); return; }
    setLoading(true); setError(''); setData(null);
    try {
      const res = await generateResume(
        resumeData.resume_text,
        targetRole.trim(),
        companyName.trim(),
        companyType,
        jobDescription.trim()
      );
      setData(res.data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  function buildPlainText() {
    if (!data) return '';
    let text = '';
    text += `PROFESSIONAL SUMMARY\n${'─'.repeat(50)}\n${data.professional_summary}\n\n`;

    if (data.skills) {
      text += `SKILLS\n${'─'.repeat(50)}\n`;
      if (data.skills.technical?.length) text += `Technical: ${data.skills.technical.join(', ')}\n`;
      if (data.skills.tools_platforms?.length) text += `Tools & Platforms: ${data.skills.tools_platforms.join(', ')}\n`;
      if (data.skills.soft_skills?.length) text += `Soft Skills: ${data.skills.soft_skills.join(', ')}\n`;
      text += '\n';
    }

    if (data.experience?.length) {
      text += `EXPERIENCE\n${'─'.repeat(50)}\n`;
      data.experience.forEach(exp => {
        text += `${exp.title} | ${exp.company} | ${exp.duration}\n`;
        exp.bullets?.forEach(b => { text += `  • ${b}\n`; });
        text += '\n';
      });
    }

    if (data.projects?.length) {
      text += `PROJECTS\n${'─'.repeat(50)}\n`;
      data.projects.forEach(proj => {
        text += `${proj.name} [${proj.tech_stack?.join(', ')}]\n`;
        text += `  ${proj.description}\n`;
        proj.highlights?.forEach(h => { text += `  • ${h}\n`; });
        text += '\n';
      });
    }

    if (data.education?.length) {
      text += `EDUCATION\n${'─'.repeat(50)}\n`;
      data.education.forEach(edu => {
        text += `${edu.degree} | ${edu.institution} | ${edu.year}\n`;
        if (edu.relevant_coursework?.length) text += `  Relevant Coursework: ${edu.relevant_coursework.join(', ')}\n`;
        text += '\n';
      });
    }

    if (data.certifications?.length) {
      text += `CERTIFICATIONS\n${'─'.repeat(50)}\n`;
      data.certifications.forEach(c => { text += `  • ${c}\n`; });
    }

    return text;
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildPlainText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([buildPlainText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Resume_${companyName.replace(/\s+/g, '_')}_${targetRole.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const SECTIONS = [
    { key: 'all', label: '📋 All Sections' },
    { key: 'summary', label: '👤 Summary' },
    { key: 'skills', label: '🛠️ Skills' },
    { key: 'experience', label: '💼 Experience' },
    { key: 'projects', label: '🚀 Projects' },
    { key: 'education', label: '🎓 Education' },
  ];

  return (
    <div className="page-container">
      <div className="page-header fade-in">
        <h2>📝 ATS Resume Builder</h2>
        <p>Build an ATS-friendly resume tailored for <strong>{targetRole || 'your target role'}</strong> — optimized with real skills from your resume</p>
      </div>

      {/* Input Form */}
      <div className="glass-card fade-in" style={{ maxWidth: 700, margin: '0 auto 2rem', padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="input-group">
            <label>Target Role *</label>
            <input id="rb-target-role" className="input-field" placeholder="e.g. Backend Engineer" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Company Name *</label>
            <input id="rb-company-name" className="input-field" placeholder="e.g. Microsoft" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
        </div>
        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <label>Company Type</label>
          <select id="rb-company-type" className="input-field" value={companyType} onChange={(e) => setCompanyType(e.target.value)}>
            {['MAANG', 'Startup', 'Product-based', 'Service-based', 'Enterprise', 'Fintech'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <label>Job Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional — for precise keyword matching)</span></label>
          <textarea
            id="rb-job-description"
            className="input-field"
            placeholder="Paste the job description here for better ATS keyword alignment..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={4}
            style={{ resize: 'vertical', minHeight: '80px' }}
          />
        </div>
        {error && <div className="error-box" style={{ marginBottom: '1rem' }}>{error}</div>}
        <button id="rb-generate-btn" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleGenerate} disabled={loading}>
          {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> Building Resume...</> : '🚀 Build ATS Resume'}
        </button>
      </div>

      {/* Result */}
      {data && (
        <div className="fade-in" style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* ATS Score + Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <h3>Your ATS-Optimized Resume</h3>
              {data.ats_score && (
                <span className={`badge ${data.ats_score >= 80 ? 'badge-nice' : data.ats_score >= 60 ? 'badge-recommended' : 'badge-critical'}`}>
                  ATS Score: {data.ats_score}%
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={handleCopy}>{copied ? '✅ Copied!' : '📋 Copy All'}</button>
              <button className="btn btn-secondary" onClick={handleDownload}>📥 Download .txt</button>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="tabs" style={{ marginBottom: '1.5rem' }}>
            {SECTIONS.map(s => (
              <button key={s.key} className={`tab-btn ${activeSection === s.key ? 'active' : ''}`} onClick={() => setActiveSection(s.key)}>{s.label}</button>
            ))}
          </div>

          {/* Professional Summary */}
          {(activeSection === 'all' || activeSection === 'summary') && data.professional_summary && (
            <div className="glass-card resume-section fade-in" style={{ marginBottom: '1.25rem' }}>
              <h4 className="resume-section-title">👤 Professional Summary</h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}>{data.professional_summary}</p>
            </div>
          )}

          {/* Skills */}
          {(activeSection === 'all' || activeSection === 'skills') && data.skills && (
            <div className="glass-card resume-section fade-in" style={{ marginBottom: '1.25rem' }}>
              <h4 className="resume-section-title">🛠️ Skills</h4>
              {data.skills.technical?.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Technical</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                    {data.skills.technical.map((s, i) => <span key={i} className="tech-pill">{s}</span>)}
                  </div>
                </div>
              )}
              {data.skills.tools_platforms?.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tools & Platforms</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                    {data.skills.tools_platforms.map((s, i) => <span key={i} className="tech-pill" style={{ borderColor: 'rgba(6,182,212,0.3)', color: 'var(--accent-cyan)', background: 'rgba(6,182,212,0.1)' }}>{s}</span>)}
                  </div>
                </div>
              )}
              {data.skills.soft_skills?.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Soft Skills</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                    {data.skills.soft_skills.map((s, i) => <span key={i} className="tech-pill" style={{ borderColor: 'rgba(16,185,129,0.3)', color: 'var(--accent-green)', background: 'rgba(16,185,129,0.1)' }}>{s}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Experience */}
          {(activeSection === 'all' || activeSection === 'experience') && data.experience?.length > 0 && (
            <div className="glass-card resume-section fade-in" style={{ marginBottom: '1.25rem' }}>
              <h4 className="resume-section-title">💼 Experience</h4>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < data.experience.length - 1 ? '1.25rem' : 0, paddingBottom: i < data.experience.length - 1 ? '1.25rem' : 0, borderBottom: i < data.experience.length - 1 ? '1px solid var(--border-glass)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '1rem' }}>{exp.title}</strong>
                      <span style={{ color: 'var(--text-muted)', margin: '0 0.5rem' }}>at</span>
                      <span style={{ color: 'var(--accent-blue)', fontWeight: 500 }}>{exp.company}</span>
                    </div>
                    <span className="badge badge-recommended">{exp.duration}</span>
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {exp.bullets?.map((b, j) => <li key={j} style={{ padding: '0.2rem 0', lineHeight: 1.6 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {(activeSection === 'all' || activeSection === 'projects') && data.projects?.length > 0 && (
            <div className="glass-card resume-section fade-in" style={{ marginBottom: '1.25rem' }}>
              <h4 className="resume-section-title">🚀 Projects</h4>
              <div className="grid-2">
                {data.projects.map((proj, i) => (
                  <div key={i} className="glass-card project-card">
                    <strong>{proj.name}</strong>
                    <div className="tech-pills">
                      {proj.tech_stack?.map((t, j) => <span key={j} className="tech-pill">{t}</span>)}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{proj.description}</p>
                    {proj.highlights?.length > 0 && (
                      <ul style={{ paddingLeft: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {proj.highlights.map((h, j) => <li key={j}>{h}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {(activeSection === 'all' || activeSection === 'education') && data.education?.length > 0 && (
            <div className="glass-card resume-section fade-in" style={{ marginBottom: '1.25rem' }}>
              <h4 className="resume-section-title">🎓 Education</h4>
              {data.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: '0.75rem' }}>
                  <strong>{edu.degree}</strong>
                  <span style={{ color: 'var(--text-muted)', margin: '0 0.5rem' }}>|</span>
                  <span style={{ color: 'var(--accent-blue)' }}>{edu.institution}</span>
                  <span style={{ color: 'var(--text-muted)', margin: '0 0.5rem' }}>|</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{edu.year}</span>
                  {edu.relevant_coursework?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
                      {edu.relevant_coursework.map((c, j) => <span key={j} className="tech-pill" style={{ fontSize: '0.7rem' }}>{c}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {(activeSection === 'all') && data.certifications?.length > 0 && (
            <div className="glass-card resume-section fade-in" style={{ marginBottom: '1.25rem' }}>
              <h4 className="resume-section-title">🏅 Certifications</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {data.certifications.map((c, i) => <span key={i} className="tech-pill" style={{ borderColor: 'rgba(245,158,11,0.3)', color: 'var(--accent-orange)', background: 'rgba(245,158,11,0.1)' }}>{c}</span>)}
              </div>
            </div>
          )}

          {/* Keywords & Tips */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {data.keywords_used?.length > 0 && (
              <div className="glass-card fade-in">
                <h4 style={{ marginBottom: '0.75rem' }}>🔑 ATS Keywords Used</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {data.keywords_used.map((k, i) => <span key={i} className="tech-pill">{k}</span>)}
                </div>
              </div>
            )}
            {data.optimization_tips?.length > 0 && (
              <div className="glass-card fade-in">
                <h4 style={{ marginBottom: '0.75rem' }}>💡 Optimization Tips</h4>
                <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {data.optimization_tips.map((t, i) => <li key={i} style={{ padding: '0.2rem 0' }}>{t}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
