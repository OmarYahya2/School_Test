import { prisma } from "../lib/prisma";

export class ClassesService {
  static async getAllClasses(pagination?: { skip: number; take: number }) {
    const queryOptions: any = {
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            phone: true,
            subject: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    };

    if (pagination) {
      queryOptions.skip = pagination.skip;
      queryOptions.take = pagination.take;
    }

    return prisma.class.findMany(queryOptions);
  }

  static async countClasses() {
    return prisma.class.count();
  }

  static async getClassById(id: string) {
    const schoolClass = await prisma.class.findUnique({
      where: { id },
      include: {
        teacher: true,
        students: true,
        attendance: true,
        scheduleItems: true,
      },
    });

    if (!schoolClass) {
      throw { status: 404, message: "Class not found" };
    }

    return schoolClass;
  }

  static async createClass(data: any) {
    const { name, teacherId, notes } = data;
    return prisma.class.create({
      data: {
        name,
        teacherId: teacherId || null,
        notes: notes || "",
      },
      include: {
        teacher: true,
      },
    });
  }

  static async updateClass(id: string, data: any) {
    const { name, teacherId, notes } = data;
    
    // Check if class exists
    await this.getClassById(id);

    return prisma.class.update({
      where: { id },
      data: {
        name,
        teacherId: teacherId !== undefined ? teacherId : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
      include: {
        teacher: true,
      },
    });
  }

  static async deleteClass(id: string) {
    await this.getClassById(id);

    return prisma.class.delete({
      where: { id },
    });
  }
}
