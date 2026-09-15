import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRemoteParticipant, startRemoteSession } from "../apiClient";

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
      // Kết quả luôn được lưu để phục vụ bảng xếp hạng và báo cáo.
      const remoteParticipant = await createRemoteParticipant(fullName.trim(), email.trim(), true);
      const remoteSession = await startRemoteSession(remoteParticipant.id);
      navigate(`/quiz/questions/1?session=${encodeURIComponent(remoteSession.id ?? "")}`);
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
