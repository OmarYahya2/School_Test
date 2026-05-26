import { prisma } from "../lib/prisma";

export class ScheduleService {
  static async getAllScheduleItems() {
    return prisma.scheduleItem.findMany({
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  static async getScheduleByClass(classId: string) {
    return prisma.scheduleItem.findMany({
      where: { classId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { semester: "asc" },
        { dayOfWeek: "asc" },
        { periodNumber: "asc" },
      ],
    });
  }

  static async createScheduleItem(data: any) {
    const { classId, semester, dayOfWeek, periodNumber, subject, teacherId, startTime, endTime } = data;

    // Verify class
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });
    if (!classExists) {
      throw { status: 400, message: "Class not found" };
    }

    // Check unique constraint
    const existing = await prisma.scheduleItem.findUnique({
      where: {
        classId_semester_dayOfWeek_periodNumber: {
          classId,
          semester: parseInt(semester, 10),
          dayOfWeek: parseInt(dayOfWeek, 10),
          periodNumber: parseInt(periodNumber, 10),
        },
      },
    });

    if (existing) {
      // Upsert/overwrite instead of erroring
      return prisma.scheduleItem.update({
        where: { id: existing.id },
        data: {
          subject,
          teacherId: teacherId || null,
          startTime,
          endTime,
        },
      });
    }

    return prisma.scheduleItem.create({
      data: {
        classId,
        semester: parseInt(semester, 10),
        dayOfWeek: parseInt(dayOfWeek, 10),
        periodNumber: parseInt(periodNumber, 10),
        subject,
        teacherId: teacherId || null,
        startTime,
        endTime,
      },
    });
  }

  static async updateScheduleItem(id: string, data: any) {
    const { subject, teacherId, startTime, endTime } = data;

    const existing = await prisma.scheduleItem.findUnique({
      where: { id },
    });
    if (!existing) {
      throw { status: 404, message: "Schedule item not found" };
    }

    return prisma.scheduleItem.update({
      where: { id },
      data: {
        subject,
        teacherId: teacherId !== undefined ? teacherId : undefined,
        startTime,
        endTime,
      },
    });
  }

  static async deleteScheduleItem(id: string) {
    const existing = await prisma.scheduleItem.findUnique({
      where: { id },
    });
    if (!existing) {
      throw { status: 404, message: "Schedule item not found" };
    }

    return prisma.scheduleItem.delete({
      where: { id },
    });
  }
}
