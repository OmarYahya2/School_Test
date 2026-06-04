"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CalendarCheck, UserCheck, UserX, ChevronDown, ChevronUp } from "lucide-react"
import { useTeacherTheme } from "@/lib/teacher-theme-context"
import { useTeacherClass } from "@/lib/teacher-class-context"
import ClassSwitcher from "@/components/class-switcher"
import { useTeacherAttendance, useTeacherStudents } from "@/lib/hooks/use-teacher-data"
import { useTeacherLanguage } from "@/lib/teacher-language-context"

interface StudentInfo {
  id: string
  name: string
}

export default function TeacherAttendancePage() {
  const { config } = useTeacherTheme()
  const { t } = useTeacherLanguage()
  const { selectedClassId } = useTeacherClass()
  const { data: records = [], isLoading: attendanceLoading } = useTeacherAttendance(selectedClassId || undefined)
  const { data: allStudents = [] } = useTeacherStudents()
  const [expandedDate, setExpandedDate] = useState<string | null>(null)

  const tc = {
    ocean:   { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200/50", gradient: "from-blue-400/20 to-sky-300/10" },
    violet:  { bg: "bg-violet-500", text: "text-violet-600", light: "bg-violet-50", border: "border-violet-200/50", gradient: "from-violet-400/20 to-fuchsia-300/10" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200/50", gradient: "from-emerald-400/20 to-teal-300/10" },
    rose:    { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-200/50", gradient: "from-rose-400/20 to-pink-300/10" },
    amber:   { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-200/50", gradient: "from-amber-400/20 to-orange-300/10" },
  }[config.color] || { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200/50", gradient: "from-blue-400/20 to-sky-300/10" }

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
    const recs = r.records
    totalEntries += recs.length
    totalPresent += recs.filter((rec) => rec.present).length
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
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-6">
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${tc.gradient} rounded-full blur-3xl -z-10 opacity-60`} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900">{t.teacher.attendance}</h1>
            <ClassSwitcher />
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${tc.light} ${tc.text} border ${tc.border} backdrop-blur-sm`}>
            <CalendarCheck className="h-4 w-4" />
            {totalRecords} {t.teacher.daysRecorded}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      {!loading && records.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-lg"
          >
            <div className={`absolute top-0 left-0 w-24 h-24 bg-gradient-to-br ${tc.gradient} rounded-full blur-2xl opacity-30 -z-10`} />
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tc.light} ${tc.text} shadow-sm`}>
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{t.teacher.totalPresent}</p>
              <p className="text-xl font-black text-slate-900">{totalPresent}</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-lg"
          >
            <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-rose-400/20 to-pink-300/10 rounded-full blur-2xl opacity-30 -z-10" />
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 shadow-sm">
              <UserX className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{t.teacher.totalAbsent}</p>
              <p className="text-xl font-black text-slate-900">{totalEntries - totalPresent}</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-lg"
          >
            <div className={`absolute top-0 left-0 w-24 h-24 bg-gradient-to-br ${tc.gradient} rounded-full blur-2xl opacity-30 -z-10`} />
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tc.light} ${tc.text} shadow-sm`}>
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{t.teacher.attendancePercentage}</p>
              <p className="text-xl font-black text-slate-900">{attendanceRate}%</p>
            </div>
          </motion.div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100/70 backdrop-blur-sm" />
          ))}
        </div>
      ) : records.length > 0 ? (
        <div className="space-y-3">
          {records.map((record, i) => {
            const recs = record.records
            const presentCount = recs.filter((r) => r.present).length
            const absentCount = recs.length - presentCount
            const isExpanded = expandedDate === record.date

            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-lg"
              >
                <button
                  onClick={() => setExpandedDate(isExpanded ? null : record.date)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-white/40 transition-colors"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tc.light} ${tc.text} shadow-sm`}>
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
                    className="border-t border-white/30 bg-white/40 backdrop-blur-sm"
                  >
                    <div className="p-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {recs.map((rec) => (
                        <div
                          key={rec.studentId}
                          className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm backdrop-blur-sm ${
                            rec.present
                              ? "border-emerald-200/50 bg-emerald-50/60 text-emerald-700"
                              : "border-rose-200/50 bg-rose-50/60 text-rose-700"
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
        <div className="text-center py-16 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 text-slate-400">
          <CalendarCheck className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">{t.teacher.noAttendance}</p>
        </div>
      )}
    </div>
  )
}
