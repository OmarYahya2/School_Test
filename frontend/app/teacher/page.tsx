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
} from "lucide-react"
import { useAppTheme } from "@/lib/theme-context"
import { useTeacherClass } from "@/lib/teacher-class-context"
import ClassSwitcher from "@/components/class-switcher"
import { useTeacherAnalytics } from "@/lib/hooks/use-teacher-data"
import { SkeletonStats } from "@/components/skeletons"
import Link from "next/link"

export default function TeacherOverviewPage() {
  const { config } = useAppTheme()
  const { profile, selectedClassId, loading: ctxLoading } = useTeacherClass()
  const { data: analytics, isLoading } = useTeacherAnalytics(selectedClassId || undefined)

  const tc = {
    ocean:   { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200" },
    violet:  { bg: "bg-violet-500", text: "text-violet-600", light: "bg-violet-50", border: "border-violet-200" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200" },
    rose:    { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-200" },
    amber:   { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-200" },
  }[config.color] || { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200" }

  if (isLoading || ctxLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-9 w-36 animate-pulse rounded-lg bg-slate-100" />
        </div>
        <SkeletonStats />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    )
  }

  const stats = [
    {
      label: "عدد الطلاب",
      value: analytics?.studentCount ?? 0,
      icon: Users,
      href: "/teacher/students",
    },
    {
      label: "متوسط الدرجات",
      value: `${analytics?.averageScore ?? 0}%`,
      icon: BookOpen,
      href: "/teacher/grades",
    },
    {
      label: "نسبة الحضور",
      value: `${analytics?.attendanceRate ?? 0}%`,
      icon: CalendarCheck,
      href: "/teacher/attendance",
    },
    {
      label: "إجمالي الدرجات المسجلة",
      value: analytics?.totalGrades ?? 0,
      icon: BarChart3,
      href: "/teacher/analytics",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-extrabold text-slate-900">مرحباً، {profile?.name} 👋</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
          <ClassSwitcher />
          <p className="text-sm text-slate-500">
            {profile?.teacherAssignments && profile.teacherAssignments.length > 0
              ? `التعيينات: ${profile.teacherAssignments.map((a) => a.subject).join("، ")}`
              : "لم يتم تعيين مواد بعد"}
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              href={stat.href}
              className={`group flex items-center gap-4 rounded-2xl border ${tc.border} bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tc.light} ${tc.text}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                <p className="text-xl font-black text-slate-900">{stat.value}</p>
              </div>
              <ArrowLeft className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Access */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-bold text-slate-900 mb-4">وصول سريع</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {[
            { label: "الطلاب", href: "/teacher/students", icon: Users },
            { label: "الدرجات", href: "/teacher/grades", icon: BookOpen },
            { label: "الجدول", href: "/teacher/schedule", icon: CalendarDays },
            { label: "الحضور", href: "/teacher/attendance", icon: CalendarCheck },
            { label: "الملفات", href: "/teacher/files", icon: GraduationCap },
            { label: "QR", href: "/teacher/qr", icon: GraduationCap },
            { label: "التقارير", href: "/teacher/analytics", icon: BarChart3 },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-2 rounded-xl border ${tc.border} ${tc.light} p-4 text-center transition-all hover:shadow-sm hover:scale-[1.02]`}
            >
              <item.icon className={`h-6 w-6 ${tc.text}`} />
              <span className="text-xs font-semibold text-slate-700">{item.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
