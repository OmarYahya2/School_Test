import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// Protected: admin-only analytics summary
router.get("/summary", authenticate, requireAdmin, AnalyticsController.getSummary);

export default router;
