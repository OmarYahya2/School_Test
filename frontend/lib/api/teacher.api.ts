import { client } from "./client";

export interface TeacherProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  subject: string;
  isActive: boolean;
  assignedSubjects: string[];
  classes: { id: string; name: string }[];
  teacherAssignments: Array<{
    id: string;
    gradeId: number;
    semester: string;
    subject: string;
    classId?: string;
    class?: { id: string; name: string };
  }>;
}

export interface TeacherStudent {
  id: string;
  name: string;
  age: number;
  parentPhone: string;
  class: { id: string; name: string };
}

export interface TeacherClass {
  id: string;
  name: string;
  notes: string;
  students: Array<{ id: string; name: string; age: number }>;
  scheduleItems: Array<{
    id: string;
    dayOfWeek: number;
    periodNumber: number;
    subject: string;
    startTime: string;
    endTime: string;
  }>;
}

export interface TeacherGrade {
  id: string;
  subject: string;
  grade: number;
  maxGrade: number;
  semester: string;
  examType: string;
  student: { id: string; name: string; class: { id: string; name: string } };
}

export interface TeacherScheduleItem {
  id: string;
  dayOfWeek: number;
  periodNumber: number;
  subject: string;
  startTime: string;
  endTime: string;
  class: { id: string; name: string };
}

export interface TeacherFile {
  id: string;
  gradeId: number;
  semester: string;
  subject: string;
  title: string;
  description: string;
  type: string;
  url: string;
  createdAt: string;
}

export interface TeacherAnalytics {
  class: { id: string; name: string };
  studentCount: number;
  averageScore: number;
  attendanceRate: number;
  totalGrades: number;
}

export async function getTeacherProfile(): Promise<TeacherProfile | null> {
  try {
    return await client.get<TeacherProfile>("/teacher/me");
  } catch {
    return null;
  }
}

export async function getTeacherStudents(): Promise<TeacherStudent[]> {
  try {
    return await client.get<TeacherStudent[]>("/teacher/students");
  } catch {
    return [];
  }
}

export async function getTeacherClass(classId?: string): Promise<TeacherClass | null> {
  try {
    const query = classId ? `?classId=${encodeURIComponent(classId)}` : "";
    return await client.get<TeacherClass>(`/teacher/class${query}`);
  } catch {
    return null;
  }
}

export async function getTeacherGrades(): Promise<TeacherGrade[]> {
  try {
    return await client.get<TeacherGrade[]>("/teacher/grades");
  } catch {
    return [];
  }
}

export async function getTeacherSchedule(): Promise<TeacherScheduleItem[]> {
  try {
    return await client.get<TeacherScheduleItem[]>("/teacher/schedule");
  } catch {
    return [];
  }
}

export async function getTeacherFiles(): Promise<TeacherFile[]> {
  try {
    return await client.get<TeacherFile[]>("/teacher/files");
  } catch {
    return [];
  }
}

export async function getTeacherQR(classId?: string): Promise<{ id: string; name: string } | null> {
  try {
    const query = classId ? `?classId=${encodeURIComponent(classId)}` : "";
    return await client.get<{ id: string; name: string }>(`/teacher/qr${query}`);
  } catch {
    return null;
  }
}

export async function getTeacherAnalytics(classId?: string): Promise<TeacherAnalytics | null> {
  try {
    const query = classId ? `?classId=${encodeURIComponent(classId)}` : "";
    return await client.get<TeacherAnalytics>(`/teacher/analytics${query}`);
  } catch {
    return null;
  }
}

export async function createTeacherStudent(data: Partial<TeacherStudent>) {
  return client.post<TeacherStudent>("/teacher/students", data);
}

export async function updateTeacherStudent(id: string, data: Partial<TeacherStudent>) {
  return client.put<TeacherStudent>(`/teacher/students/${id}`, data);
}

export async function deleteTeacherStudent(id: string) {
  return client.delete(`/teacher/students/${id}`);
}

export async function createTeacherGrade(data: Partial<TeacherGrade>) {
  return client.post<TeacherGrade>("/teacher/grades", data);
}

export async function updateTeacherGrade(id: string, data: Partial<TeacherGrade>) {
  return client.put<TeacherGrade>(`/teacher/grades/${id}`, data);
}

export async function deleteTeacherGrade(id: string) {
  return client.delete(`/teacher/grades/${id}`);
}

export async function saveTeacherAttendance(data: { classId: string; date: string; records: any[] }) {
  return client.post("/teacher/attendance", data);
}

export async function createTeacherFile(data: Partial<TeacherFile>) {
  return client.post<TeacherFile>("/teacher/files", data);
}

export async function updateTeacherFile(id: string, data: Partial<TeacherFile>) {
  return client.put<TeacherFile>(`/teacher/files/${id}`, data);
}

export async function deleteTeacherFile(id: string) {
  return client.delete(`/teacher/files/${id}`);
}
