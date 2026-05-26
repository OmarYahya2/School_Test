import { client } from "./client";
import type { SchoolClass } from "../store";

export async function fetchClasses(): Promise<SchoolClass[]> {
  try {
    return await client.get<SchoolClass[]>("/classes");
  } catch (error) {
    console.error("fetchClasses error:", error);
    return [];
  }
}

export async function fetchClassById(id: string): Promise<SchoolClass | null> {
  try {
    return await client.get<SchoolClass>(`/classes/${id}`);
  } catch (error) {
    console.error("fetchClassById error:", error);
    return null;
  }
}

export async function createClass(name: string): Promise<SchoolClass | null> {
  try {
    return await client.post<SchoolClass>("/classes", { name });
  } catch (error) {
    console.error("createClass error:", error);
    return null;
  }
}

export async function updateClassById(
  id: string,
  updates: Partial<Pick<SchoolClass, "name" | "teacherId">>
): Promise<SchoolClass | null> {
  try {
    return await client.put<SchoolClass>(`/classes/${id}`, updates);
  } catch (error) {
    console.error("updateClassById error:", error);
    return null;
  }
}

export async function deleteClassById(id: string): Promise<void> {
  try {
    await client.delete(`/classes/${id}`);
  } catch (error) {
    console.error("deleteClassById error:", error);
  }
}
