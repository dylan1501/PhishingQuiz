import { defineConfig } from "prisma/config";

const buildTimeDatabaseUrl =
  process.env.DATABASE_URL ?? "postgresql://prisma:prisma@localhost:5432/phishing_quiz?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: buildTimeDatabaseUrl,
  },
  migrations: {
    path: "prisma/migrations",
  },
});
