import { prisma } from "../lib/prisma";

export class StudentsService {
  static async getAllStudents(pagination?: { skip: number; take: number }) {
    const queryOptions: any = {
      include: {
        class: {
          select: {
            id: true,
            name: true,
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

    return prisma.student.findMany(queryOptions);
  }

  static async countStudents() {
    return prisma.student.count();
  }

  static async getStudentById(id: string) {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        class: true,
        grades: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!student) {
      throw { status: 404, message: "Student not found" };
    }

    return student;
  }

  static async getStudentsByClass(classId: string) {
    return prisma.student.findMany({
      where: { classId },
      orderBy: {
        name: "asc",
      },
    });
  }

  static async createStudent(data: any) {
    const { name, age, classId, parentPhone, notes } = data;

    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });
    if (!classExists) {
      throw { status: 400, message: "Specified Class ID does not exist" };
    }

    return prisma.student.create({
      data: {
        name,
        age: parseInt(age, 10),
        classId,
        parentPhone,
        notes: notes || "",
      },
      include: {
        class: true,
      },
    });
  }

  static async updateStudent(id: string, data: any) {
    const { name, age, classId, parentPhone, notes } = data;

    await this.getStudentById(id);

    if (classId) {
      const classExists = await prisma.class.findUnique({
        where: { id: classId },
      });
      if (!classExists) {
        throw { status: 400, message: "Specified Class ID does not exist" };
      }
    }

    return prisma.student.update({
      where: { id },
      data: {
        name,
        age: age !== undefined ? parseInt(age, 10) : undefined,
        classId,
        parentPhone,
        notes: notes !== undefined ? notes : undefined,
      },
      include: {
        class: true,
      },
    });
  }

  static async deleteStudent(id: string) {
    await this.getStudentById(id);

    return prisma.student.delete({
      where: { id },
    });
  }
}
