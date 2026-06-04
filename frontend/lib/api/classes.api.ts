import { client } from "./client";
import type { SchoolClass } from "../store";

export async function fetchClasses(): Promise<SchoolClass[]> {
  try {
    return await client.get<SchoolClass[]>("/classes");
  } catch {
    return [];
  }
}

export async function fetchClassById(id: string): Promise<SchoolClass | null> {
  try {
    return await client.get<SchoolClass>(`/classes/${id}`);
  } catch {
    return null;
  }
}

export async function createClass(name: string, teacherId?: string | null): Promise<SchoolClass | null> {
  try {
    return await client.post<SchoolClass>("/classes", { name, teacherId: teacherId || null });
  } catch {
    return null;
  }
}

export async function updateClassById(
  id: string,
  updates: Partial<Pick<SchoolClass, "name" | "teacherId">>
): Promise<SchoolClass | null> {
  try {
    return await client.put<SchoolClass>(`/classes/${id}`, updates);
  } catch {
    return null;
  }
}

export async function deleteClassById(id: string): Promise<void> {
  try {
    await client.delete(`/classes/${id}`);
  } catch {
    // silently ignore
  }
}
