import { Router } from "express";
import { FilesController } from "../controllers/files.controller";
import { fileValidator } from "../validators/file.validator";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import { rateLimit } from "../middleware/rate-limit.middleware";

const router = Router();

// Rate limit for file operations to prevent abuse (e.g., max 10 requests per 5 minutes)
const fileLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  maxHits: 10,
  keyPrefix: "files",
});

// Public reads
router.get("/", FilesController.getAll);
router.get("/filter", FilesController.getFiltered);

// Protected uploads and modifications
router.use(authenticate);
router.post("/upload", fileLimiter, upload.single("file"), FilesController.upload);
router.post("/", fileLimiter, fileValidator, validate, FilesController.create);
router.delete("/:id", FilesController.delete);

export default router;
