import { spawnSync } from "node:child_process";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());
const skipDbMigrate = process.env.SKIP_DB_MIGRATE === "true";
const isVercelBuild = process.env.VERCEL === "1";
const placeholderTokens = ["USER", "PASSWORD", "HOST"];

function isPlaceholderDatabaseUrl(databaseUrl: string) {
  return placeholderTokens.some((token) => databaseUrl.includes(token));
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

if (isPlaceholderDatabaseUrl(process.env.DATABASE_URL ?? "")) {
  fail(
    "DATABASE_URL đang dùng giá trị mẫu trong .env.example. " +
      "Hãy thay USER, PASSWORD, HOST bằng connection string PostgreSQL thật trong Vercel Environment Variables.",
  );
}

const prismaCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(prismaCommand, ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);
