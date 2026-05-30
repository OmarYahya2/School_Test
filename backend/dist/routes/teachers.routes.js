"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teachers_controller_1 = require("../controllers/teachers.controller");
const teacher_validator_1 = require("../validators/teacher.validator");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
const publicLimiter = (0, rate_limit_middleware_1.rateLimit)({ windowMs: 60 * 1000, maxHits: 300, keyPrefix: "teachers-pub" });
// Public reads (landing page): rate-limited
router.get("/", publicLimiter, teachers_controller_1.TeachersController.getAll);
router.get("/assignments", publicLimiter, teachers_controller_1.TeachersController.getAllAssignments);
router.use(auth_middleware_1.authenticate);
// --- Admin Teacher Account Management (must be before /:id) ---
router.use("/accounts", auth_middleware_1.requireAdmin);
router.get("/accounts", teachers_controller_1.TeachersController.getAccounts);
router.post("/accounts", teachers_controller_1.TeachersController.createAccount);
router.put("/accounts/:id", teachers_controller_1.TeachersController.updateAccount);
router.delete("/accounts/:id", teachers_controller_1.TeachersController.deleteAccount);
router.patch("/accounts/:id/status", teachers_controller_1.TeachersController.toggleStatus);
router.patch("/accounts/:id/reset-password", teachers_controller_1.TeachersController.resetPassword);
router.get("/:id", teachers_controller_1.TeachersController.getById);
router.post("/", teacher_validator_1.teacherValidator, validate_middleware_1.validate, teachers_controller_1.TeachersController.create);
router.delete("/:id", teachers_controller_1.TeachersController.delete);
router.post("/assignments", teacher_validator_1.teacherAssignmentValidator, validate_middleware_1.validate, teachers_controller_1.TeachersController.assignTeacher);
router.delete("/assignments/:id", teachers_controller_1.TeachersController.removeAssignment);
exports.default = router;
//# sourceMappingURL=teachers.routes.js.map