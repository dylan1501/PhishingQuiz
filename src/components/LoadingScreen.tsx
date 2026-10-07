interface LoadingScreenProps {
  /** Nhãn cho trình đọc màn hình; không hiển thị trên giao diện. */
  label?: string;
}

// Vòng quay chờ, canh giữa vùng nội dung — dùng chung cho mọi màn đang tải.
export function LoadingScreen({ label = "Đang tải…" }: LoadingScreenProps) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
