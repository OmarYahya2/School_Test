import type { SchoolClass, Student, AttendanceRecord, ScheduleItem, Teacher, Grade } from "./store"
import {
  fetchClasses as apiFetchClasses,
  fetchClassById as apiFetchClassById,
  createClass as apiCreateClass,
  updateClassById as apiUpdateClassById,
  deleteClassById as apiDeleteClassById
} from "./api/classes.api"

import {
  fetchStudents as apiFetchStudents,
  fetchStudentsByClass as apiFetchStudentsByClass,
  fetchStudentById as apiFetchStudentById,
  createStudent as apiCreateStudent,
  updateStudentById as apiUpdateStudentById,
  deleteStudentById as apiDeleteStudentById
} from "./api/students.api"

import {
  fetchAttendanceByClassRaw as apiFetchAttendanceByClassRaw,
  saveAttendanceRecord as apiSaveAttendanceRecord,
  fetchAttendanceByStudent as apiFetchAttendanceByStudent
} from "./api/attendance.api"

import {
  fetchTeachers as apiFetchTeachers
} from "./api/teachers.api"

import {
  fetchScheduleByClass as apiFetchScheduleByClass,
  createScheduleItem as apiCreateScheduleItem,
  updateScheduleItem as apiUpdateScheduleItem,
  deleteScheduleItem as apiDeleteScheduleItem,
  fetchAllSchedule as apiFetchAllSchedule
} from "./api/schedule.api"

import {
  fetchGrades as apiFetchGrades,
  fetchGradesByStudent as apiFetchGradesByStudent,
  fetchGradesByClass as apiFetchGradesByClass,
  createGrade as apiCreateGrade,
  updateGrade as apiUpdateGrade,
  deleteGrade as apiDeleteGrade
} from "./api/grades.api"

// Type for attendance with student names
export type AttendanceWithNames = {
  id: string
  classId: string
  date: string
  records: {
    studentId: string
    studentName: string
    present: boolean
  }[]
}

// Helper function to enrich attendance records with student names
async function enrichAttendanceWithNames(
  attendanceRecords: AttendanceRecord[],
  classStudents: Student[]
): Promise<AttendanceWithNames[]> {
  const studentMap = new Map(classStudents.map(s => [s.id, s.name]))
  
  return attendanceRecords.map(record => ({
    id: record.id,
    classId: record.classId,
    date: record.date,
    records: (record.records || []).map(r => ({
      studentId: r.studentId,
      studentName: studentMap.get(r.studentId) || 'غير معروف',
      present: r.present,
    }))
  }))
}

// ===== Classes =====
export const fetchClasses = apiFetchClasses;
export const fetchClassById = apiFetchClassById;
export const createClass = apiCreateClass;
export const updateClassById = apiUpdateClassById;
export const deleteClassById = apiDeleteClassById;

// ===== Students =====
export const fetchStudents = apiFetchStudents;
export const fetchStudentsByClass = apiFetchStudentsByClass;
export const fetchStudentById = apiFetchStudentById;
export const createStudent = apiCreateStudent;
export const updateStudentById = apiUpdateStudentById;
export const deleteStudentById = apiDeleteStudentById;

// ===== Attendance =====
export async function fetchAttendanceByClass(
  classId: string
): Promise<AttendanceWithNames[]> {
  const attendanceRecords = await apiFetchAttendanceByClassRaw(classId);
  const students = await apiFetchStudentsByClass(classId);
  return enrichAttendanceWithNames(attendanceRecords, students);
}

export const fetchAttendanceByClassRaw = apiFetchAttendanceByClassRaw;
export const saveAttendanceRecord = apiSaveAttendanceRecord;
export const fetchAttendanceByStudent = apiFetchAttendanceByStudent;

export async function fetchAttendanceByStudentWithName(
  studentId: string
): Promise<{ date: string; present: boolean; studentName: string }[]> {
  const student = await apiFetchStudentById(studentId);
  const studentName = student?.name || 'غير معروف';
  const records = await apiFetchAttendanceByStudent(studentId);
  return records.map(r => ({
    ...r,
    studentName
  }));
}

// ===== Teachers =====
export const fetchTeachers = apiFetchTeachers;

// ===== Schedule =====
export const fetchScheduleByClass = apiFetchScheduleByClass;
export const createScheduleItem = apiCreateScheduleItem;
export const updateScheduleItem = apiUpdateScheduleItem;
export const deleteScheduleItem = apiDeleteScheduleItem;
export const fetchAllSchedule = apiFetchAllSchedule;

// ===== Grades =====
export const fetchGrades = apiFetchGrades;
export const fetchGradesByStudent = apiFetchGradesByStudent;
export const fetchGradesByClass = apiFetchGradesByClass;
export const createGrade = apiCreateGrade;
export const updateGrade = apiUpdateGrade;
export const deleteGrade = apiDeleteGrade;
