import { prisma } from "../lib/prisma";
import { hashPassword } from "../utils/password.utils";

export class TeachersService {
  static async getAllTeachers(pagination?: { skip: number; take: number }) {
    const queryOptions: any = {
      include: {
        classes: {
          select: {
            id: true,
            name: true,
          },
        },
        teacherAssignments: true,
      },
      orderBy: {
        name: "asc",
      },
    };

    if (pagination) {
      queryOptions.skip = pagination.skip;
      queryOptions.take = pagination.take;
    }

    return prisma.teacher.findMany(queryOptions);
  }

  static async countTeachers() {
    return prisma.teacher.count();
  }

  static async getTeacherById(id: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        classes: true,
        teacherAssignments: true,
      },
    });

    if (!teacher) {
      throw { status: 404, message: "Teacher not found" };
    }

    return teacher;
  }

  static async createTeacher(data: any) {
    const { name, phone, subject } = data;
    return prisma.teacher.create({
      data: {
        name,
        phone,
        subject,
      },
    });
  }

  static async deleteTeacher(id: string) {
    await this.getTeacherById(id);
    return prisma.teacher.delete({
      where: { id },
    });
  }

  // --- Teacher Assignments ---

  static async getAllAssignments() {
    return prisma.teacherAssignment.findMany({
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            phone: true,
            subject: true,
          },
        },
      },
    });
  }

  static async assignTeacher(data: any) {
    const { teacherId, gradeId, semester, subject, classId } = data;

    // Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });
    if (!teacher) {
      throw { status: 400, message: "Teacher not found" };
    }

    // If classId provided, set this teacher as the class homeroom teacher
    if (classId) {
      await prisma.class.update({
        where: { id: classId },
        data: { teacherId },
      });
    }

    // Upsert assignment: find existing by teacher + class + subject + semester
    const existing = classId
      ? await prisma.teacherAssignment.findFirst({
          where: { teacherId, classId, subject, semester },
        })
      : await prisma.teacherAssignment.findFirst({
          where: { teacherId, gradeId: parseInt(gradeId, 10), subject, semester },
        });

    if (existing) {
      return prisma.teacherAssignment.update({
        where: { id: existing.id },
        data: {
          gradeId: parseInt(gradeId, 10),
          ...(classId ? { classId } : {}),
        },
        include: { teacher: { select: { id: true, name: true, phone: true, subject: true } } },
      });
    }

    return prisma.teacherAssignment.create({
      data: {
        teacherId,
        gradeId: parseInt(gradeId, 10),
        semester,
        subject,
        ...(classId ? { classId } : {}),
      },
      include: { teacher: { select: { id: true, name: true, phone: true, subject: true } } },
    });
  }

  static async removeAssignment(id: string) {
    const assignment = await prisma.teacherAssignment.findUnique({
      where: { id },
    });
    if (!assignment) {
      throw { status: 404, message: "Assignment not found" };
    }

    return prisma.teacherAssignment.delete({
      where: { id },
    });
  }

  // --- Teacher Account Management (Admin) ---

  static async getTeacherAccounts() {
    return prisma.teacher.findMany({
      include: {
        user: { select: { id: true, email: true, role: true } },
        classes: { select: { id: true, name: true } },
        teacherAssignments: true,
      },
      orderBy: { name: "asc" },
    });
  }

  static async createTeacherAccount(data: any) {
    const { name, email, password, phone, subject, assignedSubjects, isHomeroom, classId } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw { status: 400, message: "Email is already registered" };
    }

    const existingTeacherEmail = await prisma.teacher.findUnique({ where: { email } });
    if (existingTeacherEmail) {
      throw { status: 400, message: "Teacher email already exists" };
    }

    const hashedPassword = await hashPassword(password);

    return prisma.$transaction(async (tx) => {
      const teacher = await tx.teacher.create({
        data: {
          name,
          email,
          phone: phone || "",
          subject: subject || "",
          assignedSubjects: assignedSubjects || [],
          isActive: true,
        },
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "teacher",
          teacherId: teacher.id,
        },
      });

      if (isHomeroom && classId) {
        await tx.class.update({
          where: { id: classId },
          data: { teacherId: teacher.id },
        });
      }

      return { teacher, user };
    });
  }

  static async updateTeacherAccount(id: string, data: any) {
    const { name, email, phone, subject, assignedSubjects, isActive, isHomeroom, classId } = data;

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: { classes: { select: { id: true } } },
    });
    if (!teacher) {
      throw { status: 404, message: "Teacher not found" };
    }

    return prisma.$transaction(async (tx) => {
      const updatedTeacher = await tx.teacher.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(phone !== undefined && { phone }),
          ...(subject !== undefined && { subject }),
          ...(assignedSubjects && { assignedSubjects }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      if (email || name) {
        await tx.user.updateMany({
          where: { teacherId: id },
          data: {
            ...(email && { email }),
            ...(name && { name }),
          },
        });
      }

      if (isHomeroom && classId) {
        await tx.class.update({
          where: { id: classId },
          data: { teacherId: id },
        });
      } else if (isHomeroom === false && teacher.classes.length > 0) {
        await tx.class.updateMany({
          where: { teacherId: id },
          data: { teacherId: null },
        });
      }

      return updatedTeacher;
    });
  }

  static async deleteTeacherAccount(id: string) {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) {
      throw { status: 404, message: "Teacher not found" };
    }

    return prisma.$transaction(async (tx) => {
      await tx.user.deleteMany({ where: { teacherId: id } });
      await tx.teacher.delete({ where: { id } });
      return { message: "Teacher account deleted successfully" };
    });
  }

  static async toggleTeacherStatus(id: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      select: { isActive: true },
    });
    if (!teacher) {
      throw { status: 404, message: "Teacher not found" };
    }

    return prisma.teacher.update({
      where: { id },
      data: { isActive: !teacher.isActive },
    });
  }

  static async resetTeacherPassword(id: string, newPassword: string) {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) {
      throw { status: 404, message: "Teacher not found" };
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.updateMany({
      where: { teacherId: id },
      data: { password: hashedPassword },
    });

    return { message: "Password reset successfully" };
  }
}
