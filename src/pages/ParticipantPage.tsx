import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRemoteParticipant, startRemoteSession } from "../apiClient";

export function ParticipantPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(true);
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
      const remoteParticipant = await createRemoteParticipant(fullName.trim(), email.trim(), consent);
      const remoteSession = await startRemoteSession(remoteParticipant.id);
      navigate(`/quiz/questions/1?session=${encodeURIComponent(remoteSession.id ?? "")}`);
    } catch (remoteError) {
      setError(remoteError instanceof Error ? remoteError.message : "Không khởi tạo được bài thi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="content-card form-card">
      <p className="eyebrow">Thông Tin Người Tham Gia</p>
      <h2>Bắt đầu bài đánh giá nhận diện phishing</h2>
      <p className="section-text">
        Kết quả của bạn sẽ được lưu để hiển thị trên bảng xếp hạng và báo cáo.
      </p>
      <form className="stack" onSubmit={onSubmit}>
        <label>
          Họ và tên
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} />
        </label>
        <label>
          Địa chỉ email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          Tôi đồng ý cho phép lưu kết quả để phục vụ bảng xếp hạng và báo cáo.
        </label>
        {error && <div className="notice notice-error">{error}</div>}
        <button type="submit" className="button button-primary" disabled={submitting}>
          {submitting ? "Đang khởi tạo..." : "Bắt đầu làm bài"}
        </button>
      </form>
    </section>
  );
}
