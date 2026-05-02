import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { getProjectSuggestions } from '../api/service';

export default function ProjectsPage() {
  const { resumeData, getCached, cacheResult } = useResume();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!resumeData) return;
    const cached = getCached('projects');
    if (cached) { setData(cached); return; }
    fetchProjects();
  }, [resumeData]);

  if (!resumeData) return <div className="page-container"><div className="need-resume"><h3>📄 No Resume Uploaded</h3><p>Upload your resume first.</p><button className="btn btn-primary" onClick={() => navigate('/')}>Go to Upload</button></div></div>;

  async function fetchProjects() {
    setLoading(true); setError('');
    try {
      const res = await getProjectSuggestions(resumeData.resume_text, resumeData.desired_role);
      setData(res.data);
      cacheResult('projects', res.data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  if (loading) return <div className="page-container"><div className="spinner-overlay"><div className="spinner"></div><p className="spinner-text">AI is crafting project ideas for you...</p></div></div>;
  if (error) return <div className="page-container"><div className="error-box">{error} <button className="btn btn-ghost" onClick={fetchProjects}>Retry</button></div></div>;
  if (!data) return null;

  const projects = data.projects || [];

  return (
    <div className="page-container">
      <div className="page-header fade-in">
        <h2>🛠️ Project Suggestions</h2>
        <p>Portfolio projects to strengthen your resume for <strong>{resumeData.desired_role}</strong></p>
      </div>

      {data.recommendation_summary && (
        <div className="glass-card fade-in" style={{ marginBottom: '2rem' }}>
          <p>{data.recommendation_summary}</p>
        </div>
      )}

      {data.build_order?.length > 0 && (
        <div className="glass-card fade-in" style={{ marginBottom: '2rem' }}>
          <h4 style={{ marginBottom: '0.75rem' }}>📋 Recommended Build Order</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            {data.build_order.map((p, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p}</span>
                {i < data.build_order.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid-2">
        {projects.map((p, i) => (
          <div key={i} className="glass-card project-card fade-in" style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>{p.title}</h3>
              <span className={`badge badge-${p.difficulty}`}>{p.difficulty}</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{p.description}</p>

            <div className="tech-pills">
              {(p.tech_stack || []).map((t, j) => <span key={j} className="tech-pill">{t}</span>)}
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>
              <span>⏱️ {p.estimated_hours}h</span>
              <span>📊 Impact: {p.resume_impact_score}%</span>
            </div>

            <div className="impact-bar">
              <span>Resume Impact</span>
              <div className="progress-bar" style={{ flex: 1 }}>
                <div className="progress-fill" style={{ width: `${p.resume_impact_score}%`, background: 'var(--gradient-primary)' }}></div>
              </div>
              <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{p.resume_impact_score}%</span>
            </div>

            {p.why_impressive && <p style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--accent-green)', fontStyle: 'italic' }}>✨ {p.why_impressive}</p>}

            {p.key_features?.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Key Features:</span>
                <ul style={{ paddingLeft: '1rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {p.key_features.map((f, k) => <li key={k}>{f}</li>)}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
