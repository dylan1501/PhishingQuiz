import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <section className="hero hero-intro">
      <div className="hero-video-frame">
        <video
          className="hero-video"
          src="/assets/videos/intro-hero.webm"
          autoPlay
          muted
          loop
          playsInline
          aria-label="Minh họa các bẫy lừa đảo phishing"
        />
      </div>
      <h1>Bạn có đủ tỉnh táo để nhận diện lừa đảo?</h1>
      <p className="hero-text">
        Các cuộc tấn công phishing tìm cách lừa người dùng tiết lộ thông tin cá nhân hoặc tài chính,
        thường bằng cách giả mạo nội dung từ những tổ chức quen thuộc, đáng tin cậy.
      </p>
      <p className="hero-text">AI đang khiến phishing ngày càng tinh vi, cá nhân hóa và phổ biến hơn.</p>
      <p className="hero-text">Bạn nghĩ mình phân biệt được thật và giả?</p>
      <div className="hero-actions">
        <Link to="/quiz/start" className="button button-primary">
          Làm bài ngay
        </Link>
      </div>
    </section>
  );
}
