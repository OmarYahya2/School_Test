import { supabase } from "./supabaseClient"
import type { SchoolClass, Student, AttendanceRecord, ScheduleItem, Teacher, Grade } from "./store"

// ===== Classes =====

export async function fetchClasses(): Promise<SchoolClass[]> {
  const { data, error } = await supabase
    .from("classes")
    .select("id, name, teacher_id, created_at")
    .order("created_at", { ascending: true })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    teacherId: (row.teacher_id as string | null) ?? null,
    createdAt: row.created_at as string,
  }))
}

export async function fetchClassById(id: string): Promise<SchoolClass | null> {
  const { data, error } = await supabase
    .from("classes")
    .select("id, name, teacher_id, created_at")
    .eq("id", id)
    .single()

  if (error || !data) return null

  return {
    id: data.id as string,
    name: data.name as string,
    teacherId: (data.teacher_id as string | null) ?? null,
    createdAt: data.created_at as string,
  }
}

export async function createClass(name: string): Promise<SchoolClass | null> {
  const { data, error } = await supabase
    .from("classes")
    .insert({ name })
    .select("id, name, teacher_id, created_at")
    .single()

  if (error || !data) return null

  return {
    id: data.id as string,
    name: data.name as string,
    teacherId: (data.teacher_id as string | null) ?? null,
    createdAt: data.created_at as string,
  }
}

export async function updateClassById(
  id: string,
  updates: Partial<Pick<SchoolClass, "name" | "teacherId">>
): Promise<SchoolClass | null> {
  const payload: Record<string, unknown> = {}
  if (typeof updates.name === "string") payload.name = updates.name
  if (updates.teacherId !== undefined) payload.teacher_id = updates.teacherId

  const { data, error } = await supabase
    .from("classes")
    .update(payload)
    .eq("id", id)
    .select("id, name, teacher_id, created_at")
    .single()

  if (error || !data) return null

  return {
    id: data.id as string,
    name: data.name as string,
    teacherId: (data.teacher_id as string | null) ?? null,
    createdAt: data.created_at as string,
  }
}

export async function deleteClassById(id: string): Promise<void> {
  await supabase.from("classes").delete().eq("id", id)
}

// ===== Students =====

export async function fetchStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from("students")
    .select("id, name, age, class_id, parent_phone, notes, created_at")

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    age: row.age as number,
    classId: row.class_id as string,
    parentPhone: (row.parent_phone as string) || "",
    notes: (row.notes as string) || "",
    createdAt: row.created_at as string,
  }))
}

export async function fetchStudentsByClass(
  classId: string
): Promise<Student[]> {
  const { data, error } = await supabase
    .from("students")
    .select("id, name, age, class_id, parent_phone, notes, created_at")
    .eq("class_id", classId)
    .order("created_at", { ascending: true })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    age: row.age as number,
    classId: row.class_id as string,
    parentPhone: (row.parent_phone as string) || "",
    notes: (row.notes as string) || "",
    createdAt: row.created_at as string,
  }))
}

export async function fetchStudentById(
  id: string
): Promise<Student | null> {
  const { data, error } = await supabase
    .from("students")
    .select("id, name, age, class_id, parent_phone, notes, created_at")
    .eq("id", id)
    .single()

  if (error || !data) return null

  return {
    id: data.id as string,
    name: data.name as string,
    age: data.age as number,
    classId: data.class_id as string,
    parentPhone: (data.parent_phone as string) || "",
    notes: (data.notes as string) || "",
    createdAt: data.created_at as string,
  }
}

export async function createStudent(
  name: string,
  age: number,
  classId: string,
  parentPhone: string,
  notes: string
): Promise<Student | null> {
  const { data, error } = await supabase
    .from("students")
    .insert({
      name,
      age,
      class_id: classId,
      parent_phone: parentPhone,
      notes,
    })
    .select("id, name, age, class_id, parent_phone, notes, created_at")
    .single()

  if (error || !data) return null

  return {
    id: data.id as string,
    name: data.name as string,
    age: data.age as number,
    classId: data.class_id as string,
    parentPhone: (data.parent_phone as string) || "",
    notes: (data.notes as string) || "",
    createdAt: data.created_at as string,
  }
}

export async function updateStudentById(
  id: string,
  updates: Partial<Pick<Student, "name" | "age" | "parentPhone" | "notes">>
): Promise<Student | null> {
  const payload: Record<string, unknown> = {}
  if (typeof updates.name === "string") payload.name = updates.name
  if (typeof updates.age === "number") payload.age = updates.age
  if (updates.parentPhone !== undefined)
    payload.parent_phone = updates.parentPhone
  if (updates.notes !== undefined) payload.notes = updates.notes

  const { data, error } = await supabase
    .from("students")
    .update(payload)
    .eq("id", id)
    .select("id, name, age, class_id, parent_phone, notes, created_at")
    .single()

  if (error || !data) return null

  return {
    id: data.id as string,
    name: data.name as string,
    age: data.age as number,
    classId: data.class_id as string,
    parentPhone: (data.parent_phone as string) || "",
    notes: (data.notes as string) || "",
    createdAt: data.created_at as string,
  }
}

export async function deleteStudentById(id: string): Promise<void> {
  await supabase.from("students").delete().eq("id", id)
}

// ===== Attendance =====

export async function fetchAttendanceByClass(
  classId: string
): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from("attendance_records")
    .select("id, class_id, date, records")
    .eq("class_id", classId)

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id as string,
    classId: row.class_id as string,
    date: row.date as string,
    records: (row.records as AttendanceRecord["records"]) || [],
  }))
}

export async function saveAttendanceRecord(
  classId: string,
  date: string,
  records: { studentId: string; present: boolean }[]
): Promise<AttendanceRecord | null> {
  const { data, error } = await supabase
    .from("attendance_records")
    .upsert(
      {
        class_id: classId,
        date,
        records,
      },
      {
        onConflict: "class_id,date",
      }
    )
    .select("id, class_id, date, records")
    .single()

  if (error || !data) return null

  return {
    id: data.id as string,
    classId: data.class_id as string,
    date: data.date as string,
    records: (data.records as AttendanceRecord["records"]) || [],
  }
}

// Fetch attendance records for a specific student
export async function fetchAttendanceByStudent(
  studentId: string
): Promise<{ date: string; present: boolean }[]> {
  const { data, error } = await supabase
    .from("attendance_records")
    .select("date, records")
    .order("date", { ascending: false })

  if (error || !data) return []

  // Filter records for the specific student
  const studentRecords: { date: string; present: boolean }[] = []
  
  data.forEach((record) => {
    const records = record.records as { studentId: string; present: boolean }[] || []
    const studentRecord = records.find((r) => r.studentId === studentId)
    if (studentRecord) {
      studentRecords.push({
        date: record.date as string,
        present: studentRecord.present,
      })
    }
  })

  return studentRecords
}

// ===== Teachers =====

export async function fetchTeachers(): Promise<Teacher[]> {
  const { data, error } = await supabase
    .from("teachers")
    .select("id, name, phone, subject")
    .order("name", { ascending: true })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string,
    subject: row.subject as string,
  }))
}

// ===== Schedule =====

export async function fetchScheduleByClass(classId: string, semester?: number): Promise<ScheduleItem[]> {
  let query = supabase
    .from("schedule")
    .select("id, class_id, semester, day_of_week, period_number, subject, teacher_id, start_time, end_time")
    .eq("class_id", classId)
    .order("day_of_week", { ascending: true })
    .order("period_number", { ascending: true })

  if (semester) {
    query = query.eq("semester", semester)
  }

  const { data, error } = await query

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id as string,
    classId: row.class_id as string,
    semester: (row.semester as number) ?? 1,
    dayOfWeek: row.day_of_week as number,
    periodNumber: row.period_number as number,
    subject: row.subject as string,
    teacherId: (row.teacher_id as string | null) ?? null,
    startTime: row.start_time as string,
    endTime: row.end_time as string,
  }))
}

export async function createScheduleItem(
  classId: string,
  semester: number,
  dayOfWeek: number,
  periodNumber: number,
  subject: string,
  teacherId: string | null,
  startTime: string,
  endTime: string
): Promise<ScheduleItem | null> {
  const { data, error } = await supabase
    .from("schedule")
    .insert({
      class_id: classId,
      semester,
      day_of_week: dayOfWeek,
      period_number: periodNumber,
      subject,
      teacher_id: teacherId,
      start_time: startTime,
      end_time: endTime,
    })
    .select("id, class_id, semester, day_of_week, period_number, subject, teacher_id, start_time, end_time")
    .single()

  if (error || !data) return null

  return {
    id: data.id as string,
    classId: data.class_id as string,
    semester: (data.semester as number) ?? 1,
    dayOfWeek: data.day_of_week as number,
    periodNumber: data.period_number as number,
    subject: data.subject as string,
    teacherId: (data.teacher_id as string | null) ?? null,
    startTime: data.start_time as string,
    endTime: data.end_time as string,
  }
}

export async function updateScheduleItem(
  id: string,
  updates: Partial<Pick<ScheduleItem, "subject" | "teacherId" | "startTime" | "endTime" | "semester">>
): Promise<ScheduleItem | null> {
  const payload: Record<string, unknown> = {}
  if (updates.subject !== undefined) payload.subject = updates.subject
  if (updates.teacherId !== undefined) payload.teacher_id = updates.teacherId
  if (updates.startTime !== undefined) payload.start_time = updates.startTime
  if (updates.endTime !== undefined) payload.end_time = updates.endTime
  if (updates.semester !== undefined) payload.semester = updates.semester

  const { data, error } = await supabase
    .from("schedule")
    .update(payload)
    .eq("id", id)
    .select("id, class_id, semester, day_of_week, period_number, subject, teacher_id, start_time, end_time")
    .single()

  if (error || !data) return null

  return {
    id: data.id as string,
    classId: data.class_id as string,
    semester: (data.semester as number) ?? 1,
    dayOfWeek: data.day_of_week as number,
    periodNumber: data.period_number as number,
    subject: data.subject as string,
    teacherId: (data.teacher_id as string | null) ?? null,
    startTime: data.start_time as string,
    endTime: data.end_time as string,
  }
}

export async function deleteScheduleItem(id: string): Promise<void> {
  await supabase.from("schedule").delete().eq("id", id)
}

export async function fetchAllSchedule(): Promise<ScheduleItem[]> {
  const { data, error } = await supabase
    .from("schedule")
    .select("id, class_id, semester, day_of_week, period_number, subject, teacher_id, start_time, end_time")
    .order("day_of_week", { ascending: true })
    .order("period_number", { ascending: true })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id as string,
    classId: row.class_id as string,
    semester: (row.semester as number) ?? 1,
    dayOfWeek: row.day_of_week as number,
    periodNumber: row.period_number as number,
    subject: row.subject as string,
    teacherId: (row.teacher_id as string | null) ?? null,
    startTime: row.start_time as string,
    endTime: row.end_time as string,
  }))
}

// ===== Grades =====

export async function fetchGrades(): Promise<Grade[]> {
  const { data, error } = await supabase
    .from("grades")
    .select("id, student_id, subject, grade, max_grade, semester, academic_year, exam_type, teacher_id, notes, created_at")
    .order("created_at", { ascending: false })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id as string,
    studentId: row.student_id as string,
    subject: row.subject as string,
    grade: row.grade as number,
    maxGrade: row.max_grade as number,
    semester: row.semester as string,
    academicYear: row.academic_year as string,
    examType: row.exam_type as string,
    teacherId: (row.teacher_id as string | null) ?? null,
    notes: (row.notes as string) || "",
    createdAt: row.created_at as string,
  }))
}

export async function fetchGradesByStudent(studentId: string): Promise<Grade[]> {
  const { data, error } = await supabase
    .from("grades")
    .select("id, student_id, subject, grade, max_grade, semester, academic_year, exam_type, teacher_id, notes, created_at")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id as string,
    studentId: row.student_id as string,
    subject: row.subject as string,
    grade: row.grade as number,
    maxGrade: row.max_grade as number,
    semester: row.semester as string,
    academicYear: row.academic_year as string,
    examType: row.exam_type as string,
    teacherId: (row.teacher_id as string | null) ?? null,
    notes: (row.notes as string) || "",
    createdAt: row.created_at as string,
  }))
}

export async function fetchGradesByClass(classId: string): Promise<Grade[]> {
  // First get all students in the class
  const { data: studentsData, error: studentsError } = await supabase
    .from("students")
    .select("id")
    .eq("class_id", classId)

  if (studentsError || !studentsData) return []

  const studentIds = studentsData.map((s) => s.id)
  if (studentIds.length === 0) return []

  // Then get grades for these students
  const { data, error } = await supabase
    .from("grades")
    .select("id, student_id, subject, grade, max_grade, semester, academic_year, exam_type, teacher_id, notes, created_at")
    .in("student_id", studentIds)
    .order("created_at", { ascending: false })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id as string,
    studentId: row.student_id as string,
    subject: row.subject as string,
    grade: row.grade as number,
    maxGrade: row.max_grade as number,
    semester: row.semester as string,
    academicYear: row.academic_year as string,
    examType: row.exam_type as string,
    teacherId: (row.teacher_id as string | null) ?? null,
    notes: (row.notes as string) || "",
    createdAt: row.created_at as string,
  }))
}

export async function createGrade(
  studentId: string,
  subject: string,
  grade: number,
  maxGrade: number,
  semester: string,
  academicYear: string,
  examType: string,
  teacherId: string | null,
  notes: string
): Promise<Grade | null> {
  const { data, error } = await supabase
    .from("grades")
    .insert({
      student_id: studentId,
      subject,
      grade,
      max_grade: maxGrade,
      semester,
      academic_year: academicYear,
      exam_type: examType,
      teacher_id: teacherId,
      notes,
    })
    .select("id, student_id, subject, grade, max_grade, semester, academic_year, exam_type, teacher_id, notes, created_at")
    .single()

  if (error || !data) return null

  return {
    id: data.id as string,
    studentId: data.student_id as string,
    subject: data.subject as string,
    grade: data.grade as number,
    maxGrade: data.max_grade as number,
    semester: data.semester as string,
    academicYear: data.academic_year as string,
    examType: data.exam_type as string,
    teacherId: (data.teacher_id as string | null) ?? null,
    notes: (data.notes as string) || "",
    createdAt: data.created_at as string,
  }
}

export async function updateGrade(
  id: string,
  updates: Partial<Pick<Grade, "subject" | "grade" | "maxGrade" | "semester" | "academicYear" | "examType" | "teacherId" | "notes">>
): Promise<Grade | null> {
  const payload: Record<string, unknown> = {}
  if (updates.subject !== undefined) payload.subject = updates.subject
  if (updates.grade !== undefined) payload.grade = updates.grade
  if (updates.maxGrade !== undefined) payload.max_grade = updates.maxGrade
  if (updates.semester !== undefined) payload.semester = updates.semester
  if (updates.academicYear !== undefined) payload.academic_year = updates.academicYear
  if (updates.examType !== undefined) payload.exam_type = updates.examType
  if (updates.teacherId !== undefined) payload.teacher_id = updates.teacherId
  if (updates.notes !== undefined) payload.notes = updates.notes

  const { data, error } = await supabase
    .from("grades")
    .update(payload)
    .eq("id", id)
    .select("id, student_id, subject, grade, max_grade, semester, academic_year, exam_type, teacher_id, notes, created_at")
    .single()

  if (error || !data) return null

  return {
    id: data.id as string,
    studentId: data.student_id as string,
    subject: data.subject as string,
    grade: data.grade as number,
    maxGrade: data.max_grade as number,
    semester: data.semester as string,
    academicYear: data.academic_year as string,
    examType: data.exam_type as string,
    teacherId: (data.teacher_id as string | null) ?? null,
    notes: (data.notes as string) || "",
    createdAt: data.created_at as string,
  }
}

export async function deleteGrade(id: string): Promise<void> {
  await supabase.from("grades").delete().eq("id", id)
}

