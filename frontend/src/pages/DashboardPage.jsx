import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { getDashboardAnalysis } from '../api/service';

const TABS = [
  { key: 'tools', label: '🔧 Skill Gap' },
  { key: 'roles', label: '🗺️ Roles & Roadmap' },
  { key: 'company', label: '🏢 Company Fit' },
  { key: 'compare', label: '📊 % Match' },
];

export default function DashboardPage() {
  const { resumeData, getCached, cacheResult } = useResume();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tools');
  const [allData, setAllData] = useState(null); // combined data from single API call
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch ALL dashboard data in a single API call on mount
  useEffect(() => {
    if (!resumeData) return;

    // Check if we already have cached combined data
    const cached = getCached('dashboard_all');
    if (cached) {
      setAllData(cached);
      return;
    }

    fetchDashboard();
  }, [resumeData]);

  if (!resumeData) return <NeedResume onClick={() => navigate('/')} />;

  async function fetchDashboard() {
    setLoading(true);
    setError('');
    setAllData(null);
    try {
      const { resume_text, desired_role, company_type, specific_company } = resumeData;
      const res = await getDashboardAnalysis(resume_text, desired_role, company_type, specific_company);
      setAllData(res.data);
      cacheResult('dashboard_all', res.data);
    } catch (err) {
      const msg = err.message || '';
      const isQuota = /quota|rate.limit|429|too many|free.tier/i.test(msg);
      if (isQuota) {
        setError('⏳ AI quota limit reached. Please wait a moment and try again.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  // Get the data for the active tab from the combined response
  const tabData = allData ? allData[activeTab] : null;

  return (
    <div className="page-container">
      <div className="page-header fade-in">
        <h2>📋 Analysis Dashboard</h2>
        <p>AI-powered insights for <strong>{resumeData.desired_role}</strong></p>
      </div>
      <div className="tabs">
        {TABS.map(t => (
          <button key={t.key} className={`tab-btn ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>{t.label}</button>
        ))}
      </div>
      {loading && <div className="spinner-overlay"><div className="spinner"></div><p className="spinner-text">AI is analyzing your resume... (one-shot analysis)</p></div>}
      {error && <div className="error-box">{error} <button className="btn btn-ghost" onClick={() => fetchDashboard()}>Retry</button></div>}
      {tabData && !loading && activeTab === 'tools' && <ToolsTab data={tabData} />}
      {tabData && !loading && activeTab === 'roles' && <RolesTab data={tabData} />}
      {tabData && !loading && activeTab === 'company' && <CompanyTab data={tabData} />}
      {tabData && !loading && activeTab === 'compare' && <CompareTab data={tabData} />}
    </div>
  );
}

function NeedResume({ onClick }) {
  return <div className="page-container"><div className="need-resume"><h3>📄 No Resume Uploaded</h3><p>Upload your resume first to get AI-powered analysis.</p><button className="btn btn-primary" onClick={onClick}>Go to Upload</button></div></div>;
}

/* ===== Feature 1: Tools Tab ===== */
function ToolsTab({ data }) {
  const categories = {};
  (data.missing_tools || []).forEach(t => {
    if (!categories[t.category]) categories[t.category] = [];
    categories[t.category].push(t);
  });
  return (
    <div className="fade-in">
      {data.summary && <div className="glass-card" style={{ marginBottom: '1.5rem' }}><p>{data.summary}</p></div>}
      {data.current_tools?.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>✅ Skills Found in Resume</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {data.current_tools.map((t, i) => <span key={i} className="tech-pill" style={{ borderColor: 'rgba(16,185,129,0.3)', color: '#34d399', background: 'rgba(16,185,129,0.1)' }}>{t.name}</span>)}
          </div>
        </div>
      )}
      <h3 style={{ marginBottom: '1rem' }}>🔧 Missing Tools & Technologies</h3>
      {Object.entries(categories).map(([cat, tools]) => (
        <div key={cat} style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>{cat}</h4>
          <div className="grid-3">
            {tools.map((t, i) => (
              <div key={i} className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <strong>{t.name}</strong>
                  <span className={`badge badge-${t.importance === 'critical' ? 'critical' : t.importance === 'recommended' ? 'recommended' : 'nice'}`}>{t.importance}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t.description}</p>
                {t.learning_resource && <a href={t.learning_resource} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem' }}>📚 Learn →</a>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===== Feature 3: Roles Tab ===== */
function RolesTab({ data }) {
  const [expandedRoadmap, setExpandedRoadmap] = useState(null);
  return (
    <div className="fade-in">
      <h3 style={{ marginBottom: '1rem' }}>🎯 Best-Fit Roles</h3>
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {(data.matching_roles || []).map((r, i) => (
          <div key={i} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4>{r.role}</h4>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: r.match_percentage >= 80 ? 'var(--accent-green)' : r.match_percentage >= 60 ? 'var(--accent-orange)' : 'var(--accent-red)' }}>{r.match_percentage}%</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>{(r.key_matching_skills || []).map((s, j) => <span key={j} className="tech-pill">{s}</span>)}</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.why_good_fit}</p>
          </div>
        ))}
      </div>

      {data.short_term_roadmaps?.length > 0 && (
        <>
          <h3 style={{ marginBottom: '1rem' }}>📅 Short-Term Roadmaps (1-3 months)</h3>
          {data.short_term_roadmaps.map((rm, i) => (
            <div key={i} className="glass-card" style={{ marginBottom: '1rem', cursor: 'pointer' }} onClick={() => setExpandedRoadmap(expandedRoadmap === i ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>{rm.role}</h4>
                <span style={{ color: 'var(--text-muted)' }}>{expandedRoadmap === i ? '▲' : '▼'}</span>
              </div>
              {expandedRoadmap === i && (
                <div className="timeline" style={{ marginTop: '1rem' }}>
                  {(rm.weeks || []).map((w, j) => (
                    <div key={j} className="timeline-node">
                      <div className="timeline-dot"></div>
                      <div style={{ marginLeft: '0.5rem' }}>
                        <strong style={{ color: 'var(--accent-blue)' }}>{w.week}</strong> — {w.focus}
                        <ul style={{ marginTop: '0.25rem', paddingLeft: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {(w.tasks || []).map((t, k) => <li key={k}>{t}</li>)}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {data.long_term_roadmap && (
        <>
          <h3 style={{ margin: '1.5rem 0 1rem' }}>🗺️ Long-Term Roadmap for {data.long_term_roadmap.desired_role} ({data.long_term_roadmap.total_duration})</h3>
          <div className="timeline">
            {(data.long_term_roadmap.phases || []).map((p, i) => (
              <div key={i} className="timeline-node">
                <div className="timeline-dot"></div>
                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <h4>{p.phase_name}</h4>
                    <span className="badge badge-recommended">{p.duration}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>{(p.skills_to_learn || []).map((s, j) => <span key={j} className="tech-pill">{s}</span>)}</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📌 Milestones: {(p.milestones || []).join(' • ')}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ===== Feature 4: Company Tab ===== */
function CompanyTab({ data }) {
  return (
    <div className="fade-in">
      {data.summary && <div className="glass-card" style={{ marginBottom: '1.5rem' }}><p>{data.summary}</p><div style={{ marginTop: '0.75rem' }}><strong>Overall Readiness: </strong><span style={{ fontSize: '1.2rem', fontWeight: 700, color: data.overall_readiness >= 70 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>{data.overall_readiness}%</span></div></div>}

      <h3 style={{ marginBottom: '1rem' }}>🎯 Company Priorities</h3>
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        {(data.company_priorities || []).map((p, i) => (
          <div key={i} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong>{p.area}</strong>
              <span className={`badge ${p.importance === 'critical' ? 'badge-critical' : 'badge-recommended'}`}>{p.importance}</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.description}</p>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--accent-green)' }}>✅ Strengths</h3>
          {(data.resume_strengths || []).map((s, i) => (
            <div key={i} className="glass-card" style={{ marginBottom: '0.75rem' }}>
              <strong>{s.area}</strong> <span className={`badge ${s.rating === 'strong' ? 'badge-nice' : 'badge-recommended'}`}>{s.rating}</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{s.evidence}</p>
            </div>
          ))}
        </div>
        <div>
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--accent-red)' }}>⚠️ Gaps</h3>
          {(data.resume_gaps || []).map((g, i) => (
            <div key={i} className="glass-card" style={{ marginBottom: '0.75rem' }}>
              <strong>{g.area}</strong> <span className={`badge ${g.priority === 'high' ? 'badge-critical' : 'badge-recommended'}`}>{g.priority}</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{g.what_to_add}</p>
            </div>
          ))}
        </div>
      </div>

      {data.interview_prep?.length > 0 && (
        <>
          <h3 style={{ marginBottom: '1rem' }}>📖 Interview Preparation</h3>
          <div className="grid-2">
            {data.interview_prep.map((p, i) => (
              <div key={i} className="glass-card">
                <h4 style={{ marginBottom: '0.5rem' }}>{p.area}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>⏱️ {p.preparation_time}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>{(p.focus_topics || []).map((t, j) => <span key={j} className="tech-pill">{t}</span>)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ===== Feature 5: Compare Tab — Visualized Graphs ===== */

/* Animated Donut Ring Chart */
function DonutChart({ percentage, size = 200, strokeWidth = 16 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 75 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444';
  const gradId = 'donut-grad-' + Math.random().toString(36).slice(2, 8);

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        {/* Background ring */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="var(--border-glass)" strokeWidth={strokeWidth} />
        {/* Animated progress ring */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={`url(#${gradId})`} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)', filter: `drop-shadow(0 0 8px ${color}40)` }} />
      </svg>
      {/* Center label */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontSize: size * 0.22, fontWeight: 700, fontFamily: 'var(--font-heading)',
          background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>{percentage}%</span>
        <span style={{ fontSize: size * 0.065, color: 'var(--text-muted)', fontWeight: 500 }}>MATCH SCORE</span>
      </div>
    </div>
  );
}

/* Interactive Horizontal Bar Chart */
function BarChart({ categories }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const maxVal = 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {categories.map((c, i) => {
        const pct = c.match_percentage || 0;
        const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
        const isHovered = hoveredIdx === i;
        return (
          <div key={i}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              background: isHovered ? 'var(--bg-glass)' : 'transparent',
              borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem',
              border: isHovered ? '1px solid var(--border-glass)' : '1px solid transparent',
              transition: 'all 0.3s ease', cursor: 'pointer',
              transform: isHovered ? 'scale(1.02)' : 'scale(1)',
            }}>
            {/* Label row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{c.name}</span>
              <span style={{
                fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1.1rem',
                color, transition: 'transform 0.3s',
                transform: isHovered ? 'scale(1.15)' : 'scale(1)',
              }}>{pct}%</span>
            </div>
            {/* Bar */}
            <div style={{
              height: 12, background: 'var(--bg-secondary)', borderRadius: 999, overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{
                height: '100%', borderRadius: 999,
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${color}cc, ${color})`,
                transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isHovered ? `0 0 12px ${color}60` : 'none',
                position: 'relative',
              }}>
                {/* Shimmer effect on hover */}
                {isHovered && (
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 999,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                    animation: 'shimmer 1.5s infinite',
                  }} />
                )}
              </div>
            </div>
            {/* Expanded details on hover */}
            <div style={{
              maxHeight: isHovered ? 200 : 0, overflow: 'hidden',
              transition: 'max-height 0.4s ease, opacity 0.3s ease',
              opacity: isHovered ? 1 : 0, marginTop: isHovered ? '0.75rem' : 0,
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {c.present?.length > 0 && (
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>✅ Present</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.35rem' }}>
                      {c.present.map((s, j) => <span key={j} className="tech-pill" style={{ borderColor: 'rgba(16,185,129,0.3)', color: '#34d399', background: 'rgba(16,185,129,0.1)' }}>{s}</span>)}
                    </div>
                  </div>
                )}
                {c.missing?.length > 0 && (
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>❌ Missing</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.35rem' }}>
                      {c.missing.map((s, j) => <span key={j} className="tech-pill" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>{s}</span>)}
                    </div>
                  </div>
                )}
              </div>
              {c.suggestions?.length > 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>💡 {c.suggestions[0]}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* SVG Radar / Spider Chart */
function RadarChart({ categories, size = 300 }) {
  const cx = size / 2, cy = size / 2;
  const maxR = size * 0.38;
  const n = categories.length;
  if (n < 3) return null; // Need at least 3 axes

  const angleStep = (2 * Math.PI) / n;
  const levels = [25, 50, 75, 100];

  // Calculate point position
  const getPoint = (index, value) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  // Build polygon path
  const polygonPoints = categories.map((c, i) => {
    const pt = getPoint(i, c.match_percentage || 0);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {levels.map((lvl) => {
          const pts = Array.from({ length: n }, (_, i) => {
            const p = getPoint(i, lvl);
            return `${p.x},${p.y}`;
          }).join(' ');
          return <polygon key={lvl} points={pts} fill="none" stroke="var(--border-glass)" strokeWidth={1} opacity={0.5} />;
        })}
        {/* Axis lines */}
        {categories.map((_, i) => {
          const p = getPoint(i, 100);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--border-glass)" strokeWidth={1} opacity={0.4} />;
        })}
        {/* Data polygon */}
        <polygon points={polygonPoints} fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth={2.5}
          style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.3))', transition: 'all 0.8s ease' }} />
        {/* Data points */}
        {categories.map((c, i) => {
          const pt = getPoint(i, c.match_percentage || 0);
          const color = (c.match_percentage || 0) >= 75 ? '#10b981' : (c.match_percentage || 0) >= 50 ? '#f59e0b' : '#ef4444';
          return (
            <g key={i}>
              <circle cx={pt.x} cy={pt.y} r={5} fill={color} stroke="#fff" strokeWidth={1.5}
                style={{ filter: `drop-shadow(0 0 4px ${color})`, cursor: 'pointer' }}>
                <title>{c.name}: {c.match_percentage}%</title>
              </circle>
            </g>
          );
        })}
        {/* Labels */}
        {categories.map((c, i) => {
          const labelPt = getPoint(i, 118);
          const pct = c.match_percentage || 0;
          const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
          return (
            <g key={'lbl' + i}>
              <text x={labelPt.x} y={labelPt.y} textAnchor="middle" dominantBaseline="middle"
                fill="var(--text-secondary)" fontSize={10} fontWeight={600} fontFamily="var(--font-body)">
                {c.name.length > 14 ? c.name.slice(0, 12) + '…' : c.name}
              </text>
              <text x={labelPt.x} y={labelPt.y + 14} textAnchor="middle" dominantBaseline="middle"
                fill={color} fontSize={11} fontWeight={700} fontFamily="var(--font-heading)">
                {pct}%
              </text>
            </g>
          );
        })}
        {/* Center level labels */}
        {levels.map((lvl) => (
          <text key={'lvl' + lvl} x={cx + 4} y={cy - (lvl / 100) * maxR + 3}
            fill="var(--text-muted)" fontSize={8} opacity={0.6}>{lvl}</text>
        ))}
      </svg>
    </div>
  );
}

/* Mini donut for category cards */
function MiniDonut({ percentage, size = 56 }) {
  const sw = 5;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ - (percentage / 100) * circ;
  const color = percentage >= 75 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-glass)" strokeWidth={sw} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.2s ease', filter: `drop-shadow(0 0 4px ${color}40)` }} />
    </svg>
  );
}

function CompareTab({ data }) {
  const [viewMode, setViewMode] = useState('bar'); // 'bar' | 'radar'
  const categories = data.categories || [];

  return (
    <div className="fade-in">
      {/* ── Overall Match: Donut Ring ── */}
      <div className="glass-card" style={{ textAlign: 'center', marginBottom: '2rem', padding: '2.5rem 2rem' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 500 }}>Overall Resume Match</p>
        <DonutChart percentage={data.overall_match || 0} size={220} strokeWidth={18} />
        {data.summary && <p style={{ color: 'var(--text-secondary)', marginTop: '1.25rem', maxWidth: 520, margin: '1.25rem auto 0', lineHeight: 1.6 }}>{data.summary}</p>}
        {/* Quick stat pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          {categories.length > 0 && (
            <>
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(16,185,129,0.1)', borderRadius: 999, fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>
                ✅ {categories.filter(c => (c.match_percentage || 0) >= 75).length} Strong
              </div>
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(245,158,11,0.1)', borderRadius: 999, fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600 }}>
                ⚡ {categories.filter(c => (c.match_percentage || 0) >= 50 && (c.match_percentage || 0) < 75).length} Moderate
              </div>
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.1)', borderRadius: 999, fontSize: '0.8rem', color: '#f87171', fontWeight: 600 }}>
                🔺 {categories.filter(c => (c.match_percentage || 0) < 50).length} Needs Work
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── View Toggle ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h3>📊 Category Breakdown</h3>
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '0.2rem', gap: '0.2rem' }}>
          <button onClick={() => setViewMode('bar')}
            style={{
              padding: '0.45rem 1rem', border: 'none', borderRadius: 'var(--radius-sm)',
              background: viewMode === 'bar' ? 'var(--gradient-primary)' : 'transparent',
              color: viewMode === 'bar' ? '#fff' : 'var(--text-secondary)',
              fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.3s',
            }}>📊 Bar Chart</button>
          <button onClick={() => setViewMode('radar')}
            style={{
              padding: '0.45rem 1rem', border: 'none', borderRadius: 'var(--radius-sm)',
              background: viewMode === 'radar' ? 'var(--gradient-primary)' : 'transparent',
              color: viewMode === 'radar' ? '#fff' : 'var(--text-secondary)',
              fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.3s',
            }}>🕸️ Radar Chart</button>
        </div>
      </div>

      {/* ── Bar Chart View ── */}
      {viewMode === 'bar' && (
        <div className="glass-card fade-in" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <BarChart categories={categories} />
        </div>
      )}

      {/* ── Radar Chart View ── */}
      {viewMode === 'radar' && (
        <div className="glass-card fade-in" style={{ marginBottom: '1.5rem' }}>
          <RadarChart categories={categories} size={340} />
        </div>
      )}

      {/* ── Category Detail Cards (always visible, compact) ── */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        {categories.map((c, i) => {
          const pct = c.match_percentage || 0;
          return (
            <div key={i} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
              <MiniDonut percentage={pct} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</h4>
                <span style={{
                  fontSize: '0.8rem', fontWeight: 600,
                  color: pct >= 75 ? 'var(--accent-green)' : pct >= 50 ? 'var(--accent-orange)' : 'var(--accent-red)',
                }}>{pct >= 75 ? 'Strong Match' : pct >= 50 ? 'Moderate' : 'Needs Work'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Top Improvements ── */}
      {data.top_improvements?.length > 0 && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>🚀 Top Improvements</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.top_improvements.map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                padding: '0.75rem 1rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-glass)', transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-glass)'; e.currentTarget.style.transform = 'translateX(0)'; }}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                }}>{i + 1}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, paddingTop: '0.15rem' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
