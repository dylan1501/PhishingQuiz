export const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

interface TablePaginationProps {
  totalItems: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  /** Tên đối tượng hiển thị trong dòng tóm tắt, ví dụ "lượt thi". */
  itemLabel: string;
}

export function TablePagination({
  totalItems,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemLabel,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const firstItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="table-pagination">
      <span className="table-pagination-summary">
        {totalItems === 0
          ? `Không có ${itemLabel} nào`
          : `${firstItem}–${lastItem} trên ${totalItems} ${itemLabel}`}
      </span>
      <div className="table-pagination-controls">
        <label className="page-size-field">
          Hiển thị
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            aria-label={`Số ${itemLabel} mỗi trang`}
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <div className="page-nav" role="group" aria-label="Chuyển trang">
          <button type="button" className="button button-small" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            ‹ Trước
          </button>
          <span className="page-indicator">
            Trang {page}/{totalPages}
          </span>
          <button
            type="button"
            className="button button-small"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Sau ›
          </button>
        </div>
      </div>
    </div>
  );
}
