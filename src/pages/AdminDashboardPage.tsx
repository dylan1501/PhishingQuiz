import { Link } from "react-router-dom";
import { getAttempts, getLeaderboard, getParticipants, signOutAdmin } from "../storage";

export function AdminDashboardPage() {
  const attempts = getAttempts();
  const participants = getParticipants();
  const leaderboard = getLeaderboard();
  const fastestAttempt = attempts.length
    ? Math.min(...attempts.map((attempt) => attempt.durationSeconds))
    : 0;
  const bestAttempt = attempts.length
    ? attempts.reduce((best, attempt) => {
        if (!best) {
          return attempt;
        }
        if (attempt.score > best.score) {
          return attempt;
        }
        if (attempt.score === best.score && attempt.durationSeconds < best.durationSeconds) {
          return attempt;
        }
        return best;
      }, attempts[0])
    : null;
  const averageScore =
    attempts.length === 0
      ? 0
      : (
          attempts.reduce((total, attempt) => total + attempt.score, 0) / attempts.length
        ).toFixed(1);
  const averageAccuracy =
    attempts.length === 0
      ? 0
      : Math.round(
          (attempts.reduce(
            (total, attempt) => total + attempt.score / attempt.totalQuestions,
            0,
          ) /
            attempts.length) *
            100,
        );

  return (
    <section className="stack admin-dashboard-stack">
      <div className="admin-links">
        <Link to="/admin/participants">
          <img src="/assets/icons/participants.svg" alt="" className="admin-tab-icon" />
          Người tham gia
        </Link>
        <Link to="/admin/attempts">
          <img src="/assets/icons/attempts.svg" alt="" className="admin-tab-icon" />
          Lịch sử làm bài
        </Link>
        <Link to="/admin/questions">
          <img src="/assets/icons/questions.svg" alt="" className="admin-tab-icon" />
          Câu hỏi
        </Link>
        <button type="button" className="button button-small admin-signout-button" onClick={signOutAdmin}>
          <img src="/assets/icons/signout.svg" alt="" className="admin-tab-icon" />
          Đăng xuất
        </button>
      </div>
      <div className="content-card admin-hero-card">
        <div className="fish-school" aria-hidden="true">
          <span className="fish fish-one" />
          <span className="fish fish-two" />
          <span className="fish fish-three" />
          <span className="fish fish-four" />
          <span className="fish fish-five" />
        </div>
        <div>
          <p className="eyebrow">Bảng Điều Khiển</p>
          <h2>Toàn cảnh hoạt động của Phishing Quiz</h2>
          <p className="section-text">
            Theo dõi nhanh số lượt thi, mức độ nhận diện phishing và hiệu suất của người tham gia
            trong cùng một màn hình.
          </p>
        </div>
        <img
          src="/assets/illustrations/shield-scan.svg"
          alt="Minh họa bảng điều khiển"
          className="admin-hero-illustration"
        />
      </div>
      <div className="dashboard-grid">
        <article className="content-card dashboard-metric-card">
          <span>Tổng lượt thi</span>
          <strong>{attempts.length}</strong>
          <p>Toàn bộ số lần hoàn thành quiz đã được ghi nhận.</p>
        </article>
        <article className="content-card dashboard-metric-card">
          <span>Số người tham gia</span>
          <strong>{participants.length}</strong>
          <p>Số lượng người dùng đã để lại thông tin và tham dự bài đánh giá.</p>
        </article>
        <article className="content-card dashboard-metric-card">
          <span>Điểm trung bình</span>
          <strong>{averageScore}</strong>
          <p>Mức điểm trung bình trên mỗi lượt thi từ toàn bộ dữ liệu hiện có.</p>
        </article>
        <article className="content-card dashboard-metric-card">
          <span>Người dẫn đầu</span>
          <strong>{leaderboard[0]?.participant?.fullName ?? "Chưa có dữ liệu"}</strong>
          <p>Người có thứ hạng cao nhất theo score, thời gian và thời điểm hoàn thành.</p>
        </article>
      </div>
      <div className="admin-insight-grid">
        <article className="content-card admin-insight-card">
          <p className="eyebrow">Insight Nhanh</p>
          <h3>Tỷ lệ nhận diện trung bình</h3>
          <strong className="admin-highlight">{averageAccuracy}%</strong>
          <p className="section-text">
            Đây là tỷ lệ đúng trung bình của tất cả lượt thi đã hoàn thành.
          </p>
        </article>
        <article className="content-card admin-insight-card">
          <p className="eyebrow">Tốc Độ Tốt Nhất</p>
          <h3>Lượt thi nhanh nhất</h3>
          <strong className="admin-highlight">
            {fastestAttempt ? `${fastestAttempt}s` : "Chưa có dữ liệu"}
          </strong>
          <p className="section-text">
            Mốc thời gian hoàn thành nhanh nhất hiện có trong hệ thống.
          </p>
        </article>
        <article className="content-card admin-insight-card">
          <p className="eyebrow">Mức Điểm Cao Nhất</p>
          <h3>Điểm tốt nhất</h3>
          <strong className="admin-highlight">
            {bestAttempt ? `${bestAttempt.score}/${bestAttempt.totalQuestions}` : "Chưa có dữ liệu"}
          </strong>
          <p className="section-text">
            Điểm số cao nhất đã đạt được trong các lượt thi hiện có.
          </p>
        </article>
      </div>
    </section>
  );
}
