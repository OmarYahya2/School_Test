import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/api/client"
import { fetchStudents, fetchStudentById, fetchStudentsByClass } from "@/lib/api/students.api"
import { fetchTeachers } from "@/lib/api/teachers.api"
import { fetchClasses, fetchClassById, fetchAllSchedule, fetchScheduleByClass, fetchAttendanceByStudent, fetchAttendanceByClass } from "@/lib/supabase-school"
import { fetchSubjectFilesByFilter, fetchSubjectFiles } from "@/lib/supabase-files"
import { fetchGrades, fetchGradesByStudent } from "@/lib/api/grades.api"
import { fetchAnalyticsSummary } from "@/lib/api/analytics.api"
import { fetchTeacherAssignments } from "@/lib/supabase-teachers"
import type { Student, Teacher, SchoolClass, ScheduleItem, SubjectFile, Grade, TeacherAssignment } from "@/lib/store"

const adminKeys = {
  students: ["admin", "students"] as const,
  student: (id: string) => ["admin", "student", id] as const,
  teachers: ["admin", "teachers"] as const,
  classes: ["admin", "classes"] as const,
  schedule: ["admin", "schedule"] as const,
  files: (gradeId?: number, semester?: string, subject?: string) => ["admin", "files", gradeId, semester, subject] as const,
  allFiles: ["admin", "files", "all"] as const,
  grades: ["admin", "grades"] as const,
  analytics: ["admin", "analytics"] as const,
  teacherAssignments: ["admin", "teacherAssignments"] as const,
  teacherAccounts: ["admin", "teacherAccounts"] as const,
  authUser: ["admin", "authUser"] as const,
  scheduleByClass: (classId?: string, semester?: number) => ["admin", "schedule", "class", classId, semester] as const,
  classById: (id?: string) => ["admin", "class", id] as const,
  studentsByClass: (classId?: string) => ["admin", "students", "class", classId] as const,
  gradesByStudent: (studentId?: string) => ["admin", "grades", "student", studentId] as const,
  attendanceByStudent: (studentId?: string) => ["admin", "attendance", "student", studentId] as const,
  attendanceByClass: (classId?: string) => ["admin", "attendance", "class", classId] as const,
}

export function useAdminStudents() {
  return useQuery<Student[]>({
    queryKey: adminKeys.students,
    queryFn: fetchStudents,
    staleTime: 1000 * 60 * 3,
  })
}

export function useAdminStudent(id: string) {
  return useQuery<Student | null>({
    queryKey: adminKeys.student(id),
    queryFn: () => fetchStudentById(id),
    staleTime: 1000 * 60 * 3,
    enabled: !!id,
  })
}

export function useAdminTeachers() {
  return useQuery<Teacher[]>({
    queryKey: adminKeys.teachers,
    queryFn: fetchTeachers,
    staleTime: 1000 * 60 * 3,
  })
}

export function useAdminClasses() {
  return useQuery<SchoolClass[]>({
    queryKey: adminKeys.classes,
    queryFn: fetchClasses,
    staleTime: 1000 * 60 * 5,
  })
}

export function useAdminSchedule() {
  return useQuery<ScheduleItem[]>({
    queryKey: adminKeys.schedule,
    queryFn: fetchAllSchedule,
    staleTime: 1000 * 60 * 5,
  })
}

export function useAdminFiles(gradeId?: number, semester?: string, subject?: string) {
  return useQuery<SubjectFile[]>({
    queryKey: adminKeys.files(gradeId, semester, subject),
    queryFn: () => fetchSubjectFilesByFilter(gradeId ?? 0, semester ?? "", subject ?? ""),
    staleTime: 1000 * 60 * 3,
    enabled: true,
  })
}

export function useAdminGrades() {
  return useQuery<Grade[]>({
    queryKey: adminKeys.grades,
    queryFn: fetchGrades,
    staleTime: 1000 * 60 * 3,
  })
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: adminKeys.analytics,
    queryFn: fetchAnalyticsSummary,
    staleTime: 1000 * 60 * 5,
  })
}

export function useAdminTeacherAssignments() {
  return useQuery<TeacherAssignment[]>({
    queryKey: adminKeys.teacherAssignments,
    queryFn: fetchTeacherAssignments,
    staleTime: 1000 * 60 * 5,
  })
}

export function useAdminScheduleByClass(classId?: string, semester?: number) {
  return useQuery<ScheduleItem[]>({
    queryKey: adminKeys.scheduleByClass(classId, semester),
    queryFn: () => fetchScheduleByClass(classId || "", semester),
    staleTime: 1000 * 60 * 3,
    enabled: !!classId,
  })
}

export function useAdminAuthUser() {
  return useQuery<{ id: string; name: string; email: string; role?: string; createdAt?: string } | null>({
    queryKey: adminKeys.authUser,
    queryFn: async () => {
      try {
        return await client.get("/auth/me")
      } catch {
        return null
      }
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useAdminTeacherAccounts() {
  return useQuery<any[]>({
    queryKey: adminKeys.teacherAccounts,
    queryFn: async () => {
      try {
        return await client.get("/teachers/accounts")
      } catch {
        return []
      }
    },
    staleTime: 1000 * 60 * 3,
  })
}

export function useAdminClass(id?: string) {
  return useQuery<SchoolClass | null>({
    queryKey: adminKeys.classById(id),
    queryFn: () => fetchClassById(id || ""),
    staleTime: 1000 * 60 * 3,
    enabled: !!id,
  })
}

export function useAdminStudentsByClass(classId?: string) {
  return useQuery<Student[]>({
    queryKey: adminKeys.studentsByClass(classId),
    queryFn: () => fetchStudentsByClass(classId || ""),
    staleTime: 1000 * 60 * 3,
    enabled: !!classId,
  })
}

export function useAdminGradesByStudent(studentId?: string) {
  return useQuery<Grade[]>({
    queryKey: adminKeys.gradesByStudent(studentId),
    queryFn: () => fetchGradesByStudent(studentId || ""),
    staleTime: 1000 * 60 * 3,
    enabled: !!studentId,
  })
}

export function useAdminAttendanceByStudent(studentId?: string) {
  return useQuery<{ date: string; present: boolean }[]>({
    queryKey: adminKeys.attendanceByStudent(studentId),
    queryFn: () => fetchAttendanceByStudent(studentId || ""),
    staleTime: 1000 * 60 * 3,
    enabled: !!studentId,
  })
}

export function useAdminAllFiles() {
  return useQuery<SubjectFile[]>({
    queryKey: adminKeys.allFiles,
    queryFn: fetchSubjectFiles,
    staleTime: 1000 * 60 * 3,
  })
}

export function useAdminAttendanceByClass(classId?: string) {
  return useQuery<import("@/lib/supabase-school").AttendanceWithNames[]>({
    queryKey: adminKeys.attendanceByClass(classId),
    queryFn: () => fetchAttendanceByClass(classId || ""),
    staleTime: 1000 * 60 * 3,
    enabled: !!classId,
  })
}
