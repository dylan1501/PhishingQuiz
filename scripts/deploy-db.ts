import { spawnSync } from "node:child_process";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());
const skipDbMigrate = process.env.SKIP_DB_MIGRATE === "true";
const isVercelBuild = process.env.VERCEL === "1";
const placeholder = { username: "USER", password: "PASSWORD", hostname: "HOST" };

function parseDatabaseUrl(databaseUrl: string) {
  try {
    return new URL(databaseUrl);
  } catch {
    return null;
  }
}

// So sánh chính xác từng phần thay vì tìm substring trên cả URL,
// tránh false positive khi password/host tình cờ chứa "USER"/"PASSWORD"/"HOST".
function isPlaceholderDatabaseUrl(databaseUrl: string) {
  const url = parseDatabaseUrl(databaseUrl);
  if (!url) {
    return false;
  }
  return (
    url.username === placeholder.username ||
    url.password === placeholder.password ||
    url.hostname.toUpperCase() === placeholder.hostname
  );
}

function describeDatabaseUrl(databaseUrl: string) {
  const url = parseDatabaseUrl(databaseUrl);
  if (!url) {
    return "(không parse được — kiểm tra ký tự đặc biệt trong password đã URL-encode chưa)";
  }
  return `${url.protocol}//${url.username || "?"}:***@${url.hostname}:${url.port || "5432"}${url.pathname}${url.search}`;
}

function fail(message: string) {
  console.error(message);
  process.exit(1);
}

if (skipDbMigrate) {
  console.log("SKIP_DB_MIGRATE=true, bỏ qua Prisma migrate deploy.");
  process.exit(0);
}

if (!hasDatabaseUrl) {
  const message = "Thiếu DATABASE_URL, không thể deploy schema database.";
  if (isVercelBuild) {
    fail(`${message} Hãy cấu hình DATABASE_URL trong Vercel Environment Variables.`);
  }

  console.warn(`${message} Bỏ qua migrate cho build local.`);
  process.exit(0);
}

const databaseUrl = process.env.DATABASE_URL ?? "";
console.log(`DATABASE_URL: ${describeDatabaseUrl(databaseUrl)}`);

if (isPlaceholderDatabaseUrl(databaseUrl)) {
  fail(
    "DATABASE_URL đang dùng giá trị mẫu trong .env.example. " +
      "Hãy thay USER, PASSWORD, HOST bằng connection string PostgreSQL thật trong Vercel Environment Variables.",
  );
}

// Windows: Node >= 18.20/20.12 từ chối spawn file .cmd nếu không có shell: true (CVE-2024-27980).
const isWindows = process.platform === "win32";
const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: isWindows,
});

if (result.error) {
  fail(`Không chạy được prisma migrate deploy: ${result.error.message}`);
}

process.exit(result.status ?? 1);
