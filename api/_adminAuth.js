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
import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import { getPrisma } from "./_db";
var cookieName = "phishing_admin_session";
var sessionTtlSeconds = 8 * 60 * 60;
var passwordIterations = 210000;
function getSecret() {
    var _a;
    var secret = (_a = process.env.ADMIN_SESSION_SECRET) !== null && _a !== void 0 ? _a : process.env.DATABASE_URL;
    if (!secret) {
        throw new Error("ADMIN_SESSION_SECRET hoặc DATABASE_URL chưa được cấu hình.");
    }
    return secret;
}
function base64UrlEncode(value) {
    return Buffer.from(value)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}
function base64UrlDecode(value) {
    var normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    return Buffer.from(normalized, "base64").toString("utf8");
}
function sign(value) {
    return base64UrlEncode(createHmac("sha256", getSecret()).update(value).digest());
}
function hashPassword(password, salt) {
    return pbkdf2Sync(password, salt, passwordIterations, 32, "sha256").toString("hex");
}
function safeEqual(first, second) {
    var firstBuffer = Buffer.from(first);
    var secondBuffer = Buffer.from(second);
    if (firstBuffer.length !== secondBuffer.length) {
        return false;
    }
    return timingSafeEqual(firstBuffer, secondBuffer);
}
function parseCookies(request) {
    var _a;
    var cookieHeader = (_a = request.headers.cookie) !== null && _a !== void 0 ? _a : "";
    return Object.fromEntries(cookieHeader
        .split(";")
        .map(function (cookie) { return cookie.trim(); })
        .filter(Boolean)
        .map(function (cookie) {
        var _a = cookie.split("="), key = _a[0], value = _a.slice(1);
        return [key, decodeURIComponent(value.join("="))];
    }));
}
function createSessionToken(payload) {
    var body = base64UrlEncode(JSON.stringify(payload));
    return "".concat(body, ".").concat(sign(body));
}
function verifySessionToken(token) {
    var _a = token.split("."), body = _a[0], signature = _a[1];
    if (!body || !signature || !safeEqual(sign(body), signature)) {
        return null;
    }
    try {
        var payload = JSON.parse(base64UrlDecode(body));
        if (!payload.adminId || payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }
        return payload;
    }
    catch (_b) {
        return null;
    }
}
function setAdminCookie(response, token) {
    var secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    response.setHeader("Set-Cookie", "".concat(cookieName, "=").concat(encodeURIComponent(token), "; HttpOnly; SameSite=Lax; Path=/; Max-Age=").concat(sessionTtlSeconds).concat(secure));
}
export function clearAdminCookie(response) {
    response.setHeader("Set-Cookie", "".concat(cookieName, "=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"));
}
export function getAdminStatus(request) {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, adminCount, session, authenticated, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    prisma = getPrisma();
                    return [4 /*yield*/, prisma.adminAccount.count()];
                case 1:
                    adminCount = _c.sent();
                    session = getAdminSession(request);
                    if (!session) return [3 /*break*/, 3];
                    _b = Boolean;
                    return [4 /*yield*/, prisma.adminAccount.findFirst({ where: { id: session.adminId, isActive: true } })];
                case 2:
                    _a = _b.apply(void 0, [_c.sent()]);
                    return [3 /*break*/, 4];
                case 3:
                    _a = false;
                    _c.label = 4;
                case 4:
                    authenticated = _a;
                    return [2 /*return*/, {
                            hasAdmin: adminCount > 0,
                            authenticated: authenticated,
                        }];
            }
        });
    });
}
export function getAdminSession(request) {
    var token = parseCookies(request)[cookieName];
    return token ? verifySessionToken(token) : null;
}
export function requireAdmin(request) {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, session;
        return __generator(this, function (_a) {
            prisma = getPrisma();
            session = getAdminSession(request);
            if (!session) {
                return [2 /*return*/, null];
            }
            return [2 /*return*/, prisma.adminAccount.findFirst({
                    where: {
                        id: session.adminId,
                        isActive: true,
                    },
                })];
        });
    });
}
export function setupAdmin(email, password, response) {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, adminCount, normalizedEmail, salt, admin;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prisma = getPrisma();
                    return [4 /*yield*/, prisma.adminAccount.count()];
                case 1:
                    adminCount = _a.sent();
                    if (adminCount > 0) {
                        throw new Error("Tài khoản quản trị đã được thiết lập.");
                    }
                    normalizedEmail = email.trim().toLowerCase();
                    salt = base64UrlEncode(randomBytes(18));
                    return [4 /*yield*/, prisma.adminAccount.create({
                            data: {
                                email: normalizedEmail,
                                passwordSalt: salt,
                                passwordHash: hashPassword(password, salt),
                                role: "ADMIN",
                                isActive: true,
                            },
                        })];
                case 2:
                    admin = _a.sent();
                    setAdminCookie(response, createSessionToken({
                        adminId: admin.id,
                        email: admin.email,
                        exp: Math.floor(Date.now() / 1000) + sessionTtlSeconds,
                    }));
                    return [2 /*return*/, { email: admin.email }];
            }
        });
    });
}
export function loginAdmin(email, password, response) {
    return __awaiter(this, void 0, void 0, function () {
        var prisma, normalizedEmail, admin, passwordHash;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prisma = getPrisma();
                    normalizedEmail = email.trim().toLowerCase();
                    return [4 /*yield*/, prisma.adminAccount.findUnique({
                            where: { email: normalizedEmail },
                        })];
                case 1:
                    admin = _a.sent();
                    if (!admin || !admin.isActive) {
                        return [2 /*return*/, false];
                    }
                    passwordHash = hashPassword(password, admin.passwordSalt);
                    if (!safeEqual(passwordHash, admin.passwordHash)) {
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, prisma.adminAccount.update({
                            where: { id: admin.id },
                            data: { lastLoginAt: new Date() },
                        })];
                case 2:
                    _a.sent();
                    setAdminCookie(response, createSessionToken({
                        adminId: admin.id,
                        email: admin.email,
                        exp: Math.floor(Date.now() / 1000) + sessionTtlSeconds,
                    }));
                    return [2 /*return*/, true];
            }
        });
    });
}
