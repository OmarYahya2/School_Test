import { supabase } from "./supabaseClient"
import type { Teacher, TeacherAssignment } from "./store"

export async function fetchTeachers(): Promise<Teacher[]> {
  const { data, error } = await supabase
    .from("teachers")
    .select("id, name, phone, subject")
    .order("name", { ascending: true })

  if (error || !data) return []
  return data as Teacher[]
}

export async function createTeacher(
  name: string,
  phone: string,
  subject: string
): Promise<Teacher | null> {
  const { data, error } = await supabase
    .from("teachers")
    .insert({ name, phone, subject })
    .select("id, name, phone, subject")
    .single()

  if (error || !data) return null
  return data as Teacher
}

export async function deleteTeacherById(id: string): Promise<void> {
  await supabase.from("teachers").delete().eq("id", id)
}

export async function fetchTeacherAssignments(): Promise<TeacherAssignment[]> {
  const { data, error } = await supabase
    .from("teacher_assignments")
    .select("id, teacher_id, grade_id, semester, subject")

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id as string,
    teacherId: row.teacher_id as string,
    gradeId: row.grade_id as number,
    semester: row.semester as string,
    subject: row.subject as string,
  }))
}

export async function createTeacherAssignment(
  teacherId: string,
  gradeId: number,
  semester: string,
  subject: string
): Promise<TeacherAssignment | null> {
  // Remove existing assignment for this combination
  await supabase
    .from("teacher_assignments")
    .delete()
    .eq("grade_id", gradeId)
    .eq("semester", semester)
    .eq("subject", subject)

  const { data, error } = await supabase
    .from("teacher_assignments")
    .insert({
      teacher_id: teacherId,
      grade_id: gradeId,
      semester,
      subject,
    })
    .select("id, teacher_id, grade_id, semester, subject")
    .single()

  if (error || !data) return null

  return {
    id: data.id as string,
    teacherId: data.teacher_id as string,
    gradeId: data.grade_id as number,
    semester: data.semester as string,
    subject: data.subject as string,
  }
}

export async function deleteTeacherAssignmentById(id: string): Promise<void> {
  await supabase.from("teacher_assignments").delete().eq("id", id)
}

