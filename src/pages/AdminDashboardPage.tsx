import { FormEvent, useEffect, useMemo, useState } from "react";
import { BarChart, LineChart, type ChartPoint } from "../components/charts";
import {
  getRemoteAttempts,
  getRemoteLeaderboard,
  getRemoteParticipants,
  getRemoteQuizConfig,
  getRemoteQuestions,
  saveRemoteQuizConfig,
  type AnswerBreakdown,
  type LeaderboardEntry,
} from "../apiClient";
import type { Attempt, Participant, QuizConfig, QuizQuestion } from "../types";

type TimeGrouping = "hour" | "weekday";

// Thứ trong tuần theo múi giờ trình duyệt, bắt đầu từ Thứ 2 (JS getDay(): 0 = Chủ nhật).
const weekdayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const weekdayNames = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];

function groupParticipantsByTime(participants: Participant[], grouping: TimeGrouping): ChartPoint[] {
  if (grouping === "hour") {
    const counts = new Array<number>(24).fill(0);
    participants.forEach((participant) => {
      counts[new Date(participant.createdAt).getHours()] += 1;
    });
    return counts.map((value, hour) => ({
      label: `${hour}h`,
      detail: `${String(hour).padStart(2, "0")}:00 – ${String(hour).padStart(2, "0")}:59`,
      value,
    }));
  }

  const counts = new Array<number>(7).fill(0);
  participants.forEach((participant) => {
    counts[(new Date(participant.createdAt).getDay() + 6) % 7] += 1;
  });
  return counts.map((value, index) => ({ label: weekdayLabels[index], detail: weekdayNames[index], value }));
}

// Trục điểm 1..N (N = số câu lớn nhất từng thi, tối thiểu 10); thêm cột 0 khi thực sự có lượt 0 điểm.
function groupAttemptsByScore(attempts: Attempt[]): ChartPoint[] {
  const maxScore = Math.max(10, ...attempts.map((attempt) => attempt.totalQuestions));
  const counts = new Array<number>(maxScore + 1).fill(0);
  attempts.forEach((attempt) => {
    counts[Math.min(maxScore, Math.max(0, attempt.score))] += 1;
  });
  const firstScore = counts[0] > 0 ? 0 : 1;
  return counts
    .map((value, score) => ({ label: String(score), detail: `${score} điểm`, value }))
    .slice(firstScore);
}

export function AdminDashboardPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({
    questionCount: 10,
    passScore: 4,
    phishingCount: 5,
    updatedAt: new Date(0).toISOString(),
  });
  const [questionCountInput, setQuestionCountInput] = useState(String(quizConfig.questionCount));
  const [passScoreInput, setPassScoreInput] = useState(String(quizConfig.passScore));
  const [phishingCountInput, setPhishingCountInput] = useState(String(quizConfig.phishingCount));
  const [answerBreakdown, setAnswerBreakdown] = useState<AnswerBreakdown | null>(null);
  const [configMessage, setConfigMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const [timeGrouping, setTimeGrouping] = useState<TimeGrouping>("hour");
  const participantsOverTime = useMemo(
    () => groupParticipantsByTime(participants, timeGrouping),
    [participants, timeGrouping],
  );
  const scoreDistribution = useMemo(() => groupAttemptsByScore(attempts), [attempts]);
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

  useEffect(() => {
    let active = true;
    Promise.all([
      getRemoteAttempts(),
      getRemoteParticipants(),
      getRemoteLeaderboard(),
      getRemoteQuestions(),
      getRemoteQuizConfig(),
    ])
      .then(([remoteAttempts, remoteParticipants, remoteLeaderboard, remoteQuestions, remoteQuizConfig]) => {
        if (active) {
          setAttempts(remoteAttempts);
          setParticipants(remoteParticipants);
          setLeaderboard(remoteLeaderboard);
          setActiveQuestions(remoteQuestions);
          setQuizConfig(remoteQuizConfig);
          setQuestionCountInput(String(remoteQuizConfig.questionCount));
          setPassScoreInput(String(remoteQuizConfig.passScore));
          setPhishingCountInput(String(remoteQuizConfig.phishingCount));
          setAnswerBreakdown(remoteQuizConfig.answerBreakdown ?? null);
        }
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : "Không tải được dữ liệu dashboard.");
      });
    return () => {
      active = false;
    };
  }, []);

  async function saveQuestionCount(event: FormEvent) {
    event.preventDefault();
    const parsedQuestionCount = Number(questionCountInput);
    const parsedPassScore = Number(passScoreInput);
    const parsedPhishingCount = Number(phishingCountInput);
    if (parsedPassScore > parsedQuestionCount) {
      setConfigMessage("Số câu cần đúng không được lớn hơn số câu mỗi lượt thi.");
      return;
    }
    if (parsedPhishingCount > parsedQuestionCount) {
      setConfigMessage("Số câu Phishing không được lớn hơn số câu mỗi lượt thi.");
      return;
    }
    try {
      const nextConfig = await saveRemoteQuizConfig(parsedQuestionCount, parsedPassScore, parsedPhishingCount);
      setQuizConfig(nextConfig);
      setQuestionCountInput(String(nextConfig.questionCount));
      setPassScoreInput(String(nextConfig.passScore));
      setPhishingCountInput(String(nextConfig.phishingCount));
      setConfigMessage(
        `Đã lưu: ${nextConfig.questionCount} câu mỗi lượt (${nextConfig.phishingCount} Phishing / ${nextConfig.questionCount - nextConfig.phishingCount} An toàn), cần đúng ít nhất ${nextConfig.passScore} câu.`,
      );
    } catch (error) {
      setConfigMessage(error instanceof Error ? error.message : "Không lưu được cấu hình bài thi.");
    }
  }

  return (
    <section className="stack admin-dashboard-stack">
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
      {loadError && <div className="notice notice-error">{loadError}</div>}
      <div className="content-card quiz-config-card">
        <div>
          <p className="eyebrow">Cấu Hình Bài Thi</p>
          <h3>Số câu hỏi và ngưỡng hoàn thành</h3>
          <p className="section-text">
            Các câu được đánh dấu “Luôn có” vẫn được ưu tiên đưa vào đề, phần còn lại được random từ
            ngân hàng câu hỏi đang bật. Lượt thi đạt số câu đúng tối thiểu sẽ được tính là hoàn thành thử thách.
          </p>
        </div>
        <form className="quiz-config-form" onSubmit={saveQuestionCount}>
          <label>
            Số câu mỗi lượt
            <input
              type="number"
              min={1}
              max={Math.max(activeQuestions.length, 1)}
              value={questionCountInput}
              onChange={(event) => {
                setQuestionCountInput(event.target.value);
                setConfigMessage("");
              }}
            />
          </label>
          <label>
            Số câu cần đúng
            <input
              type="number"
              min={1}
              max={Math.max(Number(questionCountInput) || 1, 1)}
              value={passScoreInput}
              onChange={(event) => {
                setPassScoreInput(event.target.value);
                setConfigMessage("");
              }}
            />
          </label>
          <label>
            Số câu Phishing
            <input
              type="number"
              min={0}
              max={Math.max(Number(questionCountInput) || 1, 1)}
              value={phishingCountInput}
              onChange={(event) => {
                setPhishingCountInput(event.target.value);
                setConfigMessage("");
              }}
            />
          </label>
          <button type="submit" className="button button-primary">
            Lưu cấu hình
          </button>
          <span className="quiz-config-hint">
            Mỗi đề: {quizConfig.phishingCount} câu Phishing / {quizConfig.questionCount - quizConfig.phishingCount} câu
            An toàn, cần đúng {quizConfig.passScore}/{quizConfig.questionCount}.
            {answerBreakdown && (
              <>
                {" "}
                Ngân hàng đang bật: {answerBreakdown.phishing} Phishing, {answerBreakdown.legitimate} An toàn.
              </>
            )}
          </span>
          {answerBreakdown &&
            (answerBreakdown.phishing < quizConfig.phishingCount ||
              answerBreakdown.legitimate < quizConfig.questionCount - quizConfig.phishingCount) && (
              <span className="quiz-config-message quiz-config-warning">
                Ngân hàng không đủ câu cho tỉ lệ này — phần thiếu sẽ được bù bằng loại câu còn lại.
              </span>
            )}
          {configMessage && <span className="quiz-config-message">{configMessage}</span>}
        </form>
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
      <div className="dashboard-charts-grid">
        <article className="content-card chart-card">
          <div className="chart-card-heading">
            <div>
              <p className="eyebrow">Người Tham Gia</p>
              <h3>Số người tham gia theo thời gian</h3>
              <p className="section-text">
                Đếm theo thời điểm đăng ký tham gia lần đầu, tính theo múi giờ của trình duyệt.
              </p>
            </div>
            <div className="segmented-control" role="group" aria-label="Nhóm theo">
              <button
                type="button"
                aria-pressed={timeGrouping === "hour"}
                onClick={() => setTimeGrouping("hour")}
              >
                Giờ trong ngày
              </button>
              <button
                type="button"
                aria-pressed={timeGrouping === "weekday"}
                onClick={() => setTimeGrouping("weekday")}
              >
                Ngày trong tuần
              </button>
            </div>
          </div>
          <LineChart
            points={participantsOverTime}
            unit="người"
            labelHeader={timeGrouping === "hour" ? "Khung giờ" : "Thứ"}
            ariaLabel={`Biểu đồ đường số người tham gia theo ${timeGrouping === "hour" ? "giờ trong ngày" : "ngày trong tuần"}`}
          />
        </article>
        <article className="content-card chart-card">
          <div className="chart-card-heading">
            <div>
              <p className="eyebrow">Kết Quả</p>
              <h3>Phân bố kết quả theo điểm</h3>
              <p className="section-text">Số lượt thi đạt từng mức điểm trên tổng số câu của lượt đó.</p>
            </div>
          </div>
          <BarChart
            points={scoreDistribution}
            unit="lượt thi"
            labelHeader="Điểm"
            ariaLabel="Biểu đồ cột phân bố số lượt thi theo điểm"
          />
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
