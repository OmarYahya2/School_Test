import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getTeacherProfile,
  getTeacherStudents,
  getTeacherGrades,
  getTeacherAnalytics,
  getTeacherSchedule,
  getTeacherFiles,
  getTeacherClass,
  createTeacherGrade,
  updateTeacherGrade,
  deleteTeacherGrade,
  createTeacherStudent,
  updateTeacherStudent,
  deleteTeacherStudent,
  saveTeacherAttendance,
  createTeacherFile,
  updateTeacherFile,
  deleteTeacherFile,
  type TeacherProfile,
  type TeacherStudent,
  type TeacherGrade,
  type TeacherScheduleItem,
  type TeacherFile,
  type TeacherAnalytics,
} from "@/lib/api/teacher.api"
import { fetchAttendanceByClassRaw } from "@/lib/api/attendance.api"
import { fetchStudentById } from "@/lib/api/students.api"
import { fetchGradesByStudent } from "@/lib/api/grades.api"
import { fetchAttendanceByStudent } from "@/lib/api/attendance.api"
import type { AttendanceRecord, Grade, Student } from "@/lib/store"
import { adminKeys } from "./use-admin-data"

const teacherKeys = {
  profile: ["teacher", "profile"] as const,
  students: ["teacher", "students"] as const,
  student: (id?: string) => ["teacher", "student", id] as const,
  classData: (classId?: string) => ["teacher", "class", classId] as const,
  grades: ["teacher", "grades"] as const,
  gradesByStudent: (studentId?: string) => ["teacher", "grades", "student", studentId] as const,
  analytics: (classId?: string) => ["teacher", "analytics", classId] as const,
  schedule: ["teacher", "schedule"] as const,
  files: ["teacher", "files"] as const,
  attendance: (classId?: string) => ["teacher", "attendance", classId] as const,
  attendanceByStudent: (studentId?: string) => ["teacher", "attendance", "student", studentId] as const,
}

export function useTeacherProfile() {
  return useQuery<TeacherProfile | null>({
    queryKey: teacherKeys.profile,
    queryFn: getTeacherProfile,
    staleTime: 1000 * 60 * 10,
  })
}

export function useTeacherStudents() {
  return useQuery<TeacherStudent[]>({
    queryKey: teacherKeys.students,
    queryFn: getTeacherStudents,
    staleTime: 1000 * 60 * 3,
  })
}

export function useTeacherClass(classId?: string) {
  return useQuery({
    queryKey: teacherKeys.classData(classId),
    queryFn: () => getTeacherClass(classId),
    staleTime: 1000 * 60 * 3,
    enabled: true,
  })
}

export function useTeacherGrades() {
  return useQuery<TeacherGrade[]>({
    queryKey: teacherKeys.grades,
    queryFn: getTeacherGrades,
    staleTime: 1000 * 60 * 3,
  })
}

export function useTeacherAnalytics(classId?: string) {
  return useQuery<TeacherAnalytics | null>({
    queryKey: teacherKeys.analytics(classId),
    queryFn: () => getTeacherAnalytics(classId),
    staleTime: 1000 * 60 * 5,
  })
}

export function useTeacherSchedule() {
  return useQuery<TeacherScheduleItem[]>({
    queryKey: teacherKeys.schedule,
    queryFn: getTeacherSchedule,
    staleTime: 1000 * 60 * 5,
  })
}

export function useTeacherFiles() {
  return useQuery<TeacherFile[]>({
    queryKey: teacherKeys.files,
    queryFn: getTeacherFiles,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateTeacherGrade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTeacherGrade,
    onSuccess: (newGrade) => {
      const ng = newGrade as TeacherGrade & { student?: { id: string } }
      const studentId = ng.student?.id || (ng as any).studentId
      // Update teacher/grades immediately
      queryClient.setQueryData<TeacherGrade[]>(teacherKeys.grades, (old = []) => [ng, ...old])
      // Immediately refetch all related grade queries
      queryClient.refetchQueries({ queryKey: teacherKeys.gradesByStudent(studentId), type: "all" })
      queryClient.refetchQueries({ queryKey: teacherKeys.analytics(), type: "all" })
      queryClient.refetchQueries({ queryKey: adminKeys.grades, type: "all" })
      queryClient.refetchQueries({ queryKey: adminKeys.gradesByStudent(studentId), type: "all" })
      queryClient.refetchQueries({ queryKey: adminKeys.analytics, type: "all" })
      queryClient.refetchQueries({ queryKey: adminKeys.students, type: "all" }) // Dashboard student list might show averages
    },
  })
}

export function useUpdateTeacherGrade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TeacherGrade> }) => updateTeacherGrade(id, data),
    onSuccess: (updatedGrade) => {
      const ug = updatedGrade as TeacherGrade
      const studentId = ug.student?.id
      // Immediately replace grade in teacher/grades cache
      queryClient.setQueryData<TeacherGrade[]>(teacherKeys.grades, (old = []) =>
        old.map((g) => (g.id === ug.id ? ug : g))
      )
      // Immediately refetch all related grade queries
      queryClient.refetchQueries({ queryKey: teacherKeys.gradesByStudent(studentId), type: "all" })
      queryClient.refetchQueries({ queryKey: teacherKeys.analytics(), type: "all" })
      queryClient.refetchQueries({ queryKey: adminKeys.grades, type: "all" })
      queryClient.refetchQueries({ queryKey: adminKeys.gradesByStudent(studentId), type: "all" })
      queryClient.refetchQueries({ queryKey: adminKeys.analytics, type: "all" })
      queryClient.refetchQueries({ queryKey: adminKeys.students, type: "all" })
    },
  })
}

export function useDeleteTeacherGrade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTeacherGrade,
    onSuccess: (_, deletedId) => {
      // Immediately remove grade from teacher/grades cache
      queryClient.setQueryData<TeacherGrade[]>(teacherKeys.grades, (old = []) =>
        old.filter((g) => g.id !== deletedId)
      )
      // We don't know the exact studentId here easily, so we invalidate the prefix pattern
      queryClient.refetchQueries({ queryKey: ["teacher", "grades", "student"], type: "all" })
      queryClient.refetchQueries({ queryKey: teacherKeys.analytics(), type: "all" })
      queryClient.refetchQueries({ queryKey: adminKeys.grades, type: "all" })
      queryClient.refetchQueries({ queryKey: ["admin", "grades", "student"], type: "all" })
      queryClient.refetchQueries({ queryKey: adminKeys.analytics, type: "all" })
      queryClient.refetchQueries({ queryKey: adminKeys.students, type: "all" })
    },
  })
}

export function useTeacherAttendance(classId?: string) {
  return useQuery<AttendanceRecord[]>({
    queryKey: teacherKeys.attendance(classId),
    queryFn: () => fetchAttendanceByClassRaw(classId || ""),
    staleTime: 1000 * 60 * 3,
    enabled: !!classId,
  })
}

export function useTeacherStudent(id?: string) {
  return useQuery<Student | null>({
    queryKey: teacherKeys.student(id),
    queryFn: () => fetchStudentById(id || ""),
    staleTime: 1000 * 60 * 3,
    enabled: !!id,
  })
}

export function useTeacherGradesByStudent(studentId?: string) {
  return useQuery<Grade[]>({
    queryKey: teacherKeys.gradesByStudent(studentId),
    queryFn: () => fetchGradesByStudent(studentId || ""),
    staleTime: 1000 * 60 * 3,
    enabled: !!studentId,
  })
}

export function useTeacherAttendanceByStudent(studentId?: string) {
  return useQuery<{ date: string; present: boolean }[]>({
    queryKey: teacherKeys.attendanceByStudent(studentId),
    queryFn: () => fetchAttendanceByStudent(studentId || ""),
    staleTime: 1000 * 60 * 3,
    enabled: !!studentId,
  })
}

// ── TEACHER STUDENT MUTATIONS ──

export function useCreateTeacherStudentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTeacherStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.students })
    },
  })
}

export function useUpdateTeacherStudentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TeacherStudent> }) =>
      updateTeacherStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.students })
    },
  })
}

export function useDeleteTeacherStudentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTeacherStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.students })
    },
  })
}

// ── TEACHER FILE MUTATIONS ──

export function useCreateTeacherFileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTeacherFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.files })
      queryClient.invalidateQueries({ queryKey: adminKeys.allFiles })
    },
  })
}

export function useUpdateTeacherFileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TeacherFile> }) => updateTeacherFile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.files })
      queryClient.invalidateQueries({ queryKey: adminKeys.allFiles })
    },
  })
}

export function useDeleteTeacherFileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTeacherFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.files })
      queryClient.invalidateQueries({ queryKey: adminKeys.allFiles })
    },
  })
}

// ── TEACHER ATTENDANCE MUTATIONS ──

export function useSaveTeacherAttendanceMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { classId: string; date: string; records: any[] }) =>
      saveTeacherAttendance(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.attendance(variables.classId) })
      queryClient.invalidateQueries({ queryKey: ["teacher", "attendance", "student"] })
      queryClient.invalidateQueries({ queryKey: teacherKeys.analytics(variables.classId) })
      queryClient.invalidateQueries({ queryKey: adminKeys.attendanceByClass(variables.classId) })
      queryClient.invalidateQueries({ queryKey: ["admin", "attendance", "student"] })
      queryClient.invalidateQueries({ queryKey: adminKeys.analytics })
    },
  })
}
