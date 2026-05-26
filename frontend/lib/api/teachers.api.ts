import { client } from "./client";
import type { Teacher, TeacherAssignment } from "../store";

export async function fetchTeachers(): Promise<Teacher[]> {
  try {
    return await client.get<Teacher[]>("/teachers");
  } catch (error) {
    console.error("fetchTeachers error:", error);
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
  } catch (error) {
    console.error("createTeacher error:", error);
    return null;
  }
}

export async function deleteTeacherById(id: string): Promise<void> {
  try {
    await client.delete(`/teachers/${id}`);
  } catch (error) {
    console.error("deleteTeacherById error:", error);
  }
}

export async function fetchTeacherAssignments(): Promise<TeacherAssignment[]> {
  try {
    return await client.get<TeacherAssignment[]>("/teachers/assignments");
  } catch (error) {
    console.error("fetchTeacherAssignments error:", error);
    return [];
  }
}

export async function createTeacherAssignment(
  teacherId: string,
  gradeId: number,
  semester: string,
  subject: string
): Promise<TeacherAssignment | null> {
  try {
    return await client.post<TeacherAssignment>("/teachers/assignments", {
      teacherId,
      gradeId,
      semester,
      subject,
    });
  } catch (error) {
    console.error("createTeacherAssignment error:", error);
    return null;
  }
}

export async function deleteTeacherAssignmentById(id: string): Promise<void> {
  try {
    await client.delete(`/teachers/assignments/${id}`);
  } catch (error) {
    console.error("deleteTeacherAssignmentById error:", error);
  }
}
