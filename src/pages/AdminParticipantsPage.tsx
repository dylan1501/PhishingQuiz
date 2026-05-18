import { exportTableToExcel } from "../excelExport";
import { getAttempts, getParticipants } from "../storage";

export function AdminParticipantsPage() {
  const participants = getParticipants();
  const attempts = getAttempts();

  function exportExcel() {
    const rows = participants
      .map((participant) => {
        const totalAttempts = attempts.filter((attempt) => attempt.participantId === participant.id).length;
        return [
          participant.fullName,
          participant.email,
          totalAttempts,
          new Date(participant.createdAt).toLocaleString("vi-VN"),
        ];
      });
    exportTableToExcel("Danh sách tham dự", ["Họ tên", "Email", "Số lần thi", "Ngày tham gia"], rows);
  }

  return (
    <section className="content-card">
      <p className="eyebrow">Người Tham Gia</p>
      <div className="admin-page-heading">
        <div>
          <h2>Danh sách người làm quiz</h2>
          <p className="section-text">Theo dõi thông tin người tham gia và số lần làm bài.</p>
        </div>
        <button type="button" className="button button-small export-button" onClick={exportExcel}>
          Xuất Excel
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Số lần thi</th>
            <th>Ngày tham gia</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((participant) => (
            <tr key={participant.id}>
              <td>{participant.fullName}</td>
              <td>{participant.email}</td>
              <td>
                {attempts.filter((attempt) => attempt.participantId === participant.id).length}
              </td>
              <td>{new Date(participant.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
