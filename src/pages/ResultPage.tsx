import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getRemoteAttempt, getRemoteQuizConfig } from "../apiClient";
import type { Attempt } from "../types";

type ResultState = { result?: { attempt: Attempt; passScore: number } } | null;

export function ResultPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const requestedAttemptId = params.get("attempt") ?? "";
  // QuizPage chuyển sẵn kết quả qua router state → không cần gọi API; chỉ fetch khi mở link trực tiếp.
  const preloaded = (location.state as ResultState)?.result;
  const hasPreloaded = Boolean(preloaded && preloaded.attempt.id === requestedAttemptId);
  const [attempt, setAttempt] = useState<Attempt | null>(hasPreloaded ? preloaded!.attempt : null);
  const [passScore, setPassScore] = useState<number | null>(hasPreloaded ? preloaded!.passScore : null);
  const [loading, setLoading] = useState(Boolean(requestedAttemptId) && !hasPreloaded);

  useEffect(() => {
    if (!requestedAttemptId || hasPreloaded) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    Promise.all([getRemoteAttempt(requestedAttemptId), getRemoteQuizConfig()])
      .then(([attemptData, quizConfig]) => {
        if (active) {
          setAttempt(attemptData);
          setPassScore(quizConfig.passScore);
        }
      })
      .catch((error) => {
        console.warn("Không lấy được kết quả từ DB.", error);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [requestedAttemptId, hasPreloaded]);

  if (loading) {
    return (
      <section className="content-card result-card result-verdict">
        <h2>Đang tải kết quả…</h2>
      </section>
    );
  }

  if (!attempt) {
    return <Navigate to="/" replace />;
  }

  // Ngưỡng đọc từ cấu hình hiện tại; nếu không lấy được thì coi như cần đúng toàn bộ.
  const requiredScore = Math.min(passScore ?? attempt.totalQuestions, attempt.totalQuestions);
  const passed = attempt.score >= requiredScore;

  return (
    <section className={`content-card result-card result-verdict ${passed ? "result-pass" : "result-fail"}`}>
      <video
        key={passed ? "pass" : "fail"}
        className="result-video"
        src={passed ? "/assets/videos/result-pass.webm" : "/assets/videos/result-fail.webm"}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
      <h1 className="result-title">{passed ? "CHÚC MỪNG" : "THỬ THÁCH THẤT BẠI"}</h1>
      <p className="result-message">
        {passed ? "Bạn đã vượt qua thử thách" : "Rất tiếc, bạn chưa đạt yêu cầu của thử thách"}
      </p>
      <p className="result-score">
        <strong>
          {attempt.score}/{attempt.totalQuestions}
        </strong>
        <span>câu đúng · yêu cầu tối thiểu {requiredScore}/{attempt.totalQuestions}</span>
      </p>
    </section>
  );
}
