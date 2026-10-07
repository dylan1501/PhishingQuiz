import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
  prismaAdapter?: PrismaPg;
};

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL chưa được cấu hình.");
  }
  return databaseUrl;
}

export function getPrisma() {
  if (!globalForPrisma.prismaAdapter) {
    globalForPrisma.prismaAdapter = new PrismaPg({
      connectionString: getDatabaseUrl(),
      // Mỗi instance serverless giữ pool nhỏ để nhiều người chơi cùng lúc không làm
      // cạn max_connections của PostgreSQL; kết nối rảnh được trả lại nhanh.
      max: Number(process.env.DB_POOL_MAX ?? 6),
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      adapter: globalForPrisma.prismaAdapter,
    });
  }

  return globalForPrisma.prisma;
}
