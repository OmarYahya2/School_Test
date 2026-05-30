import { Router } from "express";
import { QRController } from "../controllers/qr.controller";
import { authenticate, injectTeacher, requireAdminOrActiveTeacher } from "../middleware/auth.middleware";

const router = Router();

// Public: verify a signed QR token (used by the landing page after scanning)
router.get("/verify", QRController.verify);

// Protected: generate a signed QR token (admin or active teacher)
router.post("/generate", authenticate, injectTeacher, requireAdminOrActiveTeacher, QRController.generate);

export default router;
