import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPrisma } from "./_db.js";

const cookieName = "phishing_admin_session";
const sessionTtlSeconds = 8 * 60 * 60;
const passwordIterations = 210_000;

type AdminSessionPayload = {
  adminId: string;
  email: string;
  exp: number;
};

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET ?? process.env.DATABASE_URL;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET hoặc DATABASE_URL chưa được cấu hình.");
  }
  return secret;
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
  return base64UrlEncode(createHmac("sha256", getSecret()).update(value).digest());
}

function hashPassword(password: string, salt: string) {
  return pbkdf2Sync(password, salt, passwordIterations, 32, "sha256").toString("hex");
}

function safeEqual(first: string, second: string) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);
  if (firstBuffer.length !== secondBuffer.length) {
    return false;
  }
  return timingSafeEqual(firstBuffer, secondBuffer);
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

function createSessionToken(payload: AdminSessionPayload) {
  const body = base64UrlEncode(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

function verifySessionToken(token: string) {
  const [body, signature] = token.split(".");
  if (!body || !signature || !safeEqual(sign(body), signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as AdminSessionPayload;
    if (!payload.adminId || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function setAdminCookie(response: VercelResponse, token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `${cookieName}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${sessionTtlSeconds}${secure}`,
  );
}

export function clearAdminCookie(response: VercelResponse) {
  response.setHeader("Set-Cookie", `${cookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

export async function getAdminStatus(request: VercelRequest) {
  const prisma = getPrisma();
  const adminCount = await prisma.adminAccount.count();
  const session = getAdminSession(request);
  const authenticated = session
    ? Boolean(await prisma.adminAccount.findFirst({ where: { id: session.adminId, isActive: true } }))
    : false;
  return {
    hasAdmin: adminCount > 0,
    authenticated,
  };
}

export function getAdminSession(request: VercelRequest) {
  const token = parseCookies(request)[cookieName];
  return token ? verifySessionToken(token) : null;
}

export async function requireAdmin(request: VercelRequest) {
  const prisma = getPrisma();
  const session = getAdminSession(request);
  if (!session) {
    return null;
  }
  return prisma.adminAccount.findFirst({
    where: {
      id: session.adminId,
      isActive: true,
    },
  });
}

export async function setupAdmin(email: string, password: string, response: VercelResponse) {
  const prisma = getPrisma();
  const adminCount = await prisma.adminAccount.count();
  if (adminCount > 0) {
    throw new Error("Tài khoản quản trị đã được thiết lập.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const salt = base64UrlEncode(randomBytes(18));
  const admin = await prisma.adminAccount.create({
    data: {
      email: normalizedEmail,
      passwordSalt: salt,
      passwordHash: hashPassword(password, salt),
      role: "ADMIN",
      isActive: true,
    },
  });
  setAdminCookie(
    response,
    createSessionToken({
      adminId: admin.id,
      email: admin.email,
      exp: Math.floor(Date.now() / 1000) + sessionTtlSeconds,
    }),
  );
  return { email: admin.email };
}

export async function loginAdmin(email: string, password: string, response: VercelResponse) {
  const prisma = getPrisma();
  const normalizedEmail = email.trim().toLowerCase();
  const admin = await prisma.adminAccount.findUnique({
    where: { email: normalizedEmail },
  });
  if (!admin || !admin.isActive) {
    return false;
  }

  const passwordHash = hashPassword(password, admin.passwordSalt);
  if (!safeEqual(passwordHash, admin.passwordHash)) {
    return false;
  }

  await prisma.adminAccount.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });
  setAdminCookie(
    response,
    createSessionToken({
      adminId: admin.id,
      email: admin.email,
      exp: Math.floor(Date.now() / 1000) + sessionTtlSeconds,
    }),
  );
  return true;
}
