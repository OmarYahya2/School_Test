import { prisma } from "../lib/prisma";
import { StorageService } from "./storage/storage.service";

export class FilesService {
  static async getAllFiles(pagination?: { skip: number; take: number }) {
    const queryOptions: any = {
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

    return prisma.subjectFile.findMany(queryOptions);
  }

  static async countFiles() {
    return prisma.subjectFile.count();
  }

  static async getFilesByFilter(filter: { gradeId?: number; semester?: string; subject?: string }) {
    const { gradeId, semester, subject } = filter;
    
    return prisma.subjectFile.findMany({
      where: {
        gradeId: gradeId ? parseInt(gradeId as any, 10) : undefined,
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

  static async createFileRecord(data: any) {
    const { gradeId, semester, subject, teacherId, title, description, type, url } = data;

    // Verify teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });
    if (!teacher) {
      throw { status: 400, message: "Teacher not found" };
    }

    return prisma.subjectFile.create({
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

  static async deleteFileRecord(id: string) {
    const fileRecord = await prisma.subjectFile.findUnique({
      where: { id },
    });
    
    if (!fileRecord) {
      throw { status: 404, message: "File not found" };
    }

    // Call storage service abstraction to handle deleting from local disk or S3 bucket
    if (fileRecord.url) {
      await StorageService.deleteFile(fileRecord.url);
    }

    return prisma.subjectFile.delete({
      where: { id },
    });
  }
}
