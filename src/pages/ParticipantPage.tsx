import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { startRemoteQuiz } from "../apiClient";

export function ParticipantPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (fullName.trim().length < 2) {
      setError("Họ tên phải có ít nhất 2 ký tự.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Vui lòng nhập email hợp lệ.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      // Một request: tạo người tham gia + mở phiên + nhận luôn bộ câu hỏi. Kết quả luôn được lưu
      // để phục vụ bảng xếp hạng và báo cáo. Payload đi kèm router state để QuizPage không phải tải lại.
      const quizStart = await startRemoteQuiz(fullName.trim(), email.trim(), true);
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
      <h2>Thông tin người tham gia</h2>
      <form className="stack participant-form" onSubmit={onSubmit}>
        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Họ và tên *"
          aria-label="Họ và tên (bắt buộc)"
          autoComplete="name"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Địa chỉ email *"
          aria-label="Địa chỉ email (bắt buộc)"
          autoComplete="email"
          required
        />
        {error && <div className="notice notice-error">{error}</div>}
        <button type="submit" className="button button-primary" disabled={submitting}>
          {submitting ? "Đang khởi tạo..." : "Bắt đầu làm bài"}
        </button>
      </form>
    </section>
  );
}
