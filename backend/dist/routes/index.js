"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const classes_routes_1 = __importDefault(require("./classes.routes"));
const students_routes_1 = __importDefault(require("./students.routes"));
const teachers_routes_1 = __importDefault(require("./teachers.routes"));
const attendance_routes_1 = __importDefault(require("./attendance.routes"));
const grades_routes_1 = __importDefault(require("./grades.routes"));
const schedule_routes_1 = __importDefault(require("./schedule.routes"));
const files_routes_1 = __importDefault(require("./files.routes"));
const router = (0, express_1.Router)();
router.use("/auth", auth_routes_1.default);
router.use("/classes", classes_routes_1.default);
router.use("/students", students_routes_1.default);
router.use("/teachers", teachers_routes_1.default);
router.use("/attendance", attendance_routes_1.default);
router.use("/grades", grades_routes_1.default);
router.use("/schedule", schedule_routes_1.default);
router.use("/files", files_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map