import { supabase } from "./supabaseClient"
import type { SubjectFile } from "./store"

function sanitizePathSegment(segment: string): string {
  return (
    segment
      .normalize("NFKD")
      // Keep only latin letters, numbers, space, dash, underscore
      .replace(/[^A-Za-z0-9 _-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase() || "item"
  )
}

export async function fetchSubjectFiles(): Promise<SubjectFile[]> {
  const { data, error } = await supabase
    .from("subject_files")
    .select(
      "id, grade_id, semester, subject, teacher_id, title, description, type, url, created_at"
    )
    .order("created_at", { ascending: false })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id as string,
    gradeId: row.grade_id as number,
    semester: row.semester as string,
    subject: row.subject as string,
    teacherId: row.teacher_id as string,
    title: row.title as string,
    description: (row.description as string) || "",
    type: row.type as SubjectFile["type"],
    url: row.url as string,
    createdAt: row.created_at as string,
  }))
}

export async function fetchSubjectFilesByFilter(
  gradeId: number,
  semester: string,
  subject: string
): Promise<SubjectFile[]> {
  const { data, error } = await supabase
    .from("subject_files")
    .select(
      "id, grade_id, semester, subject, teacher_id, title, description, type, url, created_at"
    )
    .eq("grade_id", gradeId)
    .eq("semester", semester)
    .eq("subject", subject)
    .order("created_at", { ascending: false })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id as string,
    gradeId: row.grade_id as number,
    semester: row.semester as string,
    subject: row.subject as string,
    teacherId: row.teacher_id as string,
    title: row.title as string,
    description: (row.description as string) || "",
    type: row.type as SubjectFile["type"],
    url: row.url as string,
    createdAt: row.created_at as string,
  }))
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
  const { data, error } = await supabase
    .from("subject_files")
    .insert({
      grade_id: gradeId,
      semester,
      subject,
      teacher_id: teacherId,
      title,
      description,
      type,
      url,
    })
    .select(
      "id, grade_id, semester, subject, teacher_id, title, description, type, url, created_at"
    )
    .single()

  if (error || !data) return null

  return {
    id: data.id as string,
    gradeId: data.grade_id as number,
    semester: data.semester as string,
    subject: data.subject as string,
    teacherId: data.teacher_id as string,
    title: data.title as string,
    description: (data.description as string) || "",
    type: data.type as SubjectFile["type"],
    url: data.url as string,
    createdAt: data.created_at as string,
  }
}

export async function deleteSubjectFileById(id: string): Promise<void> {
  await supabase.from("subject_files").delete().eq("id", id)
}

export async function uploadSubjectFileAsset(
  file: File,
  folder: string
): Promise<string | null> {
  const ext = file.name.split(".").pop() || "bin"
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const safeFolder = folder
    .split("/")
    .map((segment) => sanitizePathSegment(segment))
    .join("/")
  const path = `${safeFolder}/${fileName}`

  const { data, error } = await supabase.storage
    .from("subject-files")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (error || !data) {
    // Helpful for debugging in browser console
    // eslint-disable-next-line no-console
    console.error("Supabase storage upload error", error)
    return null
  }

  const { data: publicData } = supabase.storage
    .from("subject-files")
    .getPublicUrl(data.path)

  return publicData.publicUrl ?? null
}


