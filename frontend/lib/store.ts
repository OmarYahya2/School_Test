export interface User {
  id: string
  name: string
  email: string
  password: string
}

export interface Teacher {
  id: string
  name: string
  phone: string
  subject: string
}

export interface Student {
  id: string
  name: string
  age: number
  classId: string
  parentPhone: string
  notes: string
  createdAt: string
}

export interface SchoolClass {
  id: string
  name: string
  teacherId: string | null
  notes: string
  createdAt: string
}

export interface AttendanceRecord {
  id: string
  classId: string
  date: string
  records: { studentId: string; present: boolean }[]
}

export interface SubjectFile {
  id: string
  gradeId: number
  semester: string
  subject: string
  teacherId: string
  title: string
  description: string
  type: "pdf" | "image" | "link" | "document"
  url: string
  createdAt: string
}

export interface ScheduleItem {
  id: string
  classId: string
  semester: number // 1 = First Semester, 2 = Second Semester
  dayOfWeek: number // 0 = Sunday, 1 = Monday, ..., 4 = Thursday
  periodNumber: number // 1, 2, 3, 4, 5, 6, 7, 8
  subject: string
  teacherId: string | null
  startTime: string // e.g., "08:00"
  endTime: string // e.g., "08:45"
}

export interface TeacherAssignment {
  id: string
  teacherId: string
  classId?: string
  gradeId: number
  semester: string
  subject: string
}

export interface Grade {
  id: string
  studentId: string
  subject: string
  grade: number
  maxGrade: number
  semester: string
  academicYear: string
  examType: string
  teacherId: string | null
  notes: string
  createdAt: string
}
