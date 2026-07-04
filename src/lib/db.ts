import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  const connectionUrl = process.env.DATABASE_URL || "";
  const isPostgres = connectionUrl.startsWith("postgres://") || 
                     connectionUrl.startsWith("postgresql://") || 
                     process.env.VERCEL === "1";

  if (isPostgres) {
    const { Pool } = require("pg");
    const { PrismaPg } = require("@prisma/adapter-pg");
    // Fallback connection string avoids crashing instantiation when DATABASE_URL is empty during Vercel build phase
    const pool = new Pool({ 
      connectionString: connectionUrl || "postgresql://postgres:postgres@localhost:5432/postgres" 
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }

  // Fallback to SQLite adapter for local dev
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const adapter = new PrismaBetterSqlite3({
    url: connectionUrl || "file:./prisma/dev.db",
  });
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
