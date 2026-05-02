import { NavLink } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { resumeData } = useResume();
  const hasResume = !!resumeData;

  // Theme state — read from localStorage, default to dark
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('resumeai-theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('resumeai-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo">⚡ ResumeAI Pro</NavLink>
        <div className="navbar-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
          {hasResume && (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
              <NavLink to="/quiz" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Skill Test</NavLink>
              <NavLink to="/simulation" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Career Path</NavLink>
              <NavLink to="/coverletter" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Cover Letter</NavLink>
              <NavLink to="/resume-builder" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Resume Builder</NavLink>
              <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Projects</NavLink>
            </>
          )}
          <button
            id="theme-toggle"
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}
