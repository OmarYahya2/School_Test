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

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

// --- Users ---
export function getUsers(): User[] {
  return getItem<User[]>("school_users", [])
}

export function registerUser(name: string, email: string, password: string): User | null {
  const users = getUsers()
  if (users.find((u) => u.email === email)) return null
  const user: User = { id: generateId(), name, email, password }
  setItem("school_users", [...users, user])
  return user
}

export function loginUser(email: string, password: string): User | null {
  const users = getUsers()
  return users.find((u) => u.email === email && u.password === password) || null
}

export function getCurrentUser(): User | null {
  return getItem<User | null>("school_current_user", null)
}

export function setCurrentUser(user: User | null): void {
  setItem("school_current_user", user)
}

// --- Classes ---
export function getClasses(): SchoolClass[] {
  return getItem<SchoolClass[]>("school_classes", [])
}

export function addClass(name: string): SchoolClass {
  const classes = getClasses()
  const newClass: SchoolClass = {
    id: generateId(),
    name,
    teacherId: null,
    notes: "",
    createdAt: new Date().toISOString(),
  }
  setItem("school_classes", [...classes, newClass])
  return newClass
}

export function updateClass(id: string, updates: Partial<SchoolClass>): SchoolClass | null {
  const classes = getClasses()
  const idx = classes.findIndex((c) => c.id === id)
  if (idx === -1) return null
  classes[idx] = { ...classes[idx], ...updates }
  setItem("school_classes", classes)
  return classes[idx]
}

export function deleteClass(id: string): void {
  const classes = getClasses().filter((c) => c.id !== id)
  setItem("school_classes", classes)
  // Also delete students in this class
  const students = getStudents().filter((s) => s.classId !== id)
  setItem("school_students", students)
  // Also delete attendance for this class
  const attendance = getAttendance().filter((a) => a.classId !== id)
  setItem("school_attendance", attendance)
}

// --- Students ---
export function getStudents(): Student[] {
  return getItem<Student[]>("school_students", [])
}

export function getStudentsByClass(classId: string): Student[] {
  return getStudents().filter((s) => s.classId === classId)
}

export function getStudentById(id: string): Student | null {
  return getStudents().find((s) => s.id === id) || null
}

export function addStudent(
  name: string,
  age: number,
  classId: string,
  parentPhone: string,
  notes: string
): Student {
  const students = getStudents()
  const student: Student = {
    id: generateId(),
    name,
    age,
    classId,
    parentPhone,
    notes,
    createdAt: new Date().toISOString(),
  }
  setItem("school_students", [...students, student])
  return student
}

export function updateStudent(id: string, updates: Partial<Student>): Student | null {
  const students = getStudents()
  const idx = students.findIndex((s) => s.id === id)
  if (idx === -1) return null
  students[idx] = { ...students[idx], ...updates }
  setItem("school_students", students)
  return students[idx]
}

export function deleteStudent(id: string): void {
  const students = getStudents().filter((s) => s.id !== id)
  setItem("school_students", students)
}

// --- Teachers ---
export function getTeachers(): Teacher[] {
  return getItem<Teacher[]>("school_teachers", [])
}

export function addTeacher(name: string, phone: string, subject: string): Teacher {
  const teachers = getTeachers()
  const teacher: Teacher = { id: generateId(), name, phone, subject }
  setItem("school_teachers", [...teachers, teacher])
  return teacher
}

export function deleteTeacher(id: string): void {
  const teachers = getTeachers().filter((t) => t.id !== id)
  setItem("school_teachers", teachers)
  // Remove teacher from any classes
  const classes = getClasses().map((c) => (c.teacherId === id ? { ...c, teacherId: null } : c))
  setItem("school_classes", classes)
}

// --- Attendance ---
export function getAttendance(): AttendanceRecord[] {
  return getItem<AttendanceRecord[]>("school_attendance", [])
}

export function getAttendanceByClass(classId: string): AttendanceRecord[] {
  return getAttendance().filter((a) => a.classId === classId)
}

export function saveAttendance(
  classId: string,
  date: string,
  records: { studentId: string; present: boolean }[]
): AttendanceRecord {
  const all = getAttendance()
  const existingIdx = all.findIndex((a) => a.classId === classId && a.date === date)
  const record: AttendanceRecord = {
    id: existingIdx >= 0 ? all[existingIdx].id : generateId(),
    classId,
    date,
    records,
  }
  if (existingIdx >= 0) {
    all[existingIdx] = record
  } else {
    all.push(record)
  }
  setItem("school_attendance", all)
  return record
}

// --- Subject Files ---
export function getSubjectFiles(): SubjectFile[] {
  return getItem<SubjectFile[]>("school_subject_files", [])
}

export function getSubjectFilesByFilter(
  gradeId: number,
  semester: string,
  subject: string
): SubjectFile[] {
  return getSubjectFiles().filter(
    (f) => f.gradeId === gradeId && f.semester === semester && f.subject === subject
  )
}

export function addSubjectFile(
  gradeId: number,
  semester: string,
  subject: string,
  teacherId: string,
  title: string,
  description: string,
  type: SubjectFile["type"],
  url: string
): SubjectFile {
  const files = getSubjectFiles()
  const file: SubjectFile = {
    id: generateId(),
    gradeId,
    semester,
    subject,
    teacherId,
    title,
    description,
    type,
    url,
    createdAt: new Date().toISOString(),
  }
  setItem("school_subject_files", [...files, file])
  return file
}

export function deleteSubjectFile(id: string): void {
  const files = getSubjectFiles().filter((f) => f.id !== id)
  setItem("school_subject_files", files)
}

// --- Teacher Assignments ---
export function getTeacherAssignments(): TeacherAssignment[] {
  return getItem<TeacherAssignment[]>("school_teacher_assignments", [])
}

export function getTeacherForSubject(
  gradeId: number,
  semester: string,
  subject: string
): TeacherAssignment | null {
  return (
    getTeacherAssignments().find(
      (a) => a.gradeId === gradeId && a.semester === semester && a.subject === subject
    ) || null
  )
}

export function assignTeacherToSubject(
  teacherId: string,
  gradeId: number,
  semester: string,
  subject: string
): TeacherAssignment {
  const assignments = getTeacherAssignments()
  // Remove existing assignment for this grade+semester+subject
  const filtered = assignments.filter(
    (a) => !(a.gradeId === gradeId && a.semester === semester && a.subject === subject)
  )
  const assignment: TeacherAssignment = {
    id: generateId(),
    teacherId,
    gradeId,
    semester,
    subject,
  }
  setItem("school_teacher_assignments", [...filtered, assignment])
  return assignment
}

export function removeTeacherAssignment(id: string): void {
  const assignments = getTeacherAssignments().filter((a) => a.id !== id)
  setItem("school_teacher_assignments", assignments)
}

export function getAssignmentsByTeacher(teacherId: string): TeacherAssignment[] {
  return getTeacherAssignments().filter((a) => a.teacherId === teacherId)
}
