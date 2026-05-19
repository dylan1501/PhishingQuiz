import type { AnswerOption, Attempt, AttemptAnswer, Participant, QuizConfig, QuizQuestion, QuizSession } from "./types";

type ApiEnvelope<T> = {
  data: T;
};

export type LeaderboardEntry = Attempt & {
  participant?: Participant;
};

async function requestApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    ...init,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | { error?: string } | null;
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

export function startRemoteSession(participantId: string) {
  return requestApi<QuizSession>("quiz-sessions", {
    method: "POST",
    body: JSON.stringify({ participantId }),
  });
}

export function getRemoteSession(sessionId: string) {
  return requestApi<{ session: QuizSession; questions: QuizQuestion[] }>(
    `quiz-sessions/${encodeURIComponent(sessionId)}`,
  );
}

export function saveRemoteAnswer(sessionId: string, questionId: string, selectedAnswer: AnswerOption) {
  return requestApi<AttemptAnswer>(`quiz-sessions/${sessionId}/answers`, {
    method: "POST",
    body: JSON.stringify({ questionId, selectedAnswer }),
  });
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

export function getRemoteQuizConfig() {
  return requestApi<QuizConfig>("quiz-config");
}

export function saveRemoteQuizConfig(questionCount: number) {
  return requestApi<QuizConfig>("quiz-config", {
    method: "PUT",
    body: JSON.stringify({ questionCount }),
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
