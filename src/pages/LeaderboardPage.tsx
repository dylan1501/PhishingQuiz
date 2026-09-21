import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getRemoteLeaderboard, getRemoteQuizConfig, type LeaderboardEntry } from "../apiClient";

const REFRESH_INTERVAL_MS = 10_000;
const ANTHEM_URL = "/assets/sounds/Glory%20Glory%20Man%20United.mp3";

interface TeamStanding {
  team: string;
  /** Số người chơi của đội đã vượt qua thử thách. */
  finishers: number;
  /** Tổng thời gian thi của những người đã vượt qua. */
  totalSeconds: number;
  /** Thời điểm người cuối cùng của đội vượt qua. */
  lastFinishedAt: number;
  attempts: number;
  bestScore: number;
  totalQuestions: number;
}

type RankChange = { delta: number; isNew: boolean };

function getAvatarUrl(team: string) {
  return `https://api.dicebear.com/10.x/bottts/svg?seed=${encodeURIComponent(team)}`;
}

function getBadge(index: number) {
  if (index === 0) {
    return "Boss Slayer";
  }
  if (index === 1) {
    return "Rank Challenger";
  }
  if (index === 2) {
    return "Speed Hunter";
  }
  return "XP Grinder";
}

function getRankIcon(index: number) {
  if (index === 0) {
    return "/assets/leaderboard-icons/star-prize-award-svgrepo-com.svg";
  }
  if (index === 1 || index === 2) {
    return "/assets/leaderboard-icons/medal-svgrepo-com.svg";
  }
  return "/assets/leaderboard-icons/clapping-hand-svgrepo-com.svg";
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}p ${seconds}s` : `${seconds}s`;
}

// Xếp hạng đội: nhiều người hoàn thành hơn → tổng thời gian thi ít hơn →
// người cuối cùng vượt qua sớm hơn.
function buildStandings(entries: LeaderboardEntry[], passScore: number): TeamStanding[] {
  const byTeam = new Map<string, TeamStanding>();
  const countedParticipants = new Set<string>();

  entries.forEach((entry) => {
    const team = entry.participant?.team?.trim();
    if (!team) {
      return;
    }
    const standing = byTeam.get(team) ?? {
      team,
      finishers: 0,
      totalSeconds: 0,
      lastFinishedAt: 0,
      attempts: 0,
      bestScore: 0,
      totalQuestions: entry.totalQuestions,
    };
    standing.attempts += 1;
    standing.bestScore = Math.max(standing.bestScore, entry.score);
    standing.totalQuestions = Math.max(standing.totalQuestions, entry.totalQuestions);

    const required = Math.min(passScore, entry.totalQuestions);
    // Mỗi người chơi chỉ được tính một lần dù có nhiều lượt thi.
    if (entry.score >= required && !countedParticipants.has(entry.participantId)) {
      countedParticipants.add(entry.participantId);
      standing.finishers += 1;
      standing.totalSeconds += entry.durationSeconds;
      standing.lastFinishedAt = Math.max(standing.lastFinishedAt, new Date(entry.completedAt).getTime());
    }
    byTeam.set(team, standing);
  });

  return [...byTeam.values()].sort((first, second) => {
    if (first.finishers !== second.finishers) {
      return second.finishers - first.finishers;
    }
    if (first.totalSeconds !== second.totalSeconds) {
      return first.totalSeconds - second.totalSeconds;
    }
    return first.lastFinishedAt - second.lastFinishedAt;
  });
}

export function LeaderboardPage() {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loadError, setLoadError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [rankChanges, setRankChanges] = useState<Record<string, RankChange>>({});
  const heroRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);
  const previousRanksRef = useRef<Map<string, number> | null>(null);
  const rowRefs = useRef(new Map<string, HTMLTableRowElement>());
  const rowPositionsRef = useRef(new Map<string, number>());
  const anthemRef = useRef<HTMLAudioElement | null>(null);
  const [anthemBlocked, setAnthemBlocked] = useState(false);

  // Nhạc nền phát lặp liên tục. Trình duyệt chặn autoplay CÓ TIẾNG khi trang mở mà chưa có
  // tương tác, nhưng cho phép autoplay CÂM — nên phát câm trước để nhạc chạy sẵn, rồi bật tiếng
  // ngay ở tương tác đầu tiên (click/phím/chạm/cuộn). Nếu vẫn chưa được thì hiện nút bật.
  useEffect(() => {
    const anthem = new Audio(ANTHEM_URL);
    anthem.loop = true;
    anthem.volume = 0.35;
    anthem.preload = "auto";
    anthemRef.current = anthem;
    const interactionEvents = ["pointerdown", "keydown", "touchstart", "wheel"] as const;

    const enableSound = () => {
      anthem.muted = false;
      void anthem
        .play()
        .then(() => setAnthemBlocked(false))
        .catch(() => setAnthemBlocked(true));
    };

    void anthem
      .play()
      .then(() => setAnthemBlocked(false))
      .catch(() => {
        anthem.muted = true;
        void anthem.play().catch(() => undefined);
        setAnthemBlocked(true);
        interactionEvents.forEach((eventName) =>
          document.addEventListener(eventName, enableSound, { once: true, passive: true }),
        );
      });

    return () => {
      interactionEvents.forEach((eventName) => document.removeEventListener(eventName, enableSound));
      anthem.pause();
      anthem.currentTime = 0;
      anthemRef.current = null;
    };
  }, []);

  function playAnthem() {
    const anthem = anthemRef.current;
    if (!anthem) {
      return;
    }
    anthem.muted = false;
    void anthem
      .play()
      .then(() => setAnthemBlocked(false))
      .catch(() => setAnthemBlocked(true));
  }

  // Bảng tự làm mới liên tục để chiếu lên màn hình lớn; tạm dừng khi tab bị ẩn.
  useEffect(() => {
    let active = true;
    let timer: number | undefined;

    async function refresh() {
      if (!active) {
        return;
      }
      setRefreshing(true);
      try {
        const [entries, quizConfig] = await Promise.all([getRemoteLeaderboard(), getRemoteQuizConfig()]);
        if (!active) {
          return;
        }
        const nextStandings = buildStandings(entries, quizConfig.passScore);
        const nextRanks = new Map(nextStandings.map((standing, index) => [standing.team, index]));
        const previousRanks = previousRanksRef.current;
        if (previousRanks) {
          const changes: Record<string, RankChange> = {};
          nextRanks.forEach((rank, team) => {
            const previousRank = previousRanks.get(team);
            if (previousRank === undefined) {
              changes[team] = { delta: 0, isNew: true };
            } else if (previousRank !== rank) {
              changes[team] = { delta: previousRank - rank, isNew: false };
            }
          });
          setRankChanges(changes);
        }
        previousRanksRef.current = nextRanks;
        setStandings(nextStandings);
        setUpdatedAt(new Date());
        setLoadError("");
      } catch (error) {
        if (active) {
          setLoadError(error instanceof Error ? error.message : "Không tải được bảng xếp hạng.");
        }
      } finally {
        if (active) {
          setRefreshing(false);
        }
      }
    }

    function schedule() {
      window.clearTimeout(timer);
      timer = window.setTimeout(async () => {
        if (document.visibilityState === "visible") {
          await refresh();
        }
        schedule();
      }, REFRESH_INTERVAL_MS);
    }

    void refresh();
    schedule();

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void refresh();
        schedule();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      active = false;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Lần đầu có dữ liệu thì cuộn tới podium; các lần làm mới sau không cuộn nữa.
  useEffect(() => {
    if (standings.length > 0 && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [standings]);

  // FLIP: đội đổi hạng trượt từ vị trí cũ sang vị trí mới thay vì nhảy.
  useLayoutEffect(() => {
    const previousPositions = rowPositionsRef.current;
    const nextPositions = new Map<string, number>();
    rowRefs.current.forEach((row, team) => {
      const top = row.offsetTop;
      nextPositions.set(team, top);
      const previousTop = previousPositions.get(team);
      if (previousTop === undefined || previousTop === top) {
        return;
      }
      row.animate([{ transform: `translateY(${previousTop - top}px)` }, { transform: "translateY(0)" }], {
        duration: 420,
        easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      });
    });
    rowPositionsRef.current = nextPositions;
  }, [standings]);

  // Huy hiệu thay đổi hạng chỉ nháy vài giây rồi tắt.
  useEffect(() => {
    if (Object.keys(rankChanges).length === 0) {
      return;
    }
    const timer = window.setTimeout(() => setRankChanges({}), 6000);
    return () => window.clearTimeout(timer);
  }, [rankChanges]);

  const topOne = standings[0];
  const sidePodium = [standings[1], standings[2]].filter(Boolean);
  const sideLabels = ["Hạng 2", "Hạng 3"];
  const sideClasses = ["podium-silver", "podium-bronze"];

  function renderPodiumCard(standing: TeamStanding, index: number) {
    const sideIndex = index - 1;
    return (
      <article className={`podium-card ${sideClasses[sideIndex]}`}>
        <img src={getRankIcon(index)} alt="" className={`podium-rank-icon ${sideClasses[sideIndex]}`} />
        <span className="podium-label">{sideLabels[sideIndex]}</span>
        <h3>{standing.team}</h3>
        <p className="podium-meta">{standing.attempts} lượt thi</p>
        <div className="game-stats-inline">
          <span>{standing.finishers} HOÀN THÀNH</span>
          <span>{formatDuration(standing.totalSeconds)}</span>
        </div>
        <strong>{standing.finishers}</strong>
        <span className="podium-time">người vượt qua thử thách</span>
      </article>
    );
  }

  return (
    <section className="stack leaderboard-stack">
      <div className="content-card leaderboard-intro-card">
        <div className="leaderboard-intro-head">
          <div>
            <p className="eyebrow">Bảng Xếp Hạng Đội</p>
            <h2 className="leaderboard-title">Hall Of Fame: Phishing Hunters</h2>
          </div>
          {anthemBlocked && (
            <button type="button" className="button button-small anthem-button" onClick={playAnthem}>
              🔊 Bật nhạc nền
            </button>
          )}
          <span className={`live-pill ${refreshing ? "live-pill-active" : ""}`}>
            <span className="live-dot" aria-hidden="true" />
            Cập nhật liên tục
            {updatedAt && <em>{updatedAt.toLocaleTimeString("vi-VN")}</em>}
          </span>
        </div>
        {loadError && <div className="notice notice-error">{loadError}</div>}
      </div>

      {topOne && (
        <div className="leaderboard-hero" ref={heroRef}>
          <div className="side-podium-column">{sidePodium[0] && renderPodiumCard(sidePodium[0], 1)}</div>

          <article className="winner-card">
            <div className="winner-glow" />
            <div className="unlock-badge">UNLOCKED</div>
            <img src={getRankIcon(0)} alt="" className="winner-icon" />
            <span className="podium-label winner-label">Top 1 Victory</span>
            <h3>{topOne.team}</h3>
            <p className="podium-meta">{topOne.attempts} lượt thi</p>
            <div className="game-stats-inline winner-stats">
              <span>{topOne.finishers} HOÀN THÀNH</span>
              <span>{formatDuration(topOne.totalSeconds)}</span>
              <span>
                ĐIỂM CAO NHẤT {topOne.bestScore}/{topOne.totalQuestions}
              </span>
            </div>
            <div className="winner-score">
              <strong>{topOne.finishers}</strong>
              <span>người vượt qua thử thách</span>
            </div>
            <span className="mini-badge">{getBadge(0)}</span>
          </article>

          <div className="side-podium-column">{sidePodium[1] && renderPodiumCard(sidePodium[1], 2)}</div>
        </div>
      )}

      <div className="content-card">
        <table className="table">
          <thead>
            <tr>
              <th>Hạng</th>
              <th>Đội</th>
              <th>Huy hiệu</th>
              <th>Hoàn thành</th>
              <th>Tổng thời gian</th>
              <th>Lượt thi</th>
              <th>Người cuối vượt qua</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => {
              const change = rankChanges[standing.team];
              return (
                <tr
                  key={standing.team}
                  ref={(row) => {
                    if (row) {
                      rowRefs.current.set(standing.team, row);
                    } else {
                      rowRefs.current.delete(standing.team);
                    }
                  }}
                  className={change ? (change.isNew ? "row-entered" : "row-moved") : ""}
                >
                  <td className="rank-cell">
                    #{index + 1}
                    {change && (
                      <span
                        className={`rank-change ${
                          change.isNew ? "rank-change-new" : change.delta > 0 ? "rank-change-up" : "rank-change-down"
                        }`}
                      >
                        {change.isNew ? "MỚI" : change.delta > 0 ? `▲${change.delta}` : `▼${Math.abs(change.delta)}`}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="name-cell">
                      <img src={getRankIcon(index)} alt="" className={`table-rank-icon rank-${index + 1}`} />
                      <div className="avatar-circle avatar-small" title={standing.team}>
                        <img src={getAvatarUrl(standing.team)} alt="" className="avatar-image" loading="lazy" />
                      </div>
                      <span>{standing.team}</span>
                    </div>
                  </td>
                  <td>
                    <span className="mini-badge">{getBadge(index)}</span>
                  </td>
                  <td>{standing.finishers}</td>
                  <td>{formatDuration(standing.totalSeconds)}</td>
                  <td>{standing.attempts}</td>
                  <td>
                    {standing.lastFinishedAt > 0 ? new Date(standing.lastFinishedAt).toLocaleString("vi-VN") : "—"}
                  </td>
                </tr>
              );
            })}
            {standings.length === 0 && (
              <tr>
                <td colSpan={7} className="table-empty">
                  Chưa có đội nào tham gia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
