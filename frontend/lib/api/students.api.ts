import { client } from "./client";
import type { Student } from "../store";

export async function fetchStudents(): Promise<Student[]> {
  try {
    return await client.get<Student[]>("/students");
  } catch {
    return [];
  }
}

export async function fetchStudentsByClass(classId: string): Promise<Student[]> {
  try {
    return await client.get<Student[]>(`/students/class/${classId}`);
  } catch {
    return [];
  }
}

export async function fetchStudentById(id: string): Promise<Student | null> {
  try {
    return await client.get<Student>(`/students/${id}`);
  } catch {
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
  } catch {
    return null;
  }
}

export async function updateStudentById(
  id: string,
  updates: Partial<Pick<Student, "name" | "age" | "classId" | "parentPhone" | "notes">>
): Promise<Student | null> {
  try {
    return await client.put<Student>(`/students/${id}`, updates);
  } catch {
    return null;
  }
}

export async function deleteStudentById(id: string): Promise<void> {
  try {
    await client.delete(`/students/${id}`);
  } catch {
    // silently ignore
  }
}
