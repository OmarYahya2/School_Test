"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const client = global.prisma || new client_1.PrismaClient();
// Database Query Time Performance Monitoring Middleware
client.$use(async (params, next) => {
    const start = Date.now();
    const result = await next(params);
    const duration = Date.now() - start;
    console.log(`[PRISMA PERFORMANCE] ${params.model || "RawQuery"}.${params.action} execution took ${duration}ms`);
    return result;
});
exports.prisma = client;
if (process.env.NODE_ENV !== "production") {
    global.prisma = exports.prisma;
}
//# sourceMappingURL=prisma.js.map