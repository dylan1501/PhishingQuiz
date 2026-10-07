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
      <p className="hero-terminal">
        <span className="hero-prompt">phishing_quiz:~$</span> run --mode=training
        <span className="hero-caret" aria-hidden="true" />
      </p>
      <h1>
        Bạn có đủ tỉnh táo để <span className="hero-accent">nhận diện lừa đảo</span>?
      </h1>
      <p className="hero-text">AI đang khiến phishing ngày càng tinh vi, cá nhân hóa và phổ biến hơn.</p>
      <p className="hero-text">Bạn nghĩ mình phân biệt được thật và giả?</p>
      <div className="hero-actions">
        <Link to="/quiz/start" className="button button-primary hero-cta">
          Bắt đầu thử thách
        </Link>
      </div>
    </section>
  );
}
