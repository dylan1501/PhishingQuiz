import { exportTableToExcel } from "../excelExport";
import { getAttempts, getParticipants } from "../storage";

export function AdminAttemptsPage() {
  const attempts = getAttempts();
  const participants = getParticipants();

  function exportExcel() {
    const rows = attempts.map((attempt) => {
      const participant = participants.find((entry) => entry.id === attempt.participantId);
      return [
        participant?.fullName ?? "Không xác định",
        participant?.email ?? "",
        `${attempt.score}/${attempt.totalQuestions}`,
        `${attempt.durationSeconds}s`,
        new Date(attempt.startedAt).toLocaleString("vi-VN"),
        new Date(attempt.completedAt).toLocaleString("vi-VN"),
      ];
    });
    exportTableToExcel(
      "Lịch sử làm bài",
      ["Người tham gia", "Email", "Điểm", "Thời gian", "Bắt đầu lúc", "Hoàn thành lúc"],
      rows,
    );
  }

  return (
    <section className="content-card">
      <p className="eyebrow">Lịch Sử Làm Bài</p>
      <div className="admin-page-heading">
        <div>
          <h2>Chi tiết các lượt thi</h2>
          <p className="section-text">Xuất dữ liệu phục vụ báo cáo đào tạo nhận thức an toàn thông tin.</p>
        </div>
        <button type="button" className="button button-small export-button" onClick={exportExcel}>
          Xuất Excel
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Người tham gia</th>
            <th>Điểm</th>
            <th>Thời gian</th>
            <th>Hoàn thành lúc</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((attempt) => {
            const participant = participants.find((entry) => entry.id === attempt.participantId);
            return (
              <tr key={attempt.id}>
                <td>{participant?.fullName ?? "Không xác định"}</td>
                <td>
                  {attempt.score}/{attempt.totalQuestions}
                </td>
                <td>{attempt.durationSeconds}s</td>
                <td>{new Date(attempt.completedAt).toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
