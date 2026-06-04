import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/api/client"
import { fetchStudents, fetchStudentById, fetchStudentsByClass, createStudent, updateStudentById, deleteStudentById } from "@/lib/api/students.api"
import { fetchTeachers, deleteTeacherById, createTeacherAssignment, deleteTeacherAssignmentById } from "@/lib/api/teachers.api"
import { fetchClasses, fetchClassById, fetchAllSchedule, fetchScheduleByClass, fetchAttendanceByStudent, fetchAttendanceByClass } from "@/lib/supabase-school"
import { fetchSubjectFilesByFilter, fetchSubjectFiles } from "@/lib/supabase-files"
import { fetchGrades, fetchGradesByStudent, createGrade, updateGrade, deleteGrade } from "@/lib/api/grades.api"
import { fetchAnalyticsSummary } from "@/lib/api/analytics.api"
import { fetchTeacherAssignments } from "@/lib/supabase-teachers"
import { createClass, updateClassById, deleteClassById } from "@/lib/api/classes.api"
import { createScheduleItem, updateScheduleItem, deleteScheduleItem } from "@/lib/api/schedule.api"
import { createSubjectFile, deleteSubjectFileById } from "@/lib/api/files.api"
import { saveAttendanceRecord } from "@/lib/api/attendance.api"
import type { Student, Teacher, SchoolClass, ScheduleItem, SubjectFile, Grade, TeacherAssignment } from "@/lib/store"

export const adminKeys = {
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

// ── MUTATIONS ──

export function useUpdateAdminProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; email: string }) =>
      client.put("/auth/me", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.authUser })
    },
  })
}

export function useCreateTeacherAccountMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      name: string
      email: string
      password: string
      phone?: string
      assignedSubjects?: string[]
      isHomeroom?: boolean
      classId?: string
    }) => client.post("/teachers/accounts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.teacherAccounts })
    },
  })
}

export function useUpdateTeacherAccountMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: {
        name: string
        email: string
        phone?: string
        assignedSubjects?: string[]
        isHomeroom?: boolean
        classId?: string
      }
    }) => client.put(`/teachers/accounts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.teacherAccounts })
    },
  })
}

export function useToggleTeacherAccountStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.patch(`/teachers/accounts/${id}/status`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.teacherAccounts })
    },
  })
}

export function useDeleteTeacherAccountMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.delete(`/teachers/accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.teacherAccounts })
    },
  })
}

export function useResetTeacherPasswordMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      client.patch(`/teachers/accounts/${id}/reset-password`, { password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.teacherAccounts })
    },
  })
}

// ── STUDENT MUTATIONS ──

export function useCreateStudentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      name: string
      age: number
      classId: string
      parentPhone: string
      notes: string
    }) => createStudent(data.name, data.age, data.classId, data.parentPhone, data.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.students })
      queryClient.invalidateQueries({ queryKey: adminKeys.classes })
    },
  })
}

export function useUpdateStudentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<Pick<Student, "name" | "age" | "classId" | "parentPhone" | "notes">>
    }) => updateStudentById(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.students })
      queryClient.invalidateQueries({ queryKey: adminKeys.student(id) })
    },
  })
}

export function useDeleteStudentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteStudentById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.students })
      queryClient.invalidateQueries({ queryKey: adminKeys.classes })
      queryClient.invalidateQueries({ queryKey: adminKeys.grades })
    },
  })
}

// ── CLASS MUTATIONS ──

export function useCreateClassMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; teacherId?: string | null }) =>
      createClass(data.name, data.teacherId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.classes })
    },
  })
}

export function useUpdateClassMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<Pick<SchoolClass, "name" | "teacherId">>
    }) => updateClassById(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.classes })
      queryClient.invalidateQueries({ queryKey: adminKeys.classById(id) })
    },
  })
}

export function useDeleteClassMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteClassById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.classes })
      queryClient.invalidateQueries({ queryKey: adminKeys.students })
      queryClient.invalidateQueries({ queryKey: adminKeys.schedule })
    },
  })
}

// ── SCHEDULE MUTATIONS ──

export function useCreateScheduleItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      classId: string
      semester: number
      dayOfWeek: number
      periodNumber: number
      subject: string
      teacherId: string | null
      startTime: string
      endTime: string
    }) =>
      createScheduleItem(
        data.classId,
        data.semester,
        data.dayOfWeek,
        data.periodNumber,
        data.subject,
        data.teacherId,
        data.startTime,
        data.endTime
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.schedule })
    },
  })
}

export function useUpdateScheduleItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<Pick<ScheduleItem, "subject" | "teacherId" | "startTime" | "endTime" | "semester">>
    }) => updateScheduleItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.schedule })
    },
  })
}

export function useDeleteScheduleItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteScheduleItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.schedule })
    },
  })
}

// ── GRADE MUTATIONS ──

export function useCreateGradeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      studentId: string
      subject: string
      grade: number
      maxGrade: number
      semester: string
      academicYear: string
      examType: string
      teacherId: string | null
      notes: string
    }) =>
      createGrade(
        data.studentId,
        data.subject,
        data.grade,
        data.maxGrade,
        data.semester,
        data.academicYear,
        data.examType,
        data.teacherId,
        data.notes
      ),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: adminKeys.grades, type: "all" })
      queryClient.refetchQueries({ queryKey: ["admin", "grades", "student"], type: "all" })
      queryClient.refetchQueries({ queryKey: adminKeys.students, type: "all" })
      queryClient.refetchQueries({ queryKey: adminKeys.analytics, type: "all" })
      queryClient.refetchQueries({ queryKey: ["teacher", "grades"], type: "all" })
      queryClient.refetchQueries({ queryKey: ["teacher", "grades", "student"], type: "all" })
      queryClient.refetchQueries({ queryKey: ["teacher", "analytics"], type: "all" })
    },
  })
}

export function useUpdateGradeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<Pick<Grade, "subject" | "grade" | "maxGrade" | "semester" | "academicYear" | "examType" | "teacherId" | "notes">>
    }) => updateGrade(id, updates),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: adminKeys.grades, type: "all" })
      queryClient.refetchQueries({ queryKey: ["admin", "grades", "student"], type: "all" })
      queryClient.refetchQueries({ queryKey: adminKeys.students, type: "all" })
      queryClient.refetchQueries({ queryKey: adminKeys.analytics, type: "all" })
      queryClient.refetchQueries({ queryKey: ["teacher", "grades"], type: "all" })
      queryClient.refetchQueries({ queryKey: ["teacher", "grades", "student"], type: "all" })
      queryClient.refetchQueries({ queryKey: ["teacher", "analytics"], type: "all" })
    },
  })
}

export function useDeleteGradeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteGrade,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: adminKeys.grades, type: "all" })
      queryClient.refetchQueries({ queryKey: ["admin", "grades", "student"], type: "all" })
      queryClient.refetchQueries({ queryKey: adminKeys.students, type: "all" })
      queryClient.refetchQueries({ queryKey: adminKeys.analytics, type: "all" })
      queryClient.refetchQueries({ queryKey: ["teacher", "grades"], type: "all" })
      queryClient.refetchQueries({ queryKey: ["teacher", "grades", "student"], type: "all" })
      queryClient.refetchQueries({ queryKey: ["teacher", "analytics"], type: "all" })
    },
  })
}

// ── FILE MUTATIONS ──

export function useCreateSubjectFileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      gradeId: number
      semester: string
      subject: string
      teacherId: string
      title: string
      description: string
      type: SubjectFile["type"]
      url: string
    }) =>
      createSubjectFile(
        data.gradeId,
        data.semester,
        data.subject,
        data.teacherId,
        data.title,
        data.description,
        data.type,
        data.url
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.allFiles })
    },
  })
}

export function useDeleteSubjectFileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteSubjectFileById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.allFiles })
    },
  })
}

// ── ATTENDANCE MUTATIONS ──

export function useSaveAttendanceMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      classId: string
      date: string
      records: { studentId: string; present: boolean }[]
    }) => saveAttendanceRecord(data.classId, data.date, data.records),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.attendanceByClass() })
    },
  })
}

// ── TEACHER ASSIGNMENT MUTATIONS ──

export function useCreateTeacherAssignmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      teacherId: string
      gradeId: number
      semester: string
      subject: string
      classId?: string
    }) =>
      createTeacherAssignment(
        data.teacherId,
        data.gradeId,
        data.semester,
        data.subject,
        data.classId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.teacherAssignments })
      queryClient.invalidateQueries({ queryKey: adminKeys.teachers })
      queryClient.invalidateQueries({ queryKey: adminKeys.teacherAccounts })
      // Force complete reset of teacherAccounts cache so next mount always fetches fresh
      queryClient.resetQueries({ queryKey: adminKeys.teacherAccounts })
    },
  })
}

export function useDeleteTeacherAssignmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTeacherAssignmentById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.teacherAssignments })
      queryClient.invalidateQueries({ queryKey: adminKeys.teachers })
      queryClient.invalidateQueries({ queryKey: adminKeys.teacherAccounts })
      // Force complete reset of teacherAccounts cache so next mount always fetches fresh
      queryClient.resetQueries({ queryKey: adminKeys.teacherAccounts })
    },
  })
}

// ── TEACHER MUTATIONS ──

export function useDeleteTeacherMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTeacherById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.teachers })
      queryClient.invalidateQueries({ queryKey: adminKeys.teacherAssignments })
    },
  })
}
