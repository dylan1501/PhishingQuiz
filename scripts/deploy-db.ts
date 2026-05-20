import { spawnSync } from "node:child_process";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());
const skipDbMigrate = process.env.SKIP_DB_MIGRATE === "true";
const isVercelBuild = process.env.VERCEL === "1";

if (skipDbMigrate) {
  console.log("SKIP_DB_MIGRATE=true, bỏ qua Prisma migrate deploy.");
  process.exit(0);
}

if (!hasDatabaseUrl) {
  const message = "Thiếu DATABASE_URL, không thể deploy schema database.";
  if (isVercelBuild) {
    console.error(`${message} Hãy cấu hình DATABASE_URL trong Vercel Environment Variables.`);
    process.exit(1);
  }

  console.warn(`${message} Bỏ qua migrate cho build local.`);
  process.exit(0);
}

const prismaCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(prismaCommand, ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);
