import { useEffect } from "react";
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

function Layout() {
  const location = useLocation();
  const adminView = location.pathname.startsWith("/admin");
  const quizTakingView = location.pathname.startsWith("/quiz/questions");

  return (
    <div className={`app-shell ${quizTakingView ? "quiz-taking-shell" : ""}`}>
      {!quizTakingView && (
        <header className="site-header">
          <NavLink to="/" className="brand">
            Phishing Quiz
          </NavLink>
          {!adminView && (
            <nav className="site-nav">
              <NavLink to="/leaderboard">Bảng xếp hạng</NavLink>
              <NavLink to="/quiz/start">Làm bài quiz</NavLink>
            </nav>
          )}
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
