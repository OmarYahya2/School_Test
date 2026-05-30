"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const files_service_1 = require("../services/files.service");
const response_utils_1 = require("../utils/response.utils");
const storage_service_1 = require("../services/storage/storage.service");
const pagination_utils_1 = require("../utils/pagination.utils");
const prisma_1 = require("../lib/prisma");
class FilesController {
    static async getAll(req, res, next) {
        try {
            if (req.teacher) {
                const files = await prisma_1.prisma.subjectFile.findMany({
                    where: { teacherId: req.teacher.id },
                    include: { teacher: { select: { id: true, name: true } } },
                    orderBy: { createdAt: "desc" },
                });
                return (0, response_utils_1.sendSuccess)(res, files, "Files fetched successfully");
            }
            const { page, limit } = req.query;
            if (page || limit) {
                const { skip, take, page: p, limit: l } = (0, pagination_utils_1.getPaginationParams)(req.query);
                const [files, total] = await Promise.all([
                    files_service_1.FilesService.getAllFiles({ skip, take }),
                    files_service_1.FilesService.countFiles(),
                ]);
                const totalPages = Math.ceil(total / l);
                return (0, response_utils_1.sendPaginatedSuccess)(res, files, { total, page: p, limit: l, totalPages }, "Files fetched successfully");
            }
            const files = await files_service_1.FilesService.getAllFiles();
            return (0, response_utils_1.sendSuccess)(res, files, "Files fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async getFiltered(req, res, next) {
        try {
            const { gradeId, semester, subject } = req.query;
            if (req.teacher) {
                const files = await prisma_1.prisma.subjectFile.findMany({
                    where: {
                        teacherId: req.teacher.id,
                        gradeId: gradeId ? parseInt(gradeId, 10) : undefined,
                        semester: semester ? String(semester) : undefined,
                        subject: subject ? String(subject) : undefined,
                    },
                    include: { teacher: { select: { id: true, name: true } } },
                    orderBy: { createdAt: "desc" },
                });
                return (0, response_utils_1.sendSuccess)(res, files, "Filtered files fetched successfully");
            }
            const files = await files_service_1.FilesService.getFilesByFilter({
                gradeId: gradeId ? parseInt(gradeId, 10) : undefined,
                semester: semester,
                subject: subject,
            });
            return (0, response_utils_1.sendSuccess)(res, files, "Filtered files fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const fileRecord = await files_service_1.FilesService.createFileRecord(req.body);
            return (0, response_utils_1.sendSuccess)(res, fileRecord, "File record created successfully", 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            if (req.teacher) {
                const fileRecord = await prisma_1.prisma.subjectFile.findUnique({ where: { id: req.params.id } });
                if (!fileRecord || fileRecord.teacherId !== req.teacher.id) {
                    return (0, response_utils_1.sendError)(res, "Access denied. This file is not yours.", 403);
                }
            }
            await files_service_1.FilesService.deleteFileRecord(req.params.id);
            return (0, response_utils_1.sendSuccess)(res, null, "File deleted successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async upload(req, res, next) {
        try {
            if (!req.file) {
                return (0, response_utils_1.sendError)(res, "No file uploaded", 400);
            }
            const fileUrl = await storage_service_1.StorageService.uploadFile(req.file);
            return (0, response_utils_1.sendSuccess)(res, { url: fileUrl }, "File uploaded successfully", 201);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.FilesController = FilesController;
//# sourceMappingURL=files.controller.js.map