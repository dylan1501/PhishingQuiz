var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { clearAdminCookie, getAdminStatus, loginAdmin, requireAdmin, setupAdmin, } from "./_adminAuth";
import { createQuestion, ensureDefaultQuiz, finishQuizSession, getAttemptById, getLeaderboard, getQuizConfig, getQuizSession, listAttempts, listParticipants, listQuestions, saveSessionAnswer, saveQuizConfig, startQuizSession, updateQuestion, updateQuestionState, upsertParticipant, } from "./_quizRepository";
function getPathSegments(request) {
    var path = request.query.path;
    if (Array.isArray(path)) {
        return path;
    }
    return path ? [path] : [];
}
function readBody(request) {
    if (!request.body) {
        return {};
    }
    if (typeof request.body === "string") {
        return JSON.parse(request.body);
    }
    return request.body;
}
function sendOk(response, data) {
    response.status(200).json({ data: data });
}
function sendCreated(response, data) {
    response.status(201).json({ data: data });
}
function sendError(response, status, message) {
    response.status(status).json({ error: message });
}
function requireMethod(request, response, method) {
    if (request.method !== method) {
        sendError(response, 405, "Method ".concat(request.method, " kh\u00F4ng \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3."));
        return false;
    }
    return true;
}
function isAnswerOption(value) {
    return value === "phishing" || value === "legitimate";
}
function isAdminResource(resource) {
    return resource === "admin";
}
function readQuestionBody(request) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var body = readBody(request);
    if (!((_a = body.title) === null || _a === void 0 ? void 0 : _a.trim()) || !((_b = body.category) === null || _b === void 0 ? void 0 : _b.trim()) || !isAnswerOption(body.correctAnswer)) {
        throw new Error("Dữ liệu câu hỏi không hợp lệ.");
    }
    return {
        title: body.title.trim(),
        category: body.category.trim(),
        scenarioIntro: (_d = (_c = body.scenarioIntro) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : "",
        scenarioContent: (_f = (_e = body.scenarioContent) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : "",
        scenarioHtml: (_h = (_g = body.scenarioHtml) === null || _g === void 0 ? void 0 : _g.trim()) !== null && _h !== void 0 ? _h : "",
        correctAnswer: body.correctAnswer,
        explanation: (_k = (_j = body.explanation) === null || _j === void 0 ? void 0 : _j.trim()) !== null && _k !== void 0 ? _k : "",
        indicators: Array.isArray(body.indicators)
            ? body.indicators.map(String).map(function (value) { return value.trim(); }).filter(Boolean)
            : [],
        alwaysIncluded: Boolean(body.alwaysIncluded),
    };
}
export default function handler(request, response) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, resource, resourceId, action, _b, _c, body, _d, _e, body, valid, admin, _f, _g, _h, _j, _k, _l, body, _m, _o, _p, _q, _r, _s, body, _t, _u, body, _v, _w, session, body, _x, _y, _z, _0, attemptId, attempt, _1, _2, _3, _4, _5, _6, body, _7, _8, error_1, message, status_1;
        return __generator(this, function (_9) {
            switch (_9.label) {
                case 0:
                    if (request.method === "OPTIONS") {
                        response.status(204).end();
                        return [2 /*return*/];
                    }
                    _a = getPathSegments(request), resource = _a[0], resourceId = _a[1], action = _a[2];
                    _9.label = 1;
                case 1:
                    _9.trys.push([1, 44, , 45]);
                    if (!isAdminResource(resource)) return [3 /*break*/, 17];
                    if (!(resourceId === "status")) return [3 /*break*/, 3];
                    if (!requireMethod(request, response, "GET")) {
                        return [2 /*return*/];
                    }
                    _b = sendOk;
                    _c = [response];
                    return [4 /*yield*/, getAdminStatus(request)];
                case 2:
                    _b.apply(void 0, _c.concat([_9.sent()]));
                    return [2 /*return*/];
                case 3:
                    if (!(resourceId === "setup")) return [3 /*break*/, 5];
                    if (!requireMethod(request, response, "POST")) {
                        return [2 /*return*/];
                    }
                    body = readBody(request);
                    if (!body.email || !body.password || body.password.length < 10) {
                        sendError(response, 400, "Email hoặc mật khẩu quản trị không hợp lệ.");
                        return [2 /*return*/];
                    }
                    _d = sendCreated;
                    _e = [response];
                    return [4 /*yield*/, setupAdmin(body.email, body.password, response)];
                case 4:
                    _d.apply(void 0, _e.concat([_9.sent()]));
                    return [2 /*return*/];
                case 5:
                    if (!(resourceId === "login")) return [3 /*break*/, 7];
                    if (!requireMethod(request, response, "POST")) {
                        return [2 /*return*/];
                    }
                    body = readBody(request);
                    if (!body.email || !body.password) {
                        sendError(response, 400, "Thiếu email hoặc mật khẩu.");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, loginAdmin(body.email, body.password, response)];
                case 6:
                    valid = _9.sent();
                    if (!valid) {
                        sendError(response, 401, "Thông tin đăng nhập quản trị không đúng.");
                        return [2 /*return*/];
                    }
                    sendOk(response, { authenticated: true });
                    return [2 /*return*/];
                case 7:
                    if (resourceId === "logout") {
                        if (!requireMethod(request, response, "POST")) {
                            return [2 /*return*/];
                        }
                        clearAdminCookie(response);
                        sendOk(response, { authenticated: false });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, requireAdmin(request)];
                case 8:
                    admin = _9.sent();
                    if (!admin) {
                        sendError(response, 401, "Bạn cần đăng nhập quản trị.");
                        return [2 /*return*/];
                    }
                    if (!(resourceId === "questions")) return [3 /*break*/, 12];
                    if (!(request.method === "GET")) return [3 /*break*/, 10];
                    _f = sendOk;
                    _g = [response];
                    return [4 /*yield*/, listQuestions(true)];
                case 9:
                    _f.apply(void 0, _g.concat([_9.sent()]));
                    return [2 /*return*/];
                case 10:
                    if (!(request.method === "POST")) return [3 /*break*/, 12];
                    _h = sendCreated;
                    _j = [response];
                    return [4 /*yield*/, createQuestion(readQuestionBody(request))];
                case 11:
                    _h.apply(void 0, _j.concat([_9.sent()]));
                    return [2 /*return*/];
                case 12:
                    if (!(resourceId === "questions" && action)) return [3 /*break*/, 16];
                    if (!(request.method === "PUT")) return [3 /*break*/, 14];
                    _k = sendOk;
                    _l = [response];
                    return [4 /*yield*/, updateQuestion(action, readQuestionBody(request))];
                case 13:
                    _k.apply(void 0, _l.concat([_9.sent()]));
                    return [2 /*return*/];
                case 14:
                    if (!(request.method === "PATCH")) return [3 /*break*/, 16];
                    body = readBody(request);
                    _m = sendOk;
                    _o = [response];
                    return [4 /*yield*/, updateQuestionState(action, body)];
                case 15:
                    _m.apply(void 0, _o.concat([_9.sent()]));
                    return [2 /*return*/];
                case 16:
                    sendError(response, 404, "Không tìm thấy API quản trị.");
                    return [2 /*return*/];
                case 17:
                    if (!(resource === "health")) return [3 /*break*/, 19];
                    return [4 /*yield*/, ensureDefaultQuiz()];
                case 18:
                    _9.sent();
                    sendOk(response, { ok: true });
                    return [2 /*return*/];
                case 19:
                    if (!(resource === "questions")) return [3 /*break*/, 21];
                    if (!requireMethod(request, response, "GET")) {
                        return [2 /*return*/];
                    }
                    _p = sendOk;
                    _q = [response];
                    return [4 /*yield*/, listQuestions(request.query.all === "true")];
                case 20:
                    _p.apply(void 0, _q.concat([_9.sent()]));
                    return [2 /*return*/];
                case 21:
                    if (!(resource === "participants")) return [3 /*break*/, 25];
                    if (!(request.method === "GET")) return [3 /*break*/, 23];
                    _r = sendOk;
                    _s = [response];
                    return [4 /*yield*/, listParticipants()];
                case 22:
                    _r.apply(void 0, _s.concat([_9.sent()]));
                    return [2 /*return*/];
                case 23:
                    if (!requireMethod(request, response, "POST")) {
                        return [2 /*return*/];
                    }
                    body = readBody(request);
                    if (!body.fullName || body.fullName.trim().length < 2) {
                        sendError(response, 400, "Họ tên phải có ít nhất 2 ký tự.");
                        return [2 /*return*/];
                    }
                    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
                        sendError(response, 400, "Email không hợp lệ.");
                        return [2 /*return*/];
                    }
                    _t = sendCreated;
                    _u = [response];
                    return [4 /*yield*/, upsertParticipant({
                            fullName: body.fullName,
                            email: body.email,
                            consent: Boolean(body.consent),
                        })];
                case 24:
                    _t.apply(void 0, _u.concat([_9.sent()]));
                    return [2 /*return*/];
                case 25:
                    if (!(resource === "quiz-sessions" && !resourceId)) return [3 /*break*/, 27];
                    if (!requireMethod(request, response, "POST")) {
                        return [2 /*return*/];
                    }
                    body = readBody(request);
                    if (!body.participantId) {
                        sendError(response, 400, "Thiếu participantId.");
                        return [2 /*return*/];
                    }
                    _v = sendCreated;
                    _w = [response];
                    return [4 /*yield*/, startQuizSession(body.participantId)];
                case 26:
                    _v.apply(void 0, _w.concat([_9.sent()]));
                    return [2 /*return*/];
                case 27:
                    if (!(resource === "quiz-sessions" && resourceId && !action)) return [3 /*break*/, 29];
                    if (!requireMethod(request, response, "GET")) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, getQuizSession(resourceId)];
                case 28:
                    session = _9.sent();
                    if (!session) {
                        sendError(response, 404, "Không tìm thấy phiên làm bài.");
                        return [2 /*return*/];
                    }
                    sendOk(response, session);
                    return [2 /*return*/];
                case 29:
                    if (!(resource === "quiz-sessions" && resourceId && action === "answers")) return [3 /*break*/, 31];
                    if (!requireMethod(request, response, "POST")) {
                        return [2 /*return*/];
                    }
                    body = readBody(request);
                    if (!body.questionId || !isAnswerOption(body.selectedAnswer)) {
                        sendError(response, 400, "Dữ liệu câu trả lời không hợp lệ.");
                        return [2 /*return*/];
                    }
                    _x = sendOk;
                    _y = [response];
                    return [4 /*yield*/, saveSessionAnswer({
                            sessionId: resourceId,
                            questionId: body.questionId,
                            selectedAnswer: body.selectedAnswer,
                        })];
                case 30:
                    _x.apply(void 0, _y.concat([_9.sent()]));
                    return [2 /*return*/];
                case 31:
                    if (!(resource === "quiz-sessions" && resourceId && action === "finish")) return [3 /*break*/, 33];
                    if (!requireMethod(request, response, "POST")) {
                        return [2 /*return*/];
                    }
                    _z = sendOk;
                    _0 = [response];
                    return [4 /*yield*/, finishQuizSession(resourceId)];
                case 32:
                    _z.apply(void 0, _0.concat([_9.sent()]));
                    return [2 /*return*/];
                case 33:
                    if (!(resource === "attempts")) return [3 /*break*/, 37];
                    if (!requireMethod(request, response, "GET")) {
                        return [2 /*return*/];
                    }
                    attemptId = typeof request.query.attemptId === "string" ? request.query.attemptId : "";
                    if (!attemptId) return [3 /*break*/, 35];
                    return [4 /*yield*/, getAttemptById(attemptId)];
                case 34:
                    attempt = _9.sent();
                    if (!attempt) {
                        sendError(response, 404, "Không tìm thấy lượt thi.");
                        return [2 /*return*/];
                    }
                    sendOk(response, attempt);
                    return [2 /*return*/];
                case 35:
                    _1 = sendOk;
                    _2 = [response];
                    return [4 /*yield*/, listAttempts()];
                case 36:
                    _1.apply(void 0, _2.concat([_9.sent()]));
                    return [2 /*return*/];
                case 37:
                    if (!(resource === "leaderboard")) return [3 /*break*/, 39];
                    if (!requireMethod(request, response, "GET")) {
                        return [2 /*return*/];
                    }
                    _3 = sendOk;
                    _4 = [response];
                    return [4 /*yield*/, getLeaderboard()];
                case 38:
                    _3.apply(void 0, _4.concat([_9.sent()]));
                    return [2 /*return*/];
                case 39:
                    if (!(resource === "quiz-config")) return [3 /*break*/, 43];
                    if (!(request.method === "GET")) return [3 /*break*/, 41];
                    _5 = sendOk;
                    _6 = [response];
                    return [4 /*yield*/, getQuizConfig()];
                case 40:
                    _5.apply(void 0, _6.concat([_9.sent()]));
                    return [2 /*return*/];
                case 41:
                    if (!requireMethod(request, response, "PUT")) {
                        return [2 /*return*/];
                    }
                    body = readBody(request);
                    _7 = sendOk;
                    _8 = [response];
                    return [4 /*yield*/, saveQuizConfig(Number(body.questionCount))];
                case 42:
                    _7.apply(void 0, _8.concat([_9.sent()]));
                    return [2 /*return*/];
                case 43:
                    sendError(response, 404, "Không tìm thấy API.");
                    return [3 /*break*/, 45];
                case 44:
                    error_1 = _9.sent();
                    message = error_1 instanceof Error ? error_1.message : "Lỗi không xác định.";
                    status_1 = message.includes("DATABASE_URL") ? 503 : 500;
                    sendError(response, status_1, message);
                    return [3 /*break*/, 45];
                case 45: return [2 /*return*/];
            }
        });
    });
}
