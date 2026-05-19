import { useState } from "react";
import { exportTableToExcel } from "../excelExport";
import { getAttempts, getParticipants } from "../storage";

type AttemptSortKey = "participantName" | "email" | "score" | "durationSeconds" | "completedAt";
type SortDirection = "asc" | "desc";

interface AttemptRow {
  id: string;
  participantName: string;
  email: string;
  score: number;
  totalQuestions: number;
  durationSeconds: number;
  startedAt: string;
  completedAt: string;
}

export function AdminAttemptsPage() {
  const attempts = getAttempts();
  const participants = getParticipants();
  const [sortKey, setSortKey] = useState<AttemptSortKey>("completedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const attemptRows: AttemptRow[] = attempts.map((attempt) => {
    const participant = participants.find((entry) => entry.id === attempt.participantId);
    return {
      id: attempt.id,
      participantName: participant?.fullName ?? "Không xác định",
      email: participant?.email ?? "",
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      durationSeconds: attempt.durationSeconds,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
    };
  });

  const sortedRows = [...attemptRows].sort((firstRow, secondRow) => {
    const direction = sortDirection === "asc" ? 1 : -1;

    if (sortKey === "score" || sortKey === "durationSeconds") {
      return (firstRow[sortKey] - secondRow[sortKey]) * direction;
    }

    if (sortKey === "completedAt") {
      return (new Date(firstRow.completedAt).getTime() - new Date(secondRow.completedAt).getTime()) * direction;
    }

    return firstRow[sortKey].localeCompare(secondRow[sortKey], "vi", { sensitivity: "base" }) * direction;
  });

  function changeSort(nextSortKey: AttemptSortKey) {
    if (nextSortKey === sortKey) {
      setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection(
      nextSortKey === "score" || nextSortKey === "completedAt" || nextSortKey === "durationSeconds" ? "desc" : "asc",
    );
  }

  function renderSortHeader(label: string, nextSortKey: AttemptSortKey) {
    const isActive = sortKey === nextSortKey;
    return (
      <button type="button" className="table-sort-button" onClick={() => changeSort(nextSortKey)}>
        <span>{label}</span>
        <span className={`sort-indicator ${isActive ? "sort-indicator-active" : ""}`}>
          {isActive ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    );
  }

  function exportExcel() {
    const rows = sortedRows.map((attempt, index) => [
      index + 1,
      attempt.participantName,
      attempt.email,
      `${attempt.score}/${attempt.totalQuestions}`,
      `${attempt.durationSeconds}s`,
      new Date(attempt.startedAt).toLocaleString("vi-VN"),
      new Date(attempt.completedAt).toLocaleString("vi-VN"),
    ]);
    exportTableToExcel(
      "Lịch sử làm bài",
      ["STT", "Người tham gia", "Email", "Điểm", "Thời gian", "Bắt đầu lúc", "Hoàn thành lúc"],
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
            <th className="stt-col">STT</th>
            <th>{renderSortHeader("Người tham gia", "participantName")}</th>
            <th>{renderSortHeader("Email", "email")}</th>
            <th>{renderSortHeader("Điểm", "score")}</th>
            <th>{renderSortHeader("Thời gian", "durationSeconds")}</th>
            <th>{renderSortHeader("Hoàn thành lúc", "completedAt")}</th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((attempt, index) => (
            <tr key={attempt.id}>
              <td className="stt-col">{index + 1}</td>
              <td>{attempt.participantName}</td>
              <td>{attempt.email}</td>
              <td>
                {attempt.score}/{attempt.totalQuestions}
              </td>
              <td>{attempt.durationSeconds}s</td>
              <td>{new Date(attempt.completedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
