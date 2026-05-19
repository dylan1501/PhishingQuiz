import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getRemoteAttempts,
  getRemoteLeaderboard,
  getRemoteParticipants,
  getRemoteQuizConfig,
  getRemoteQuestions,
  logoutRemoteAdmin,
  saveRemoteQuizConfig,
  type LeaderboardEntry,
} from "../apiClient";
import type { Attempt, Participant, QuizConfig, QuizQuestion } from "../types";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({ questionCount: 10, updatedAt: new Date(0).toISOString() });
  const [questionCountInput, setQuestionCountInput] = useState(String(quizConfig.questionCount));
  const [configMessage, setConfigMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const fastestAttempt = attempts.length
    ? Math.min(...attempts.map((attempt) => attempt.durationSeconds))
    : 0;
  const bestAttempt = attempts.length
    ? attempts.reduce((best, attempt) => {
        if (!best) {
          return attempt;
        }
        if (attempt.score > best.score) {
          return attempt;
        }
        if (attempt.score === best.score && attempt.durationSeconds < best.durationSeconds) {
          return attempt;
        }
        return best;
      }, attempts[0])
    : null;
  const averageScore =
    attempts.length === 0
      ? 0
      : (
          attempts.reduce((total, attempt) => total + attempt.score, 0) / attempts.length
        ).toFixed(1);
  const averageAccuracy =
    attempts.length === 0
      ? 0
      : Math.round(
          (attempts.reduce(
            (total, attempt) => total + attempt.score / attempt.totalQuestions,
            0,
          ) /
            attempts.length) *
            100,
        );

  useEffect(() => {
    let active = true;
    Promise.all([
      getRemoteAttempts(),
      getRemoteParticipants(),
      getRemoteLeaderboard(),
      getRemoteQuestions(),
      getRemoteQuizConfig(),
    ])
      .then(([remoteAttempts, remoteParticipants, remoteLeaderboard, remoteQuestions, remoteQuizConfig]) => {
        if (active) {
          setAttempts(remoteAttempts);
          setParticipants(remoteParticipants);
          setLeaderboard(remoteLeaderboard);
          setActiveQuestions(remoteQuestions);
          setQuizConfig(remoteQuizConfig);
          setQuestionCountInput(String(remoteQuizConfig.questionCount));
        }
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : "Không tải được dữ liệu dashboard.");
      });
    return () => {
      active = false;
    };
  }, []);

  async function saveQuestionCount(event: FormEvent) {
    event.preventDefault();
    const parsedQuestionCount = Number(questionCountInput);
    try {
      const nextConfig = await saveRemoteQuizConfig(parsedQuestionCount);
      setQuizConfig(nextConfig);
      setQuestionCountInput(String(nextConfig.questionCount));
      setConfigMessage(`Đã lưu cấu hình ${nextConfig.questionCount} câu hỏi cho mỗi lượt thi.`);
    } catch (error) {
      setConfigMessage(error instanceof Error ? error.message : "Không lưu được cấu hình bài thi.");
    }
  }

  async function signOut() {
    await logoutRemoteAdmin().catch(() => undefined);
    navigate("/admin/login", { replace: true });
  }

  return (
    <section className="stack admin-dashboard-stack">
      <div className="admin-links">
        <Link to="/admin/participants">
          <img src="/assets/icons/participants.svg" alt="" className="admin-tab-icon" />
          Người tham gia
        </Link>
        <Link to="/admin/attempts">
          <img src="/assets/icons/attempts.svg" alt="" className="admin-tab-icon" />
          Lịch sử làm bài
        </Link>
        <Link to="/admin/questions">
          <img src="/assets/icons/questions.svg" alt="" className="admin-tab-icon" />
          Câu hỏi
        </Link>
        <button type="button" className="button button-small admin-signout-button" onClick={signOut}>
          <img src="/assets/icons/signout.svg" alt="" className="admin-tab-icon" />
          Đăng xuất
        </button>
      </div>
      <div className="content-card admin-hero-card">
        <div className="fish-school" aria-hidden="true">
          <span className="fish fish-one" />
          <span className="fish fish-two" />
          <span className="fish fish-three" />
          <span className="fish fish-four" />
          <span className="fish fish-five" />
        </div>
        <div>
          <p className="eyebrow">Bảng Điều Khiển</p>
          <h2>Toàn cảnh hoạt động của Phishing Quiz</h2>
          <p className="section-text">
            Theo dõi nhanh số lượt thi, mức độ nhận diện phishing và hiệu suất của người tham gia
            trong cùng một màn hình.
          </p>
        </div>
        <img
          src="/assets/illustrations/shield-scan.svg"
          alt="Minh họa bảng điều khiển"
          className="admin-hero-illustration"
        />
      </div>
      {loadError && <div className="notice notice-error">{loadError}</div>}
      <div className="content-card quiz-config-card">
        <div>
          <p className="eyebrow">Cấu Hình Bài Thi</p>
          <h3>Số câu hỏi mỗi lượt thi</h3>
          <p className="section-text">
            Mặc định là 10 câu. Các câu được đánh dấu “Luôn có” vẫn được ưu tiên đưa vào đề,
            phần còn lại được random từ ngân hàng câu hỏi đang bật.
          </p>
        </div>
        <form className="quiz-config-form" onSubmit={saveQuestionCount}>
          <label>
            Số câu
            <input
              type="number"
              min={1}
              max={Math.max(activeQuestions.length, 1)}
              value={questionCountInput}
              onChange={(event) => {
                setQuestionCountInput(event.target.value);
                setConfigMessage("");
              }}
            />
          </label>
          <button type="submit" className="button button-primary">
            Lưu cấu hình
          </button>
          <span className="quiz-config-hint">
            Đang bật {activeQuestions.length} câu. Hiện cấu hình: {quizConfig.questionCount} câu/lượt.
          </span>
          {configMessage && <span className="quiz-config-message">{configMessage}</span>}
        </form>
      </div>
      <div className="dashboard-grid">
        <article className="content-card dashboard-metric-card">
          <span>Tổng lượt thi</span>
          <strong>{attempts.length}</strong>
          <p>Toàn bộ số lần hoàn thành quiz đã được ghi nhận.</p>
        </article>
        <article className="content-card dashboard-metric-card">
          <span>Số người tham gia</span>
          <strong>{participants.length}</strong>
          <p>Số lượng người dùng đã để lại thông tin và tham dự bài đánh giá.</p>
        </article>
        <article className="content-card dashboard-metric-card">
          <span>Điểm trung bình</span>
          <strong>{averageScore}</strong>
          <p>Mức điểm trung bình trên mỗi lượt thi từ toàn bộ dữ liệu hiện có.</p>
        </article>
        <article className="content-card dashboard-metric-card">
          <span>Người dẫn đầu</span>
          <strong>{leaderboard[0]?.participant?.fullName ?? "Chưa có dữ liệu"}</strong>
          <p>Người có thứ hạng cao nhất theo score, thời gian và thời điểm hoàn thành.</p>
        </article>
      </div>
      <div className="admin-insight-grid">
        <article className="content-card admin-insight-card">
          <p className="eyebrow">Insight Nhanh</p>
          <h3>Tỷ lệ nhận diện trung bình</h3>
          <strong className="admin-highlight">{averageAccuracy}%</strong>
          <p className="section-text">
            Đây là tỷ lệ đúng trung bình của tất cả lượt thi đã hoàn thành.
          </p>
        </article>
        <article className="content-card admin-insight-card">
          <p className="eyebrow">Tốc Độ Tốt Nhất</p>
          <h3>Lượt thi nhanh nhất</h3>
          <strong className="admin-highlight">
            {fastestAttempt ? `${fastestAttempt}s` : "Chưa có dữ liệu"}
          </strong>
          <p className="section-text">
            Mốc thời gian hoàn thành nhanh nhất hiện có trong hệ thống.
          </p>
        </article>
        <article className="content-card admin-insight-card">
          <p className="eyebrow">Mức Điểm Cao Nhất</p>
          <h3>Điểm tốt nhất</h3>
          <strong className="admin-highlight">
            {bestAttempt ? `${bestAttempt.score}/${bestAttempt.totalQuestions}` : "Chưa có dữ liệu"}
          </strong>
          <p className="section-text">
            Điểm số cao nhất đã đạt được trong các lượt thi hiện có.
          </p>
        </article>
      </div>
    </section>
  );
}
