import { AnswerOption as DbAnswerOption, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { seedQuestions } from "../src/data";
import type {
  AnswerOption as ClientAnswerOption,
  Attempt,
  Participant,
  QuizConfig,
  QuizQuestion,
  QuizSession,
} from "../src/types";
import { getPrisma } from "./_db";

const defaultQuizTitle = "Phishing Quiz";

type QuestionWithIndicators = Prisma.QuestionGetPayload<{
  include: { indicators: { orderBy: { orderIndex: "asc" } } };
}>;

type AttemptWithRelations = Prisma.AttemptGetPayload<{
  include: {
    answers: true;
    participant: true;
  };
}>;

type QuestionInput = {
  title: string;
  category: string;
  scenarioIntro: string;
  scenarioContent: string;
  scenarioHtml: string;
  correctAnswer: ClientAnswerOption;
  explanation: string;
  indicators: string[];
  alwaysIncluded: boolean;
};

function toDbAnswer(answer: ClientAnswerOption) {
  return answer === "phishing" ? DbAnswerOption.PHISHING : DbAnswerOption.LEGITIMATE;
}

function fromDbAnswer(answer: string): ClientAnswerOption {
  return answer === DbAnswerOption.PHISHING ? "phishing" : "legitimate";
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

function serializeQuestion(question: QuestionWithIndicators): QuizQuestion {
  return {
    id: question.id,
    title: question.title,
    category: question.category,
    scenarioIntro: question.scenarioIntro,
    scenarioContent: question.scenarioContent,
    scenarioHtml: question.scenarioHtml,
    correctAnswer: fromDbAnswer(question.correctAnswer),
    explanation: question.explanation,
    indicators: question.indicators.map((indicator) => indicator.label),
    active: question.active,
    alwaysIncluded: question.alwaysIncluded,
    orderIndex: question.orderIndex,
  };
}

function serializeParticipant(participant: {
  id: string;
  fullName: string;
  email: string;
  consent: boolean;
  createdAt: Date;
}): Participant {
  return {
    id: participant.id,
    fullName: participant.fullName,
    email: participant.email,
    consent: participant.consent,
    createdAt: participant.createdAt.toISOString(),
  };
}

function serializeAttempt(attempt: AttemptWithRelations): Attempt & { participant: Participant } {
  return {
    id: attempt.id,
    participantId: attempt.participantId,
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    durationSeconds: attempt.durationSeconds,
    startedAt: attempt.startedAt.toISOString(),
    completedAt: attempt.completedAt.toISOString(),
    answers: attempt.answers.map((answer) => ({
      questionId: answer.questionId,
      selectedAnswer: fromDbAnswer(answer.selectedAnswer),
      isCorrect: answer.isCorrect,
      answeredAt: answer.answeredAt.toISOString(),
    })),
    participant: serializeParticipant(attempt.participant),
  };
}

export async function ensureDefaultQuiz() {
  const prisma = getPrisma();
  const existingQuiz = await prisma.quiz.findFirst({
    where: { title: defaultQuizTitle },
    include: { setting: true },
  });

  if (existingQuiz) {
    if (!existingQuiz.setting) {
      await prisma.quizSetting.create({
        data: {
          quizId: existingQuiz.id,
          questionCount: 10,
          randomizeQuestions: true,
          requireExplanation: true,
        },
      });
    }
    return existingQuiz;
  }

  return prisma.quiz.create({
    data: {
      title: defaultQuizTitle,
      description: "Bài đánh giá nhận diện phishing dành cho đào tạo nhận thức an ninh thông tin.",
      isActive: true,
      setting: {
        create: {
          questionCount: 10,
          randomizeQuestions: true,
          requireExplanation: true,
        },
      },
      questions: {
        create: seedQuestions.map((question, index) => ({
          id: question.id,
          title: question.title,
          category: question.category,
          scenarioIntro: question.scenarioIntro,
          scenarioContent: question.scenarioContent,
          scenarioHtml: question.scenarioHtml,
          correctAnswer: toDbAnswer(question.correctAnswer),
          explanation: question.explanation,
          active: question.active,
          alwaysIncluded: question.alwaysIncluded,
          orderIndex: question.orderIndex ?? index + 1,
          indicators: {
            create: question.indicators.map((indicator, indicatorIndex) => ({
              label: indicator,
              orderIndex: indicatorIndex + 1,
            })),
          },
        })),
      },
    },
  });
}

export async function listQuestions(includeInactive = false) {
  const prisma = getPrisma();
  const quiz = await ensureDefaultQuiz();
  const questions = await prisma.question.findMany({
    where: {
      quizId: quiz.id,
      ...(includeInactive ? {} : { active: true }),
    },
    include: {
      indicators: { orderBy: { orderIndex: "asc" } },
    },
    orderBy: { orderIndex: "asc" },
  });
  return questions.map(serializeQuestion);
}

export async function createQuestion(input: QuestionInput) {
  const prisma = getPrisma();
  const quiz = await ensureDefaultQuiz();
  const lastQuestion = await prisma.question.findFirst({
    where: { quizId: quiz.id },
    orderBy: { orderIndex: "desc" },
  });
  const question = await prisma.question.create({
    data: {
      id: randomUUID(),
      quizId: quiz.id,
      title: input.title,
      category: input.category,
      scenarioIntro: input.scenarioIntro,
      scenarioContent: input.scenarioContent,
      scenarioHtml: input.scenarioHtml,
      correctAnswer: toDbAnswer(input.correctAnswer),
      explanation: input.explanation,
      active: true,
      alwaysIncluded: input.alwaysIncluded,
      orderIndex: (lastQuestion?.orderIndex ?? 0) + 1,
      indicators: {
        create: input.indicators.map((indicator, index) => ({
          label: indicator,
          orderIndex: index + 1,
        })),
      },
    },
    include: {
      indicators: { orderBy: { orderIndex: "asc" } },
    },
  });
  return serializeQuestion(question);
}

export async function updateQuestion(questionId: string, input: QuestionInput) {
  const prisma = getPrisma();
  const question = await prisma.$transaction(async (tx) => {
    await tx.questionIndicator.deleteMany({ where: { questionId } });
    return tx.question.update({
      where: { id: questionId },
      data: {
        title: input.title,
        category: input.category,
        scenarioIntro: input.scenarioIntro,
        scenarioContent: input.scenarioContent,
        scenarioHtml: input.scenarioHtml,
        correctAnswer: toDbAnswer(input.correctAnswer),
        explanation: input.explanation,
        alwaysIncluded: input.alwaysIncluded,
        indicators: {
          create: input.indicators.map((indicator, index) => ({
            label: indicator,
            orderIndex: index + 1,
          })),
        },
      },
      include: {
        indicators: { orderBy: { orderIndex: "asc" } },
      },
    });
  });
  return serializeQuestion(question);
}

export async function updateQuestionState(
  questionId: string,
  input: Partial<Pick<QuizQuestion, "active" | "alwaysIncluded">>,
) {
  const question = await getPrisma().question.update({
    where: { id: questionId },
    data: {
      ...(typeof input.active === "boolean" ? { active: input.active } : {}),
      ...(typeof input.alwaysIncluded === "boolean"
        ? { alwaysIncluded: input.alwaysIncluded, ...(input.alwaysIncluded ? { active: true } : {}) }
        : {}),
    },
    include: {
      indicators: { orderBy: { orderIndex: "asc" } },
    },
  });
  return serializeQuestion(question);
}

export async function getQuizConfig(): Promise<QuizConfig> {
  const prisma = getPrisma();
  const quiz = await ensureDefaultQuiz();
  const setting = await prisma.quizSetting.findUniqueOrThrow({
    where: { quizId: quiz.id },
  });
  return {
    questionCount: setting.questionCount,
    updatedAt: setting.updatedAt.toISOString(),
  };
}

export async function saveQuizConfig(questionCount: number): Promise<QuizConfig> {
  const prisma = getPrisma();
  const quiz = await ensureDefaultQuiz();
  const activeQuestionCount = await prisma.question.count({
    where: { quizId: quiz.id, active: true },
  });
  const nextQuestionCount = clampQuestionCount(questionCount, activeQuestionCount);
  const setting = await prisma.quizSetting.upsert({
    where: { quizId: quiz.id },
    update: { questionCount: nextQuestionCount },
    create: {
      quizId: quiz.id,
      questionCount: nextQuestionCount,
      randomizeQuestions: true,
      requireExplanation: true,
    },
  });
  return {
    questionCount: setting.questionCount,
    updatedAt: setting.updatedAt.toISOString(),
  };
}

export async function upsertParticipant(input: {
  fullName: string;
  email: string;
  consent: boolean;
}) {
  const prisma = getPrisma();
  const normalizedEmail = input.email.trim().toLowerCase();
  const participant = await prisma.participant.upsert({
    where: { email: normalizedEmail },
    update: {
      fullName: input.fullName.trim(),
      consent: input.consent,
    },
    create: {
      fullName: input.fullName.trim(),
      email: normalizedEmail,
      consent: input.consent,
    },
  });
  return serializeParticipant(participant);
}

export async function listParticipants() {
  const prisma = getPrisma();
  const participants = await prisma.participant.findMany({
    orderBy: { createdAt: "desc" },
  });
  return participants.map(serializeParticipant);
}

export async function startQuizSession(participantId: string): Promise<QuizSession> {
  const prisma = getPrisma();
  const quiz = await ensureDefaultQuiz();
  const [setting, activeQuestions] = await Promise.all([
    prisma.quizSetting.findUnique({ where: { quizId: quiz.id } }),
    prisma.question.findMany({
      where: { quizId: quiz.id, active: true },
      orderBy: { orderIndex: "asc" },
    }),
  ]);
  const questionLimit = clampQuestionCount(setting?.questionCount ?? 10, activeQuestions.length);
  const requiredQuestions = activeQuestions
    .filter((question) => question.alwaysIncluded)
    .slice(0, questionLimit);
  const remainingSlots = Math.max(0, questionLimit - requiredQuestions.length);
  const randomQuestions = shuffle(activeQuestions.filter((question) => !question.alwaysIncluded)).slice(
    0,
    remainingSlots,
  );
  const selectedQuestions = shuffle([...requiredQuestions, ...randomQuestions]);
  const session = await prisma.quizSession.create({
    data: {
      participantId,
      quizId: quiz.id,
      status: "IN_PROGRESS",
      questions: {
        create: selectedQuestions.map((question, index) => ({
          questionId: question.id,
          orderIndex: index + 1,
        })),
      },
    },
    include: {
      answers: true,
      questions: { orderBy: { orderIndex: "asc" } },
    },
  });

  return {
    id: session.id,
    remote: true,
    participantId: session.participantId,
    startedAt: session.startedAt.toISOString(),
    questionIds: session.questions.map((question) => question.questionId),
    answers: session.answers.map((answer) => ({
      questionId: answer.questionId,
      selectedAnswer: fromDbAnswer(answer.selectedAnswer),
      isCorrect: answer.isCorrect,
      answeredAt: answer.answeredAt.toISOString(),
    })),
  };
}

export async function getQuizSession(sessionId: string) {
  const prisma = getPrisma();
  const session = await prisma.quizSession.findUnique({
    where: { id: sessionId },
    include: {
      answers: true,
      questions: {
        orderBy: { orderIndex: "asc" },
        include: {
          question: {
            include: {
              indicators: { orderBy: { orderIndex: "asc" } },
            },
          },
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  return {
    session: {
      id: session.id,
      remote: true,
      participantId: session.participantId,
      startedAt: session.startedAt.toISOString(),
      questionIds: session.questions.map((question) => question.questionId),
      answers: session.answers.map((answer) => ({
        questionId: answer.questionId,
        selectedAnswer: fromDbAnswer(answer.selectedAnswer),
        isCorrect: answer.isCorrect,
        answeredAt: answer.answeredAt.toISOString(),
      })),
    } satisfies QuizSession,
    questions: session.questions.map((entry) => serializeQuestion(entry.question)),
  };
}

export async function saveSessionAnswer(input: {
  sessionId: string;
  questionId: string;
  selectedAnswer: ClientAnswerOption;
}) {
  const prisma = getPrisma();
  const question = await prisma.question.findUniqueOrThrow({
    where: { id: input.questionId },
  });
  const isCorrect = fromDbAnswer(question.correctAnswer) === input.selectedAnswer;
  const answeredAt = new Date();

  const answer = await prisma.quizSessionAnswer.upsert({
    where: {
      sessionId_questionId: {
        sessionId: input.sessionId,
        questionId: input.questionId,
      },
    },
    update: {
      selectedAnswer: toDbAnswer(input.selectedAnswer),
      isCorrect,
      answeredAt,
    },
    create: {
      sessionId: input.sessionId,
      questionId: input.questionId,
      selectedAnswer: toDbAnswer(input.selectedAnswer),
      isCorrect,
      answeredAt,
    },
  });

  return {
    questionId: answer.questionId,
    selectedAnswer: fromDbAnswer(answer.selectedAnswer),
    isCorrect: answer.isCorrect,
    answeredAt: answer.answeredAt.toISOString(),
  };
}

export async function finishQuizSession(sessionId: string) {
  const prisma = getPrisma();
  const session = await prisma.quizSession.findUniqueOrThrow({
    where: { id: sessionId },
    include: {
      answers: true,
      questions: { orderBy: { orderIndex: "asc" } },
    },
  });

  const questionIds = session.questions.map((question) => question.questionId);
  const answeredQuestions = session.answers.filter((answer) => questionIds.includes(answer.questionId));
  const questionAnswers = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    select: { id: true, correctAnswer: true },
  });
  const correctAnswerByQuestionId = new Map(
    questionAnswers.map((question) => [question.id, question.correctAnswer] as const),
  );
  const completedAt = new Date();
  const durationSeconds = Math.max(1, Math.round((completedAt.getTime() - session.startedAt.getTime()) / 1000));
  const score = answeredQuestions.filter((answer) => answer.isCorrect).length;

  const attempt = await prisma.$transaction(async (tx) => {
    const nextAttempt = await tx.attempt.create({
      data: {
        participantId: session.participantId,
        quizId: session.quizId,
        score,
        totalQuestions: questionIds.length,
        durationSeconds,
        startedAt: session.startedAt,
        completedAt,
        answers: {
          create: answeredQuestions.map((answer) => ({
            questionId: answer.questionId,
            selectedAnswer: answer.selectedAnswer,
            correctAnswer: correctAnswerByQuestionId.get(answer.questionId) ?? answer.selectedAnswer,
            isCorrect: answer.isCorrect,
            answeredAt: answer.answeredAt,
          })),
        },
      },
      include: {
        answers: true,
        participant: true,
      },
    });
    await tx.quizSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        completedAt,
      },
    });
    return nextAttempt;
  });

  return serializeAttempt(attempt);
}

export async function getAttemptById(attemptId: string) {
  const prisma = getPrisma();
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: true,
      participant: true,
    },
  });
  return attempt ? serializeAttempt(attempt) : null;
}

export async function listAttempts() {
  const prisma = getPrisma();
  const attempts = await prisma.attempt.findMany({
    include: {
      answers: true,
      participant: true,
    },
    orderBy: { completedAt: "desc" },
  });
  return attempts.map(serializeAttempt);
}

export async function getLeaderboard() {
  const prisma = getPrisma();
  const attempts = await prisma.attempt.findMany({
    include: {
      answers: true,
      participant: true,
    },
    orderBy: [
      { score: "desc" },
      { durationSeconds: "asc" },
      { completedAt: "asc" },
    ],
  });
  return attempts.map(serializeAttempt);
}
