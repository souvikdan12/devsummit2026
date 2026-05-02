import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { generateQuiz } from '../api/service';

export default function QuizPage() {
  const { resumeData, getCached, cacheResult } = useResume();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [results, setResults] = useState([]);
  const timerRef = useRef(null);

  if (!resumeData) return <div className="page-container"><div className="need-resume"><h3>📄 No Resume Uploaded</h3><p>Upload your resume first.</p><button className="btn btn-primary" onClick={() => navigate('/')}>Go to Upload</button></div></div>;

  const startQuiz = async () => {
    const cached = getCached('quiz');
    if (cached) { setQuestions(cached); setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const skills = extractSkills(resumeData.resume_text);
      const res = await generateQuiz(skills, 10, 'mixed');
      const q = res.data.questions || [];
      setQuestions(q);
      cacheResult('quiz', q);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (questions.length > 0 && !finished && !answered) {
      setTimer(30);
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [current, questions.length, answered]);

  function handleTimeout() {
    setAnswered(true);
    setResults(prev => [...prev, { question: current, correct: false, skill: questions[current]?.skill }]);
  }

  function handleSelect(opt) {
    if (answered) return;
    clearInterval(timerRef.current);
    setSelected(opt);
    setAnswered(true);
    const isCorrect = opt === questions[current].correct_answer;
    if (isCorrect) setScore(s => s + 1);
    setResults(prev => [...prev, { question: current, correct: isCorrect, skill: questions[current]?.skill }]);
  }

  function nextQuestion() {
    if (current + 1 >= questions.length) { setFinished(true); return; }
    setCurrent(c => c + 1);
    setSelected(null);
    setAnswered(false);
  }

  function resetQuiz() {
    setCurrent(0); setSelected(null); setAnswered(false);
    setScore(0); setFinished(false); setResults([]);
    cacheResult('quiz', null);
    setQuestions([]);
  }

  // Not started yet
  if (questions.length === 0 && !loading) {
    return (
      <div className="page-container">
        <div className="page-header fade-in"><h2>🧠 Skill Test</h2><p>Test your proficiency with AI-generated MCQs based on your resume skills.</p></div>
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Ready to test your skills?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>10 questions • 30 seconds each • Instant feedback</p>
          {error && <div className="error-box" style={{ marginBottom: '1rem' }}>{error}</div>}
          <button className="btn btn-primary" onClick={startQuiz}>Start Quiz →</button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="page-container"><div className="spinner-overlay"><div className="spinner"></div><p className="spinner-text">AI is generating questions from your skills...</p></div></div>;

  // Finished
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const skillMap = {};
    results.forEach(r => { if (!skillMap[r.skill]) skillMap[r.skill] = { correct: 0, total: 0 }; skillMap[r.skill].total++; if (r.correct) skillMap[r.skill].correct++; });
    return (
      <div className="page-container">
        <div className="quiz-score-card fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem' }}>Quiz Complete!</h2>
            <div className="quiz-score-big">{score}/{questions.length}</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: '0.5rem 0 1.5rem' }}>{pct}% — {pct >= 80 ? '🌟 Excellent!' : pct >= 60 ? '👍 Good job!' : pct >= 40 ? '💪 Keep learning!' : '📚 More practice needed'}</p>
            <div className="progress-bar" style={{ marginBottom: '2rem' }}><div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--gradient-primary)' }}></div></div>
            <div className="skill-breakdown">
              <h3 style={{ marginBottom: '1rem', textAlign: 'left' }}>Skill Breakdown</h3>
              {Object.entries(skillMap).map(([skill, d]) => (
                <div key={skill} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                  <span>{skill}</span>
                  <span style={{ fontWeight: 600, color: d.correct === d.total ? 'var(--accent-green)' : 'var(--accent-orange)' }}>{d.correct}/{d.total}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={resetQuiz}>Retake Quiz</button>
          </div>
        </div>
      </div>
    );
  }

  // Active quiz
  const q = questions[current];
  return (
    <div className="page-container">
      <div className="quiz-container fade-in">
        <div className="quiz-header">
          <span className="quiz-progress-text">Question {current + 1} of {questions.length}</span>
          <span className={`quiz-timer ${timer <= 10 ? 'warning' : ''} ${timer <= 5 ? 'danger' : ''}`}>⏱️ {timer}s</span>
        </div>
        <div className="progress-bar" style={{ marginBottom: '1.5rem' }}><div className="progress-fill" style={{ width: `${((current + 1) / questions.length) * 100}%`, background: 'var(--gradient-primary)' }}></div></div>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span className={`badge badge-${q.difficulty}`}>{q.difficulty}</span>
            <span className="tech-pill">{q.skill}</span>
          </div>
          <p className="quiz-question">{q.question}</p>
          <div className="quiz-options">
            {['a', 'b', 'c', 'd'].map(opt => {
              let cls = 'quiz-option';
              if (answered && opt === q.correct_answer) cls += ' correct';
              else if (answered && opt === selected && opt !== q.correct_answer) cls += ' wrong';
              else if (!answered && opt === selected) cls += ' selected';
              if (answered) cls += ' disabled';
              return (
                <div key={opt} className={cls} onClick={() => handleSelect(opt)}>
                  <span className="opt-letter">{opt.toUpperCase()}</span>
                  <span>{q.options[opt]}</span>
                </div>
              );
            })}
          </div>
          {answered && q.explanation && <div className="quiz-explanation">💡 {q.explanation}</div>}
          {answered && <div className="quiz-actions"><button className="btn btn-primary" onClick={nextQuestion}>{current + 1 >= questions.length ? 'See Results' : 'Next Question →'}</button></div>}
        </div>
      </div>
    </div>
  );
}

function extractSkills(text) {
  const common = ['JavaScript','Python','Java','C++','React','Node.js','SQL','MongoDB','AWS','Docker','Git','TypeScript','HTML','CSS','Redux','Express','Django','Flask','Machine Learning','Data Science','TensorFlow','Kubernetes','Linux','REST API','GraphQL','PostgreSQL','MySQL','Firebase','Azure','GCP','Golang','Rust','Swift','Kotlin','Flutter','Angular','Vue','Next.js','Spring Boot','PHP','Ruby','Scala','Hadoop','Spark','Tableau','Power BI','Excel','R','MATLAB','Figma','Photoshop','Jira','Agile','Scrum','CI/CD','Jenkins','Terraform'];
  const found = common.filter(s => text.toLowerCase().includes(s.toLowerCase()));
  return found.length > 0 ? found.slice(0, 8) : ['Programming', 'Web Development', 'Problem Solving'];
}
