import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getRemoteAttempt, getRemoteQuizConfig } from "../apiClient";
import { LoadingScreen } from "../components/LoadingScreen";
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
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Video đã nằm sẵn trong cache (prefetch từ câu cuối) có thể "canplay" trước khi effect gắn handler.
  useEffect(() => {
    if (videoRef.current && videoRef.current.readyState >= 3) {
      setVideoReady(true);
    }
  });

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
    return <LoadingScreen label="Đang tải kết quả" />;
  }

  if (!attempt) {
    return <Navigate to="/" replace />;
  }

  // Ngưỡng đọc từ cấu hình hiện tại; nếu không lấy được thì coi như cần đúng toàn bộ.
  const requiredScore = Math.min(passScore ?? attempt.totalQuestions, attempt.totalQuestions);
  const passed = attempt.score >= requiredScore;

  return (
    <section className={`result-verdict ${passed ? "result-pass" : "result-fail"}`}>
      <h1 className="result-title">{passed ? "XIN CHÚC MỪNG" : "THỬ THÁCH THẤT BẠI"}</h1>
      <p className="result-message">
        {passed ? "Bạn đã vượt qua thử thách" : "Rất tiếc, bạn chưa đạt yêu cầu của thử thách"}
      </p>
      <p className="result-score">
        <strong>
          {attempt.score}/{attempt.totalQuestions}
        </strong>
        <span>câu đúng · yêu cầu tối thiểu {requiredScore}/{attempt.totalQuestions}</span>
      </p>
      <video
        key={passed ? "pass" : "fail"}
        ref={videoRef}
        className={`result-video ${videoReady ? "result-video-ready" : ""}`}
        src={passed ? "/assets/videos/result-pass.webm" : "/assets/videos/result-fail.webm"}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={() => setVideoReady(true)}
        aria-hidden="true"
      />
    </section>
  );
}
