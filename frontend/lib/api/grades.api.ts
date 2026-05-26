import { client } from "./client";
import type { Grade } from "../store";

export async function fetchGrades(): Promise<Grade[]> {
  try {
    return await client.get<Grade[]>("/grades");
  } catch (error) {
    console.error("fetchGrades error:", error);
    return [];
  }
}

export async function fetchGradesByStudent(studentId: string): Promise<Grade[]> {
  try {
    return await client.get<Grade[]>(`/grades/student/${studentId}`);
  } catch (error) {
    console.error("fetchGradesByStudent error:", error);
    return [];
  }
}

export async function fetchGradesByClass(classId: string): Promise<Grade[]> {
  try {
    return await client.get<Grade[]>(`/grades/class/${classId}`);
  } catch (error) {
    console.error("fetchGradesByClass error:", error);
    return [];
  }
}

export async function createGrade(
  studentId: string,
  subject: string,
  grade: number,
  maxGrade: number,
  semester: string,
  academicYear: string,
  examType: string,
  teacherId: string | null,
  notes: string
): Promise<Grade | null> {
  try {
    return await client.post<Grade>("/grades", {
      studentId,
      subject,
      grade,
      maxGrade,
      semester,
      academicYear,
      examType,
      teacherId,
      notes,
    });
  } catch (error) {
    console.error("createGrade error:", error);
    return null;
  }
}

export async function updateGrade(
  id: string,
  updates: Partial<Pick<Grade, "subject" | "grade" | "maxGrade" | "semester" | "academicYear" | "examType" | "teacherId" | "notes">>
): Promise<Grade | null> {
  try {
    return await client.put<Grade>(`/grades/${id}`, updates);
  } catch (error) {
    console.error("updateGrade error:", error);
    return null;
  }
}

export async function deleteGrade(id: string): Promise<void> {
  try {
    await client.delete(`/grades/${id}`);
  } catch (error) {
    console.error("deleteGrade error:", error);
  }
}
