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
  type TeacherProfile,
  type TeacherStudent,
  type TeacherGrade,
  type TeacherScheduleItem,
  type TeacherFile,
  type TeacherAnalytics,
} from "@/lib/api/teacher.api"
import { fetchAttendanceByClassRaw } from "@/lib/api/attendance.api"
import type { AttendanceRecord } from "@/lib/store"

const teacherKeys = {
  profile: ["teacher", "profile"] as const,
  students: ["teacher", "students"] as const,
  classData: (classId?: string) => ["teacher", "class", classId] as const,
  grades: ["teacher", "grades"] as const,
  analytics: (classId?: string) => ["teacher", "analytics", classId] as const,
  schedule: ["teacher", "schedule"] as const,
  files: ["teacher", "files"] as const,
  attendance: (classId?: string) => ["teacher", "attendance", classId] as const,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.grades })
    },
  })
}

export function useUpdateTeacherGrade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TeacherGrade> }) => updateTeacherGrade(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.grades })
    },
  })
}

export function useDeleteTeacherGrade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTeacherGrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.grades })
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
