import handler from "../api/[...path]";

type MockResponse = {
  statusCode: number;
  payload: unknown;
  headers: Record<string, string | string[]>;
  status: (statusCode: number) => MockResponse;
  json: (payload: unknown) => MockResponse;
  end: () => MockResponse;
  setHeader: (name: string, value: string | string[]) => void;
};

function createResponse(): MockResponse {
  return {
    statusCode: 200,
    payload: undefined,
    headers: {},
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
    end() {
      return this;
    },
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
  };
}

function pathToQuery(path: string) {
  const url = new URL(`http://localhost/api/${path}`);
  const segments = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  const query: Record<string, string | string[]> = { path: segments };
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });
  return query;
}

async function callApi<T>(path: string, options: { method?: string; body?: unknown; cookie?: string } = {}) {
  const response = createResponse();
  await handler(
    {
      method: options.method ?? "GET",
      query: pathToQuery(path),
      body: options.body,
      headers: options.cookie ? { cookie: options.cookie } : {},
    } as never,
    response as never,
  );

  if (response.statusCode >= 400) {
    throw new Error(`${options.method ?? "GET"} /api/${path} -> ${response.statusCode}: ${JSON.stringify(response.payload)}`);
  }

  return {
    data: (response.payload as { data: T }).data,
    cookie: Array.isArray(response.headers["set-cookie"])
      ? response.headers["set-cookie"][0]
      : response.headers["set-cookie"],
  };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Thiếu DATABASE_URL để chạy API smoke test.");
  }

  await callApi("health");
  const questions = await callApi<Array<{ id: string; correctAnswer: "phishing" | "legitimate" }>>("questions");
  if (questions.data.length === 0) {
    throw new Error("API questions không trả về câu hỏi.");
  }

  const participant = await callApi<{ id: string }>("participants", {
    method: "POST",
    body: {
      fullName: "Smoke Test User",
      email: `smoke.${Date.now()}@vps.com.vn`,
      consent: true,
    },
  });
  const session = await callApi<{ id: string; questionIds: string[] }>("quiz-sessions", {
    method: "POST",
    body: { participantId: participant.data.id },
  });
  if (!session.data.id || session.data.questionIds.length === 0) {
    throw new Error("API quiz-sessions không tạo được phiên làm bài.");
  }

  const loadedSession = await callApi<{ session: { id: string }; questions: Array<{ id: string; correctAnswer: "phishing" | "legitimate" }> }>(
    `quiz-sessions/${session.data.id}`,
  );
  const firstQuestion = loadedSession.data.questions[0];
  await callApi(`quiz-sessions/${session.data.id}/answers`, {
    method: "POST",
    body: {
      questionId: firstQuestion.id,
      selectedAnswer: firstQuestion.correctAnswer,
    },
  });
  const attempt = await callApi<{ id: string }>(`quiz-sessions/${session.data.id}/finish`, {
    method: "POST",
  });
  await callApi(`attempts?attemptId=${attempt.data.id}`);
  await callApi("leaderboard");
  await callApi("quiz-config");
  await callApi("quiz-config", {
    method: "PUT",
    body: { questionCount: 10 },
  });

  const adminStatus = await callApi<{ hasAdmin: boolean; authenticated: boolean }>("admin/status");
  let adminCookie = "";
  if (!adminStatus.data.hasAdmin) {
    const setup = await callApi("admin/setup", {
      method: "POST",
      body: {
        email: "admin@vps.com.vn",
        password: "SmokeTestPassword123!",
      },
    });
    adminCookie = setup.cookie?.split(";")[0] ?? "";
  } else {
    const login = await callApi("admin/login", {
      method: "POST",
      body: {
        email: "admin@vps.com.vn",
        password: "SmokeTestPassword123!",
      },
    });
    adminCookie = login.cookie?.split(";")[0] ?? "";
  }

  if (!adminCookie) {
    throw new Error("API admin không trả về cookie đăng nhập.");
  }

  const adminQuestions = await callApi<Array<{ id: string }>>("admin/questions", { cookie: adminCookie });
  if (adminQuestions.data.length === 0) {
    throw new Error("API admin/questions không trả về dữ liệu.");
  }

  const createdQuestion = await callApi<{ id: string }>("admin/questions", {
    method: "POST",
    cookie: adminCookie,
    body: {
      title: "Bạn nhận được một thông báo kiểm thử?",
      category: "Email",
      scenarioIntro: "Hãy đánh giá nội dung mô phỏng bên dưới.",
      scenarioContent: "Một email yêu cầu kiểm tra đường dẫn nội bộ.",
      scenarioHtml: "<div class=\"mail-sim\"><p><strong>From:</strong> test@vps.com.vn</p><p><strong>Subject:</strong> Smoke test</p><p>Kiểm tra liên kết <a href=\"https://vps.com.vn\">vps.com.vn</a></p></div>",
      correctAnswer: "legitimate",
      explanation: "Đây là câu hỏi kiểm thử API.",
      indicators: ["kiểm thử API"],
      alwaysIncluded: false,
    },
  });
  await callApi(`admin/questions/${createdQuestion.data.id}`, {
    method: "PATCH",
    cookie: adminCookie,
    body: { active: false },
  });
  await callApi("admin/logout", { method: "POST", cookie: adminCookie });

  console.log("API smoke test passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
