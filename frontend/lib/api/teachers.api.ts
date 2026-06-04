import { client } from "./client";
import type { Teacher, TeacherAssignment } from "../store";

export async function fetchTeachers(): Promise<Teacher[]> {
  try {
    return await client.get<Teacher[]>("/teachers");
  } catch {
    return [];
  }
}

export async function createTeacher(
  name: string,
  phone: string,
  subject: string
): Promise<Teacher | null> {
  try {
    return await client.post<Teacher>("/teachers", { name, phone, subject });
  } catch {
    return null;
  }
}

export async function deleteTeacherById(id: string): Promise<void> {
  try {
    await client.delete(`/teachers/${id}`);
  } catch {
    // silently ignore
  }
}

export async function fetchTeacherAssignments(): Promise<TeacherAssignment[]> {
  try {
    return await client.get<TeacherAssignment[]>("/teachers/assignments");
  } catch {
    return [];
  }
}

export async function createTeacherAssignment(
  teacherId: string,
  gradeId: number,
  semester: string,
  subject: string,
  classId?: string
): Promise<TeacherAssignment | null> {
  try {
    return await client.post<TeacherAssignment>("/teachers/assignments", {
      teacherId,
      gradeId,
      semester,
      subject,
      classId,
    });
  } catch {
    return null;
  }
}

export async function deleteTeacherAssignmentById(id: string): Promise<void> {
  try {
    await client.delete(`/teachers/assignments/${id}`);
  } catch {
    // silently ignore
  }
}
