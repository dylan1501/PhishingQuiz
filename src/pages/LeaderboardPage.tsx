import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getRemoteLeaderboard, type LeaderboardEntry } from "../apiClient";

function maskEmail(email: string) {
  const [name = "", domain = "hidden.local"] = email.split("@");
  return `${name.slice(0, 2)}***@${domain}`;
}

function getInitials(name?: string) {
  return (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getAvatarUrl(name?: string) {
  return `https://api.dicebear.com/10.x/bottts/svg?seed=${encodeURIComponent(name ?? "phishing-hunter")}`;
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

function getLevel(score: number, totalQuestions: number) {
  const ratio = totalQuestions === 0 ? 0 : score / totalQuestions;
  if (ratio >= 0.9) {
    return 9;
  }
  if (ratio >= 0.8) {
    return 8;
  }
  if (ratio >= 0.7) {
    return 7;
  }
  if (ratio >= 0.6) {
    return 6;
  }
  if (ratio >= 0.5) {
    return 5;
  }
  return 4;
}

function getXp(score: number, totalQuestions: number) {
  return score * 120 + Math.max(0, totalQuestions - score) * 35;
}

function getCombo(durationSeconds: number) {
  if (durationSeconds <= 25) {
    return "x5";
  }
  if (durationSeconds <= 40) {
    return "x4";
  }
  if (durationSeconds <= 60) {
    return "x3";
  }
  if (durationSeconds <= 90) {
    return "x2";
  }
  return "x1";
}

function getProgress(score: number, totalQuestions: number) {
  return Math.max(8, Math.round((score / totalQuestions) * 100));
}

const REFRESH_INTERVAL_MS = 10_000;

type RankChange = { delta: number; isNew: boolean };

export function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loadError, setLoadError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [rankChanges, setRankChanges] = useState<Record<string, RankChange>>({});
  const heroRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);
  const previousRanksRef = useRef<Map<string, number> | null>(null);
  const rowRefs = useRef(new Map<string, HTMLTableRowElement>());
  const rowPositionsRef = useRef(new Map<string, number>());

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
        const remoteEntries = await getRemoteLeaderboard();
        if (!active) {
          return;
        }
        const nextRanks = new Map(remoteEntries.map((entry, index) => [entry.id, index]));
        const previousRanks = previousRanksRef.current;
        if (previousRanks) {
          const changes: Record<string, RankChange> = {};
          nextRanks.forEach((rank, id) => {
            const previousRank = previousRanks.get(id);
            if (previousRank === undefined) {
              changes[id] = { delta: 0, isNew: true };
            } else if (previousRank !== rank) {
              changes[id] = { delta: previousRank - rank, isNew: false };
            }
          });
          setRankChanges(changes);
        }
        previousRanksRef.current = nextRanks;
        setEntries(remoteEntries);
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
    if (entries.length > 0 && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [entries]);

  // FLIP: dòng đổi hạng trượt từ vị trí cũ sang vị trí mới thay vì nhảy.
  useLayoutEffect(() => {
    const previousPositions = rowPositionsRef.current;
    const nextPositions = new Map<string, number>();
    rowRefs.current.forEach((row, id) => {
      const top = row.offsetTop;
      nextPositions.set(id, top);
      const previousTop = previousPositions.get(id);
      if (previousTop === undefined || previousTop === top) {
        return;
      }
      row.animate(
        [{ transform: `translateY(${previousTop - top}px)` }, { transform: "translateY(0)" }],
        { duration: 420, easing: "cubic-bezier(0.22, 0.61, 0.36, 1)" },
      );
    });
    rowPositionsRef.current = nextPositions;
  }, [entries]);

  // Huy hiệu thay đổi hạng chỉ nháy vài giây rồi tắt.
  useEffect(() => {
    if (Object.keys(rankChanges).length === 0) {
      return;
    }
    const timer = window.setTimeout(() => setRankChanges({}), 6000);
    return () => window.clearTimeout(timer);
  }, [rankChanges]);

  const topOne = entries[0];
  const sidePodium = [entries[1], entries[2]].filter(Boolean);
  const sideLabels = ["Hạng 2", "Hạng 3"];
  const sideClasses = ["podium-silver", "podium-bronze"];

  return (
    <section className="stack leaderboard-stack">
      <div className="content-card leaderboard-intro-card">
        <div className="leaderboard-intro-head">
          <div>
            <p className="eyebrow">Bảng Xếp Hạng</p>
            <h2>Hall Of Fame: Phishing Hunters</h2>
            <p className="section-text">
              Xếp hạng theo điểm cao hơn, thời gian ngắn hơn, rồi đến thời điểm hoàn thành sớm hơn.
            </p>
          </div>
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
          <div className="side-podium-column">
            {sidePodium[0] && (
            <article className={`podium-card ${sideClasses[0]}`}>
                <img
                  src={getRankIcon(1)}
                  alt=""
                  className={`podium-rank-icon ${sideClasses[0]}`}
                />
                <span className="podium-label">{sideLabels[0]}</span>
                <h3>{sidePodium[0].participant?.fullName}</h3>
                <p className="podium-meta">{maskEmail(sidePodium[0].participant?.email ?? "")}</p>
                <div className="game-stats-inline">
                  <span>LEVEL {getLevel(sidePodium[0].score, sidePodium[0].totalQuestions)}</span>
                  <span>{getXp(sidePodium[0].score, sidePodium[0].totalQuestions)} XP</span>
                  <span>COMBO {getCombo(sidePodium[0].durationSeconds)}</span>
                </div>
                <strong>{sidePodium[0].score}/{sidePodium[0].totalQuestions}</strong>
                <span className="podium-time">{sidePodium[0].durationSeconds}s hoàn thành</span>
                <div className="player-progress">
                  <span style={{ width: `${getProgress(sidePodium[0].score, sidePodium[0].totalQuestions)}%` }} />
                </div>
              </article>
            )}
          </div>

          <article className="winner-card">
            <div className="winner-glow" />
            <div className="unlock-badge">UNLOCKED</div>
            <img
              src={getRankIcon(0)}
              alt=""
              className="winner-icon"
            />
            <span className="podium-label winner-label">Top 1 Victory</span>
            <h3>{topOne.participant?.fullName}</h3>
            <p className="podium-meta">{maskEmail(topOne.participant?.email ?? "")}</p>
            <div className="game-stats-inline winner-stats">
              <span>LEVEL {getLevel(topOne.score, topOne.totalQuestions)}</span>
              <span>{getXp(topOne.score, topOne.totalQuestions)} XP</span>
              <span>COMBO {getCombo(topOne.durationSeconds)}</span>
            </div>
            <div className="winner-score">
              <strong>
                {topOne.score}/{topOne.totalQuestions}
              </strong>
              <span>{topOne.durationSeconds}s hoàn thành</span>
            </div>
            <div className="player-progress winner-progress">
              <span style={{ width: `${getProgress(topOne.score, topOne.totalQuestions)}%` }} />
            </div>
            <span className="mini-badge">{getBadge(0)}</span>
          </article>

          <div className="side-podium-column">
            {sidePodium[1] && (
            <article className={`podium-card ${sideClasses[1]}`}>
                <img
                  src={getRankIcon(2)}
                  alt=""
                  className={`podium-rank-icon ${sideClasses[1]}`}
                />
                <span className="podium-label">{sideLabels[1]}</span>
                <h3>{sidePodium[1].participant?.fullName}</h3>
                <p className="podium-meta">{maskEmail(sidePodium[1].participant?.email ?? "")}</p>
                <div className="game-stats-inline">
                  <span>LEVEL {getLevel(sidePodium[1].score, sidePodium[1].totalQuestions)}</span>
                  <span>{getXp(sidePodium[1].score, sidePodium[1].totalQuestions)} XP</span>
                  <span>COMBO {getCombo(sidePodium[1].durationSeconds)}</span>
                </div>
                <strong>{sidePodium[1].score}/{sidePodium[1].totalQuestions}</strong>
                <span className="podium-time">{sidePodium[1].durationSeconds}s hoàn thành</span>
                <div className="player-progress">
                  <span style={{ width: `${getProgress(sidePodium[1].score, sidePodium[1].totalQuestions)}%` }} />
                </div>
              </article>
            )}
          </div>
        </div>
      )}
      <div className="content-card">
        <table className="table">
          <thead>
            <tr>
              <th>Hạng</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Huy hiệu</th>
              <th>Điểm</th>
              <th>Thời gian</th>
              <th>Ngày</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => {
              const change = rankChanges[entry.id];
              return (
              <tr
                key={entry.id}
                ref={(row) => {
                  if (row) {
                    rowRefs.current.set(entry.id, row);
                  } else {
                    rowRefs.current.delete(entry.id);
                  }
                }}
                className={change ? (change.isNew ? "row-entered" : "row-moved") : ""}
              >
                <td className="rank-cell">
                  #{index + 1}
                  {change && (
                    <span
                      className={`rank-change ${change.isNew ? "rank-change-new" : change.delta > 0 ? "rank-change-up" : "rank-change-down"}`}
                    >
                      {change.isNew ? "MỚI" : change.delta > 0 ? `▲${change.delta}` : `▼${Math.abs(change.delta)}`}
                    </span>
                  )}
                </td>
                <td>
                  <div className="name-cell">
                    <img src={getRankIcon(index)} alt="" className={`table-rank-icon rank-${index + 1}`} />
                    <div className="avatar-circle avatar-small" title={getInitials(entry.participant?.fullName)}>
                      <img
                        src={getAvatarUrl(entry.participant?.fullName)}
                        alt={getInitials(entry.participant?.fullName)}
                        className="avatar-image"
                        loading="lazy"
                      />
                    </div>
                    <span>{entry.participant?.fullName}</span>
                  </div>
                </td>
                <td>{maskEmail(entry.participant?.email ?? "")}</td>
                <td>
                  <span className="mini-badge">{getBadge(index)}</span>
                </td>
                <td>
                  {entry.score}/{entry.totalQuestions}
                </td>
                <td>{entry.durationSeconds}s</td>
                <td>{new Date(entry.completedAt).toLocaleDateString()}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
