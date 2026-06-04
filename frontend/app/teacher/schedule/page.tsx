"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CalendarDays, Clock, BookOpen, GraduationCap, User } from "lucide-react"
import { useTeacherTheme } from "@/lib/teacher-theme-context"
import { useTeacherClass } from "@/lib/teacher-class-context"
import ClassSwitcher from "@/components/class-switcher"
import { useTeacherSchedule } from "@/lib/hooks/use-teacher-data"
import { SkeletonSchedule } from "@/components/skeletons"
import { useTeacherLanguage } from "@/lib/teacher-language-context"

const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

const DEFAULT_PERIODS = [
  { number: 1, start: "08:00", end: "08:45" },
  { number: 2, start: "08:45", end: "09:30" },
  { number: 3, start: "09:30", end: "10:15" },
  { number: 4, start: "10:15", end: "11:00" },
  { number: 5, start: "11:00", end: "11:45" },
  { number: 6, start: "11:45", end: "12:30" },
  { number: 7, start: "12:30", end: "13:15" },
  { number: 8, start: "13:15", end: "14:00" },
]

const SUBJECT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "رياضيات": { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700" },
  "علوم": { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  "لغة عربية": { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  "لغة إنجليزية": { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  "تربية إسلامية": { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700" },
  "تربية وطنية": { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
  "تاريخ": { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  "جغرافيا": { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700" },
  "فيزياء": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  "كيمياء": { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700" },
  "أحياء": { bg: "bg-lime-50", border: "border-lime-200", text: "text-lime-700" },
  "حاسوب": { bg: "bg-slate-100", border: "border-slate-300", text: "text-slate-700" },
  "فن": { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700" },
  "رياضة": { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
}

function getSubjectColor(subject: string) {
  return SUBJECT_COLORS[subject] || { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700" }
}

const DAYS = [0, 1, 2, 3, 4]

export default function TeacherSchedulePage() {
  const { config } = useTeacherTheme()
  const { t } = useTeacherLanguage()
  const { selectedClassId } = useTeacherClass()
  const { data: schedule = [], isLoading: loading } = useTeacherSchedule()

  const tc = {
    ocean:   { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200/50", gradient: "from-blue-400/20 to-sky-300/10" },
    violet:  { bg: "bg-violet-500", text: "text-violet-600", light: "bg-violet-50", border: "border-violet-200/50", gradient: "from-violet-400/20 to-fuchsia-300/10" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200/50", gradient: "from-emerald-400/20 to-teal-300/10" },
    rose:    { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-200/50", gradient: "from-rose-400/20 to-pink-300/10" },
    amber:   { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-200/50", gradient: "from-amber-400/20 to-orange-300/10" },
  }[config.color] || { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200/50", gradient: "from-blue-400/20 to-sky-300/10" }

  const classSchedule = selectedClassId
    ? schedule.filter((item) => item.class.id === selectedClassId)
    : schedule

  const getItem = (dayId: number, periodNumber: number) => {
    return classSchedule.find((item) => item.dayOfWeek === dayId && item.periodNumber === periodNumber)
  }

  const stats = {
    totalLessons: classSchedule.length,
    uniqueSubjects: new Set(classSchedule.map((s) => s.subject)).size,
    uniqueClasses: new Set(classSchedule.map((s) => s.class.id)).size,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-6">
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${tc.gradient} rounded-full blur-3xl -z-10 opacity-60`} />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tc.light} ${tc.text} shadow-sm`}>
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">{t.teacher.mySchedule}</h1>
              <p className="text-sm text-slate-500">{t.teacher.scheduleDesc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ClassSwitcher />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { value: stats.totalLessons, label: t.teacher.totalLessons, icon: <BookOpen className="h-4 w-4" />, iconBg: "bg-blue-50 text-blue-600", glow: "from-blue-400/20 to-sky-300/10" },
          { value: stats.uniqueSubjects, label: t.teacher.uniqueSubjects, icon: <GraduationCap className="h-4 w-4" />, iconBg: "bg-purple-50 text-purple-600", glow: "from-violet-400/20 to-fuchsia-300/10" },
          { value: stats.uniqueClasses, label: t.teacher.uniqueClasses, icon: <User className="h-4 w-4" />, iconBg: "bg-amber-50 text-amber-600", glow: "from-amber-400/20 to-orange-300/10" },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-4 transition-all duration-300 hover:shadow-lg"
          >
            <div className={`absolute top-0 left-0 w-24 h-24 bg-gradient-to-br ${card.glow} rounded-full blur-2xl opacity-30 -z-10`} />
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg mb-3 ${card.iconBg} shadow-sm`}>
              {card.icon}
            </div>
            <p className="text-xl font-black text-slate-900 leading-none">{card.value}</p>
            <p className="text-[11px] font-semibold text-slate-500 mt-1.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Schedule Grid */}
      <div className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
        <div className="p-5 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-600" />
            <div>
              <h3 className="font-bold text-slate-900">{t.teacher.weeklySchedule}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{t.teacher.sunToThu}</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="overflow-x-auto">
              <div className="min-w-[900px] space-y-1.5">
                <div className="grid grid-cols-9 gap-1.5">
                  <div className="h-12 animate-pulse bg-slate-100/70 rounded-xl backdrop-blur-sm" />
                  {DEFAULT_PERIODS.map((_, i) => (
                    <div key={i} className="h-12 animate-pulse bg-slate-100/70 rounded-xl backdrop-blur-sm" />
                  ))}
                </div>
                {Array.from({ length: 5 }).map((_, r) => (
                  <div key={r} className="grid grid-cols-9 gap-1.5">
                    <div className="h-[72px] animate-pulse bg-slate-100/70 rounded-xl backdrop-blur-sm" />
                    {DEFAULT_PERIODS.map((_, c) => (
                      <div key={c} className="h-[72px] animate-pulse bg-slate-100/70 rounded-xl backdrop-blur-sm opacity-50" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {/* Header Row */}
                <div className="grid grid-cols-9 gap-1.5 mb-1.5">
                  <div className="p-2.5 text-center font-bold text-slate-500 bg-white/50 rounded-xl text-xs border border-white/20">
                    اليوم / الحصة
                  </div>
                  {DEFAULT_PERIODS.map((period) => (
                    <div key={period.number} className="p-2.5 text-center font-bold text-slate-700 bg-white/50 rounded-xl border border-white/20">
                      <div className="text-xs">حصة {period.number}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5 font-mono">{period.start}-{period.end}</div>
                    </div>
                  ))}
                </div>

                {/* Day Rows */}
                <div className="space-y-1.5">
                  {DAYS.map((dayId) => (
                    <div key={dayId} className="grid grid-cols-9 gap-1.5">
                      <div className="p-2.5 bg-white/50 rounded-xl flex items-center justify-center text-xs font-bold text-slate-700 border border-white/20">
                        {dayNames[dayId]}
                      </div>

                      {DEFAULT_PERIODS.map((period) => {
                        const item = getItem(dayId, period.number)
                        const colors = item ? getSubjectColor(item.subject) : null

                        return (
                          <div
                            key={`${dayId}-${period.number}`}
                            className={`p-2 rounded-xl border min-h-[72px] transition-all backdrop-blur-sm ${
                              item
                                ? `${colors?.bg} ${colors?.border} ${colors?.text} shadow-sm`
                                : "border-dashed border-white/30 bg-white/30"
                            }`}
                          >
                            {item ? (
                              <div className="h-full flex flex-col">
                                <div className="font-bold text-[11px] mb-0.5">{item.subject}</div>
                                <div className="text-[9px] opacity-80 mt-auto">
                                  <div className="flex items-center gap-0.5">
                                    <User className="h-2 w-2" />
                                    <span className="truncate">{item.class.name}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px]">
                                —
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && classSchedule.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <GraduationCap className="mb-4 h-12 w-12 text-slate-300" />
              <p className="text-sm font-bold text-slate-900">لا يوجد جدول دراسي</p>
              <p className="mt-1 text-xs text-slate-500">لم يتم تعيين حصص لهذا الصف</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
