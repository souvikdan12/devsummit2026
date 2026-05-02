import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { generateCoverLetter } from '../api/service';

export default function CoverLetterPage() {
  const { resumeData } = useResume();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [companyName, setCompanyName] = useState(resumeData?.specific_company || '');
  const [companyType, setCompanyType] = useState(resumeData?.company_type || 'Product-based');
  const [jobRole, setJobRole] = useState(resumeData?.desired_role || '');
  const [jobDescription, setJobDescription] = useState('');
  const [copied, setCopied] = useState(false);

  if (!resumeData) return <div className="page-container"><div className="need-resume"><h3>📄 No Resume Uploaded</h3><p>Upload your resume first.</p><button className="btn btn-primary" onClick={() => navigate('/')}>Go to Upload</button></div></div>;

  async function handleGenerate() {
    if (!companyName.trim()) { setError('Please enter a company name'); return; }
    if (!jobRole.trim()) { setError('Please enter a job role'); return; }
    setLoading(true); setError(''); setData(null);
    try {
      const res = await generateCoverLetter(
        resumeData.resume_text,
        resumeData.desired_role,
        companyName.trim(),
        companyType,
        jobRole.trim(),
        jobDescription.trim()
      );
      setData(res.data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  function handleCopy() {
    navigator.clipboard.writeText(data.cover_letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([data.cover_letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cover_Letter_${companyName.replace(/\s+/g, '_')}_${jobRole.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const wordCount = data?.cover_letter ? data.cover_letter.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="page-container">
      <div className="page-header fade-in">
        <h2>✉️ AI Cover Letter Generator</h2>
        <p>Generate a tailored cover letter for <strong>{resumeData.desired_role}</strong> — personalized for the role AND company</p>
      </div>

      {/* Input Form */}
      <div className="glass-card fade-in" style={{ maxWidth: 700, margin: '0 auto 2rem', padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="input-group">
            <label>Job Role *</label>
            <input id="cl-job-role" className="input-field" placeholder="e.g. Frontend Developer" value={jobRole} onChange={(e) => setJobRole(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Company Name *</label>
            <input id="cl-company-name" className="input-field" placeholder="e.g. Google" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="input-group">
            <label>Company Type</label>
            <select id="cl-company-type" className="input-field" value={companyType} onChange={(e) => setCompanyType(e.target.value)}>
              {['MAANG', 'Startup', 'Product-based', 'Service-based', 'Enterprise', 'Fintech'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <label>Job Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional — paste for hyper-specific tailoring)</span></label>
          <textarea
            id="cl-job-description"
            className="input-field"
            placeholder="Paste the job description here for a more targeted cover letter..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={4}
            style={{ resize: 'vertical', minHeight: '80px' }}
          />
        </div>
        {error && <div className="error-box" style={{ marginBottom: '1rem' }}>{error}</div>}
        <button id="cl-generate-btn" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleGenerate} disabled={loading}>
          {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> Generating...</> : '✨ Generate Cover Letter'}
        </button>
      </div>

      {/* Result */}
      {data && (
        <div className="fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <h3>Your Cover Letter</h3>
              {data.tone_used && <span className="badge badge-recommended">{data.tone_used}</span>}
              <span className={`badge ${wordCount >= 250 && wordCount <= 400 ? 'badge-nice' : 'badge-critical'}`}>
                {wordCount} words
              </span>
            </div>
            <div className="cover-letter-actions">
              <button className="btn btn-secondary" onClick={handleCopy}>{copied ? '✅ Copied!' : '📋 Copy'}</button>
              <button className="btn btn-secondary" onClick={handleDownload}>📥 Download</button>
            </div>
          </div>

          <div className="cover-letter-preview">{data.cover_letter}</div>

          {data.role_keywords_used?.length > 0 && (
            <div className="glass-card" style={{ marginTop: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>🔑 Role Keywords Used</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {data.role_keywords_used.map((k, i) => <span key={i} className="tech-pill">{k}</span>)}
              </div>
            </div>
          )}

          {data.key_highlights?.length > 0 && (
            <div className="glass-card" style={{ marginTop: '1rem' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>⭐ Key Highlights Used</h4>
              <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {data.key_highlights.map((h, i) => <li key={i} style={{ padding: '0.2rem 0' }}>{h}</li>)}
              </ul>
            </div>
          )}

          {data.customization_tips?.length > 0 && (
            <div className="glass-card" style={{ marginTop: '1rem' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>💡 Customization Tips</h4>
              <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {data.customization_tips.map((t, i) => <li key={i} style={{ padding: '0.2rem 0' }}>{t}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
