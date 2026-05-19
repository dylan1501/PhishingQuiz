import { useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AdminAttemptsPage } from "./pages/AdminAttemptsPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminParticipantsPage } from "./pages/AdminParticipantsPage";
import { AdminQuestionsPage } from "./pages/AdminQuestionsPage";
import { HomePage } from "./pages/HomePage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ParticipantPage } from "./pages/ParticipantPage";
import { QuizPage } from "./pages/QuizPage";
import { ResultPage } from "./pages/ResultPage";
import { initializeStorage, isAdminAuthenticated } from "./storage";

type ThemeMode = "dark" | "light";

function Layout() {
  const location = useLocation();
  const adminView = location.pathname.startsWith("/admin");
  const quizTakingView = location.pathname.startsWith("/quiz/questions");
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "light";
    }
    return localStorage.getItem("phishing-quiz-theme") === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    localStorage.setItem("phishing-quiz-theme", themeMode);
  }, [themeMode]);

  return (
    <div className={`app-shell ${quizTakingView ? "quiz-taking-shell" : ""}`}>
      {!quizTakingView && (
        <header className="site-header">
          <NavLink to="/" className="brand">
            Phishing Quiz
          </NavLink>
          <div className="header-actions">
            {!adminView && (
              <nav className="site-nav">
                <NavLink to="/leaderboard">Bảng xếp hạng</NavLink>
                <NavLink to="/quiz/start">Làm bài quiz</NavLink>
              </nav>
            )}
            <button
              type="button"
              className={`theme-toggle theme-toggle-${themeMode}`}
              onClick={() => setThemeMode((currentMode) => (currentMode === "dark" ? "light" : "dark"))}
              aria-label={`Đổi sang giao diện ${themeMode === "dark" ? "Light" : "Dark"}`}
              aria-pressed={themeMode === "light"}
            >
              <span className="theme-toggle-track" aria-hidden="true">
                <span className="theme-toggle-thumb">
                  {themeMode === "dark" ? "☾" : "☀"}
                </span>
              </span>
            </button>
          </div>
        </header>
      )}
      <main className={`page-shell ${quizTakingView ? "quiz-taking-page" : ""}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quiz/start" element={<ParticipantPage />} />
          <Route path="/quiz/questions/:index" element={<QuizPage />} />
          <Route path="/quiz/result" element={<ResultPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/participants" element={<AdminRoute><AdminParticipantsPage /></AdminRoute>} />
          <Route path="/admin/attempts" element={<AdminRoute><AdminAttemptsPage /></AdminRoute>} />
          <Route path="/admin/questions" element={<AdminRoute><AdminQuestionsPage /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!quizTakingView && (
        <footer className="site-footer">
          Phòng An ninh thông tin - Trung tâm Công nghệ Thông tin
        </footer>
      )}
    </div>
  );
}

function AdminRoute({ children }: { children: React.ReactElement }) {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default function App() {
  useEffect(() => {
    initializeStorage();
  }, []);

  return <Layout />;
}
