import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRemoteQuizConfig, startRemoteQuizForTeam, TEAM_OPTIONS } from "../apiClient";

export function ParticipantPage() {
  const [team, setTeam] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requireInfo, setRequireInfo] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    getRemoteQuizConfig()
      .then((config) => {
        if (active) {
          setRequireInfo(config.requireParticipantInfo);
        }
      })
      .catch(() => {
        if (active) {
          setRequireInfo(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!TEAM_OPTIONS.includes(team)) {
      setError("Vui lòng chọn đội liên minh của bạn.");
      return;
    }
    if (requireInfo) {
      if (!fullName.trim()) {
        setError("Vui lòng nhập tên của bạn.");
        return;
      }
      if (!email.trim()) {
        setError("Vui lòng nhập email của bạn.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Email không hợp lệ.");
        return;
      }
    }
    setSubmitting(true);
    setError("");
    try {
      // Server tự đánh số "Người chơi N" và mở phiên trong cùng một request.
      const quizStart = await startRemoteQuizForTeam(team, requireInfo ? fullName : undefined, requireInfo ? email : undefined);
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
      <h2>{requireInfo ? "Thông tin người tham gia" : "Thông tin đội liên minh"}</h2>
      <form className="stack participant-form" onSubmit={onSubmit}>
        {requireInfo && (
          <>
            <label>
              Tên của bạn
              <input
                type="text"
                value={fullName}
                onChange={(event) => {
                  setFullName(event.target.value);
                  setError("");
                }}
                placeholder="Nhập tên đầy đủ"
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="Nhập email của bạn"
                required
              />
            </label>
          </>
        )}
        <div>
          <label style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Chọn đội liên minh</label>
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
        </div>
        {error && <div className="notice notice-error">{error}</div>}
        <button type="submit" className="button button-primary" disabled={submitting || !team}>
          {submitting ? "Đang khởi tạo..." : "Bắt đầu làm bài"}
        </button>
      </form>
    </section>
  );
}
