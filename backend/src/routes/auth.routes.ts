import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { registerValidator, loginValidator } from "../validators/auth.validator";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { rateLimit } from "../middleware/rate-limit.middleware";

const router = Router();

// Strict rate limit for authentication endpoints (e.g. 10 attempts per 10 minutes)
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  maxHits: 10,
  keyPrefix: "auth",
});

router.post("/register", authLimiter, registerValidator, validate, AuthController.register);
router.post("/login", authLimiter, loginValidator, validate, AuthController.login);
router.post("/refresh", authLimiter, AuthController.refresh);
router.post("/logout", AuthController.logout);
router.get("/me", authenticate, AuthController.me);
router.put("/me", authenticate, AuthController.updateMe);

export default router;
