import { useEffect, useMemo, useState } from "react";
import { getRemoteAttempts, getRemoteParticipants } from "../apiClient";
import { exportTableToExcel } from "../excelExport";
import { PAGE_SIZE_OPTIONS, TablePagination } from "../components/TablePagination";

// "ranking" là thứ tự mặc định: điểm cao hơn → thời gian ít hơn → hoàn thành sớm hơn.
type AttemptSortKey = "ranking" | "participantName" | "email" | "score" | "durationSeconds" | "completedAt";
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
  const [attempts, setAttempts] = useState<Awaited<ReturnType<typeof getRemoteAttempts>>>([]);
  const [participants, setParticipants] = useState<Awaited<ReturnType<typeof getRemoteParticipants>>>([]);
  const [loadError, setLoadError] = useState("");
  const [sortKey, setSortKey] = useState<AttemptSortKey>("ranking");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);

  useEffect(() => {
    let active = true;
    Promise.all([getRemoteAttempts(), getRemoteParticipants()])
      .then(([remoteAttempts, remoteParticipants]) => {
        if (active) {
          setAttempts(remoteAttempts);
          setParticipants(remoteParticipants);
        }
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : "Không tải được lịch sử làm bài.");
      });
    return () => {
      active = false;
    };
  }, []);

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

  const sortedRows = useMemo(() => {
    const direction = sortDirection === "asc" ? 1 : -1;
    return [...attemptRows].sort((firstRow, secondRow) => {
      if (sortKey === "ranking") {
        // Thứ tự xếp hạng: điểm cao hơn, thời gian ít hơn, rồi hoàn thành sớm hơn.
        // "desc" = hạng tốt nhất lên đầu, nên chiều thuận ở đây ngược với các cột thường.
        const rankDirection = sortDirection === "desc" ? 1 : -1;
        if (firstRow.score !== secondRow.score) {
          return (secondRow.score - firstRow.score) * rankDirection;
        }
        if (firstRow.durationSeconds !== secondRow.durationSeconds) {
          return (firstRow.durationSeconds - secondRow.durationSeconds) * rankDirection;
        }
        return (
          (new Date(firstRow.completedAt).getTime() - new Date(secondRow.completedAt).getTime()) * rankDirection
        );
      }

      if (sortKey === "score" || sortKey === "durationSeconds") {
        return (firstRow[sortKey] - secondRow[sortKey]) * direction;
      }

      if (sortKey === "completedAt") {
        return (new Date(firstRow.completedAt).getTime() - new Date(secondRow.completedAt).getTime()) * direction;
      }

      return firstRow[sortKey].localeCompare(secondRow[sortKey], "vi", { sensitivity: "base" }) * direction;
    });
  }, [attemptRows, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function changeSort(nextSortKey: AttemptSortKey) {
    setPage(1);
    if (nextSortKey === sortKey) {
      setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection(
      nextSortKey === "score" || nextSortKey === "completedAt" || nextSortKey === "durationSeconds" || nextSortKey === "ranking"
        ? "desc"
        : "asc",
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
      {loadError && <div className="notice notice-error">{loadError}</div>}
      <div className="sort-hint">
        <button
          type="button"
          className={`button button-small ${sortKey === "ranking" ? "sort-hint-active" : ""}`}
          onClick={() => changeSort("ranking")}
        >
          Xếp theo thành tích
        </button>
        <span>Điểm cao hơn → thời gian ít hơn → hoàn thành sớm hơn</span>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th className="stt-col">{renderSortHeader("#", "ranking")}</th>
            <th>{renderSortHeader("Người tham gia", "participantName")}</th>
            <th>{renderSortHeader("Email", "email")}</th>
            <th>{renderSortHeader("Điểm", "score")}</th>
            <th>{renderSortHeader("Thời gian", "durationSeconds")}</th>
            <th>{renderSortHeader("Hoàn thành lúc", "completedAt")}</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((attempt, index) => (
            <tr key={attempt.id}>
              <td className="stt-col">{(currentPage - 1) * pageSize + index + 1}</td>
              <td>{attempt.participantName}</td>
              <td>{attempt.email}</td>
              <td>
                {attempt.score}/{attempt.totalQuestions}
              </td>
              <td>{attempt.durationSeconds}s</td>
              <td>{new Date(attempt.completedAt).toLocaleString()}</td>
            </tr>
          ))}
          {pageRows.length === 0 && (
            <tr>
              <td colSpan={6} className="table-empty">
                Chưa có lượt thi nào.
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
        itemLabel="lượt thi"
      />
    </section>
  );
}
