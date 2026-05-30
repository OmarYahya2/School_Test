import { client } from "./client";

export interface MonthlyPoint {
  month: string;
  students: number;
  classes: number;
  teachers: number;
}

export interface AnalyticsSummary {
  totals: {
    students: number;
    classes: number;
    teachers: number;
    grades: number;
  };
  quality: {
    classesWithTeacher: number;
    studentsWithPhone: number;
    studentsInTeacherClasses: number;
    teachersWithSubject: number;
    averageAge: number;
    teacherClassRatioPct: number;
    studentPhoneRatioPct: number;
  };
  attendance: {
    ratePct: number | null;
    totalSlots: number;
    presentCount: number;
  };
  grades: {
    averagePct: number | null;
    passRatePct: number | null;
    totalRecords: number;
  };
  monthlyGrowth: MonthlyPoint[];
  charts: {
    classBreakdown: { name: string; students: number; averageAge: number }[];
    ageDistribution: { range: string; count: number }[];
    subjectDistribution: { subject: string; count: number }[];
  };
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  return client.get<AnalyticsSummary>("/analytics/summary");
}
