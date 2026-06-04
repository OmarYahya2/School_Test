import { client } from "./client";
import type { SubjectFile } from "../store";

export async function fetchSubjectFiles(): Promise<SubjectFile[]> {
  try {
    return await client.get<SubjectFile[]>("/files");
  } catch {
    return [];
  }
}

export async function fetchSubjectFilesByFilter(
  gradeId: number,
  semester: string,
  subject: string
): Promise<SubjectFile[]> {
  try {
    const params = new URLSearchParams({
      gradeId: gradeId.toString(),
      semester,
      subject,
    });
    return await client.get<SubjectFile[]>(`/files/filter?${params.toString()}`);
  } catch {
    return [];
  }
}

export async function createSubjectFile(
  gradeId: number,
  semester: string,
  subject: string,
  teacherId: string,
  title: string,
  description: string,
  type: SubjectFile["type"],
  url: string
): Promise<SubjectFile | null> {
  try {
    return await client.post<SubjectFile>("/files", {
      gradeId,
      semester,
      subject,
      teacherId,
      title,
      description,
      type,
      url,
    });
  } catch {
    return null;
  }
}

export async function deleteSubjectFileById(id: string): Promise<void> {
  try {
    await client.delete(`/files/${id}`);
  } catch {
    // silently ignore
  }
}

export async function uploadSubjectFileAsset(
  file: File,
  folder: string
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const result = await client.post<{ url: string }>("/files/upload", formData);
    return result?.url || null;
  } catch {
    return null;
  }
}
