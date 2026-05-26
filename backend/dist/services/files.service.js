"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const prisma_1 = require("../lib/prisma");
const storage_service_1 = require("./storage/storage.service");
class FilesService {
    static async getAllFiles(pagination) {
        const queryOptions = {
            include: {
                teacher: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        };
        if (pagination) {
            queryOptions.skip = pagination.skip;
            queryOptions.take = pagination.take;
        }
        return prisma_1.prisma.subjectFile.findMany(queryOptions);
    }
    static async countFiles() {
        return prisma_1.prisma.subjectFile.count();
    }
    static async getFilesByFilter(filter) {
        const { gradeId, semester, subject } = filter;
        return prisma_1.prisma.subjectFile.findMany({
            where: {
                gradeId: gradeId ? parseInt(gradeId, 10) : undefined,
                semester: semester || undefined,
                subject: subject || undefined,
            },
            include: {
                teacher: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    static async createFileRecord(data) {
        const { gradeId, semester, subject, teacherId, title, description, type, url } = data;
        // Verify teacher exists
        const teacher = await prisma_1.prisma.teacher.findUnique({
            where: { id: teacherId },
        });
        if (!teacher) {
            throw { status: 400, message: "Teacher not found" };
        }
        return prisma_1.prisma.subjectFile.create({
            data: {
                gradeId: parseInt(gradeId, 10),
                semester,
                subject,
                teacherId,
                title,
                description: description || "",
                type,
                url,
            },
            include: {
                teacher: true,
            },
        });
    }
    static async deleteFileRecord(id) {
        const fileRecord = await prisma_1.prisma.subjectFile.findUnique({
            where: { id },
        });
        if (!fileRecord) {
            throw { status: 404, message: "File not found" };
        }
        // Call storage service abstraction to handle deleting from local disk or S3 bucket
        if (fileRecord.url) {
            await storage_service_1.StorageService.deleteFile(fileRecord.url);
        }
        return prisma_1.prisma.subjectFile.delete({
            where: { id },
        });
    }
}
exports.FilesService = FilesService;
//# sourceMappingURL=files.service.js.map