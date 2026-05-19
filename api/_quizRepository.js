var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { AnswerOption as DbAnswerOption } from "@prisma/client";
import { randomUUID } from "crypto";
import { seedQuestions } from "../src/data";
import { getPrisma } from "./_db";
var defaultQuizTitle = "Phishing Quiz";
function toDbAnswer(answer) {
    return answer === "phishing" ? DbAnswerOption.PHISHING : DbAnswerOption.LEGITIMATE;
}
function fromDbAnswer(answer) {
    return answer === DbAnswerOption.PHISHING ? "phishing" : "legitimate";
}
function shuffle(items) {
    var _a;
    var next = __spreadArray([], items, true);
    for (var index = next.length - 1; index > 0; index -= 1) {
        var swapIndex = Math.floor(Math.random() * (index + 1));
        _a = [next[swapIndex], next[index]], next[index] = _a[0], next[swapIndex] = _a[1];
    }
    return next;
}
function clampQuestionCount(value, maxQuestions) {
    if (!Number.isFinite(value)) {
        return 10;
    }
    return Math.min(Math.max(Math.round(value), 1), Math.max(maxQuestions, 1));
}
function serializeQuestion(question) {
    return {
        id: question.id,
        title: question.title,
        category: question.category,
        scenarioIntro: question.scenarioIntro,
        scenarioContent: question.scenarioContent,
        scenarioHtml: question.scenarioHtml,
        correctAnswer: fromDbAnswer(question.correctAnswer),
        explanation: question.explanation,
        indicators: question.indicators.map(function (indicator) { return indicator.label; }),
        active: question.active,
        alwaysIncluded: question.alwaysIncluded,
        orderIndex: question.orderIndex,
    };
}
function serializeParticipant(participant) {
    return {
        id: participant.id,
        fullName: participant.fullName,
        email: participant.email,
        consent: participant.consent,
        createdAt: participant.createdAt.toISOString(),
    };
}
function serializeAttempt(attempt) {
    return {
        id: attempt.id,
        participantId: attempt.participantId,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        durationSeconds: attempt.durationSeconds,
        startedAt: attempt.startedAt.toISOString(),
        completedAt: attempt.completedAt.toISOString(),
        answers: attempt.answers.map(function (answer) { return ({
            questionId: answer.questionId,
            selectedAnswer: fromDbAnswer(answer.selectedAnswer),
            isCorrect: answer.isCorrect,
            answeredAt: answer.answeredAt.toISOString(),
        }); }),
        participant: serializeParticipant(attempt.participant),
    };
}
export function ensureDefaultQuiz() {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, existingQuiz;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prisma = getPrisma();
                    return [4 /*yield*/, prisma.quiz.findFirst({
                            where: { title: defaultQuizTitle },
                            include: { setting: true },
                        })];
                case 1:
                    existingQuiz = _a.sent();
                    if (!existingQuiz) return [3 /*break*/, 4];
                    if (!!existingQuiz.setting) return [3 /*break*/, 3];
                    return [4 /*yield*/, prisma.quizSetting.create({
                            data: {
                                quizId: existingQuiz.id,
                                questionCount: 10,
                                randomizeQuestions: true,
                                requireExplanation: true,
                            },
                        })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/, existingQuiz];
                case 4: return [2 /*return*/, prisma.quiz.create({
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
                                create: seedQuestions.map(function (question, index) {
                                    var _a;
                                    return ({
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
                                        orderIndex: (_a = question.orderIndex) !== null && _a !== void 0 ? _a : index + 1,
                                        indicators: {
                                            create: question.indicators.map(function (indicator, indicatorIndex) { return ({
                                                label: indicator,
                                                orderIndex: indicatorIndex + 1,
                                            }); }),
                                        },
                                    });
                                }),
                            },
                        },
                    })];
            }
        });
    });
}
export function listQuestions() {
    return __awaiter(this, arguments, void 0, function (includeInactive) {
        var prisma, quiz, questions;
        if (includeInactive === void 0) { includeInactive = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prisma = getPrisma();
                    return [4 /*yield*/, ensureDefaultQuiz()];
                case 1:
                    quiz = _a.sent();
                    return [4 /*yield*/, prisma.question.findMany({
                            where: __assign({ quizId: quiz.id }, (includeInactive ? {} : { active: true })),
                            include: {
                                indicators: { orderBy: { orderIndex: "asc" } },
                            },
                            orderBy: { orderIndex: "asc" },
                        })];
                case 2:
                    questions = _a.sent();
                    return [2 /*return*/, questions.map(serializeQuestion)];
            }
        });
    });
}
export function createQuestion(input) {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, quiz, lastQuestion, question;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    prisma = getPrisma();
                    return [4 /*yield*/, ensureDefaultQuiz()];
                case 1:
                    quiz = _b.sent();
                    return [4 /*yield*/, prisma.question.findFirst({
                            where: { quizId: quiz.id },
                            orderBy: { orderIndex: "desc" },
                        })];
                case 2:
                    lastQuestion = _b.sent();
                    return [4 /*yield*/, prisma.question.create({
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
                                orderIndex: ((_a = lastQuestion === null || lastQuestion === void 0 ? void 0 : lastQuestion.orderIndex) !== null && _a !== void 0 ? _a : 0) + 1,
                                indicators: {
                                    create: input.indicators.map(function (indicator, index) { return ({
                                        label: indicator,
                                        orderIndex: index + 1,
                                    }); }),
                                },
                            },
                            include: {
                                indicators: { orderBy: { orderIndex: "asc" } },
                            },
                        })];
                case 3:
                    question = _b.sent();
                    return [2 /*return*/, serializeQuestion(question)];
            }
        });
    });
}
export function updateQuestion(questionId, input) {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, question;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prisma = getPrisma();
                    return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tx.questionIndicator.deleteMany({ where: { questionId: questionId } })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/, tx.question.update({
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
                                                        create: input.indicators.map(function (indicator, index) { return ({
                                                            label: indicator,
                                                            orderIndex: index + 1,
                                                        }); }),
                                                    },
                                                },
                                                include: {
                                                    indicators: { orderBy: { orderIndex: "asc" } },
                                                },
                                            })];
                                }
                            });
                        }); })];
                case 1:
                    question = _a.sent();
                    return [2 /*return*/, serializeQuestion(question)];
            }
        });
    });
}
export function updateQuestionState(questionId, input) {
    return __awaiter(this, void 0, void 0, function () {
        var question;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getPrisma().question.update({
                        where: { id: questionId },
                        data: __assign(__assign({}, (typeof input.active === "boolean" ? { active: input.active } : {})), (typeof input.alwaysIncluded === "boolean"
                            ? __assign({ alwaysIncluded: input.alwaysIncluded }, (input.alwaysIncluded ? { active: true } : {})) : {})),
                        include: {
                            indicators: { orderBy: { orderIndex: "asc" } },
                        },
                    })];
                case 1:
                    question = _a.sent();
                    return [2 /*return*/, serializeQuestion(question)];
            }
        });
    });
}
export function getQuizConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, quiz, setting;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prisma = getPrisma();
                    return [4 /*yield*/, ensureDefaultQuiz()];
                case 1:
                    quiz = _a.sent();
                    return [4 /*yield*/, prisma.quizSetting.findUniqueOrThrow({
                            where: { quizId: quiz.id },
                        })];
                case 2:
                    setting = _a.sent();
                    return [2 /*return*/, {
                            questionCount: setting.questionCount,
                            updatedAt: setting.updatedAt.toISOString(),
                        }];
            }
        });
    });
}
export function saveQuizConfig(questionCount) {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, quiz, activeQuestionCount, nextQuestionCount, setting;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prisma = getPrisma();
                    return [4 /*yield*/, ensureDefaultQuiz()];
                case 1:
                    quiz = _a.sent();
                    return [4 /*yield*/, prisma.question.count({
                            where: { quizId: quiz.id, active: true },
                        })];
                case 2:
                    activeQuestionCount = _a.sent();
                    nextQuestionCount = clampQuestionCount(questionCount, activeQuestionCount);
                    return [4 /*yield*/, prisma.quizSetting.upsert({
                            where: { quizId: quiz.id },
                            update: { questionCount: nextQuestionCount },
                            create: {
                                quizId: quiz.id,
                                questionCount: nextQuestionCount,
                                randomizeQuestions: true,
                                requireExplanation: true,
                            },
                        })];
                case 3:
                    setting = _a.sent();
                    return [2 /*return*/, {
                            questionCount: setting.questionCount,
                            updatedAt: setting.updatedAt.toISOString(),
                        }];
            }
        });
    });
}
export function upsertParticipant(input) {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, normalizedEmail, participant;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prisma = getPrisma();
                    normalizedEmail = input.email.trim().toLowerCase();
                    return [4 /*yield*/, prisma.participant.upsert({
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
                        })];
                case 1:
                    participant = _a.sent();
                    return [2 /*return*/, serializeParticipant(participant)];
            }
        });
    });
}
export function listParticipants() {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, participants;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prisma = getPrisma();
                    return [4 /*yield*/, prisma.participant.findMany({
                            orderBy: { createdAt: "desc" },
                        })];
                case 1:
                    participants = _a.sent();
                    return [2 /*return*/, participants.map(serializeParticipant)];
            }
        });
    });
}
export function startQuizSession(participantId) {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, quiz, _a, setting, activeQuestions, questionLimit, requiredQuestions, remainingSlots, randomQuestions, selectedQuestions, session;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    prisma = getPrisma();
                    return [4 /*yield*/, ensureDefaultQuiz()];
                case 1:
                    quiz = _c.sent();
                    return [4 /*yield*/, Promise.all([
                            prisma.quizSetting.findUnique({ where: { quizId: quiz.id } }),
                            prisma.question.findMany({
                                where: { quizId: quiz.id, active: true },
                                orderBy: { orderIndex: "asc" },
                            }),
                        ])];
                case 2:
                    _a = _c.sent(), setting = _a[0], activeQuestions = _a[1];
                    questionLimit = clampQuestionCount((_b = setting === null || setting === void 0 ? void 0 : setting.questionCount) !== null && _b !== void 0 ? _b : 10, activeQuestions.length);
                    requiredQuestions = activeQuestions
                        .filter(function (question) { return question.alwaysIncluded; })
                        .slice(0, questionLimit);
                    remainingSlots = Math.max(0, questionLimit - requiredQuestions.length);
                    randomQuestions = shuffle(activeQuestions.filter(function (question) { return !question.alwaysIncluded; })).slice(0, remainingSlots);
                    selectedQuestions = shuffle(__spreadArray(__spreadArray([], requiredQuestions, true), randomQuestions, true));
                    return [4 /*yield*/, prisma.quizSession.create({
                            data: {
                                participantId: participantId,
                                quizId: quiz.id,
                                status: "IN_PROGRESS",
                                questions: {
                                    create: selectedQuestions.map(function (question, index) { return ({
                                        questionId: question.id,
                                        orderIndex: index + 1,
                                    }); }),
                                },
                            },
                            include: {
                                answers: true,
                                questions: { orderBy: { orderIndex: "asc" } },
                            },
                        })];
                case 3:
                    session = _c.sent();
                    return [2 /*return*/, {
                            id: session.id,
                            remote: true,
                            participantId: session.participantId,
                            startedAt: session.startedAt.toISOString(),
                            questionIds: session.questions.map(function (question) { return question.questionId; }),
                            answers: session.answers.map(function (answer) { return ({
                                questionId: answer.questionId,
                                selectedAnswer: fromDbAnswer(answer.selectedAnswer),
                                isCorrect: answer.isCorrect,
                                answeredAt: answer.answeredAt.toISOString(),
                            }); }),
                        }];
            }
        });
    });
}
export function getQuizSession(sessionId) {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, session;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prisma = getPrisma();
                    return [4 /*yield*/, prisma.quizSession.findUnique({
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
                        })];
                case 1:
                    session = _a.sent();
                    if (!session) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, {
                            session: {
                                id: session.id,
                                remote: true,
                                participantId: session.participantId,
                                startedAt: session.startedAt.toISOString(),
                                questionIds: session.questions.map(function (question) { return question.questionId; }),
                                answers: session.answers.map(function (answer) { return ({
                                    questionId: answer.questionId,
                                    selectedAnswer: fromDbAnswer(answer.selectedAnswer),
                                    isCorrect: answer.isCorrect,
                                    answeredAt: answer.answeredAt.toISOString(),
                                }); }),
                            },
                            questions: session.questions.map(function (entry) { return serializeQuestion(entry.question); }),
                        }];
            }
        });
    });
}
export function saveSessionAnswer(input) {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, question, isCorrect, answeredAt, answer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prisma = getPrisma();
                    return [4 /*yield*/, prisma.question.findUniqueOrThrow({
                            where: { id: input.questionId },
                        })];
                case 1:
                    question = _a.sent();
                    isCorrect = fromDbAnswer(question.correctAnswer) === input.selectedAnswer;
                    answeredAt = new Date();
                    return [4 /*yield*/, prisma.quizSessionAnswer.upsert({
                            where: {
                                sessionId_questionId: {
                                    sessionId: input.sessionId,
                                    questionId: input.questionId,
                                },
                            },
                            update: {
                                selectedAnswer: toDbAnswer(input.selectedAnswer),
                                isCorrect: isCorrect,
                                answeredAt: answeredAt,
                            },
                            create: {
                                sessionId: input.sessionId,
                                questionId: input.questionId,
                                selectedAnswer: toDbAnswer(input.selectedAnswer),
                                isCorrect: isCorrect,
                                answeredAt: answeredAt,
                            },
                        })];
                case 2:
                    answer = _a.sent();
                    return [2 /*return*/, {
                            questionId: answer.questionId,
                            selectedAnswer: fromDbAnswer(answer.selectedAnswer),
                            isCorrect: answer.isCorrect,
                            answeredAt: answer.answeredAt.toISOString(),
                        }];
            }
        });
    });
}
export function finishQuizSession(sessionId) {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, session, questionIds, answeredQuestions, questionAnswers, correctAnswerByQuestionId, completedAt, durationSeconds, score, attempt;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prisma = getPrisma();
                    return [4 /*yield*/, prisma.quizSession.findUniqueOrThrow({
                            where: { id: sessionId },
                            include: {
                                answers: true,
                                questions: { orderBy: { orderIndex: "asc" } },
                            },
                        })];
                case 1:
                    session = _a.sent();
                    questionIds = session.questions.map(function (question) { return question.questionId; });
                    answeredQuestions = session.answers.filter(function (answer) { return questionIds.includes(answer.questionId); });
                    return [4 /*yield*/, prisma.question.findMany({
                            where: { id: { in: questionIds } },
                            select: { id: true, correctAnswer: true },
                        })];
                case 2:
                    questionAnswers = _a.sent();
                    correctAnswerByQuestionId = new Map(questionAnswers.map(function (question) { return [question.id, question.correctAnswer]; }));
                    completedAt = new Date();
                    durationSeconds = Math.max(1, Math.round((completedAt.getTime() - session.startedAt.getTime()) / 1000));
                    score = answeredQuestions.filter(function (answer) { return answer.isCorrect; }).length;
                    return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var nextAttempt;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tx.attempt.create({
                                            data: {
                                                participantId: session.participantId,
                                                quizId: session.quizId,
                                                score: score,
                                                totalQuestions: questionIds.length,
                                                durationSeconds: durationSeconds,
                                                startedAt: session.startedAt,
                                                completedAt: completedAt,
                                                answers: {
                                                    create: answeredQuestions.map(function (answer) {
                                                        var _a;
                                                        return ({
                                                            questionId: answer.questionId,
                                                            selectedAnswer: answer.selectedAnswer,
                                                            correctAnswer: (_a = correctAnswerByQuestionId.get(answer.questionId)) !== null && _a !== void 0 ? _a : answer.selectedAnswer,
                                                            isCorrect: answer.isCorrect,
                                                            answeredAt: answer.answeredAt,
                                                        });
                                                    }),
                                                },
                                            },
                                            include: {
                                                answers: true,
                                                participant: true,
                                            },
                                        })];
                                    case 1:
                                        nextAttempt = _a.sent();
                                        return [4 /*yield*/, tx.quizSession.update({
                                                where: { id: sessionId },
                                                data: {
                                                    status: "COMPLETED",
                                                    completedAt: completedAt,
                                                },
                                            })];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/, nextAttempt];
                                }
                            });
                        }); })];
                case 3:
                    attempt = _a.sent();
                    return [2 /*return*/, serializeAttempt(attempt)];
            }
        });
    });
}
export function getAttemptById(attemptId) {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, attempt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prisma = getPrisma();
                    return [4 /*yield*/, prisma.attempt.findUnique({
                            where: { id: attemptId },
                            include: {
                                answers: true,
                                participant: true,
                            },
                        })];
                case 1:
                    attempt = _a.sent();
                    return [2 /*return*/, attempt ? serializeAttempt(attempt) : null];
            }
        });
    });
}
export function listAttempts() {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, attempts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prisma = getPrisma();
                    return [4 /*yield*/, prisma.attempt.findMany({
                            include: {
                                answers: true,
                                participant: true,
                            },
                            orderBy: { completedAt: "desc" },
                        })];
                case 1:
                    attempts = _a.sent();
                    return [2 /*return*/, attempts.map(serializeAttempt)];
            }
        });
    });
}
export function getLeaderboard() {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, attempts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prisma = getPrisma();
                    return [4 /*yield*/, prisma.attempt.findMany({
                            include: {
                                answers: true,
                                participant: true,
                            },
                            orderBy: [
                                { score: "desc" },
                                { durationSeconds: "asc" },
                                { completedAt: "asc" },
                            ],
                        })];
                case 1:
                    attempts = _a.sent();
                    return [2 /*return*/, attempts.map(serializeAttempt)];
            }
        });
    });
}
