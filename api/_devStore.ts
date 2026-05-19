import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { seedQuestions } from "../src/data";
import type {
  AnswerOption,
  Attempt,
  AttemptAnswer,
  Participant,
  QuizConfig,
  QuizQuestion,
  QuizSession,
} from "../src/types";

type LeaderboardEntry = Attempt & { participant: Participant };

type QuestionInput = {
  title: string;
  category: string;
  scenarioIntro: string;
  scenarioContent: string;
  scenarioHtml: string;
  correctAnswer: AnswerOption;
  explanation: string;
  indicators: string[];
  alwaysIncluded: boolean;
};

type DevAdmin = {
  id: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
};

type DevState = {
  questions: QuizQuestion[];
  participants: Participant[];
  sessions: QuizSession[];
  attempts: LeaderboardEntry[];
  quizConfig: QuizConfig;
  admin: DevAdmin | null;
};

const globalForDevStore = globalThis as typeof globalThis & {
  phishingQuizDevStore?: DevState;
};

const cookieName = "phishing_admin_session";
const sessionTtlSeconds = 8 * 60 * 60;
const passwordIterations = 120_000;
const devSecret = "phishing-quiz-dev-api-fallback";

function getState() {
  if (!globalForDevStore.phishingQuizDevStore) {
    globalForDevStore.phishingQuizDevStore = {
      questions: seedQuestions.map((question) => ({ ...question, indicators: [...question.indicators] })),
      participants: [],
      sessions: [],
      attempts: [],
      quizConfig: {
        questionCount: 10,
        updatedAt: new Date(0).toISOString(),
      },
      admin: null,
    };
  }
  return globalForDevStore.phishingQuizDevStore;
}

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function clampQuestionCount(value: number, maxQuestions: number) {
  if (!Number.isFinite(value)) {
    return 10;
  }
  return Math.min(Math.max(Math.round(value), 1), Math.max(maxQuestions, 1));
}

function withParticipant(attempt: Attempt): LeaderboardEntry {
  const participant = getState().participants.find((entry) => entry.id === attempt.participantId);
  return {
    ...attempt,
    participant: participant ?? {
      id: attempt.participantId,
      fullName: "Không xác định",
      email: "",
      consent: false,
      createdAt: attempt.completedAt,
    },
  };
}

function parseCookies(request: VercelRequest) {
  const cookieHeader = request.headers.cookie ?? "";
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const [key, ...value] = cookie.split("=");
        return [key, decodeURIComponent(value.join("="))];
      }),
  );
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function sign(value: string) {
  return base64UrlEncode(createHmac("sha256", devSecret).update(value).digest());
}

function safeEqual(first: string, second: string) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);
  return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer);
}

function hashPassword(password: string, salt: string) {
  return pbkdf2Sync(password, salt, passwordIterations, 32, "sha256").toString("hex");
}

function createSessionToken(admin: DevAdmin) {
  const body = base64UrlEncode(
    JSON.stringify({
      adminId: admin.id,
      email: admin.email,
      exp: Math.floor(Date.now() / 1000) + sessionTtlSeconds,
    }),
  );
  return `${body}.${sign(body)}`;
}

function verifySessionToken(token: string) {
  const [body, signature] = token.split(".");
  if (!body || !signature || !safeEqual(sign(body), signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as { adminId?: string; exp?: number };
    if (!payload.adminId || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function setAdminCookie(response: VercelResponse, admin: DevAdmin) {
  response.setHeader(
    "Set-Cookie",
    `${cookieName}=${encodeURIComponent(createSessionToken(admin))}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${sessionTtlSeconds}`,
  );
}

export async function devEnsureDefaultQuiz() {
  getState();
  return { title: "Phishing Quiz" };
}

export async function devListQuestions(includeInactive = false) {
  return getState()
    .questions.filter((question) => includeInactive || question.active)
    .sort((first, second) => first.orderIndex - second.orderIndex);
}

export async function devCreateQuestion(input: QuestionInput) {
  const state = getState();
  const question: QuizQuestion = {
    id: crypto.randomUUID(),
    ...input,
    active: true,
    orderIndex: state.questions.length + 1,
  };
  state.questions.push(question);
  return question;
}

export async function devUpdateQuestion(questionId: string, input: QuestionInput) {
  const state = getState();
  const index = state.questions.findIndex((question) => question.id === questionId);
  if (index < 0) {
    throw new Error("Không tìm thấy câu hỏi.");
  }
  state.questions[index] = {
    ...state.questions[index],
    ...input,
  };
  return state.questions[index];
}

export async function devUpdateQuestionState(
  questionId: string,
  input: Partial<Pick<QuizQuestion, "active" | "alwaysIncluded">>,
) {
  const state = getState();
  const question = state.questions.find((entry) => entry.id === questionId);
  if (!question) {
    throw new Error("Không tìm thấy câu hỏi.");
  }
  if (typeof input.active === "boolean") {
    question.active = input.active;
  }
  if (typeof input.alwaysIncluded === "boolean") {
    question.alwaysIncluded = input.alwaysIncluded;
    if (input.alwaysIncluded) {
      question.active = true;
    }
  }
  return question;
}

export async function devGetQuizConfig() {
  return getState().quizConfig;
}

export async function devSaveQuizConfig(questionCount: number) {
  const state = getState();
  const activeQuestionCount = Math.max(state.questions.filter((question) => question.active).length, 1);
  state.quizConfig = {
    questionCount: clampQuestionCount(questionCount, activeQuestionCount),
    updatedAt: new Date().toISOString(),
  };
  return state.quizConfig;
}

export async function devUpsertParticipant(input: {
  fullName: string;
  email: string;
  consent: boolean;
}) {
  const state = getState();
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = state.participants.find((participant) => participant.email === normalizedEmail);
  if (existing) {
    existing.fullName = input.fullName.trim();
    existing.consent = input.consent;
    return existing;
  }

  const participant: Participant = {
    id: crypto.randomUUID(),
    fullName: input.fullName.trim(),
    email: normalizedEmail,
    consent: input.consent,
    createdAt: new Date().toISOString(),
  };
  state.participants.push(participant);
  return participant;
}

export async function devListParticipants() {
  return [...getState().participants].sort(
    (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  );
}

export async function devStartQuizSession(participantId: string): Promise<QuizSession> {
  const state = getState();
  const activeQuestions = state.questions.filter((question) => question.active);
  const questionLimit = clampQuestionCount(state.quizConfig.questionCount, activeQuestions.length);
  const requiredQuestions = activeQuestions
    .filter((question) => question.alwaysIncluded)
    .slice(0, questionLimit);
  const randomQuestions = shuffle(activeQuestions.filter((question) => !question.alwaysIncluded)).slice(
    0,
    Math.max(0, questionLimit - requiredQuestions.length),
  );
  const questionIds = shuffle([...requiredQuestions, ...randomQuestions]).map((question) => question.id);
  const session: QuizSession = {
    id: crypto.randomUUID(),
    remote: true,
    participantId,
    startedAt: new Date().toISOString(),
    questionIds,
    answers: [],
  };
  state.sessions.push(session);
  return session;
}

export async function devGetQuizSession(sessionId: string) {
  const state = getState();
  const session = state.sessions.find((entry) => entry.id === sessionId);
  if (!session) {
    return null;
  }
  return {
    session,
    questions: session.questionIds
      .map((questionId) => state.questions.find((question) => question.id === questionId))
      .filter((question): question is QuizQuestion => Boolean(question)),
  };
}

export async function devSaveSessionAnswer(input: {
  sessionId: string;
  questionId: string;
  selectedAnswer: AnswerOption;
}) {
  const state = getState();
  const session = state.sessions.find((entry) => entry.id === input.sessionId);
  const question = state.questions.find((entry) => entry.id === input.questionId);
  if (!session || !question) {
    throw new Error("Không tìm thấy phiên hoặc câu hỏi.");
  }

  const answer: AttemptAnswer = {
    questionId: input.questionId,
    selectedAnswer: input.selectedAnswer,
    isCorrect: input.selectedAnswer === question.correctAnswer,
    answeredAt: new Date().toISOString(),
  };
  session.answers = [...session.answers.filter((entry) => entry.questionId !== input.questionId), answer];
  return answer;
}

export async function devFinishQuizSession(sessionId: string) {
  const state = getState();
  const session = state.sessions.find((entry) => entry.id === sessionId);
  if (!session) {
    throw new Error("Không tìm thấy phiên làm bài.");
  }
  const completedAt = new Date().toISOString();
  const attempt: Attempt = {
    id: crypto.randomUUID(),
    participantId: session.participantId,
    score: session.answers.filter((answer) => answer.isCorrect).length,
    totalQuestions: session.questionIds.length,
    durationSeconds: Math.max(
      1,
      Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000),
    ),
    startedAt: session.startedAt,
    completedAt,
    answers: session.answers,
  };
  const entry = withParticipant(attempt);
  state.attempts.push(entry);
  return entry;
}

export async function devGetAttemptById(attemptId: string) {
  return getState().attempts.find((attempt) => attempt.id === attemptId) ?? null;
}

export async function devListAttempts() {
  return [...getState().attempts].sort(
    (first, second) => new Date(second.completedAt).getTime() - new Date(first.completedAt).getTime(),
  );
}

export async function devGetLeaderboard() {
  return [...getState().attempts].sort((first, second) => {
    if (second.score !== first.score) {
      return second.score - first.score;
    }
    if (first.durationSeconds !== second.durationSeconds) {
      return first.durationSeconds - second.durationSeconds;
    }
    return new Date(first.completedAt).getTime() - new Date(second.completedAt).getTime();
  });
}

export function devClearAdminCookie(response: VercelResponse) {
  response.setHeader("Set-Cookie", `${cookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

export async function devGetAdminStatus(request: VercelRequest) {
  const state = getState();
  return {
    hasAdmin: Boolean(state.admin),
    authenticated: Boolean(await devRequireAdmin(request)),
  };
}

export async function devRequireAdmin(request: VercelRequest) {
  const state = getState();
  const token = parseCookies(request)[cookieName];
  const payload = token ? verifySessionToken(token) : null;
  if (!payload || !state.admin || payload.adminId !== state.admin.id) {
    return null;
  }
  return state.admin;
}

export async function devSetupAdmin(email: string, password: string, response: VercelResponse) {
  const state = getState();
  if (state.admin) {
    throw new Error("Tài khoản quản trị đã được thiết lập.");
  }
  const salt = base64UrlEncode(randomBytes(18));
  const admin: DevAdmin = {
    id: crypto.randomUUID(),
    email: email.trim().toLowerCase(),
    passwordSalt: salt,
    passwordHash: hashPassword(password, salt),
  };
  state.admin = admin;
  setAdminCookie(response, admin);
  return { email: admin.email };
}

export async function devLoginAdmin(email: string, password: string, response: VercelResponse) {
  const admin = getState().admin;
  if (!admin || admin.email !== email.trim().toLowerCase()) {
    return false;
  }
  if (!safeEqual(hashPassword(password, admin.passwordSalt), admin.passwordHash)) {
    return false;
  }
  setAdminCookie(response, admin);
  return true;
}
