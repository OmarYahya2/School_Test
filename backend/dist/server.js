"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./middleware/error.middleware");
const logger_middleware_1 = require("./middleware/logger.middleware");
const prisma_1 = require("./lib/prisma");
const app = (0, express_1.default)();
// Configure CORS — uses CORS_ORIGIN env var (defaults to * in dev)
app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Body parsing
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// HTTP request logger
app.use(logger_middleware_1.requestLogger);
// Serve static file uploads
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../../uploads")));
// Mount API routes
app.use("/api", routes_1.default);
// Fallback health endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});
// Global error handler (must be last)
app.use(error_middleware_1.globalErrorHandler);
// Start server
app.listen(env_1.env.PORT, () => {
    console.log(`[Server] Running at ${env_1.env.BACKEND_URL}`);
    console.log(`[Server] Environment: ${env_1.env.NODE_ENV}`);
    console.log(`[Server] CORS origin: ${env_1.env.CORS_ORIGIN}`);
    // Database pre-heating / connection warmup
    console.log("[Server] Pre-heating database connection pool...");
    prisma_1.prisma.$queryRaw `SELECT 1`
        .then(() => {
        console.log("[Server] Database connection pool pre-heated successfully!");
    })
        .catch((err) => {
        console.error("[Server] Database pre-heating failed:", err);
    });
});
//# sourceMappingURL=server.js.map