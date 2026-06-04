"use client"

import { motion } from "framer-motion"
import {
  Users,
  BookOpen,
  CalendarDays,
  CalendarCheck,
  BarChart3,
  GraduationCap,
  ArrowLeft,
  FolderOpen,
  QrCode
} from "lucide-react"
import { useTeacherTheme } from "@/lib/teacher-theme-context"
import { useTeacherClass } from "@/lib/teacher-class-context"
import ClassSwitcher from "@/components/class-switcher"
import { useTeacherAnalytics } from "@/lib/hooks/use-teacher-data"
import { SkeletonStats } from "@/components/skeletons"
import Link from "next/link"
import { useTeacherLanguage } from "@/lib/teacher-language-context"

export default function TeacherOverviewPage() {
  const { config } = useTeacherTheme()
  const { t } = useTeacherLanguage()
  const { profile, selectedClassId, loading: ctxLoading } = useTeacherClass()
  const { data: analytics, isLoading } = useTeacherAnalytics(selectedClassId || undefined)

  const tc = {
    ocean:   { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200/50", gradient: "from-blue-100 to-transparent" },
    violet:  { bg: "bg-violet-500", text: "text-violet-600", light: "bg-violet-50", border: "border-violet-200/50", gradient: "from-violet-100 to-transparent" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200/50", gradient: "from-emerald-100 to-transparent" },
    rose:    { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-200/50", gradient: "from-rose-100 to-transparent" },
    amber:   { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-200/50", gradient: "from-amber-100 to-transparent" },
  }[config.color] || { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200/50", gradient: "from-blue-100 to-transparent" }

  if (isLoading || ctxLoading) {
    return (
      <div className="space-y-8">
        <div className="h-40 animate-pulse rounded-3xl bg-white/50 border border-slate-200/50" />
        <SkeletonStats />
        <div className="h-64 animate-pulse rounded-3xl bg-white/50 border border-slate-200/50" />
      </div>
    )
  }

  const stats = [
    {
      label: t.teacher.studentsInClass,
      value: analytics?.studentCount ?? 0,
      icon: Users,
      href: "/teacher/students",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: t.teacher.avgGrades,
      value: `${analytics?.averageScore ?? 0}%`,
      icon: BookOpen,
      href: "/teacher/grades",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: t.teacher.attendanceRate,
      value: `${analytics?.attendanceRate ?? 0}%`,
      icon: CalendarCheck,
      href: "/teacher/attendance",
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: t.teacher.gradesRecorded,
      value: analytics?.totalGrades ?? 0,
      icon: BarChart3,
      href: "/teacher/analytics",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ]

  return (
    <div className="space-y-8 pb-10">
      {/* Header Profile Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
      >
        <div className={`absolute top-0 left-0 w-full h-1.5 ${tc.bg} opacity-80`} />
        <div className={`absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br ${tc.gradient} rounded-full blur-3xl opacity-60 pointer-events-none`} />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${tc.bg} text-white shadow-lg shadow-black/5`}>
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-1.5 tracking-tight">
                {t.teacher.welcome}، {profile?.name || t.teacher.teacher} 👋
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {profile?.teacherAssignments && profile.teacherAssignments.length > 0
                    ? profile.teacherAssignments.map((a) => a.subject).join("، ")
                    : profile?.subject || t.teacher.notAssigned}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block" />
                <span dir="ltr">{profile?.phone || "—"}</span>
              </div>
            </div>
          </div>
          <div className="self-end md:self-center">
            <ClassSwitcher />
          </div>
        </div>
      </motion.div>

      {/* Stats Summary */}
      <div>
        <motion.h2 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg font-extrabold text-slate-800 mb-4 px-1 flex items-center gap-2"
        >
          <BarChart3 className="h-5 w-5 text-slate-400" />
          {t.teacher.selectedClassOverview}
        </motion.h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
            >
              <Link
                href={stat.href}
                className="group relative block rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-lg p-6 shadow-sm shadow-slate-100/50 transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 overflow-hidden"
              >
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 ${stat.bg} pointer-events-none transition-opacity group-hover:opacity-40`} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <ArrowLeft className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900 mb-1 tracking-tight">{stat.value}</p>
                    <p className="text-xs font-bold text-slate-500">{stat.label}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <motion.h2
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg font-extrabold text-slate-800 mb-4 px-1"
        >
          {t.teacher.quickAccess}
        </motion.h2>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid gap-3 sm:grid-cols-3 lg:grid-cols-7"
        >
          {[
            { label: t.teacher.studentsAndFollowup, href: "/teacher/students", icon: Users },
            { label: t.teacher.gradeRecording, href: "/teacher/grades", icon: BookOpen },
            { label: t.teacher.scheduleTitle, href: "/teacher/schedule", icon: CalendarDays },
            { label: t.teacher.attendanceTitle, href: "/teacher/attendance", icon: CalendarCheck },
            { label: t.teacher.filesLibrary, href: "/teacher/files", icon: FolderOpen },
            { label: t.teacher.qrCodes, href: "/teacher/qr", icon: QrCode },
            { label: t.teacher.comprehensiveReports, href: "/teacher/analytics", icon: BarChart3 },
          ].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-lg p-5 shadow-sm shadow-slate-100/50 transition-all duration-300 hover:bg-white hover:shadow-lg hover:shadow-slate-200/40 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${tc.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:${tc.bg} group-hover:text-white transition-colors duration-300 shadow-inner`}>
                <item.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors text-center relative z-10">
                {item.label}
              </span>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
