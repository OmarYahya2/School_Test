"use client"

import { motion } from "framer-motion"
import { BarChart3, Users, BookOpen, CalendarCheck, TrendingUp } from "lucide-react"
import { useAppTheme } from "@/lib/theme-context"
import { useTeacherClass } from "@/lib/teacher-class-context"
import ClassSwitcher from "@/components/class-switcher"
import { useTeacherAnalytics } from "@/lib/hooks/use-teacher-data"

export default function TeacherAnalyticsPage() {
  const { config } = useAppTheme()
  const { selectedClassId } = useTeacherClass()
  const { data: analytics, isLoading: loading } = useTeacherAnalytics(selectedClassId || undefined)

  const tc = {
    ocean:   { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200" },
    violet:  { bg: "bg-violet-500", text: "text-violet-600", light: "bg-violet-50", border: "border-violet-200" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200" },
    rose:    { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-200" },
    amber:   { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-200" },
  }[config.color] || { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200" }

  const stats = analytics ? [
    { label: "عدد الطلاب", value: analytics.studentCount, icon: Users, desc: "في الصف" },
    { label: "متوسط الدرجات", value: `${analytics.averageScore}%`, icon: BookOpen, desc: "عام" },
    { label: "نسبة الحضور", value: `${analytics.attendanceRate}%`, icon: CalendarCheck, desc: "هذا الشهر" },
    { label: "إجمالي الدرجات", value: analytics.totalGrades, icon: TrendingUp, desc: "مسجلة" },
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-extrabold text-slate-900">تقاريري</h1>
        <ClassSwitcher />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : analytics ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-center gap-4 rounded-2xl border ${tc.border} bg-white p-5 shadow-sm`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tc.light} ${tc.text}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                  <p className="text-[10px] text-slate-400">{stat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Class info card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tc.light} ${tc.text}`}>
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">ملخص الأداء</h2>
                <p className="text-xs text-slate-500">{analytics.class.name}</p>
              </div>
            </div>
            <div className="space-y-3">
              <ProgressBar label="متوسط الدرجات" value={analytics.averageScore} color={tc.bg} />
              <ProgressBar label="نسبة الحضور" value={analytics.attendanceRate} color={tc.bg} />
            </div>
          </motion.div>
        </>
      ) : (
        <div className="text-center py-16 text-slate-400">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">لا توجد بيانات تحليلية</p>
        </div>
      )}
    </div>
  )
}

function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        <span className="text-xs font-bold text-slate-900">{clamped}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  )
}
