"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const classes_controller_1 = require("../controllers/classes.controller");
const class_validator_1 = require("../validators/class.validator");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.use(auth_middleware_1.injectTeacher);
router.get("/", classes_controller_1.ClassesController.getAll);
router.get("/:id", classes_controller_1.ClassesController.getById);
router.post("/", auth_middleware_1.requireAdmin, class_validator_1.classValidator, validate_middleware_1.validate, classes_controller_1.ClassesController.create);
router.put("/:id", auth_middleware_1.requireAdmin, class_validator_1.classValidator, validate_middleware_1.validate, classes_controller_1.ClassesController.update);
router.delete("/:id", auth_middleware_1.requireAdmin, classes_controller_1.ClassesController.delete);
exports.default = router;
//# sourceMappingURL=classes.routes.js.map