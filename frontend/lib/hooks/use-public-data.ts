import { useQuery } from "@tanstack/react-query"
import { fetchClasses, fetchAllSchedule } from "@/lib/supabase-school"
import { fetchTeacherAssignments, fetchTeachers } from "@/lib/supabase-teachers"
import { fetchSubjectFilesByFilter } from "@/lib/supabase-files"
import { verifyQRToken } from "@/lib/api/qr.api"
import type { QRVerifyResult } from "@/lib/api/qr.api"
import type { SchoolClass, ScheduleItem, Teacher, TeacherAssignment, SubjectFile } from "@/lib/store"

const publicKeys = {
  classes: ["public", "classes"] as const,
  schedule: ["public", "schedule"] as const,
  teachers: ["public", "teachers"] as const,
  teacherAssignments: ["public", "teacherAssignments"] as const,
  files: (gradeId?: number, semester?: string, subject?: string) =>
    ["public", "files", gradeId, semester, subject] as const,
  qrToken: (token?: string) => ["public", "qrToken", token] as const,
}

export function usePublicClasses() {
  return useQuery<SchoolClass[]>({
    queryKey: publicKeys.classes,
    queryFn: fetchClasses,
    staleTime: 1000 * 60 * 5,
  })
}

export function usePublicSchedule() {
  return useQuery<ScheduleItem[]>({
    queryKey: publicKeys.schedule,
    queryFn: fetchAllSchedule,
    staleTime: 1000 * 60 * 5,
  })
}

export function usePublicTeachers() {
  return useQuery<Teacher[]>({
    queryKey: publicKeys.teachers,
    queryFn: fetchTeachers,
    staleTime: 1000 * 60 * 5,
  })
}

export function usePublicTeacherAssignments() {
  return useQuery<TeacherAssignment[]>({
    queryKey: publicKeys.teacherAssignments,
    queryFn: fetchTeacherAssignments,
    staleTime: 1000 * 60 * 5,
  })
}

export function usePublicFiles(gradeId?: number, semester?: string, subject?: string) {
  return useQuery<SubjectFile[]>({
    queryKey: publicKeys.files(gradeId, semester, subject),
    queryFn: () => fetchSubjectFilesByFilter(gradeId ?? 0, semester ?? "", subject ?? ""),
    staleTime: 1000 * 60 * 3,
    enabled: !!subject,
  })
}

export function usePublicQRToken(token?: string) {
  return useQuery<QRVerifyResult | null>({
    queryKey: publicKeys.qrToken(token),
    queryFn: () => verifyQRToken(token || ""),
    staleTime: 1000 * 60 * 5,
    enabled: !!token,
  })
}
