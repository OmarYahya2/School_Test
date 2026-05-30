import { Router } from "express";
import { TeachersController } from "../controllers/teachers.controller";
import { teacherValidator, teacherAssignmentValidator } from "../validators/teacher.validator";
import { validate } from "../middleware/validate.middleware";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import { rateLimit } from "../middleware/rate-limit.middleware";

const router = Router();

const publicLimiter = rateLimit({ windowMs: 60 * 1000, maxHits: 300, keyPrefix: "teachers-pub" });

// Public reads (landing page): rate-limited
router.get("/", publicLimiter, TeachersController.getAll);
router.get("/assignments", publicLimiter, TeachersController.getAllAssignments);

router.use(authenticate);

// --- Admin Teacher Account Management (must be before /:id) ---
router.use("/accounts", requireAdmin);
router.get("/accounts", TeachersController.getAccounts);
router.post("/accounts", TeachersController.createAccount);
router.put("/accounts/:id", TeachersController.updateAccount);
router.delete("/accounts/:id", TeachersController.deleteAccount);
router.patch("/accounts/:id/status", TeachersController.toggleStatus);
router.patch("/accounts/:id/reset-password", TeachersController.resetPassword);

router.get("/:id", TeachersController.getById);
router.post("/", teacherValidator, validate, TeachersController.create);
router.delete("/:id", TeachersController.delete);

router.post("/assignments", teacherAssignmentValidator, validate, TeachersController.assignTeacher);
router.delete("/assignments/:id", TeachersController.removeAssignment);

export default router;
