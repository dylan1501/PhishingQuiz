import { AnswerOption as DbAnswerOption, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { seedQuestions } from "../src/data.js";
import type {
  AnswerOption as ClientAnswerOption,
  Attempt,
  Participant,
  QuizConfig,
  QuizQuestion,
  QuizSession,
  QuizSessionPayload,
} from "../src/types.js";
import { getPrisma } from "./_db.js";

const defaultQuizTitle = "Phishing Quiz";

// Phiên làm bài không có hoạt động (trả lời / còn mở tab) quá 20 phút sẽ bị chốt kết quả và xóa.
export const SESSION_IDLE_TIMEOUT_MS = 20 * 60 * 1000;
const sessionExpiredMessage =
  "Phiên làm bài đã hết hạn do quá 20 phút không hoạt động. Các câu đã trả lời vẫn được ghi nhận vào kết quả.";

function nextSessionExpiry(from = Date.now()) {
  return new Date(from + SESSION_IDLE_TIMEOUT_MS);
}

const attemptInclude = {
  answers: true,
  participant: true,
} satisfies Prisma.AttemptInclude;

type QuestionWithIndicators = Prisma.QuestionGetPayload<{
  include: { indicators: { orderBy: { orderIndex: "asc" } } };
}>;

type AttemptWithRelations = Prisma.AttemptGetPayload<{
  include: typeof attemptInclude;
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

// Số câu cần đúng nằm trong [1, questionCount].
function clampPassScore(value: number, questionCount: number) {
  if (!Number.isFinite(value)) {
    return Math.min(4, questionCount);
  }
  return Math.min(Math.max(Math.round(value), 1), questionCount);
}

// Số câu Phishing nằm trong [0, questionCount].
function clampPhishingCount(value: number, questionCount: number) {
  if (!Number.isFinite(value)) {
    return Math.min(Math.round(questionCount / 2), questionCount);
  }
  return Math.min(Math.max(Math.round(value), 0), questionCount);
}

function serializeQuizConfig(setting: {
  questionCount: number;
  passScore: number;
  phishingCount: number;
  updatedAt: Date;
}): QuizConfig {
  return {
    questionCount: setting.questionCount,
    passScore: clampPassScore(setting.passScore, setting.questionCount),
    phishingCount: clampPhishingCount(setting.phishingCount, setting.questionCount),
    updatedAt: setting.updatedAt.toISOString(),
  };
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
    createdAt: question.createdAt.toISOString(),
    updatedAt: question.updatedAt.toISOString(),
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

const questionInUseMessage =
  "Câu hỏi đã xuất hiện trong lịch sử làm bài nên không thể xóa (sẽ làm sai kết quả cũ). Hãy tắt câu hỏi thay vì xóa.";

// Xóa cứng chỉ khi câu hỏi chưa có ai trả lời; FK Restrict trên attempt_answers / quiz_session_answers
// bảo vệ lịch sử — bắt lỗi P2003 để trả thông báo rõ ràng thay vì lỗi kỹ thuật.
export async function deleteQuestion(questionId: string) {
  const prisma = getPrisma();
  const [attemptAnswerCount, sessionAnswerCount] = await Promise.all([
    prisma.attemptAnswer.count({ where: { questionId } }),
    prisma.quizSessionAnswer.count({ where: { questionId } }),
  ]);
  if (attemptAnswerCount > 0 || sessionAnswerCount > 0) {
    throw new Error(questionInUseMessage);
  }
  try {
    await prisma.question.delete({ where: { id: questionId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        throw new Error(questionInUseMessage);
      }
      if (error.code === "P2025") {
        throw new Error("Không tìm thấy câu hỏi.");
      }
    }
    throw error;
  }
  return { id: questionId, deleted: true };
}

export async function getQuizConfig(): Promise<QuizConfig> {
  const prisma = getPrisma();
  const quiz = await ensureDefaultQuiz();
  const setting = await prisma.quizSetting.findUniqueOrThrow({
    where: { quizId: quiz.id },
  });
  return serializeQuizConfig(setting);
}

export async function saveQuizConfig(
  questionCount: number,
  passScore: number,
  phishingCount: number,
): Promise<QuizConfig> {
  const prisma = getPrisma();
  const quiz = await ensureDefaultQuiz();
  const activeQuestionCount = await prisma.question.count({
    where: { quizId: quiz.id, active: true },
  });
  const nextQuestionCount = clampQuestionCount(questionCount, activeQuestionCount);
  const nextPassScore = clampPassScore(passScore, nextQuestionCount);
  const nextPhishingCount = clampPhishingCount(phishingCount, nextQuestionCount);
  const setting = await prisma.quizSetting.upsert({
    where: { quizId: quiz.id },
    update: {
      questionCount: nextQuestionCount,
      passScore: nextPassScore,
      phishingCount: nextPhishingCount,
    },
    create: {
      quizId: quiz.id,
      questionCount: nextQuestionCount,
      passScore: nextPassScore,
      phishingCount: nextPhishingCount,
      randomizeQuestions: true,
      requireExplanation: true,
    },
  });
  return serializeQuizConfig(setting);
}

/** Bao nhiêu câu Phishing / An toàn trong ngân hàng đang bật — dùng để cảnh báo trên dashboard. */
export async function getActiveAnswerBreakdown() {
  const prisma = getPrisma();
  const quiz = await ensureDefaultQuiz();
  const [phishing, legitimate] = await Promise.all([
    prisma.question.count({ where: { quizId: quiz.id, active: true, correctAnswer: DbAnswerOption.PHISHING } }),
    prisma.question.count({ where: { quizId: quiz.id, active: true, correctAnswer: DbAnswerOption.LEGITIMATE } }),
  ]);
  return { phishing, legitimate };
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

// Trả về cả bộ câu hỏi (kèm indicators) và ngưỡng đạt để client vào bài ngay, không cần gọi thêm API.
export async function startQuizSession(participantId: string): Promise<QuizSessionPayload> {
  const prisma = getPrisma();
  const quiz = await ensureDefaultQuiz();
  const [setting, activeQuestions] = await Promise.all([
    prisma.quizSetting.findUnique({ where: { quizId: quiz.id } }),
    prisma.question.findMany({
      where: { quizId: quiz.id, active: true },
      orderBy: { orderIndex: "asc" },
      include: { indicators: { orderBy: { orderIndex: "asc" } } },
    }),
  ]);
  const questionLimit = clampQuestionCount(setting?.questionCount ?? 10, activeQuestions.length);
  const requiredQuestions = activeQuestions
    .filter((question) => question.alwaysIncluded)
    .slice(0, questionLimit);

  // Đề được trộn theo tỉ lệ cấu hình: đúng `phishingCount` câu đáp án Phishing, còn lại An toàn.
  // Câu "luôn có" được tính vào hạn ngạch của loại tương ứng; nếu ngân hàng không đủ một loại thì
  // bù bằng loại còn lại để đề vẫn đủ số câu.
  const isPhishing = (question: { correctAnswer: DbAnswerOption }) =>
    question.correctAnswer === DbAnswerOption.PHISHING;
  const targetPhishing = clampPhishingCount(setting?.phishingCount ?? Math.round(questionLimit / 2), questionLimit);
  const requiredPhishingCount = requiredQuestions.filter(isPhishing).length;
  const requiredLegitimateCount = requiredQuestions.length - requiredPhishingCount;
  const neededPhishing = Math.max(0, targetPhishing - requiredPhishingCount);
  const neededLegitimate = Math.max(0, questionLimit - targetPhishing - requiredLegitimateCount);

  const optionalQuestions = activeQuestions.filter((question) => !question.alwaysIncluded);
  const phishingPool = shuffle(optionalQuestions.filter(isPhishing));
  const legitimatePool = shuffle(optionalQuestions.filter((question) => !isPhishing(question)));
  const picked = [
    ...requiredQuestions,
    ...phishingPool.slice(0, neededPhishing),
    ...legitimatePool.slice(0, neededLegitimate),
  ];
  if (picked.length < questionLimit) {
    const leftovers = shuffle([
      ...phishingPool.slice(neededPhishing),
      ...legitimatePool.slice(neededLegitimate),
    ]);
    picked.push(...leftovers.slice(0, questionLimit - picked.length));
  }
  const selectedQuestions = shuffle(picked).slice(0, questionLimit);
  const session = await prisma.quizSession.create({
    data: {
      participantId,
      quizId: quiz.id,
      status: "IN_PROGRESS",
      expiresAt: nextSessionExpiry(),
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

  const questionById = new Map(selectedQuestions.map((question) => [question.id, question] as const));
  return {
    session: {
      id: session.id,
      remote: true,
      participantId: session.participantId,
      startedAt: session.startedAt.toISOString(),
      expiresAt: session.expiresAt?.toISOString(),
      questionIds: session.questions.map((question) => question.questionId),
      answers: [],
    },
    questions: session.questions
      .map((entry) => questionById.get(entry.questionId))
      .filter((question): question is NonNullable<typeof question> => Boolean(question))
      .map(serializeQuestion),
    passScore: clampPassScore(setting?.passScore ?? 4, questionLimit),
  };
}

export async function getQuizSession(sessionId: string): Promise<QuizSessionPayload | null> {
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

  const setting = await prisma.quizSetting.findUnique({ where: { quizId: session.quizId } });

  return {
    session: {
      id: session.id,
      remote: true,
      participantId: session.participantId,
      startedAt: session.startedAt.toISOString(),
      expiresAt: session.expiresAt?.toISOString(),
      questionIds: session.questions.map((question) => question.questionId),
      answers: session.answers.map((answer) => ({
        questionId: answer.questionId,
        selectedAnswer: fromDbAnswer(answer.selectedAnswer),
        isCorrect: answer.isCorrect,
        answeredAt: answer.answeredAt.toISOString(),
      })),
    } satisfies QuizSession,
    questions: session.questions.map((entry) => serializeQuestion(entry.question)),
    passScore: clampPassScore(setting?.passScore ?? 4, session.questions.length),
  };
}

// Một request duy nhất cho màn nhập thông tin: tạo/cập nhật người tham gia rồi mở phiên ngay.
export async function startQuizForParticipant(input: { fullName: string; email: string; consent: boolean }) {
  const participant = await upsertParticipant(input);
  return startQuizSession(participant.id);
}

export async function saveSessionAnswer(input: {
  sessionId: string;
  questionId: string;
  selectedAnswer: ClientAnswerOption;
}) {
  const prisma = getPrisma();
  const answeredAt = new Date();

  // Kiểm tra phiên còn hiệu lực + gia hạn 20 phút trong một query; tra đáp án song song.
  const [sessionUpdate, question] = await Promise.all([
    prisma.quizSession.updateMany({
      where: { id: input.sessionId, status: "IN_PROGRESS" },
      data: { expiresAt: nextSessionExpiry(answeredAt.getTime()) },
    }),
    prisma.question.findUnique({
      where: { id: input.questionId },
      select: { correctAnswer: true },
    }),
  ]);
  if (sessionUpdate.count === 0) {
    throw new Error(sessionExpiredMessage);
  }
  if (!question) {
    throw new Error("Không tìm thấy câu hỏi.");
  }
  const isCorrect = fromDbAnswer(question.correctAnswer) === input.selectedAnswer;

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

// Đọc phiên kèm đáp án đúng của từng câu (qua relation) để chốt kết quả không cần query thêm.
const sessionFinalizeInclude = {
  answers: true,
  questions: {
    orderBy: { orderIndex: "asc" },
    include: { question: { select: { correctAnswer: true } } },
  },
} satisfies Prisma.QuizSessionInclude;

type SessionForFinalize = Prisma.QuizSessionGetPayload<{ include: typeof sessionFinalizeInclude }>;

// Tạo Attempt từ các câu đã trả lời trong phiên. `completedAt` là lúc chốt (bấm hoàn thành,
// hoặc hoạt động cuối cùng nếu phiên bị bỏ dở). Idempotent theo unique quizSessionId (P2002).
async function createAttemptFromSession(session: SessionForFinalize, completedAt: Date) {
  const prisma = getPrisma();
  const questionIds = session.questions.map((question) => question.questionId);
  const answeredQuestions = session.answers.filter((answer) => questionIds.includes(answer.questionId));
  const correctAnswerByQuestionId = new Map(
    session.questions.map((entry) => [entry.questionId, entry.question.correctAnswer] as const),
  );
  const durationSeconds = Math.max(1, Math.round((completedAt.getTime() - session.startedAt.getTime()) / 1000));
  const score = answeredQuestions.filter((answer) => answer.isCorrect).length;

  try {
    // Batch transaction: 2 lệnh trong 1 giao dịch, không cần vòng kiểm tra trước (unique lo việc đó).
    const [attempt] = await prisma.$transaction([
      prisma.attempt.create({
        data: {
          participantId: session.participantId,
          quizId: session.quizId,
          quizSessionId: session.id,
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
        include: attemptInclude,
      }),
      prisma.quizSession.update({
        where: { id: session.id },
        data: { status: "COMPLETED", completedAt },
      }),
    ]);
    return attempt;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const attempt = await prisma.attempt.findUnique({
        where: { quizSessionId: session.id },
        include: attemptInclude,
      });
      if (attempt) {
        return attempt;
      }
    }
    throw error;
  }
}

export async function finishQuizSession(sessionId: string) {
  const prisma = getPrisma();
  // Một query: phiên + câu trả lời + đáp án đúng + attempt đã có (nếu bấm hoàn thành 2 lần).
  const session = await prisma.quizSession.findUnique({
    where: { id: sessionId },
    include: { ...sessionFinalizeInclude, attempt: { include: attemptInclude } },
  });
  if (!session) {
    throw new Error(sessionExpiredMessage);
  }
  if (session.attempt) {
    return serializeAttempt(session.attempt);
  }

  return serializeAttempt(await createAttemptFromSession(session, new Date()));
}

// Gia hạn phiên khi người dùng còn hoạt động (client gọi khi rời/ẩn tab).
export async function touchQuizSession(sessionId: string) {
  const prisma = getPrisma();
  const result = await prisma.quizSession.updateMany({
    where: { id: sessionId, status: "IN_PROGRESS" },
    data: { expiresAt: nextSessionExpiry() },
  });
  return { active: result.count > 0 };
}

// Quét phiên IN_PROGRESS đã quá hạn: có câu trả lời → chốt thành Attempt (mốc hoàn thành = hoạt động
// cuối), sau đó xóa phiên. Phiên chưa trả lời câu nào chỉ bị xóa. Phiên cũ không có expiresAt
// (tạo trước khi có tính năng này) được xét theo startedAt.
export async function expireStaleSessions() {
  const prisma = getPrisma();
  const now = new Date();
  const staleSessions = await prisma.quizSession.findMany({
    where: {
      status: "IN_PROGRESS",
      OR: [{ expiresAt: { lt: now } }, { expiresAt: null, startedAt: { lt: new Date(now.getTime() - SESSION_IDLE_TIMEOUT_MS) } }],
    },
    include: sessionFinalizeInclude,
  });

  let finalized = 0;
  let deleted = 0;
  for (const session of staleSessions) {
    try {
      if (session.answers.length > 0) {
        const lastActivityAt = new Date(
          Math.max(session.startedAt.getTime(), ...session.answers.map((answer) => answer.answeredAt.getTime())),
        );
        await createAttemptFromSession(session, lastActivityAt);
        finalized += 1;
      }
      // Attempt.quizSessionId → SetNull, answers/questions của phiên → Cascade.
      await prisma.quizSession.delete({ where: { id: session.id } });
      deleted += 1;
    } catch (error) {
      // Một instance khác có thể đã xử lý phiên này (serverless chạy song song) — bỏ qua.
      console.warn(`[session-expiry] Bỏ qua phiên ${session.id}:`, error instanceof Error ? error.message : error);
    }
  }

  return { scanned: staleSessions.length, finalized, deleted };
}

export async function getAttemptById(attemptId: string) {
  const prisma = getPrisma();
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: attemptInclude,
  });
  return attempt ? serializeAttempt(attempt) : null;
}

export async function listAttempts() {
  const prisma = getPrisma();
  const attempts = await prisma.attempt.findMany({
    include: attemptInclude,
    orderBy: { completedAt: "desc" },
  });
  return attempts.map(serializeAttempt);
}

export async function getLeaderboard() {
  const prisma = getPrisma();
  const attempts = await prisma.attempt.findMany({
    include: attemptInclude,
    orderBy: [
      { score: "desc" },
      { durationSeconds: "asc" },
      { completedAt: "asc" },
    ],
  });
  return attempts.map(serializeAttempt);
}
