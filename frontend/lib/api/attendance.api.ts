import { client } from "./client";
import type { AttendanceRecord } from "../store";

export async function fetchAttendanceByClassRaw(classId: string): Promise<AttendanceRecord[]> {
  try {
    return await client.get<AttendanceRecord[]>(`/attendance/class/${classId}`);
  } catch {
    return [];
  }
}

export async function saveAttendanceRecord(
  classId: string,
  date: string,
  records: { studentId: string; present: boolean }[]
): Promise<AttendanceRecord | null> {
  try {
    return await client.post<AttendanceRecord>("/attendance", {
      classId,
      date,
      records,
    });
  } catch {
    return null;
  }
}

export async function fetchAttendanceByStudent(
  studentId: string
): Promise<{ date: string; present: boolean }[]> {
  try {
    // In our simplified version, we can fetch all attendance for the student's class, 
    // or since we don't have a direct student attendance route, we can fetch all class attendance 
    // or implement a general query. But wait! In the backend, we fetch all attendance records 
    // (since it's a small app) and filter them, or fetch student class ID first.
    // Let's implement student attendance lookup by querying the backend.
    // Wait, let's look at the student's details to get their classId, then fetch that class's attendance!
    // That's very clean and works without loading all attendance records in the database.
    const student = await client.get<{ id: string; classId: string } | null>(`/students/${studentId}`);
    if (!student || !student.classId) return [];
    
    const attendanceRecords = await fetchAttendanceByClassRaw(student.classId);
    
    const studentRecords: { date: string; present: boolean }[] = [];
    attendanceRecords.forEach((record) => {
      const records = record.records;
      const studentRecord = records.find((r) => r.studentId === studentId);
      if (studentRecord) {
        studentRecords.push({
          date: record.date,
          present: studentRecord.present,
        });
      }
    });
    
    return studentRecords;
  } catch {
    return [];
  }
}
