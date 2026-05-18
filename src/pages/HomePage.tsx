import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Đào Tạo Nhận Thức An Toàn Thông Tin</p>
        <h1>Nhận diện bẫy lừa đảo trước khi sự cố xảy ra.</h1>
        <p className="hero-text">
          Phishing Quiz giúp người học luyện khả năng phát hiện dấu hiệu lừa đảo,
          hiểu rõ các kỹ thuật tấn công phổ biến và hình thành phản xạ xử lý an toàn
          trong môi trường làm việc số.
        </p>
        <div className="hero-actions">
          <Link to="/quiz/start" className="button button-primary">Làm bài ngay</Link>
          <Link to="/leaderboard" className="button button-ghost">
            Xem bảng xếp hạng
          </Link>
        </div>
      </div>
      <div className="hero-panel">
        <div className="hero-visual-card">
          <img
            src="/assets/illustrations/shield-scan.svg"
            alt="Minh họa lá chắn bảo mật quét phishing"
            className="hero-visual"
          />
        </div>
        <div className="stat-card">
          <img
            src="/assets/illustrations/alert-mail.svg"
            alt="Icon cảnh báo email lừa đảo"
            className="stat-icon"
          />
          <span className="stat-kicker">Nhận diện tín hiệu giả mạo</span>
          <strong>Học cách nhận diện phishing</strong>
          <p className="stat-text">Làm quen với email, SMS, QR, website và các tình huống lừa đảo thường gặp.</p>
        </div>
        <div className="stat-card">
          <img
            src="/assets/illustrations/shield-scan.svg"
            alt="Icon quét dấu hiệu an toàn"
            className="stat-icon"
          />
          <span className="stat-kicker">Phản hồi tức thì</span>
          <strong>Nâng cao nhận thức an ninh mạng</strong>
          <p className="stat-text">Giải thích ngay sau mỗi câu để người học hiểu vì sao một tín hiệu là nguy hiểm hay hợp lệ.</p>
        </div>
      </div>
    </section>
  );
}
