<<<<<<< HEAD
# 🚀 AI Resume Analyzer

An AI-powered Resume Analysis platform that leverages **Google Gemini AI** to provide intelligent career insights, skill gap detection, and personalized roadmaps.

![Tech Stack](https://img.shields.io/badge/React-19-blue?logo=react)
![Tech Stack](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![Tech Stack](https://img.shields.io/badge/Gemini-AI-purple?logo=google)
![Tech Stack](https://img.shields.io/badge/Vite-8-yellow?logo=vite)

---

## ✨ Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | 🔧 **Skill Gap Analysis** | Identifies missing tools & technologies with learning resources |
| 2 | 🗺️ **Career Roadmaps** | Short-term (1-3 month) and long-term personalized roadmaps |
| 3 | 🏢 **Company Fit Analysis** | Evaluates resume strengths/gaps for specific companies |
| 4 | 📊 **% Match Visualization** | Interactive donut, bar & radar charts for resume match scoring |
| 5 | 🎯 **Role Matching** | AI-recommended best-fit roles based on your skills |
| 6 | 📝 **Cover Letter Generator** | Role-specific AI-generated cover letters |
| 7 | 🧠 **Skill Quiz** | Timed MCQ assessments to test your knowledge |
| 8 | 🔮 **Career Simulation** | Multi-year career path predictions |
| 9 | 💼 **Resume Builder** | ATS-friendly resume builder for targeted applications |
| 10 | 💡 **Project Suggestions** | AI-curated portfolio project ideas |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite 8
- **React Router v7** for SPA navigation
- **Custom CSS** with glassmorphism design, dark/light theme
- **SVG Charts** — interactive donut, bar & radar (zero dependencies)

### Backend
- **Node.js** + **Express 4**
- **Google Gemini AI** (`@google/generative-ai`)
- **Multer** for PDF resume uploads
- **pdf-parse** for text extraction

---

## 📁 Project Structure

```
hackathon/
├── frontend/               # React + Vite SPA
│   ├── src/
│   │   ├── pages/          # Page components (Dashboard, Quiz, etc.)
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (ResumeContext)
│   │   ├── api/            # API service layer
│   │   ├── App.jsx         # Root app with routing
│   │   └── index.css       # Global styles & design system
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                # Express API server
│   ├── server.js           # Entry point
│   ├── routes/             # API routes
│   ├── services/           # Gemini AI & PDF parsing
│   ├── middleware/         # Rate limiting, etc.
│   ├── uploads/            # Temporary PDF storage (gitignored)
│   ├── .env.example        # Environment variable template
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ installed
- **Google Gemini API Key** — [Get one free here](https://aistudio.google.com/apikey)

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/ai-resume-analyzer.git
cd ai-resume-analyzer
```

### 2. Setup Backend
```bash
cd backend
npm install

# Create your environment file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 3. Setup Frontend
```bash
cd frontend
npm install
```

### 4. Run the App
Open **two terminals**:

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | ✅ Yes |
| `PORT` | Backend server port (default: 5000) | ❌ Optional |

---

## 📸 Screenshots

> Upload your resume → Get instant AI-powered analysis across 10+ features with interactive visualizations.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using React, Express & Google Gemini AI
</p>
=======
# devsummit2026
>>>>>>> cda02edb5c437de0cb17da68ae09a894e526b7d2
