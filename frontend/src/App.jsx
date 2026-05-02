import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ResumeProvider } from './context/ResumeContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import QuizPage from './pages/QuizPage';
import SimulationPage from './pages/SimulationPage';
import CoverLetterPage from './pages/CoverLetterPage';
import ProjectsPage from './pages/ProjectsPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <ResumeProvider>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/simulation" element={<SimulationPage />} />
            <Route path="/coverletter" element={<CoverLetterPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/resume-builder" element={<ResumeBuilderPage />} />
          </Routes>
        </main>
      </ResumeProvider>
    </BrowserRouter>
  );
}
