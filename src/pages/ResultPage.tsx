import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { getRemoteAttempt } from "../apiClient";
import type { Attempt } from "../types";

function getRating(score: number, total: number) {
  const ratio = total === 0 ? 0 : score / total;
  if (ratio <= 0.4) {
    return "Cần cải thiện";
  }
  if (ratio <= 0.7) {
    return "Nhận thức tốt";
  }
  return "Xuất sắc";
}

export function ResultPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const requestedAttemptId = params.get("attempt") ?? "";
  const [remoteAttempt, setRemoteAttempt] = useState<Attempt | null>(null);
  const [loadingRemoteAttempt, setLoadingRemoteAttempt] = useState(Boolean(requestedAttemptId));
  const attempt = remoteAttempt;

  useEffect(() => {
    if (!requestedAttemptId) {
      setLoadingRemoteAttempt(false);
      return;
    }

    let active = true;
    setLoadingRemoteAttempt(true);
    getRemoteAttempt(requestedAttemptId)
      .then((attemptData) => {
        if (active) {
          setRemoteAttempt(attemptData);
        }
      })
      .catch((error) => {
        console.warn("Không lấy được kết quả từ DB.", error);
      })
      .finally(() => {
        if (active) {
          setLoadingRemoteAttempt(false);
        }
      });

    return () => {
      active = false;
    };
  }, [requestedAttemptId]);

  if (loadingRemoteAttempt) {
    return (
      <section className="content-card result-card result-showcase">
        <p className="eyebrow">Hoàn Thành Bài Quiz</p>
        <h2>Đang tải kết quả</h2>
        <p className="section-text">Hệ thống đang lấy kết quả từ cơ sở dữ liệu.</p>
      </section>
    );
  }

  if (!attempt) {
    return <Navigate to="/" replace />;
  }

  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    window.location.origin,
  )}&quote=${encodeURIComponent(
    `Tôi đạt ${attempt.score}/${attempt.totalQuestions} điểm trong Phishing Quiz. Bạn thử xem?`,
  )}`;
  const percent = Math.round((attempt.score / attempt.totalQuestions) * 100);

  return (
    <section className="content-card result-card result-showcase">
      <div className="result-topline">
        <div>
          <p className="eyebrow">Hoàn Thành Bài Quiz</p>
          <h2>Kết quả của bạn</h2>
          <p className="section-text">
            Bạn đã hoàn thành bài đánh giá nhận diện phishing. Xem nhanh thành tích bên dưới.
          </p>
        </div>
        <img
          src="/assets/illustrations/leaderboard-cup.svg"
          alt="Minh họa kết quả hoàn thành bài quiz"
          className="result-illustration"
        />
      </div>

      <div className="result-hero-score">
        <div className="result-score-ring">
          <div className="result-score-center">
            <span className="result-score-value">
              {attempt.score}/{attempt.totalQuestions}
            </span>
            <span className="result-score-percent">{percent}%</span>
          </div>
        </div>
        <div className="result-summary">
          <p className="result-rating">{getRating(attempt.score, attempt.totalQuestions)}</p>
          <p className="result-summary-text">
            {attempt.score === attempt.totalQuestions
              ? "Bạn đã nhận diện chính xác toàn bộ tình huống trong lượt thi này."
              : "Hãy xem lại các phần giải thích để củng cố phản xạ nhận diện trong những tình huống tương tự."}
          </p>
        </div>
      </div>

      <div className="result-grid result-stats-grid">
        <div className="result-stat-card">
          <span>Thời gian hoàn thành</span>
          <strong>{attempt.durationSeconds}s</strong>
        </div>
        <div className="result-stat-card">
          <span>Số câu đúng</span>
          <strong>{attempt.score}</strong>
        </div>
        <div className="result-stat-card">
          <span>Tổng số câu</span>
          <strong>{attempt.totalQuestions}</strong>
        </div>
        <div className="result-stat-card">
          <span>Mức hoàn thành</span>
          <strong>{percent}%</strong>
        </div>
      </div>

      <div className="hero-actions result-actions">
        <a href={shareUrl} target="_blank" rel="noreferrer" className="button button-primary">
          Chia sẻ Facebook
        </a>
        <Link to="/quiz/start" className="button button-ghost">
          Làm lại
        </Link>
        <Link to="/leaderboard" className="button button-ghost">
          Xem bảng xếp hạng
        </Link>
      </div>
    </section>
  );
}
