import { Router } from "express";
import { FilesController } from "../controllers/files.controller";
import { fileValidator } from "../validators/file.validator";
import { validate } from "../middleware/validate.middleware";
import { authenticate, injectTeacher, requireAdmin, requireAdminOrActiveTeacher } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import { rateLimit } from "../middleware/rate-limit.middleware";

const router = Router();

// Rate limit for file operations to prevent abuse (e.g., max 10 requests per 5 minutes)
const fileLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  maxHits: 10,
  keyPrefix: "files",
});

const publicLimiter = rateLimit({ windowMs: 60 * 1000, maxHits: 300, keyPrefix: "files-pub" });

router.use(authenticate);
router.use(injectTeacher);

router.get("/", publicLimiter, FilesController.getAll);
router.get("/filter", publicLimiter, FilesController.getFiltered);

router.post("/upload", requireAdminOrActiveTeacher, fileLimiter, upload.single("file"), FilesController.upload);
router.post("/", requireAdminOrActiveTeacher, fileLimiter, fileValidator, validate, FilesController.create);
router.delete("/:id", requireAdminOrActiveTeacher, FilesController.delete);

export default router;
