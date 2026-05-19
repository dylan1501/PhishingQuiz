import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { AnswerOption } from "../src/types";
import {
  clearAdminCookie,
  getAdminStatus,
  loginAdmin,
  requireAdmin,
  setupAdmin,
} from "./_adminAuth";
import {
  devClearAdminCookie,
  devCreateQuestion,
  devEnsureDefaultQuiz,
  devFinishQuizSession,
  devGetAdminStatus,
  devGetAttemptById,
  devGetLeaderboard,
  devGetQuizConfig,
  devGetQuizSession,
  devListAttempts,
  devListParticipants,
  devListQuestions,
  devLoginAdmin,
  devRequireAdmin,
  devSaveQuizConfig,
  devSaveSessionAnswer,
  devSetupAdmin,
  devStartQuizSession,
  devUpdateQuestion,
  devUpdateQuestionState,
  devUpsertParticipant,
} from "./_devStore";
import {
  createQuestion,
  ensureDefaultQuiz,
  finishQuizSession,
  getAttemptById,
  getLeaderboard,
  getQuizConfig,
  getQuizSession,
  listAttempts,
  listParticipants,
  listQuestions,
  saveSessionAnswer,
  saveQuizConfig,
  startQuizSession,
  updateQuestion,
  updateQuestionState,
  upsertParticipant,
} from "./_quizRepository";

function getPathSegments(request: VercelRequest) {
  const path = request.query.path;
  if (Array.isArray(path)) {
    return path;
  }
  return path ? [path] : [];
}

function readBody<T>(request: VercelRequest): T {
  if (!request.body) {
    return {} as T;
  }
  if (typeof request.body === "string") {
    return JSON.parse(request.body) as T;
  }
  return request.body as T;
}

function sendOk(response: VercelResponse, data: unknown) {
  response.status(200).json({ data });
}

function sendCreated(response: VercelResponse, data: unknown) {
  response.status(201).json({ data });
}

function sendError(response: VercelResponse, status: number, message: string) {
  response.status(status).json({ error: message });
}

function requireMethod(request: VercelRequest, response: VercelResponse, method: string) {
  if (request.method !== method) {
    sendError(response, 405, `Method ${request.method} không được hỗ trợ.`);
    return false;
  }
  return true;
}

function isAnswerOption(value: unknown): value is AnswerOption {
  return value === "phishing" || value === "legitimate";
}

function canUseDevFallback(error: unknown) {
  if (process.env.NODE_ENV === "production" || process.env.DISABLE_DEV_API_FALLBACK === "true") {
    return false;
  }

  const message = error instanceof Error ? error.message : String(error);
  return [
    "DATABASE_URL",
    "Can't reach database server",
    "P1001",
    "ECONNREFUSED",
    "ENOTFOUND",
    "getaddrinfo",
    "connect ECONNREFUSED",
  ].some((pattern) => message.includes(pattern));
}

async function withDevFallback<T>(databaseAction: () => Promise<T>, devAction: () => Promise<T>) {
  try {
    return await databaseAction();
  } catch (error) {
    if (!canUseDevFallback(error)) {
      throw error;
    }
    console.warn(
      "[dev-api-fallback] Không kết nối được PostgreSQL, dùng bộ nhớ tạm phía server cho môi trường dev.",
      error instanceof Error ? error.message : error,
    );
    return devAction();
  }
}

function isAdminResource(resource: string | undefined) {
  return resource === "admin";
}

function readQuestionBody(request: VercelRequest) {
  const body = readBody<{
    title?: string;
    category?: string;
    scenarioIntro?: string;
    scenarioContent?: string;
    scenarioHtml?: string;
    correctAnswer?: unknown;
    explanation?: string;
    indicators?: unknown;
    alwaysIncluded?: boolean;
  }>(request);

  if (!body.title?.trim() || !body.category?.trim() || !isAnswerOption(body.correctAnswer)) {
    throw new Error("Dữ liệu câu hỏi không hợp lệ.");
  }

  return {
    title: body.title.trim(),
    category: body.category.trim(),
    scenarioIntro: body.scenarioIntro?.trim() ?? "",
    scenarioContent: body.scenarioContent?.trim() ?? "",
    scenarioHtml: body.scenarioHtml?.trim() ?? "",
    correctAnswer: body.correctAnswer,
    explanation: body.explanation?.trim() ?? "",
    indicators: Array.isArray(body.indicators)
      ? body.indicators.map(String).map((value) => value.trim()).filter(Boolean)
      : [],
    alwaysIncluded: Boolean(body.alwaysIncluded),
  };
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  const [resource, resourceId, action] = getPathSegments(request);

  try {
    if (isAdminResource(resource)) {
      if (resourceId === "status") {
        if (!requireMethod(request, response, "GET")) {
          return;
        }
        sendOk(
          response,
          await withDevFallback(
            () => getAdminStatus(request),
            () => devGetAdminStatus(request),
          ),
        );
        return;
      }

      if (resourceId === "setup") {
        if (!requireMethod(request, response, "POST")) {
          return;
        }
        const body = readBody<{ email?: string; password?: string }>(request);
        if (!body.email || !body.password || body.password.length < 10) {
          sendError(response, 400, "Email hoặc mật khẩu quản trị không hợp lệ.");
          return;
        }
        sendCreated(
          response,
          await withDevFallback(
            () => setupAdmin(body.email, body.password, response),
            () => devSetupAdmin(body.email, body.password, response),
          ),
        );
        return;
      }

      if (resourceId === "login") {
        if (!requireMethod(request, response, "POST")) {
          return;
        }
        const body = readBody<{ email?: string; password?: string }>(request);
        if (!body.email || !body.password) {
          sendError(response, 400, "Thiếu email hoặc mật khẩu.");
          return;
        }
        const valid = await withDevFallback(
          () => loginAdmin(body.email, body.password, response),
          () => devLoginAdmin(body.email, body.password, response),
        );
        if (!valid) {
          sendError(response, 401, "Thông tin đăng nhập quản trị không đúng.");
          return;
        }
        sendOk(response, { authenticated: true });
        return;
      }

      if (resourceId === "logout") {
        if (!requireMethod(request, response, "POST")) {
          return;
        }
        if (process.env.NODE_ENV === "production") {
          clearAdminCookie(response);
        } else {
          devClearAdminCookie(response);
        }
        sendOk(response, { authenticated: false });
        return;
      }

      const admin = await withDevFallback(
        () => requireAdmin(request),
        () => devRequireAdmin(request),
      );
      if (!admin) {
        sendError(response, 401, "Bạn cần đăng nhập quản trị.");
        return;
      }

      if (resourceId === "questions") {
        if (request.method === "GET") {
          sendOk(
            response,
            await withDevFallback(
              () => listQuestions(true),
              () => devListQuestions(true),
            ),
          );
          return;
        }
        if (request.method === "POST") {
          const questionBody = readQuestionBody(request);
          sendCreated(
            response,
            await withDevFallback(
              () => createQuestion(questionBody),
              () => devCreateQuestion(questionBody),
            ),
          );
          return;
        }
      }

      if (resourceId === "questions" && action) {
        if (request.method === "PUT") {
          const questionBody = readQuestionBody(request);
          sendOk(
            response,
            await withDevFallback(
              () => updateQuestion(action, questionBody),
              () => devUpdateQuestion(action, questionBody),
            ),
          );
          return;
        }
        if (request.method === "PATCH") {
          const body = readBody<{ active?: boolean; alwaysIncluded?: boolean }>(request);
          sendOk(
            response,
            await withDevFallback(
              () => updateQuestionState(action, body),
              () => devUpdateQuestionState(action, body),
            ),
          );
          return;
        }
      }

      sendError(response, 404, "Không tìm thấy API quản trị.");
      return;
    }

    if (resource === "health") {
      await withDevFallback(
        () => ensureDefaultQuiz(),
        () => devEnsureDefaultQuiz(),
      );
      sendOk(response, { ok: true });
      return;
    }

    if (resource === "questions") {
      if (!requireMethod(request, response, "GET")) {
        return;
      }
      sendOk(
        response,
        await withDevFallback(
          () => listQuestions(request.query.all === "true"),
          () => devListQuestions(request.query.all === "true"),
        ),
      );
      return;
    }

    if (resource === "participants") {
      if (request.method === "GET") {
        sendOk(
          response,
          await withDevFallback(
            () => listParticipants(),
            () => devListParticipants(),
          ),
        );
        return;
      }
      if (!requireMethod(request, response, "POST")) {
        return;
      }
      const body = readBody<{ fullName?: string; email?: string; consent?: boolean }>(request);
      if (!body.fullName || body.fullName.trim().length < 2) {
        sendError(response, 400, "Họ tên phải có ít nhất 2 ký tự.");
        return;
      }
      if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        sendError(response, 400, "Email không hợp lệ.");
        return;
      }
      sendCreated(
        response,
        await withDevFallback(
          () =>
            upsertParticipant({
              fullName: body.fullName,
              email: body.email,
              consent: Boolean(body.consent),
            }),
          () =>
            devUpsertParticipant({
              fullName: body.fullName,
              email: body.email,
              consent: Boolean(body.consent),
            }),
        ),
      );
      return;
    }

    if (resource === "quiz-sessions" && !resourceId) {
      if (!requireMethod(request, response, "POST")) {
        return;
      }
      const body = readBody<{ participantId?: string }>(request);
      if (!body.participantId) {
        sendError(response, 400, "Thiếu participantId.");
        return;
      }
      sendCreated(
        response,
        await withDevFallback(
          () => startQuizSession(body.participantId),
          () => devStartQuizSession(body.participantId),
        ),
      );
      return;
    }

    if (resource === "quiz-sessions" && resourceId && !action) {
      if (!requireMethod(request, response, "GET")) {
        return;
      }
      const session = await withDevFallback(
        () => getQuizSession(resourceId),
        () => devGetQuizSession(resourceId),
      );
      if (!session) {
        sendError(response, 404, "Không tìm thấy phiên làm bài.");
        return;
      }
      sendOk(response, session);
      return;
    }

    if (resource === "quiz-sessions" && resourceId && action === "answers") {
      if (!requireMethod(request, response, "POST")) {
        return;
      }
      const body = readBody<{ questionId?: string; selectedAnswer?: unknown }>(request);
      if (!body.questionId || !isAnswerOption(body.selectedAnswer)) {
        sendError(response, 400, "Dữ liệu câu trả lời không hợp lệ.");
        return;
      }
      sendOk(
        response,
        await withDevFallback(
          () =>
            saveSessionAnswer({
              sessionId: resourceId,
              questionId: body.questionId,
              selectedAnswer: body.selectedAnswer,
            }),
          () =>
            devSaveSessionAnswer({
              sessionId: resourceId,
              questionId: body.questionId,
              selectedAnswer: body.selectedAnswer,
            }),
        ),
      );
      return;
    }

    if (resource === "quiz-sessions" && resourceId && action === "finish") {
      if (!requireMethod(request, response, "POST")) {
        return;
      }
      sendOk(
        response,
        await withDevFallback(
          () => finishQuizSession(resourceId),
          () => devFinishQuizSession(resourceId),
        ),
      );
      return;
    }

    if (resource === "attempts") {
      if (!requireMethod(request, response, "GET")) {
        return;
      }
      const attemptId = typeof request.query.attemptId === "string" ? request.query.attemptId : "";
      if (attemptId) {
        const attempt = await withDevFallback(
          () => getAttemptById(attemptId),
          () => devGetAttemptById(attemptId),
        );
        if (!attempt) {
          sendError(response, 404, "Không tìm thấy lượt thi.");
          return;
        }
        sendOk(response, attempt);
        return;
      }
      sendOk(
        response,
        await withDevFallback(
          () => listAttempts(),
          () => devListAttempts(),
        ),
      );
      return;
    }

    if (resource === "leaderboard") {
      if (!requireMethod(request, response, "GET")) {
        return;
      }
      sendOk(
        response,
        await withDevFallback(
          () => getLeaderboard(),
          () => devGetLeaderboard(),
        ),
      );
      return;
    }

    if (resource === "quiz-config") {
      if (request.method === "GET") {
        sendOk(
          response,
          await withDevFallback(
            () => getQuizConfig(),
            () => devGetQuizConfig(),
          ),
        );
        return;
      }
      if (!requireMethod(request, response, "PUT")) {
        return;
      }
      const body = readBody<{ questionCount?: number }>(request);
      sendOk(
        response,
        await withDevFallback(
          () => saveQuizConfig(Number(body.questionCount)),
          () => devSaveQuizConfig(Number(body.questionCount)),
        ),
      );
      return;
    }

    sendError(response, 404, "Không tìm thấy API.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi không xác định.";
    const status = message.includes("DATABASE_URL") ? 503 : 500;
    sendError(response, status, message);
  }
}
