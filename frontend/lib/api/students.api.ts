import { client } from "./client";
import type { Student } from "../store";

export async function fetchStudents(): Promise<Student[]> {
  try {
    return await client.get<Student[]>("/students");
  } catch (error) {
    console.error("fetchStudents error:", error);
    return [];
  }
}

export async function fetchStudentsByClass(classId: string): Promise<Student[]> {
  try {
    return await client.get<Student[]>(`/students/class/${classId}`);
  } catch (error) {
    console.error("fetchStudentsByClass error:", error);
    return [];
  }
}

export async function fetchStudentById(id: string): Promise<Student | null> {
  try {
    return await client.get<Student>(`/students/${id}`);
  } catch (error) {
    console.error("fetchStudentById error:", error);
    return null;
  }
}

export async function createStudent(
  name: string,
  age: number,
  classId: string,
  parentPhone: string,
  notes: string
): Promise<Student | null> {
  try {
    return await client.post<Student>("/students", {
      name,
      age,
      classId,
      parentPhone,
      notes,
    });
  } catch (error) {
    console.error("createStudent error:", error);
    return null;
  }
}

export async function updateStudentById(
  id: string,
  updates: Partial<Pick<Student, "name" | "age" | "parentPhone" | "notes">>
): Promise<Student | null> {
  try {
    return await client.put<Student>(`/students/${id}`, updates);
  } catch (error) {
    console.error("updateStudentById error:", error);
    return null;
  }
}

export async function deleteStudentById(id: string): Promise<void> {
  try {
    await client.delete(`/students/${id}`);
  } catch (error) {
    console.error("deleteStudentById error:", error);
  }
}
