import { seedQuestions } from "./data";
import type { Attempt, Participant, QuizQuestion, QuizSession } from "./types";

const keys = {
  participants: "phishing-quiz-participants",
  questions: "phishing-quiz-questions",
  attempts: "phishing-quiz-attempts",
  session: "phishing-quiz-session",
  admin: "phishing-quiz-admin-auth",
  questionSeedVersion: "phishing-quiz-question-seed-version",
};
const currentQuestionSeedVersion = "2026-05-18.vps-question-bank.v5";

function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeQuestion(question: Partial<QuizQuestion>, fallbackOrderIndex: number): QuizQuestion {
  return {
    id: question.id ?? crypto.randomUUID(),
    title: question.title ?? "",
    category: question.category ?? "Email",
    scenarioIntro: question.scenarioIntro ?? "",
    scenarioContent: question.scenarioContent ?? "",
    scenarioHtml: question.scenarioHtml ?? "",
    correctAnswer: question.correctAnswer ?? "phishing",
    explanation: question.explanation ?? "",
    indicators: question.indicators ?? [],
    active: question.active ?? true,
    orderIndex: question.orderIndex ?? fallbackOrderIndex,
  };
}

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

export function initializeStorage() {
  const storedQuestionVersion = localStorage.getItem(keys.questionSeedVersion);
  if (!localStorage.getItem(keys.questions) || storedQuestionVersion !== currentQuestionSeedVersion) {
    write(keys.questions, seedQuestions);
    localStorage.setItem(keys.questionSeedVersion, currentQuestionSeedVersion);
  } else {
    const normalizedQuestions = read<Partial<QuizQuestion>[]>(keys.questions, []).map(
      (question, index) => normalizeQuestion(question, index + 1),
    );
    write(keys.questions, normalizedQuestions);
  }
  if (!localStorage.getItem(keys.participants)) {
    write<Participant[]>(keys.participants, []);
  }
  if (!localStorage.getItem(keys.attempts)) {
    write<Attempt[]>(keys.attempts, []);
  }
}

export function getQuestions() {
  return read<Partial<QuizQuestion>[]>(keys.questions, seedQuestions)
    .map((question, index) => normalizeQuestion(question, index + 1))
    .filter((question) => question.active)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

export function getAllQuestions() {
  return read<Partial<QuizQuestion>[]>(keys.questions, seedQuestions)
    .map((question, index) => normalizeQuestion(question, index + 1))
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

export function saveQuestions(questions: QuizQuestion[]) {
  write(keys.questions, questions);
}

export function createParticipant(fullName: string, email: string, consent: boolean) {
  const participants = read<Participant[]>(keys.participants, []);
  const existing = participants.find(
    (participant) => participant.email.toLowerCase() === email.toLowerCase(),
  );
  if (existing) {
    return existing;
  }
  const participant: Participant = {
    id: crypto.randomUUID(),
    fullName,
    email,
    consent,
    createdAt: new Date().toISOString(),
  };
  participants.push(participant);
  write(keys.participants, participants);
  return participant;
}

export function getParticipants() {
  return read<Participant[]>(keys.participants, []);
}

export function startSession(participantId: string) {
  const questionIds = shuffle(getQuestions()).slice(0, 10).map((question) => question.id);
  const session: QuizSession = {
    participantId,
    startedAt: new Date().toISOString(),
    questionIds,
    answers: [],
  };
  write(keys.session, session);
  return session;
}

export function getSession() {
  const session = read<QuizSession | null>(keys.session, null);
  if (!session) {
    return null;
  }
  return {
    ...session,
    questionIds: session.questionIds ?? shuffle(getQuestions()).slice(0, 10).map((question) => question.id),
  };
}

export function saveSession(session: QuizSession) {
  write(keys.session, session);
}

export function clearSession() {
  localStorage.removeItem(keys.session);
}

export function finishAttempt() {
  const session = getSession();
  if (!session) {
    return null;
  }
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
    completedAt: new Date().toISOString(),
    answers: session.answers,
  };
  const attempts = read<Attempt[]>(keys.attempts, []);
  attempts.push(attempt);
  write(keys.attempts, attempts);
  clearSession();
  return attempt;
}

export function getAttempts() {
  return read<Attempt[]>(keys.attempts, []);
}

export function getAttempt(attemptId: string) {
  return getAttempts().find((attempt) => attempt.id === attemptId) ?? null;
}

export function getLeaderboard() {
  const attempts = getAttempts();
  const participants = getParticipants();
  return attempts
    .map((attempt) => ({
      ...attempt,
      participant: participants.find((participant) => participant.id === attempt.participantId),
    }))
    .filter((attempt) => attempt.participant)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (a.durationSeconds !== b.durationSeconds) {
        return a.durationSeconds - b.durationSeconds;
      }
      return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
    });
}

export function signInAdmin(email: string, password: string) {
  const valid = email === "admin@phishingquiz.local" && password === "Admin123!";
  if (valid) {
    localStorage.setItem(keys.admin, "true");
  }
  return valid;
}

export function isAdminAuthenticated() {
  return localStorage.getItem(keys.admin) === "true";
}

export function signOutAdmin() {
  localStorage.removeItem(keys.admin);
}
