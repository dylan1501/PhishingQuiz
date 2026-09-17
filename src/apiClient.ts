import type {
  AnswerOption,
  Attempt,
  AttemptAnswer,
  Participant,
  QuizConfig,
  QuizQuestion,
  QuizSessionPayload,
} from "./types";

type ApiEnvelope<T> = {
  data: T;
};

export type LeaderboardEntry = Attempt & {
  participant?: Participant;
};

function createApiUrl(path: string) {
  const [resourcePath, queryString = ""] = path.split("?");
  const params = new URLSearchParams(queryString);
  params.set("path", resourcePath);
  return `/api?${params.toString()}`;
}

async function requestApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(createApiUrl(path), {
    ...init,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJsonResponse = contentType.includes("application/json");
  const payload = isJsonResponse
    ? ((await response.json().catch(() => null)) as ApiEnvelope<T> | { error?: string } | null)
    : null;

  if (!isJsonResponse) {
    throw new Error(
      `API không trả về JSON (HTTP ${response.status}). Kiểm tra rewrite /api hoặc Deployment Protection trên Vercel.`,
    );
  }

  if (!response.ok) {
    const message = payload && "error" in payload && payload.error ? payload.error : "Không gọi được API.";
    throw new Error(message);
  }
  if (!payload || !("data" in payload)) {
    throw new Error("API trả về dữ liệu không hợp lệ.");
  }
  return payload.data;
}

export function createRemoteParticipant(fullName: string, email: string, consent: boolean) {
  return requestApi<Participant>("participants", {
    method: "POST",
    body: JSON.stringify({ fullName, email, consent }),
  });
}

export function getRemoteParticipants() {
  return requestApi<Participant[]>("participants");
}

export function getRemoteQuestions(includeInactive = false) {
  return requestApi<QuizQuestion[]>(`questions${includeInactive ? "?all=true" : ""}`);
}

export function getAdminQuestions() {
  return requestApi<QuizQuestion[]>("admin/questions");
}

export function createAdminQuestion(question: Omit<QuizQuestion, "id" | "active" | "orderIndex">) {
  return requestApi<QuizQuestion>("admin/questions", {
    method: "POST",
    body: JSON.stringify(question),
  });
}

export function updateAdminQuestion(
  questionId: string,
  question: Omit<QuizQuestion, "id" | "active" | "orderIndex">,
) {
  return requestApi<QuizQuestion>(`admin/questions/${questionId}`, {
    method: "PUT",
    body: JSON.stringify(question),
  });
}

export function patchAdminQuestionState(
  questionId: string,
  state: Partial<Pick<QuizQuestion, "active" | "alwaysIncluded">>,
) {
  return requestApi<QuizQuestion>(`admin/questions/${questionId}`, {
    method: "PATCH",
    body: JSON.stringify(state),
  });
}

export function deleteAdminQuestion(questionId: string) {
  return requestApi<{ id: string; deleted: boolean }>(`admin/questions/${questionId}`, {
    method: "DELETE",
  });
}

export function startRemoteSession(participantId: string) {
  return requestApi<QuizSessionPayload>("quiz-sessions", {
    method: "POST",
    body: JSON.stringify({ participantId }),
  });
}

// Tạo/cập nhật người tham gia và mở phiên trong một request; trả về luôn bộ câu hỏi.
export function startRemoteQuiz(fullName: string, email: string, consent = true) {
  return requestApi<QuizSessionPayload>("quiz-sessions", {
    method: "POST",
    body: JSON.stringify({ fullName, email, consent }),
  });
}

export function getRemoteSession(sessionId: string) {
  return requestApi<QuizSessionPayload>(`quiz-sessions/${encodeURIComponent(sessionId)}`);
}

export function saveRemoteAnswer(sessionId: string, questionId: string, selectedAnswer: AnswerOption) {
  return requestApi<AttemptAnswer>(`quiz-sessions/${sessionId}/answers`, {
    method: "POST",
    body: JSON.stringify({ questionId, selectedAnswer }),
  });
}

// Gọi khi người dùng ẩn/đóng tab giữa chừng: sendBeacon vẫn gửi được sau khi trang unload,
// giúp server tính mốc "20 phút không hoạt động" từ lúc rời trang.
export function touchRemoteSessionBeacon(sessionId: string) {
  const url = createApiUrl(`quiz-sessions/${encodeURIComponent(sessionId)}/touch`);
  const body = new Blob([JSON.stringify({})], { type: "application/json" });
  if (typeof navigator.sendBeacon === "function" && navigator.sendBeacon(url, body)) {
    return;
  }
  void fetch(url, { method: "POST", body, credentials: "same-origin", keepalive: true }).catch(() => undefined);
}

export function finishRemoteSession(sessionId: string) {
  return requestApi<LeaderboardEntry>(`quiz-sessions/${sessionId}/finish`, {
    method: "POST",
  });
}

export function getRemoteAttempt(attemptId: string) {
  return requestApi<LeaderboardEntry>(`attempts?attemptId=${encodeURIComponent(attemptId)}`);
}

export function getRemoteAttempts() {
  return requestApi<LeaderboardEntry[]>("attempts");
}

export function getRemoteLeaderboard() {
  return requestApi<LeaderboardEntry[]>("leaderboard");
}

export type AnswerBreakdown = { phishing: number; legitimate: number };

export function getRemoteQuizConfig() {
  return requestApi<QuizConfig & { answerBreakdown?: AnswerBreakdown }>("quiz-config");
}

export function saveRemoteQuizConfig(
  questionCount: number,
  passScore: number,
  phishingCount: number,
  singleAttemptPerEmail: boolean,
) {
  return requestApi<QuizConfig>("quiz-config", {
    method: "PUT",
    body: JSON.stringify({ questionCount, passScore, phishingCount, singleAttemptPerEmail }),
  });
}

export function deleteAdminParticipants(ids: string[]) {
  return requestApi<{ deleted: number }>("admin/participants", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}

export function deleteAllAdminAttempts() {
  return requestApi<{ deleted: number }>("admin/attempts", {
    method: "DELETE",
  });
}

export function getRemoteAdminStatus() {
  return requestApi<{ hasAdmin: boolean; authenticated: boolean }>("admin/status");
}

export function setupRemoteAdmin(email: string, password: string) {
  return requestApi<{ email: string }>("admin/setup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function loginRemoteAdmin(email: string, password: string) {
  return requestApi<{ authenticated: boolean }>("admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logoutRemoteAdmin() {
  return requestApi<{ authenticated: boolean }>("admin/logout", {
    method: "POST",
  });
}
