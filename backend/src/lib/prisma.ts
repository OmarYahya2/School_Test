import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const client = global.prisma || new PrismaClient();

// Database Query Time Performance Monitoring Middleware
client.$use(async (params, next) => {
  const start = Date.now();
  const result = await next(params);
  const duration = Date.now() - start;
  console.log(`[PRISMA PERFORMANCE] ${params.model || "RawQuery"}.${params.action} execution took ${duration}ms`);
  return result;
});

export const prisma = client;

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

