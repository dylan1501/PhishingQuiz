import { useEffect, useMemo, useState } from "react";
import { deleteAdminParticipants, getRemoteAttempts, getRemoteParticipants } from "../apiClient";
import { exportTableToExcel } from "../excelExport";
import { PAGE_SIZE_OPTIONS, TablePagination } from "../components/TablePagination";
import { PencilIcon, TrashIcon } from "../components/icons";

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
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState("");

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

  function toggleSelected(participantId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(participantId)) {
        next.delete(participantId);
      } else {
        next.add(participantId);
      }
      return next;
    });
  }

  // Checkbox ở tiêu đề chọn/bỏ chọn toàn bộ danh sách sau khi lọc & sắp xếp (không chỉ trang hiện tại).
  const allSelected = sortedRows.length > 0 && sortedRows.every((row) => selectedIds.has(row.id));
  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(sortedRows.map((row) => row.id)));
  }

  function exitEditMode() {
    setEditMode(false);
    setSelectedIds(new Set());
  }

  async function deleteSelected() {
    setDeleting(true);
    setLoadError("");
    try {
      const ids = [...selectedIds];
      const result = await deleteAdminParticipants(ids);
      setParticipants((current) => current.filter((participant) => !selectedIds.has(participant.id)));
      setAttempts((current) => current.filter((attempt) => !selectedIds.has(attempt.participantId)));
      setNotice(`Đã xóa ${result.deleted} người tham gia cùng lịch sử làm bài của họ.`);
      setConfirmDelete(false);
      exitEditMode();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Không xóa được người tham gia.");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

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
        <h2>Danh sách người làm quiz</h2>
        <div className="admin-page-actions">
          {editMode ? (
            <>
              <button
                type="button"
                className="button button-small button-danger"
                disabled={selectedIds.size === 0}
                onClick={() => setConfirmDelete(true)}
              >
                <TrashIcon />
                Xóa {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
              </button>
              <button type="button" className="button button-small" onClick={exitEditMode}>
                Xong
              </button>
            </>
          ) : (
            <button type="button" className="button button-small" onClick={() => setEditMode(true)}>
              <PencilIcon />
              Chỉnh sửa
            </button>
          )}
          <button type="button" className="button button-small export-button" onClick={exportExcel}>
            Xuất Excel
          </button>
        </div>
      </div>
      {loadError && <div className="notice notice-error">{loadError}</div>}
      {notice && <div className="notice notice-success">{notice}</div>}
      <table className="table">
        <thead>
          <tr>
            {editMode && (
              <th className="select-col">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  aria-label="Chọn tất cả người tham gia"
                />
              </th>
            )}
            <th className="stt-col">STT</th>
            <th>{renderSortHeader("Họ tên", "fullName")}</th>
            <th>{renderSortHeader("Email", "email")}</th>
            <th>{renderSortHeader("Số lần thi", "totalAttempts")}</th>
            <th>{renderSortHeader("Ngày tham gia", "createdAt")}</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((participant, index) => (
            <tr key={participant.id} className={editMode && selectedIds.has(participant.id) ? "row-selected" : ""}>
              {editMode && (
                <td className="select-col">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(participant.id)}
                    onChange={() => toggleSelected(participant.id)}
                    aria-label={`Chọn ${participant.fullName}`}
                  />
                </td>
              )}
              <td className="stt-col">{(currentPage - 1) * pageSize + index + 1}</td>
              <td>{participant.fullName}</td>
              <td>{participant.email}</td>
              <td>{participant.totalAttempts}</td>
              <td>{new Date(participant.createdAt).toLocaleString()}</td>
            </tr>
          ))}
          {pageRows.length === 0 && (
            <tr>
              <td colSpan={editMode ? 6 : 5} className="table-empty">
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
      {confirmDelete && (
        <div className="modal-backdrop preview-modal-backdrop" onClick={() => !deleting && setConfirmDelete(false)}>
          <div
            className="modal-card confirm-modal-card"
            role="alertdialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="eyebrow">Xóa Người Tham Gia</p>
            <h3>Xóa {selectedIds.size} người đã chọn?</h3>
            <p className="section-text">
              Toàn bộ lượt thi và câu trả lời của những người này cũng bị xóa khỏi bảng xếp hạng và báo cáo.
              Thao tác không thể hoàn tác.
            </p>
            <div className="hero-actions confirm-modal-actions">
              <button
                type="button"
                className="button button-ghost"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Hủy
              </button>
              <button type="button" className="button button-danger" onClick={deleteSelected} disabled={deleting}>
                {deleting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
