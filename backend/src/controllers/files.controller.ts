import { Response, NextFunction } from "express";
import { RequestWithUser } from "../types/express.types";
import { FilesService } from "../services/files.service";
import { sendSuccess, sendPaginatedSuccess, sendError } from "../utils/response.utils";
import { StorageService } from "../services/storage/storage.service";
import { getPaginationParams } from "../utils/pagination.utils";
import { prisma } from "../lib/prisma";

export class FilesController {
  static async getAll(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (req.teacher) {
        const files = await prisma.subjectFile.findMany({
          where: { teacherId: req.teacher.id },
          include: { teacher: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        });
        return sendSuccess(res, files, "Files fetched successfully");
      }

      const { page, limit } = req.query;
      if (page || limit) {
        const { skip, take, page: p, limit: l } = getPaginationParams(req.query);
        const [files, total] = await Promise.all([
          FilesService.getAllFiles({ skip, take }),
          FilesService.countFiles(),
        ]);
        const totalPages = Math.ceil(total / l);
        return sendPaginatedSuccess(
          res,
          files,
          { total, page: p, limit: l, totalPages },
          "Files fetched successfully"
        );
      }

      const files = await FilesService.getAllFiles();
      return sendSuccess(res, files, "Files fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getFiltered(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const { gradeId, semester, subject } = req.query;
      if (req.teacher) {
        const files = await prisma.subjectFile.findMany({
          where: {
            teacherId: req.teacher.id,
            gradeId: gradeId ? parseInt(gradeId as string, 10) : undefined,
            semester: semester ? String(semester) : undefined,
            subject: subject ? String(subject) : undefined,
          },
          include: { teacher: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        });
        return sendSuccess(res, files, "Filtered files fetched successfully");
      }
      const files = await FilesService.getFilesByFilter({
        gradeId: gradeId ? parseInt(gradeId as string, 10) : undefined,
        semester: semester as string,
        subject: subject as string,
      });
      return sendSuccess(res, files, "Filtered files fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async create(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const fileRecord = await FilesService.createFileRecord(req.body);
      return sendSuccess(res, fileRecord, "File record created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (req.teacher) {
        const fileRecord = await prisma.subjectFile.findUnique({ where: { id: req.params.id } });
        if (!fileRecord || fileRecord.teacherId !== req.teacher.id) {
          return sendError(res, "Access denied. This file is not yours.", 403);
        }
      }
      await FilesService.deleteFileRecord(req.params.id);
      return sendSuccess(res, null, "File deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  static async upload(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return sendError(res, "No file uploaded", 400);
      }

      const fileUrl = await StorageService.uploadFile(req.file);

      return sendSuccess(res, { url: fileUrl }, "File uploaded successfully", 201);
    } catch (error) {
      next(error);
    }
  }
}
