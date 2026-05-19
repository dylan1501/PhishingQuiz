import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
var globalForPrisma = globalThis;
function getDatabaseUrl() {
    var databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error("DATABASE_URL chưa được cấu hình.");
    }
    return databaseUrl;
}
export function getPrisma() {
    if (!globalForPrisma.prismaAdapter) {
        globalForPrisma.prismaAdapter = new PrismaPg({
            connectionString: getDatabaseUrl(),
        });
    }
    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new PrismaClient({
            adapter: globalForPrisma.prismaAdapter,
        });
    }
    return globalForPrisma.prisma;
}
