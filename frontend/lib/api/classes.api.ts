import { client } from "./client";
import type { SchoolClass } from "../store";

export async function fetchClasses(): Promise<SchoolClass[]> {
  try {
    return await client.get<SchoolClass[]>("/classes");
  } catch (error) {
    const { status = 0, message = "Unknown error", silent = false } = (error as any) ?? {};
    if (!silent) console.error(`fetchClasses error [${status}]: ${message}`);
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

export async function createClass(name: string, teacherId?: string | null): Promise<SchoolClass | null> {
  try {
    return await client.post<SchoolClass>("/classes", { name, teacherId: teacherId || null });
  } catch (error: any) {
    console.error("createClass error:", JSON.stringify(error));
    return null;
  }
}

export async function updateClassById(
  id: string,
  updates: Partial<Pick<SchoolClass, "name" | "teacherId">>
): Promise<SchoolClass | null> {
  try {
    return await client.put<SchoolClass>(`/classes/${id}`, updates);
  } catch (error: any) {
    console.error("updateClassById error:", JSON.stringify(error));
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
