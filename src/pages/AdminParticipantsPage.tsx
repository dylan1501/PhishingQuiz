import { useEffect, useState } from "react";
import { getRemoteAttempts, getRemoteParticipants } from "../apiClient";
import { exportTableToExcel } from "../excelExport";

type ParticipantSortKey = "fullName" | "email" | "totalAttempts" | "createdAt";
type SortDirection = "asc" | "desc";

interface ParticipantRow {
  id: string;
  fullName: string;
  email: string;
  totalAttempts: number;
  createdAt: string;
}

export function AdminParticipantsPage() {
  const [participants, setParticipants] = useState<Awaited<ReturnType<typeof getRemoteParticipants>>>([]);
  const [attempts, setAttempts] = useState<Awaited<ReturnType<typeof getRemoteAttempts>>>([]);
  const [loadError, setLoadError] = useState("");
  const [sortKey, setSortKey] = useState<ParticipantSortKey>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    let active = true;
    Promise.all([getRemoteParticipants(), getRemoteAttempts()])
      .then(([remoteParticipants, remoteAttempts]) => {
        if (active) {
          setParticipants(remoteParticipants);
          setAttempts(remoteAttempts);
        }
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : "Không tải được danh sách người tham gia.");
      });
    return () => {
      active = false;
    };
  }, []);

  const participantRows: ParticipantRow[] = participants.map((participant) => ({
    id: participant.id,
    fullName: participant.fullName,
    email: participant.email,
    totalAttempts: attempts.filter((attempt) => attempt.participantId === participant.id).length,
    createdAt: participant.createdAt,
  }));

  const sortedRows = [...participantRows].sort((firstRow, secondRow) => {
    const direction = sortDirection === "asc" ? 1 : -1;

    if (sortKey === "totalAttempts") {
      return (firstRow.totalAttempts - secondRow.totalAttempts) * direction;
    }

    if (sortKey === "createdAt") {
      return (new Date(firstRow.createdAt).getTime() - new Date(secondRow.createdAt).getTime()) * direction;
    }

    return firstRow[sortKey].localeCompare(secondRow[sortKey], "vi", { sensitivity: "base" }) * direction;
  });

  function changeSort(nextSortKey: ParticipantSortKey) {
    if (nextSortKey === sortKey) {
      setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection(nextSortKey === "createdAt" || nextSortKey === "totalAttempts" ? "desc" : "asc");
  }

  function renderSortHeader(label: string, nextSortKey: ParticipantSortKey) {
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
    const rows = sortedRows.map((participant, index) => [
      index + 1,
      participant.fullName,
      participant.email,
      participant.totalAttempts,
      new Date(participant.createdAt).toLocaleString("vi-VN"),
    ]);
    exportTableToExcel("Danh sách tham dự", ["STT", "Họ tên", "Email", "Số lần thi", "Ngày tham gia"], rows);
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
      {loadError && <div className="notice notice-error">{loadError}</div>}
      <table className="table">
        <thead>
          <tr>
            <th className="stt-col">STT</th>
            <th>{renderSortHeader("Họ tên", "fullName")}</th>
            <th>{renderSortHeader("Email", "email")}</th>
            <th>{renderSortHeader("Số lần thi", "totalAttempts")}</th>
            <th>{renderSortHeader("Ngày tham gia", "createdAt")}</th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((participant, index) => (
            <tr key={participant.id}>
              <td className="stt-col">{index + 1}</td>
              <td>{participant.fullName}</td>
              <td>{participant.email}</td>
              <td>{participant.totalAttempts}</td>
              <td>{new Date(participant.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
