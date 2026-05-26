"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const files_controller_1 = require("../controllers/files.controller");
const file_validator_1 = require("../validators/file.validator");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
// Rate limit for file operations to prevent abuse (e.g., max 10 requests per 5 minutes)
const fileLimiter = (0, rate_limit_middleware_1.rateLimit)({
    windowMs: 5 * 60 * 1000,
    maxHits: 10,
    keyPrefix: "files",
});
// Public reads
router.get("/", files_controller_1.FilesController.getAll);
router.get("/filter", files_controller_1.FilesController.getFiltered);
// Protected uploads and modifications
router.use(auth_middleware_1.authenticate);
router.post("/upload", fileLimiter, upload_middleware_1.upload.single("file"), files_controller_1.FilesController.upload);
router.post("/", fileLimiter, file_validator_1.fileValidator, validate_middleware_1.validate, files_controller_1.FilesController.create);
router.delete("/:id", files_controller_1.FilesController.delete);
exports.default = router;
//# sourceMappingURL=files.routes.js.map