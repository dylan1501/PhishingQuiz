import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { startRemoteQuizForTeam, TEAM_OPTIONS } from "../apiClient";

export function ParticipantPage() {
  const [team, setTeam] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!TEAM_OPTIONS.includes(team)) {
      setError("Vui lòng chọn đội liên minh của bạn.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      // Server tự đánh số "Người chơi N" và mở phiên trong cùng một request.
      const quizStart = await startRemoteQuizForTeam(team);
      navigate(`/quiz/questions/1?session=${encodeURIComponent(quizStart.session.id ?? "")}`, {
        state: { quizStart },
      });
    } catch (remoteError) {
      setError(remoteError instanceof Error ? remoteError.message : "Không khởi tạo được bài thi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="content-card form-card participant-card">
      <h2>Thông tin đội liên minh</h2>
      <form className="stack participant-form" onSubmit={onSubmit}>
        <div className="team-grid" role="radiogroup" aria-label="Chọn đội liên minh">
          {TEAM_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={team === option}
              className={`team-option ${team === option ? "team-option-active" : ""}`}
              onClick={() => {
                setTeam(option);
                setError("");
              }}
            >
              {option}
            </button>
          ))}
        </div>
        {error && <div className="notice notice-error">{error}</div>}
        <button type="submit" className="button button-primary" disabled={submitting || !team}>
          {submitting ? "Đang khởi tạo..." : "Bắt đầu làm bài"}
        </button>
      </form>
    </section>
  );
}
