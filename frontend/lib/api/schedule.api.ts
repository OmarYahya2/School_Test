import { client } from "./client";
import type { ScheduleItem } from "../store";

export async function fetchAllSchedule(): Promise<ScheduleItem[]> {
  try {
    return await client.get<ScheduleItem[]>("/schedule");
  } catch (error) {
    if (!(error as any)?.silent) console.error("fetchAllSchedule error:", error);
    return [];
  }
}

export async function fetchScheduleByClass(classId: string, semester?: number): Promise<ScheduleItem[]> {
  try {
    const items = await client.get<ScheduleItem[]>(`/schedule/class/${classId}`);
    if (semester) {
      return items.filter(item => item.semester === semester);
    }
    return items;
  } catch (error) {
    if (!(error as any)?.silent) console.error("fetchScheduleByClass error:", error);
    return [];
  }
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
  try {
    return await client.post<ScheduleItem>("/schedule", {
      classId,
      semester,
      dayOfWeek,
      periodNumber,
      subject,
      teacherId,
      startTime,
      endTime,
    });
  } catch (error) {
    console.error("createScheduleItem error:", error);
    return null;
  }
}

export async function updateScheduleItem(
  id: string,
  updates: Partial<Pick<ScheduleItem, "subject" | "teacherId" | "startTime" | "endTime" | "semester">>
): Promise<ScheduleItem | null> {
  try {
    return await client.put<ScheduleItem>(`/schedule/${id}`, updates);
  } catch (error) {
    console.error("updateScheduleItem error:", error);
    return null;
  }
}

export async function deleteScheduleItem(id: string): Promise<void> {
  try {
    await client.delete(`/schedule/${id}`);
  } catch (error) {
    console.error("deleteScheduleItem error:", error);
  }
}
