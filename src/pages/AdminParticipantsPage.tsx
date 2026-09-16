import { useEffect, useMemo, useState } from "react";
import { getRemoteAttempts, getRemoteParticipants } from "../apiClient";
import { exportTableToExcel } from "../excelExport";
import { PAGE_SIZE_OPTIONS, TablePagination } from "../components/TablePagination";

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);

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

  const sortedRows = useMemo(() => {
    const direction = sortDirection === "asc" ? 1 : -1;
    return [...participantRows].sort((firstRow, secondRow) => {
      if (sortKey === "totalAttempts") {
        return (firstRow.totalAttempts - secondRow.totalAttempts) * direction;
      }

      if (sortKey === "createdAt") {
        return (new Date(firstRow.createdAt).getTime() - new Date(secondRow.createdAt).getTime()) * direction;
      }

      return firstRow[sortKey].localeCompare(secondRow[sortKey], "vi", { sensitivity: "base" }) * direction;
    });
  }, [participantRows, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function changeSort(nextSortKey: ParticipantSortKey) {
    setPage(1);
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
          {pageRows.map((participant, index) => (
            <tr key={participant.id}>
              <td className="stt-col">{(currentPage - 1) * pageSize + index + 1}</td>
              <td>{participant.fullName}</td>
              <td>{participant.email}</td>
              <td>{participant.totalAttempts}</td>
              <td>{new Date(participant.createdAt).toLocaleString()}</td>
            </tr>
          ))}
          {pageRows.length === 0 && (
            <tr>
              <td colSpan={5} className="table-empty">
                Chưa có người tham gia nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <TablePagination
        totalItems={sortedRows.length}
        page={currentPage}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
        itemLabel="người tham gia"
      />
    </section>
  );
}
