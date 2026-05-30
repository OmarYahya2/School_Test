"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CalendarCheck, UserCheck, UserX, ChevronDown, ChevronUp } from "lucide-react"
import { useAppTheme } from "@/lib/theme-context"
import { useTeacherClass } from "@/lib/teacher-class-context"
import ClassSwitcher from "@/components/class-switcher"
import { useTeacherAttendance, useTeacherStudents } from "@/lib/hooks/use-teacher-data"

interface StudentInfo {
  id: string
  name: string
}

export default function TeacherAttendancePage() {
  const { config } = useAppTheme()
  const { selectedClassId } = useTeacherClass()
  const { data: records = [], isLoading: attendanceLoading } = useTeacherAttendance(selectedClassId || undefined)
  const { data: allStudents = [] } = useTeacherStudents()
  const [expandedDate, setExpandedDate] = useState<string | null>(null)

  const tc = {
    ocean:   { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200" },
    violet:  { bg: "bg-violet-500", text: "text-violet-600", light: "bg-violet-50", border: "border-violet-200" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200" },
    rose:    { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-200" },
    amber:   { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-200" },
  }[config.color] || { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200" }

  const students: StudentInfo[] = selectedClassId
    ? allStudents.filter((s) => s.class.id === selectedClassId).map((s) => ({ id: s.id, name: s.name }))
    : []
  const loading = attendanceLoading

  const studentMap = new Map(students.map((s) => [s.id, s.name]))

  // Summary stats
  const totalRecords = records.length
  let totalPresent = 0
  let totalEntries = 0
  records.forEach((r) => {
    const recs = (r.records as any[]) || []
    totalEntries += recs.length
    totalPresent += recs.filter((rec: any) => rec.present).length
  })
  const attendanceRate = totalEntries > 0 ? Math.round((totalPresent / totalEntries) * 100) : 0

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-slate-900">الحضور</h1>
          <ClassSwitcher />
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${tc.light} ${tc.text} border ${tc.border}`}>
          <CalendarCheck className="h-4 w-4" />
          {totalRecords} يوم مسجل
        </div>
      </div>

      {/* Summary cards */}
      {!loading && records.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border ${tc.border} bg-white p-5 shadow-sm flex items-center gap-4`}
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tc.light} ${tc.text}`}>
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">إجمالي الحضور</p>
              <p className="text-xl font-black text-slate-900">{totalPresent}</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`rounded-2xl border ${tc.border} bg-white p-5 shadow-sm flex items-center gap-4`}
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tc.light} ${tc.text}`}>
              <UserX className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">إجمالي الغياب</p>
              <p className="text-xl font-black text-slate-900">{totalEntries - totalPresent}</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-2xl border ${tc.border} bg-white p-5 shadow-sm flex items-center gap-4`}
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tc.light} ${tc.text}`}>
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">نسبة الحضور</p>
              <p className="text-xl font-black text-slate-900">{attendanceRate}%</p>
            </div>
          </motion.div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : records.length > 0 ? (
        <div className="space-y-3">
          {records.map((record, i) => {
            const recs = (record.records as any[]) || []
            const presentCount = recs.filter((r: any) => r.present).length
            const absentCount = recs.length - presentCount
            const isExpanded = expandedDate === record.date

            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setExpandedDate(isExpanded ? null : record.date)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tc.light} ${tc.text}`}>
                    <CalendarCheck className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="text-sm font-bold text-slate-900">{formatDate(record.date)}</h3>
                    <p className="text-xs text-slate-500">
                      حاضر: {presentCount} | غائب: {absentCount}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${presentCount > absentCount ? "text-emerald-600" : "text-rose-600"}`}>
                      {recs.length > 0 ? Math.round((presentCount / recs.length) * 100) : 0}%
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-slate-100"
                  >
                    <div className="p-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {recs.map((rec: any) => (
                        <div
                          key={rec.studentId}
                          className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm ${
                            rec.present
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-rose-200 bg-rose-50 text-rose-700"
                          }`}
                        >
                          {rec.present ? (
                            <UserCheck className="h-4 w-4" />
                          ) : (
                            <UserX className="h-4 w-4" />
                          )}
                          <span className="font-medium truncate flex-1">
                            {studentMap.get(rec.studentId) || "طالب"}
                          </span>
                          <span className="text-xs font-bold">
                            {rec.present ? "حاضر" : "غائب"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400">
          <CalendarCheck className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">لا توجد سجلات حضور مسجلة لهذا الصف</p>
        </div>
      )}
    </div>
  )
}
