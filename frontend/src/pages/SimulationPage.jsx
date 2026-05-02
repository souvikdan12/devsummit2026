import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { getCareerSimulation } from '../api/service';

export default function SimulationPage() {
  const { resumeData, getCached, cacheResult } = useResume();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activePhase, setActivePhase] = useState(0);

  useEffect(() => {
    if (!resumeData) return;
    const cached = getCached('simulation');
    if (cached) { setData(cached); return; }
    fetchSimulation();
  }, [resumeData]);

  if (!resumeData) return <div className="page-container"><div className="need-resume"><h3>📄 No Resume Uploaded</h3><p>Upload your resume first.</p><button className="btn btn-primary" onClick={() => navigate('/')}>Go to Upload</button></div></div>;

  async function fetchSimulation() {
    setLoading(true); setError('');
    try {
      const res = await getCareerSimulation(resumeData.resume_text, resumeData.desired_role);
      setData(res.data);
      cacheResult('simulation', res.data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  if (loading) return <div className="page-container"><div className="spinner-overlay"><div className="spinner"></div><p className="spinner-text">AI is simulating your career path...</p></div></div>;
  if (error) return <div className="page-container"><div className="error-box">{error} <button className="btn btn-ghost" onClick={fetchSimulation}>Retry</button></div></div>;
  if (!data) return null;

  const phases = data.simulation_path || [];
  const current = data.current_state || {};

  return (
    <div className="page-container">
      <div className="page-header fade-in">
        <h2>🎮 Career Path Simulation</h2>
        <p>Your personalized journey to <strong>{resumeData.desired_role}</strong></p>
      </div>

      {/* Current State Card */}
      <div className="glass-card fade-in" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>📍 Current Position</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Level: <strong style={{ color: 'var(--accent-cyan)' }}>{current.estimated_level}</strong></p>
            <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {(current.strongest_areas || []).map((a, i) => <span key={i} className="tech-pill" style={{ borderColor: 'rgba(16,185,129,0.3)', color: '#34d399', background: 'rgba(16,185,129,0.1)' }}>{a}</span>)}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Current Eligibility</p>
            <div style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--accent-orange)' }}>{current.current_eligibility}%</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Target Eligibility</p>
            <div style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--accent-green)' }}>{data.final_eligibility}%</div>
          </div>
        </div>
        {current.key_gaps?.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Key gaps: </span>
            {current.key_gaps.map((g, i) => <span key={i} className="tech-pill" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>{g}</span>)}
          </div>
        )}
      </div>

      {/* Simulation Path */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {phases.map((p, i) => (
          <button key={i} className={`btn ${activePhase === i ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActivePhase(i)} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
            Phase {p.phase}
          </button>
        ))}
      </div>

      {/* Progress Journey Bar */}
      <div className="glass-card fade-in" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', overflow: 'hidden' }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Start</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-orange)' }}>{current.current_eligibility}%</div>
          </div>
          {phases.map((p, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1, height: 4, background: i <= activePhase ? 'var(--accent-blue)' : 'var(--border-glass)', borderRadius: 2, transition: 'background 0.5s' }}></div>
              <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, background: i <= activePhase ? 'var(--gradient-primary)' : 'var(--bg-secondary)', border: '2px solid ' + (i <= activePhase ? 'var(--accent-blue)' : 'var(--border-glass)'), color: '#fff', transition: 'all 0.5s' }}>
                {p.eligibility_after}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Phase Detail */}
      {phases[activePhase] && (
        <div className="glass-card fade-in" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <h3>Phase {phases[activePhase].phase}: {phases[activePhase].title}</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>⏱️ {phases[activePhase].duration_weeks} weeks</p>
            </div>
            <div style={{ textAlign: 'center', background: 'var(--bg-secondary)', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Eligibility After</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-green)' }}>{phases[activePhase].eligibility_after}%</div>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{phases[activePhase].description}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>🎯 Skills Gained</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {(phases[activePhase].skills_gained || []).map((s, i) => <span key={i} className="tech-pill">{s}</span>)}
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--accent-purple)' }}>🔓 Roles Unlocked</h4>
              {(phases[activePhase].roles_unlocked || []).map((r, i) => <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0.2rem 0' }}>• {r}</div>)}
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--accent-orange)' }}>📋 Activities</h4>
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {(phases[activePhase].activities || []).map((a, i) => <li key={i} style={{ padding: '0.2rem 0' }}>{a}</li>)}
            </ul>
          </div>
          {phases[activePhase].milestone && <p style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-green)', fontSize: '0.9rem' }}>🏆 Milestone: {phases[activePhase].milestone}</p>}
        </div>
      )}

      {/* Alternative Paths */}
      {data.alternative_paths?.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>🔀 Alternative Paths</h3>
          <div className="grid-2">
            {data.alternative_paths.map((p, i) => (
              <div key={i} className="glass-card">
                <h4>{p.path_name}</h4>
                <p style={{ color: 'var(--accent-cyan)', fontWeight: 600, margin: '0.25rem 0' }}>⏱️ {p.duration_months} months</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.tradeoff}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.success_factors?.length > 0 && (
        <div className="glass-card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>💡 Success Factors</h3>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)' }}>
            {data.success_factors.map((f, i) => <li key={i} style={{ padding: '0.2rem 0' }}>{f}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
