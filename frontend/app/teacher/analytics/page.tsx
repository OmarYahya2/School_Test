"use client"

import { motion } from "framer-motion"
import { BarChart3, Users, BookOpen, CalendarCheck, TrendingUp } from "lucide-react"
import { useTeacherTheme } from "@/lib/teacher-theme-context"
import { useTeacherClass } from "@/lib/teacher-class-context"
import ClassSwitcher from "@/components/class-switcher"
import { useTeacherAnalytics } from "@/lib/hooks/use-teacher-data"
import { useTeacherLanguage } from "@/lib/teacher-language-context"

export default function TeacherAnalyticsPage() {
  const { config } = useTeacherTheme()
  const { t } = useTeacherLanguage()
  const { selectedClassId } = useTeacherClass()
  const { data: analytics, isLoading: loading } = useTeacherAnalytics(selectedClassId || undefined)

  const tc = {
    ocean:   { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200/50", gradient: "from-blue-400/20 to-sky-300/10" },
    violet:  { bg: "bg-violet-500", text: "text-violet-600", light: "bg-violet-50", border: "border-violet-200/50", gradient: "from-violet-400/20 to-fuchsia-300/10" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200/50", gradient: "from-emerald-400/20 to-teal-300/10" },
    rose:    { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-200/50", gradient: "from-rose-400/20 to-pink-300/10" },
    amber:   { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-200/50", gradient: "from-amber-400/20 to-orange-300/10" },
  }[config.color] || { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200/50", gradient: "from-blue-400/20 to-sky-300/10" }

  const stats = analytics ? [
    { label: t.teacher.studentsInClass, value: analytics.studentCount, icon: Users, desc: t.teacher.inClass },
    { label: t.teacher.avgGrades, value: `${analytics.averageScore}%`, icon: BookOpen, desc: t.teacher.overall },
    { label: t.teacher.attendanceRate, value: `${analytics.attendanceRate}%`, icon: CalendarCheck, desc: t.teacher.thisMonth },
    { label: t.teacher.totalGrades, value: analytics.totalGrades, icon: TrendingUp, desc: t.teacher.recorded },
  ] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-6">
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${tc.gradient} rounded-full blur-3xl -z-10 opacity-60`} />
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-slate-900">{t.teacher.myReports}</h1>
          <ClassSwitcher />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100/70 backdrop-blur-sm" />
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
                className="group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br ${tc.gradient} rounded-full blur-2xl opacity-30 -z-10`} />
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tc.light} ${tc.text} shadow-sm`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                    <p className="text-[10px] text-slate-400">{stat.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Class info card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-6"
          >
            <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${tc.gradient} rounded-full blur-3xl opacity-30 -z-10`} />
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tc.light} ${tc.text} shadow-sm`}>
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{t.teacher.performanceSummary}</h2>
                <p className="text-xs text-slate-500">{analytics.class.name}</p>
              </div>
            </div>
            <div className="space-y-4">
              <ProgressBar label={t.teacher.avgGrades} value={analytics.averageScore} color={tc.bg} />
              <ProgressBar label={t.teacher.attendanceRate} value={analytics.attendanceRate} color={tc.bg} />
            </div>
          </motion.div>
        </>
      ) : (
        <div className="text-center py-16 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 text-slate-400">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">{t.teacher.noAnalytics}</p>
        </div>
      )}
    </div>
  )
}

function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        <span className="text-xs font-black text-slate-900">{clamped}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-slate-100/80 overflow-hidden backdrop-blur-sm border border-white/30">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color} shadow-sm`}
        />
      </div>
    </div>
  )
}
