import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { uploadResume } from '../api/service';

const COMPANY_TYPES = ['MAANG', 'Startup', 'Product-based', 'Service-based', 'Enterprise', 'Fintech'];

const FEATURES = [
  '🔧 Skill Gap Detection', '📝 MCQ Skill Testing', '🗺️ Career Roadmaps',
  '🏢 Company Analysis', '📊 % Match System', '🎮 Career Simulation',
  '✉️ Cover Letter AI', '🛠️ Project Ideas',
];

export default function HomePage() {
  const { saveResume } = useResume();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [desiredRole, setDesiredRole] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [specificCompany, setSpecificCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f) => {
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setError('');
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleSubmit = async () => {
    if (!file) return setError('Please upload your resume');
    if (!desiredRole.trim()) return setError('Please enter your desired role');

    setLoading(true);
    setError('');
    try {
      const res = await uploadResume(file, desiredRole.trim(), companyType, specificCompany.trim());
      saveResume({
        ...res.data,
        company_type: companyType,
        specific_company: specificCompany.trim(),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="hero">
        <div className="hero-content fade-in">
          <h1>AI-Powered <span>Resume Analyzer</span></h1>
          <p>Upload your resume and get instant AI-powered insights — skill gaps, career roadmaps, company-specific analysis, and more.</p>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <span key={f} className="feature-pill">{f}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="page-container">
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          {/* Upload Zone */}
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          >
            <input ref={fileRef} type="file" accept=".pdf" hidden onChange={(e) => handleFile(e.target.files[0])} />
            <div className="upload-icon">{file ? '✅' : '📄'}</div>
            <h3>{file ? 'Resume Uploaded!' : 'Drop your Resume PDF here'}</h3>
            <p>{file ? '' : 'or click to browse • PDF only • Max 10MB'}</p>
            {file && <div className="file-name">{file.name}</div>}
          </div>

          {/* Form Fields */}
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
            <div className="input-group">
              <label>Desired Job Role *</label>
              <input className="input-field" placeholder="e.g. Full Stack Developer, Data Scientist, DevOps Engineer" value={desiredRole} onChange={(e) => setDesiredRole(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>Company Type</label>
                <select className="input-field" value={companyType} onChange={(e) => setCompanyType(e.target.value)}>
                  <option value="">Select type...</option>
                  {COMPANY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Specific Company (optional)</label>
                <input className="input-field" placeholder="e.g. Google, Amazon" value={specificCompany} onChange={(e) => setSpecificCompany(e.target.value)} />
              </div>
            </div>
          </div>

          {error && <div className="error-box" style={{ marginTop: '1rem' }}>{error}</div>}

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center', padding: '1rem' }} onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <><span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span> Analyzing Resume...</>
            ) : (
              '🚀 Analyze My Resume'
            )}
          </button>
        </div>
      </div>
    </>
  );
}
