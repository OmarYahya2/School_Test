"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CalendarDays, Clock, BookOpen, GraduationCap, User } from "lucide-react"
import { useAppTheme } from "@/lib/theme-context"
import { useTeacherClass } from "@/lib/teacher-class-context"
import ClassSwitcher from "@/components/class-switcher"
import { useTeacherSchedule } from "@/lib/hooks/use-teacher-data"
import { SkeletonSchedule } from "@/components/skeletons"

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
  const { config } = useAppTheme()
  const { selectedClassId } = useTeacherClass()
  const { data: schedule = [], isLoading: loading } = useTeacherSchedule()

  const tc = {
    ocean:   { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200" },
    violet:  { bg: "bg-violet-500", text: "text-violet-600", light: "bg-violet-50", border: "border-violet-200" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200" },
    rose:    { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-200" },
    amber:   { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-200" },
  }[config.color] || { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200" }

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">جدولي الدراسي</h1>
            <p className="text-sm text-slate-500">الحصص المدرسية المخصصة لك</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ClassSwitcher />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { value: stats.totalLessons, label: "إجمالي الحصص", icon: <BookOpen className="h-4 w-4" />, iconBg: "bg-blue-50 text-blue-600" },
          { value: stats.uniqueSubjects, label: "عدد المواد", icon: <GraduationCap className="h-4 w-4" />, iconBg: "bg-purple-50 text-purple-600" },
          { value: stats.uniqueClasses, label: "عدد الصفوف", icon: <User className="h-4 w-4" />, iconBg: "bg-amber-50 text-amber-600" },
        ].map((card, i) => (
          <div key={i} className="border border-slate-200 bg-white shadow-sm rounded-2xl p-4">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg mb-3 ${card.iconBg}`}>
              {card.icon}
            </div>
            <p className="text-xl font-black text-slate-900 leading-none">{card.value}</p>
            <p className="text-[11px] font-semibold text-slate-500 mt-1.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Schedule Grid */}
      <div className="border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-600" />
            <div>
              <h3 className="font-bold text-slate-900">الجدول الأسبوعي</h3>
              <p className="text-xs text-slate-500 mt-0.5">من الأحد إلى الخميس</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="overflow-x-auto">
              <div className="min-w-[900px] space-y-1.5">
                <div className="grid grid-cols-9 gap-1.5">
                  <div className="h-12 animate-pulse bg-slate-100 rounded-xl" />
                  {DEFAULT_PERIODS.map((_, i) => (
                    <div key={i} className="h-12 animate-pulse bg-slate-100 rounded-xl" />
                  ))}
                </div>
                {Array.from({ length: 5 }).map((_, r) => (
                  <div key={r} className="grid grid-cols-9 gap-1.5">
                    <div className="h-[72px] animate-pulse bg-slate-100 rounded-xl" />
                    {DEFAULT_PERIODS.map((_, c) => (
                      <div key={c} className="h-[72px] animate-pulse bg-slate-100 rounded-xl opacity-50" />
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
                  <div className="p-2.5 text-center font-bold text-slate-500 bg-slate-50 rounded-xl text-xs">
                    اليوم / الحصة
                  </div>
                  {DEFAULT_PERIODS.map((period) => (
                    <div key={period.number} className="p-2.5 text-center font-bold text-slate-700 bg-slate-50 rounded-xl">
                      <div className="text-xs">حصة {period.number}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5 font-mono">{period.start}-{period.end}</div>
                    </div>
                  ))}
                </div>

                {/* Day Rows */}
                <div className="space-y-1.5">
                  {DAYS.map((dayId) => (
                    <div key={dayId} className="grid grid-cols-9 gap-1.5">
                      <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-center text-xs font-bold text-slate-700">
                        {dayNames[dayId]}
                      </div>

                      {DEFAULT_PERIODS.map((period) => {
                        const item = getItem(dayId, period.number)
                        const colors = item ? getSubjectColor(item.subject) : null

                        return (
                          <div
                            key={`${dayId}-${period.number}`}
                            className={`p-2 rounded-xl border min-h-[72px] transition-all ${
                              item
                                ? `${colors?.bg} ${colors?.border} ${colors?.text}`
                                : "border-dashed border-slate-200 bg-slate-50/50"
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
