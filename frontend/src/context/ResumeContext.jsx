import { createContext, useContext, useState } from 'react';

const ResumeContext = createContext(null);

export function ResumeProvider({ children }) {
  const [resumeData, setResumeData] = useState(null);
  // Cache AI results so we don't re-fetch
  const [analysisCache, setAnalysisCache] = useState({});

  const saveResume = (data) => {
    setResumeData(data);
    setAnalysisCache({});
  };

  const cacheResult = (key, data) => {
    setAnalysisCache((prev) => ({ ...prev, [key]: data }));
  };

  const getCached = (key) => analysisCache[key] || null;

  const clearAll = () => {
    setResumeData(null);
    setAnalysisCache({});
  };

  return (
    <ResumeContext.Provider value={{ resumeData, saveResume, cacheResult, getCached, clearAll }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error('useResume must be used within ResumeProvider');
  return ctx;
}
