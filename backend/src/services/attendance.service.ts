import { prisma } from "../lib/prisma";

export class AttendanceService {
  static async getAttendanceByClass(classId: string) {
    return prisma.attendanceRecord.findMany({
      where: { classId },
      orderBy: {
        date: "desc",
      },
    });
  }

  static async getAttendanceByClassAndDate(classId: string, dateStr: string) {
    const date = new Date(dateStr);
    return prisma.attendanceRecord.findUnique({
      where: {
        classId_date: {
          classId,
          date,
        },
      },
    });
  }

  static async saveAttendance(data: any) {
    const { classId, date: dateStr, records } = data;
    const date = new Date(dateStr);

    // Verify class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });
    if (!classExists) {
      throw { status: 400, message: "Class not found" };
    }

    const existing = await prisma.attendanceRecord.findUnique({
      where: {
        classId_date: {
          classId,
          date,
        },
      },
    });

    if (existing) {
      return prisma.attendanceRecord.update({
        where: { id: existing.id },
        data: { records },
      });
    }

    return prisma.attendanceRecord.create({
      data: {
        classId,
        date,
        records,
      },
    });
  }
}
