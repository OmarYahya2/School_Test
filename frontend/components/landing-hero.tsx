"use client"

import { useState, useEffect, useCallback } from "react"
import { useSchoolName } from "@/lib/school-settings-context"
import { useAppTheme } from "@/lib/theme-context"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  GraduationCap,
  BookOpen,
  Phone,
  MapPin,
  LogIn,
  ChevronLeft,
  Users,
  Calendar,
  FileText,
  Download,
  ExternalLink,
  ImageIcon,
  FileIcon,
  LinkIcon,
  FolderOpen,
  CalendarDays,
  Clock,
  QrCode,
  Star,
  Sparkles,
  ArrowLeft,
  Shield,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SubjectFile, TeacherAssignment, Teacher, SchoolClass, ScheduleItem } from "@/lib/store"
import { fetchSubjectFilesByFilter } from "@/lib/supabase-files"
import { fetchTeacherAssignments, fetchTeachers } from "@/lib/supabase-teachers"
import { fetchClasses, fetchAllSchedule } from "@/lib/supabase-school"
import { verifyQRToken } from "@/lib/api/qr.api"
import { motion, AnimatePresence, type Variants } from "framer-motion"

const grades = [
  { id: 1, name: "الصف الأول", color: "from-rose-500 to-pink-600", lightColor: "from-rose-500/10 to-pink-600/10", borderColor: "border-rose-500/20", hoverBorder: "group-hover:border-rose-500/40", icon: "🎨", desc: "بداية الرحلة" },
  { id: 2, name: "الصف الثاني", color: "from-orange-500 to-amber-600", lightColor: "from-orange-500/10 to-amber-600/10", borderColor: "border-orange-500/20", hoverBorder: "group-hover:border-orange-500/40", icon: "🚀", desc: "اكتشاف جديد" },
  { id: 3, name: "الصف الثالث", color: "from-yellow-500 to-orange-500", lightColor: "from-yellow-500/10 to-orange-500/10", borderColor: "border-yellow-500/20", hoverBorder: "group-hover:border-yellow-500/40", icon: "⭐", desc: "تطور مستمر" },
  { id: 4, name: "الصف الرابع", color: "from-emerald-500 to-teal-600", lightColor: "from-emerald-500/10 to-teal-600/10", borderColor: "border-emerald-500/20", hoverBorder: "group-hover:border-emerald-500/40", icon: "🔬", desc: "علوم ممتعة" },
  { id: 5, name: "الصف الخامس", color: "from-cyan-500 to-blue-600", lightColor: "from-cyan-500/10 to-blue-600/10", borderColor: "border-cyan-500/20", hoverBorder: "group-hover:border-cyan-500/40", icon: "📚", desc: "معرفة أعمق" },
  { id: 6, name: "الصف السادس", color: "from-blue-500 to-indigo-600", lightColor: "from-blue-500/10 to-indigo-600/10", borderColor: "border-blue-500/20", hoverBorder: "group-hover:border-blue-500/40", icon: "🎯", desc: "تحضير منهجي" },
  { id: 7, name: "الصف السابع", color: "from-violet-500 to-purple-600", lightColor: "from-violet-500/10 to-purple-600/10", borderColor: "border-violet-500/20", hoverBorder: "group-hover:border-violet-500/40", icon: "💡", desc: "مرحلة جديدة" },
  { id: 8, name: "الصف الثامن", color: "from-purple-500 to-pink-600", lightColor: "from-purple-500/10 to-pink-600/10", borderColor: "border-purple-500/20", hoverBorder: "group-hover:border-purple-500/40", icon: "⚡", desc: "تقدم ملحوظ" },
  { id: 9, name: "الصف التاسع", color: "from-indigo-500 to-violet-600", lightColor: "from-indigo-500/10 to-violet-600/10", borderColor: "border-indigo-500/20", hoverBorder: "group-hover:border-indigo-500/40", icon: "🏆", desc: "الإنجاز النهائي" },
]

const subjects = [
  { name: "اللغة العربية", emoji: "📖", color: "from-blue-500 to-blue-600", bg: "bg-blue-500/10", text: "text-blue-400", desc: "لغتنا الجميلة" },
  { name: "اللغة الإنجليزية", emoji: "🔤", color: "from-indigo-500 to-purple-600", bg: "bg-indigo-500/10", text: "text-indigo-400", desc: "English Language" },
  { name: "الرياضيات", emoji: "🔢", color: "from-purple-500 to-fuchsia-600", bg: "bg-purple-500/10", text: "text-purple-400", desc: "أرقام وحساب" },
  { name: "العلوم والحياة", emoji: "🔬", color: "from-emerald-500 to-green-600", bg: "bg-emerald-500/10", text: "text-emerald-400", desc: "اكتشاف العلوم" },
  { name: "التربية الدينية", emoji: "🕌", color: "from-amber-500 to-yellow-500", bg: "bg-amber-500/10", text: "text-amber-400", desc: "تعليم ديني" },
  { name: "الدراسات الاجتماعية", emoji: "🌍", color: "from-rose-500 to-red-600", bg: "bg-rose-500/10", text: "text-rose-400", desc: "التاريخ والجغرافيا" },
  { name: "التكنولوجيا", emoji: "💻", color: "from-cyan-500 to-sky-600", bg: "bg-cyan-500/10", text: "text-cyan-400", desc: "عالم التقنية" },
]

type ViewState =
  | { type: "grades" }
  | { type: "semesters"; gradeId: number; gradeName: string }
  | {
      type: "subjects"
      gradeId: number
      gradeName: string
      semester: string
    }
  | {
      type: "files"
      gradeId: number
      gradeName: string
      semester: string
      subject: string
      subjectColor: string
    }

function FileTypeIcon({ type }: { type: SubjectFile["type"] }) {
  switch (type) {
    case "pdf":
      return <FileText className="h-5 w-5 text-rose-400" />
    case "image":
      return <ImageIcon className="h-5 w-5 text-blue-400" />
    case "link":
      return <LinkIcon className="h-5 w-5 text-emerald-400" />
    default:
      return <FileIcon className="h-5 w-5 text-slate-400" />
  }
}

function FileTypeLabel({ type }: { type: SubjectFile["type"] }) {
  switch (type) {
    case "pdf":
      return "PDF"
    case "image":
      return "صورة"
    case "link":
      return "رابط"
    default:
      return "مستند"
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
}

export default function LandingHero() {
  const { schoolName } = useSchoolName()
  const { config, isDark } = useAppTheme()

  // Theme accent color palette
  const tc = {
    ocean:   { from: "from-blue-500",   via: "via-sky-500",   to: "to-cyan-500",    btnTo: "to-blue-600",   bg500: "bg-blue-500",   text: "text-blue-600",   textLight: "text-blue-400",   bg50: "bg-blue-50",   bg100: "bg-blue-100",   border: "border-blue-100",   border200: "border-blue-200",   shadow: "shadow-blue-300",   glow: "bg-blue-300",   ring: "ring-blue-500" },
    violet:  { from: "from-violet-500", via: "via-purple-500", to: "to-fuchsia-500", btnTo: "to-violet-600", bg500: "bg-violet-500", text: "text-violet-600", textLight: "text-violet-400", bg50: "bg-violet-50", bg100: "bg-violet-100", border: "border-violet-100", border200: "border-violet-200", shadow: "shadow-violet-300", glow: "bg-violet-300",   ring: "ring-violet-500" },
    emerald: { from: "from-emerald-500", via: "via-teal-500", to: "to-cyan-500",    btnTo: "to-emerald-600", bg500: "bg-emerald-500", text: "text-emerald-600", textLight: "text-emerald-400", bg50: "bg-emerald-50", bg100: "bg-emerald-100", border: "border-emerald-100", border200: "border-emerald-200", shadow: "shadow-emerald-300", glow: "bg-emerald-300", ring: "ring-emerald-500" },
    rose:    { from: "from-rose-500",   via: "via-pink-500",  to: "to-fuchsia-500", btnTo: "to-rose-600",   bg500: "bg-rose-500",   text: "text-rose-600",   textLight: "text-rose-400",   bg50: "bg-rose-50",   bg100: "bg-rose-100",   border: "border-rose-100",   border200: "border-rose-200",   shadow: "shadow-rose-300",   glow: "bg-rose-300",   ring: "ring-rose-500" },
    amber:   { from: "from-amber-500",  via: "via-orange-500", to: "to-yellow-500", btnTo: "to-amber-600",  bg500: "bg-amber-500",  text: "text-amber-600",  textLight: "text-amber-400",  bg50: "bg-amber-50",  bg100: "bg-amber-100",  border: "border-amber-100",  border200: "border-amber-200",  shadow: "shadow-amber-300",  glow: "bg-amber-300",  ring: "ring-amber-500" },
  }[config.color] || { from: "from-blue-500", via: "via-sky-500", to: "to-cyan-500", btnTo: "to-blue-600", bg500: "bg-blue-500", text: "text-blue-600", textLight: "text-blue-400", bg50: "bg-blue-50", bg100: "bg-blue-100", border: "border-blue-100", border200: "border-blue-200", shadow: "shadow-blue-300", glow: "bg-blue-300", ring: "ring-blue-500" }

  /* Tailwind safelist:
     selection:bg-blue-500 selection:bg-violet-500 selection:bg-emerald-500 selection:bg-rose-500 selection:bg-amber-500
     hover:border-blue-200 hover:border-violet-200 hover:border-emerald-200 hover:border-rose-200 hover:border-amber-200
     hover:shadow-blue-300/10 hover:shadow-violet-300/10 hover:shadow-emerald-300/10 hover:shadow-rose-300/10 hover:shadow-amber-300/10
     hover:text-blue-400 hover:text-violet-400 hover:text-emerald-400 hover:text-rose-400 hover:text-amber-400
     hover:bg-blue-400 hover:bg-violet-400 hover:bg-emerald-400 hover:bg-rose-400 hover:bg-amber-400
     bg-slate-900 bg-slate-800 bg-slate-700 bg-slate-600 text-slate-300 text-slate-400 text-slate-500 border-slate-700 border-slate-600
  */

  const searchParams = useSearchParams()
  const [view, setView] = useState<ViewState>({ type: "grades" })
  const [files, setFiles] = useState<SubjectFile[]>([])
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([])
  const [teachersList, setTeachersList] = useState<Teacher[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [lastGradeId, setLastGradeId] = useState<number | null>(null)

  // Check if accessed via a signed QR token
  const isViaQR = searchParams.get('token') !== null

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle signed QR token — verify server-side before trusting the gradeId
  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) return

    const resolveToken = async () => {
      const result = await verifyQRToken(tokenParam)
      if (!result) return
      const grade = grades.find(g => g.id === result.gradeId)
      if (grade) {
        setView({
          type: "semesters",
          gradeId: grade.id,
          gradeName: grade.name,
        })
        setLastGradeId(grade.id)
      }
    }

    void resolveToken()
  }, [searchParams])

  // Fetch classes and schedules on mount
  useEffect(() => {
    const loadData = async () => {
      const [cls, sch] = await Promise.all([fetchClasses(), fetchAllSchedule()])
      setClasses(cls)
      setSchedule(sch)
    }
    void loadData()
  }, [])

  useEffect(() => {
    const loadMeta = async () => {
      const [a, t] = await Promise.all([fetchTeacherAssignments(), fetchTeachers()])
      setAssignments(a)
      setTeachersList(t)
    }
    void loadMeta()
  }, [])

  // Helper to get full weekly schedule for a class (grouped by day) - with semester filter
  const getClassFullSchedule = (classId: string, semester: number) => {
    const classSchedule = schedule
      .filter(item => item.classId === classId && item.semester === semester)
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.periodNumber - b.periodNumber)
    
    // Group by day
    const byDay: Record<number, ScheduleItem[]> = {}
    for (let i = 0; i < 7; i++) {
      byDay[i] = classSchedule.filter(item => item.dayOfWeek === i)
    }
    return byDay
  }

  // Day names in Arabic (Sunday to Saturday)
  const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

  useEffect(() => {
    const loadFiles = async () => {
      if (view.type === "files") {
        const list = await fetchSubjectFilesByFilter(
          view.gradeId,
          view.semester,
          view.subject
        )
        setFiles(list)
      }
    }
    void loadFiles()
  }, [view])

  if (!mounted) return (
    <div className={`flex min-h-screen items-center justify-center ${isDark ? "bg-slate-900" : tc.bg50}`}>
      <div className="flex flex-col items-center gap-4">
        <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tc.from} ${tc.btnTo} shadow-lg ${tc.shadow}/30`}>
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <div className={`h-1 w-32 overflow-hidden rounded-full ${isDark ? "bg-slate-800" : tc.bg100}`}>
          <div className={`h-full w-1/2 animate-pulse rounded-full ${tc.bg500}`} />
        </div>
      </div>
    </div>
  )

  return (
    <main className={`flex min-h-screen flex-col ${isDark ? "bg-slate-900" : tc.bg50} ${isDark ? "text-slate-300" : "text-slate-700"} overflow-x-hidden relative selection:${tc.bg500} selection:text-white`}>

      {/* ─── Soft Blue Background ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute inset-0 ${isDark ? "opacity-[0.15]" : "opacity-[0.3]"}`} style={{ backgroundImage: `linear-gradient(${isDark ? "rgba(148,163,184,0.08)" : "rgba(96,165,250,0.12)"} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? "rgba(148,163,184,0.08)" : "rgba(96,165,250,0.12)"} 1px, transparent 1px)`, backgroundSize: '48px 48px' }} />
        <div className={`absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full ${tc.glow}/${isDark ? "10" : "20"} blur-[100px]`} />
        <div className={`absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full ${tc.glow}/${isDark ? "10" : "20"} blur-[100px]`} />
      </div>

      {/* ─── Header ─── */}
      <header className={`sticky top-0 z-40 ${isDark ? "bg-slate-800" : "bg-white"} backdrop-blur-xl border-b ${isDark ? "border-slate-700" : "border-slate-200"} safe-area-top transition-all duration-300`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className={`relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl shadow-lg ${tc.shadow}/20 bg-gradient-to-br ${tc.from} ${tc.via} ${tc.to} p-[1px]`}>
              <div className={`flex h-full w-full items-center justify-center rounded-[11px] ${isDark ? "bg-slate-800" : "bg-white"}`}>
                <GraduationCap className={`h-5 w-5 ${tc.text}`} />
              </div>
              <div className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${tc.bg500} border-2 ${isDark ? "border-slate-800" : "border-white"}`} />
            </div>
            <div>
              <span className={`block text-sm sm:text-base font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{schoolName}</span>
              <span className={`hidden sm:block text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"} font-medium`}>الأساسية المختلطة</span>
            </div>
          </div>

          {/* Actions */}
          {!isViaQR && (
            <Link href="/login">
              <Button className={`h-9 sm:h-10 bg-gradient-to-r ${tc.from} ${tc.btnTo} hover:${tc.from.replace("500", "600")} hover:${tc.btnTo.replace("600", "700")} text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg ${tc.shadow}/30 border-0 flex items-center gap-1.5 transition-all duration-300 hover:scale-105 active:scale-95`}>
                <LogIn className="h-4 w-4" />
                <span>دخول الإدارة</span>
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative z-10 px-4 pt-12 pb-14 sm:pt-20 sm:pb-22 text-center">
        <div className="relative mx-auto max-w-3xl">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold mb-6 border ${tc.border200} ${isDark ? "bg-slate-800" : tc.bg100} ${isDark ? tc.textLight : tc.text} backdrop-blur-md shadow-sm`}
          >
            <Sparkles className={`h-3.5 w-3.5 ${tc.textLight}`} />
            <span>الموقع الرسمي للمدرسة</span>
            <Sparkles className={`h-3.5 w-3.5 ${tc.textLight}`} />
          </motion.div>

          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`mb-4 text-3xl sm:text-5xl md:text-6xl font-black ${isDark ? "text-white" : "text-slate-900"} leading-tight tracking-tight`}
          >
            نحن نُشكّل الجيل القادم
            <br />
            <span className={`bg-gradient-to-r ${tc.from} ${tc.via} ${tc.to} bg-clip-text text-transparent`}>
              {schoolName}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`mb-8 text-sm sm:text-base md:text-lg ${isDark ? "text-slate-400" : "text-slate-500"} max-w-xl mx-auto leading-relaxed`}
          >
            مؤسسة تعليمية حكومية راسخة تسعى إلى بناء شخصية متكاملة لكل طالب، وتهيئة بيئة محفزة تجمع بين الأصالة والتقدم التكنولوجي في قلب كفر عقب.
          </motion.p>

          {/* Stats Pills */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          >
            {[
              { icon: <Users className={`h-4 w-4 ${tc.text}`} />, label: "9 صفوف دراسية" },
              { icon: <BookOpen className={`h-4 w-4 ${tc.text}`} />, label: "7 مواد أساسية" },
              { icon: <Award className={`h-4 w-4 ${tc.text}`} />, label: "بيئة ذكية متكاملة" },
            ].map((stat, i) => (
              <div 
                key={i} 
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium border ${tc.border} ${isDark ? "bg-slate-800" : "bg-white"} backdrop-blur-md ${isDark ? "text-slate-400" : "text-slate-500"} shadow-sm`}
              >
                {stat.icon}
                <span>{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <section className="relative z-10 flex-1 px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-5xl">

          {/* Breadcrumb */}
          {view.type !== "grades" && (
            <motion.nav 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm"
            >
              <button
                onClick={() => setView({ type: "grades" })}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold ${isDark ? "bg-slate-800 hover:bg-slate-700" : "bg-white hover:" + tc.bg50} border ${tc.border200} ${isDark ? tc.textLight : tc.text} transition-all duration-200 shadow-sm`}
              >
                <GraduationCap className="h-4 w-4" />
                الصفوف الدراسية
              </button>

              {(view.type === "semesters" || view.type === "subjects" || view.type === "files") && (
                <>
                  <ChevronLeft className="h-4 w-4 text-slate-400" />
                  {view.type === "semesters" ? (
                    <span className={`rounded-lg px-3 py-1.5 font-semibold ${isDark ? "bg-slate-800" : tc.bg50} border ${tc.border200} ${isDark ? tc.textLight : tc.text}`}>
                      {view.gradeName}
                    </span>
                  ) : (
                    <button
                      onClick={() => setView({ type: "semesters", gradeId: view.gradeId, gradeName: view.gradeName })}
                      className={`rounded-lg px-3 py-1.5 font-semibold ${isDark ? "bg-slate-800 hover:bg-slate-700" : "bg-white hover:" + tc.bg50} border ${tc.border200} ${isDark ? tc.textLight : tc.text} transition-all shadow-sm`}
                    >
                      {view.gradeName}
                    </button>
                  )}
                </>
              )}

              {(view.type === "subjects" || view.type === "files") && (
                <>
                  <ChevronLeft className="h-4 w-4 text-slate-400" />
                  {view.type === "subjects" ? (
                    <span className={`rounded-lg px-3 py-1.5 font-semibold ${isDark ? "bg-slate-800" : tc.bg50} border ${tc.border200} ${isDark ? tc.textLight : tc.text}`}>
                      {view.semester === "first" ? "الفصل الأول" : "الفصل الثاني"}
                    </span>
                  ) : (
                    <button
                      onClick={() => setView({ type: "subjects", gradeId: view.gradeId, gradeName: view.gradeName, semester: view.semester })}
                      className={`rounded-lg px-3 py-1.5 font-semibold ${isDark ? "bg-slate-800 hover:bg-slate-700" : "bg-white hover:" + tc.bg50} border ${tc.border200} ${isDark ? tc.textLight : tc.text} transition-all shadow-sm`}
                    >
                      {view.semester === "first" ? "الفصل الأول" : "الفصل الثاني"}
                    </button>
                  )}
                </>
              )}

              {view.type === "files" && (
                <>
                  <ChevronLeft className="h-4 w-4 text-slate-400" />
                  <span className={`rounded-lg px-3 py-1.5 font-semibold ${isDark ? "bg-slate-800" : tc.bg50} border ${tc.border200} ${isDark ? tc.textLight : tc.text}`}>
                    {view.subject}
                  </span>
                </>
              )}
            </motion.nav>
          )}

          {/* Views with AnimatePresence */}
          <AnimatePresence mode="wait">
            
            {/* ══════════════════════════ FEATURES VIEW (replaces grades grid) ══════════════════════════ */}
            {view.type === "grades" && (
              <motion.div
                key="grades"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="space-y-10"
              >
                {/* Section Header */}
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-4 border ${tc.border200} ${isDark ? "bg-slate-800" : tc.bg100} ${isDark ? tc.textLight : tc.text}`}>
                    <Star className="h-3.5 w-3.5" />
                    <span>مميزاتنا</span>
                  </div>
                  <h2 className={`text-2xl sm:text-3xl font-extrabold ${isDark ? "text-white" : "text-slate-900"} mb-2`}>{`لماذا ${schoolName}؟`}</h2>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"} max-w-md mx-auto`}>نوفر بيئة تعليمية متكاملة تجمع بين التقنية الحديثة والتعليم الأصيل</p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                  {[
                    { emoji: "📚", title: "مناهج متكاملة", desc: "محتوى تعليمي شامل من الصف الأول حتى التاسع وفق المناهج الوطنية المعتمدة", gradient: `${tc.from} ${tc.via.replace("via-", "to-")}`, border: tc.border, glow: `hover:${tc.shadow}/15` },
                    { emoji: "📅", title: "جداول دراسية منظمة", desc: "جداول حصص أسبوعية دقيقة ومحدّثة لكل صف دراسي بشكل مستمر", gradient: `${tc.from} ${tc.via.replace("via-", "to-")}`, border: tc.border, glow: `hover:${tc.shadow}/15` },
                    { emoji: "👨‍🏫", title: "كادر تعليمي متميز", desc: "معلمون مؤهلون ومتخصصون في تقديم التعليم الحديث وتنمية مهارات الطلاب", gradient: `${tc.from} ${tc.via.replace("via-", "to-")}`, border: tc.border, glow: `hover:${tc.shadow}/15` },
                    { emoji: "📁", title: "مكتبة رقمية", desc: "ملفات دراسية ومقررات وأوراق عمل متاحة لكل طالب في أي وقت ومكان", gradient: `${tc.from} ${tc.via.replace("via-", "to-")}`, border: tc.border, glow: `hover:${tc.shadow}/15` },
                    { emoji: "🏆", title: "بيئة آمنة ومحفزة", desc: "بيئة مدرسية تدعم النمو الأكاديمي والاجتماعي لكل طالب بشكل فردي", gradient: `${tc.from} ${tc.via.replace("via-", "to-")}`, border: tc.border, glow: `hover:${tc.shadow}/15` },
                    { emoji: "🔗", title: "تواصل مستمر", desc: "نظام متكامل لمتابعة تقدم الطلاب وتواصل أولياء الأمور مع الكادر التعليمي", gradient: `${tc.from} ${tc.via.replace("via-", "to-")}`, border: tc.border, glow: `hover:${tc.shadow}/15` },
                  ].map((feat, i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      className={`group relative rounded-2xl p-5 border ${feat.border} ${isDark ? "bg-slate-800" : "bg-white"} shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${feat.glow} hover:${tc.border200}`}
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feat.gradient} text-2xl shadow-md ${tc.shadow}/20 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        {feat.emoji}
                      </div>
                      <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2`}>{feat.title}</h3>
                      <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"} leading-relaxed`}>{feat.desc}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Browse Grades CTA */}
                <div className="text-center pt-2">
                  <div className={`inline-flex flex-col sm:flex-row items-center gap-4 rounded-2xl p-5 border ${tc.border200} ${isDark ? "bg-slate-800" : tc.bg50} backdrop-blur-md max-w-xl mx-auto w-full`}>
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tc.from} ${tc.via.replace("via-", "to-")} shadow-lg ${tc.shadow}/30`}>
                      <QrCode className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center sm:text-right flex-1">
                      <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"} mb-0.5`}>تصفح المواد الدراسية</h3>
                      <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>اختر صفك الدراسي للاطلاع على المقررات والجداول والملفات</p>
                    </div>
                    <button
                      onClick={() => {
                        const targetId = lastGradeId || grades[0].id
                        const targetGrade = grades.find(g => g.id === targetId) || grades[0]
                        setView({ type: "semesters", gradeId: targetGrade.id, gradeName: targetGrade.name })
                        setLastGradeId(targetGrade.id)
                      }}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl ${tc.bg500} hover:${tc.bg500.replace("500", "400")} text-white text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md ${tc.shadow}/30`}
                    >
                      ابدأ الآن
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════ SEMESTERS VIEW ══════════════════════════ */}
            {view.type === "semesters" && (
              <motion.div
                key="semesters"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold mb-4 border ${tc.border200} ${isDark ? "bg-slate-800" : tc.bg100} ${isDark ? tc.textLight : tc.text}`}>
                    <span>🎓</span>
                    <span>{view.gradeName}</span>
                  </div>
                  <h2 className={`text-2xl sm:text-3xl font-black ${isDark ? "text-white" : "text-slate-900"} mb-2`}>اختر الفصل الدراسي</h2>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>تصفح المواد الدراسية والجداول المخصصة لكل فصل</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      key: "first",
                      label: "الفصل الدراسي الأول",
                      emoji: "🍂",
                      period: "سبتمبر - يناير",
                      gradient: "from-orange-500 to-amber-500",
                      features: ["مناهج الفصل الأول", "جدول الحصص الأسبوعي", "ملخصات دراسية شاملة"],
                    },
                    {
                      key: "second",
                      label: "الفصل الدراسي الثاني",
                      emoji: "🌸",
                      period: "فبراير - يونيو",
                      gradient: "from-emerald-500 to-teal-500",
                      features: ["مناهج الفصل الثاني", "تحديثات الجدول المدرسي", "أوراق عمل ومراجعات نهائية"],
                    },
                  ].map((sem) => (
                    <button
                      key={sem.key}
                      onClick={() => setView({ type: "subjects", gradeId: view.gradeId, gradeName: view.gradeName, semester: sem.key })}
                      className={`group relative rounded-2xl p-5 sm:p-6 text-right overflow-hidden border ${isDark ? "border-slate-700" : "border-slate-200"} ${isDark ? "bg-slate-800" : "bg-white"} shadow-sm transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-md`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${sem.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300`} />
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                          <div className="flex items-center gap-3.5 mb-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${sem.gradient} text-2xl shadow-xl group-hover:rotate-6 transition-transform duration-300`}>
                              {sem.emoji}
                            </div>
                            <div>
                              <h3 className={`text-base sm:text-lg font-bold ${isDark ? "text-white" : "text-slate-900"} mb-0.5`}>{sem.label}</h3>
                              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{sem.period}</p>
                            </div>
                          </div>
                          <div className="space-y-2 mb-6">
                            {sem.features.map((f, idx) => (
                              <div key={idx} className={`flex items-center gap-2 text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                <div className={`flex h-4 w-4 items-center justify-center rounded-full ${isDark ? "bg-slate-700" : tc.bg50} ${isDark ? tc.textLight : tc.text} text-[10px] font-bold border ${isDark ? "border-slate-600" : tc.border}`}>✓</div>
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 text-xs font-semibold ${isDark ? tc.textLight : tc.text} group-hover:${tc.textLight}`}>
                          <span>عرض المواد والجدول</span>
                          <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════ SUBJECTS VIEW ══════════════════════════ */}
            {view.type === "subjects" && (
              <motion.div
                key="subjects"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Timetable Section */}
                <div className={`rounded-2xl overflow-hidden border ${tc.border} ${isDark ? "bg-slate-800" : "bg-white"} shadow-sm`}>
                  <div className={`p-4 sm:p-5 border-b ${isDark ? "border-slate-700" : "border-blue-50"} bg-gradient-to-r ${isDark ? "from-slate-800 to-slate-700" : "from-blue-50 to-sky-50"} flex items-center gap-3`}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                      <CalendarDays className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-bold ${isDark ? "text-white" : "text-slate-900"} text-sm sm:text-base`}>
                        جدول الحصص الأسبوعي ({view.gradeName})
                      </h3>
                      <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>الفصل الدراسي {view.semester === "first" ? "الأول" : "الثاني"}</p>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 overflow-x-auto">
                    {(() => {
                      const gradeClass = classes.find(c => {
                        const name = c.name.toLowerCase()
                        const gradeNum = view.gradeId.toString()
                        return (
                          name.includes(gradeNum) ||
                          name.includes(view.gradeName.replace("الصف ", "").toLowerCase()) ||
                          name.includes(view.gradeName.toLowerCase()) ||
                          (view.gradeId === 1 && (name.includes("first") || name.includes("أول") || name.includes("اول"))) ||
                          (view.gradeId === 2 && (name.includes("second") || name.includes("ثاني"))) ||
                          (view.gradeId === 3 && (name.includes("third") || name.includes("ثالث"))) ||
                          (view.gradeId === 4 && (name.includes("fourth") || name.includes("رابع"))) ||
                          (view.gradeId === 5 && (name.includes("fifth") || name.includes("خامس"))) ||
                          (view.gradeId === 6 && (name.includes("sixth") || name.includes("سادس"))) ||
                          (view.gradeId === 7 && (name.includes("seventh") || name.includes("سابع"))) ||
                          (view.gradeId === 8 && (name.includes("eighth") || name.includes("ثامن"))) ||
                          (view.gradeId === 9 && (name.includes("ninth") || name.includes("تاسع")))
                        )
                      })
                      
                      if (!gradeClass) {
                        return (
                          <div className="text-center py-8">
                            <Calendar className="h-10 w-10 mx-auto mb-2 text-slate-400" />
                            <p className="text-xs text-slate-500">لا يوجد صف دراسي معرّف حالياً لهذا المستوى</p>
                          </div>
                        )
                      }
                      
                      const semesterNumber = view.semester === "first" ? 1 : 2
                      const fullSchedule = getClassFullSchedule(gradeClass.id, semesterNumber)
                      const hasSchedule = Object.values(fullSchedule).some(day => day.length > 0)
                      
                      if (!hasSchedule) {
                        return (
                          <div className="text-center py-8">
                            <Clock className="h-10 w-10 mx-auto mb-2 text-slate-400" />
                            <p className="text-xs text-slate-500">لم يتم إدخال جدول الحصص لهذا الفصل بعد</p>
                          </div>
                        )
                      }

                      return (
                        <>
                          {/* Desktop Grid View */}
                          <div className="hidden sm:block min-w-[750px]">
                            <div className="grid grid-cols-9 gap-2 mb-2">
                              <div className={`text-center py-2 rounded-xl text-xs font-bold ${isDark ? "bg-slate-700 border-slate-600 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-600"}`}>
                                اليوم / الحصة
                              </div>
                              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                <div key={n} className={`text-center py-2 rounded-xl text-xs font-bold ${isDark ? "bg-slate-700 border-slate-600 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-600"}`}>
                                  {n}
                                </div>
                              ))}
                            </div>
                            {[0, 1, 2, 3, 4, 5].map((dayIndex) => {
                              const daySchedule = fullSchedule[dayIndex] || []
                              const isToday = dayIndex === new Date().getDay()
                              return (
                                <div key={dayIndex} className="grid grid-cols-9 gap-2 mb-2">
                                  <div className={`text-center py-2 rounded-xl text-xs font-bold flex items-center justify-center border ${isToday ? `bg-gradient-to-r ${tc.from} ${tc.via.replace("via-", "to-")} text-white border-transparent` : `${isDark ? "bg-slate-800 border-slate-700" : "bg-blue-50 border-blue-100"} ${isDark ? "text-slate-400" : "text-slate-400"}`}`}>
                                    {dayNames[dayIndex]}
                                  </div>
                                  {[1, 2, 3, 4, 5, 6, 7, 8].map((periodNum) => {
                                    const item = daySchedule.find(s => s.periodNumber === periodNum)
                                    if (!item) return (
                                      <div key={periodNum} className={`text-center rounded-xl flex items-center justify-center min-h-[56px] ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100"}`}>
                                        <span className={`${isDark ? "text-slate-600" : "text-slate-300"} text-xs`}>-</span>
                                      </div>
                                    )
                                    return (
                                      <div key={periodNum} className={`p-1.5 rounded-xl text-center min-h-[56px] flex flex-col items-center justify-center border transition-all duration-300 ${isToday ? `${isDark ? "bg-slate-700 border-slate-600" : "bg-blue-50 border-blue-200"}` : `${isDark ? "bg-slate-800 border-slate-700 hover:border-slate-600" : "bg-white border-slate-100 hover:border-blue-200"}`}`}>
                                        <p className={`text-[11px] font-bold ${isDark ? "text-white" : "text-slate-900"} truncate w-full`}>{item.subject}</p>
                                        <span className={`text-[9px] ${isDark ? "text-slate-500" : "text-slate-400"} mt-1`}>{item.startTime}</span>
                                      </div>
                                    )
                                  })}
                                </div>
                              )
                            })}
                          </div>

                          {/* Mobile List View */}
                          <div className="sm:hidden space-y-3">
                            {[0, 1, 2, 3, 4, 5].map((dayIndex) => {
                              const daySchedule = fullSchedule[dayIndex] || []
                              const isToday = dayIndex === new Date().getDay()
                              const dayLessons = daySchedule.length
                              if (dayLessons === 0) return null
                              return (
                                <div key={dayIndex} className={`rounded-xl overflow-hidden border ${tc.border} ${isDark ? "bg-slate-800" : "bg-white"} shadow-sm`}>
                                  <div className={`px-3 py-2 flex items-center justify-between ${isToday ? `bg-gradient-to-r ${tc.from} ${tc.via.replace("via-", "to-")} text-white` : `${isDark ? "bg-slate-800 border-b border-slate-700" : "bg-blue-50 border-b border-blue-50"} ${isDark ? "text-slate-400" : "text-slate-500"}`}`}>
                                    <div className="font-bold text-xs">{dayNames[dayIndex]}</div>
                                    <div className="text-[10px] opacity-80">{dayLessons} حصص</div>
                                  </div>
                                  <div className="p-2 space-y-1.5">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((periodNum) => {
                                      const item = daySchedule.find(s => s.periodNumber === periodNum)
                                      if (!item) return null
                                      return (
                                        <div key={periodNum} className={`flex items-center gap-2.5 p-2 rounded-lg border ${isToday ? `${isDark ? "bg-slate-700 border-slate-600" : "bg-blue-50 border-blue-100"}` : `${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}`}>
                                          <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${isToday ? `${isDark ? "bg-slate-600 text-blue-300" : "bg-blue-100 text-blue-600"}` : `${isDark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}`}>
                                            {periodNum}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className={`font-semibold text-xs ${isDark ? "text-white" : "text-slate-800"} truncate`}>{item.subject}</div>
                                            <div className={`text-[9px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{item.startTime} - {item.endTime}</div>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>

                {/* Subjects Grid */}
                <div className="space-y-5">
                  <div className="text-center">
                    <div className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold mb-2 border ${tc.border200} ${isDark ? "bg-slate-800" : tc.bg100} ${isDark ? tc.textLight : tc.text}`}>
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>المواد التعليمية</span>
                    </div>
                    <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>مواد {view.gradeName}</h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {subjects.map((subj) => (
                      <button
                        key={subj.name}
                        onClick={() => setView({ type: "files", gradeId: view.gradeId, gradeName: view.gradeName, semester: view.semester, subject: subj.name, subjectColor: subj.color })}
                        className={`group relative rounded-xl p-4 text-center border ${tc.border} ${isDark ? "bg-slate-800" : "bg-white"} shadow-sm transition-all duration-300 hover:shadow-xl hover:${tc.shadow}/10 hover:-translate-y-0.5 hover:${tc.border200}`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${subj.color} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300`} />
                        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${subj.color}`} />

                        <div className="relative flex flex-col items-center gap-3">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${subj.color} text-2xl shadow-md group-hover:scale-105 group-hover:rotate-2 transition-all duration-300`}>
                            {subj.emoji}
                          </div>
                          <div>
                            <h3 className={`text-xs sm:text-sm font-bold ${isDark ? "text-white" : "text-slate-900"} mb-0.5`}>{subj.name}</h3>
                            <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{subj.desc}</p>
                          </div>
                          <div className={`flex items-center gap-1 text-[10px] ${isDark ? tc.textLight : tc.text}`}>
                            <span>تصفح الملفات</span>
                            <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════ FILES VIEW ══════════════════════════ */}
            {view.type === "files" && (
              <motion.div
                key="files"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className={`flex items-center gap-4 rounded-2xl p-5 border ${tc.border} ${isDark ? "bg-slate-800" : "bg-white"} shadow-sm`}>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${view.subjectColor} text-3xl shadow-md`}>
                    {subjects.find((s) => s.name === view.subject)?.emoji || "📚"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className={`text-lg sm:text-xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-1.5`}>{view.subject}</h2>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className={`rounded-md px-2 py-0.5 ${isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"} border ${isDark ? "border-slate-600" : "border-slate-200"}`}>{view.gradeName}</span>
                      <span className={`rounded-md px-2 py-0.5 ${isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"} border ${isDark ? "border-slate-600" : "border-slate-200"}`}>
                        الفصل {view.semester === "first" ? "الأول" : "الثاني"}
                      </span>
                    </div>
                  </div>
                </div>

                {files.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed ${isDark ? "border-slate-700" : "border-slate-200"} py-16 px-6 text-center ${isDark ? "bg-slate-800" : "bg-white"}`}>
                    <span className="text-4xl mb-4">📂</span>
                    <h3 className={`text-sm sm:text-base font-bold ${isDark ? "text-white" : "text-slate-900"} mb-1`}>لا توجد ملفات حالياً</h3>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"} max-w-xs leading-relaxed`}>
                      لم يقم معلم المادة برفع أي أوراق عمل أو ملفات لهذا الفصل بعد. سيتم توفيرها قريباً.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>الملفات والمرفقات ({files.length})</span>
                      <span className={`${isDark ? "text-slate-400" : "text-slate-500"}`}>انقر على الملف لتحميله أو فتحه</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {files.map((file) => {
                        const fileColors = {
                          pdf: { gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-500/5', border: 'border-rose-500/20', badge: 'bg-rose-500/15', text: 'text-rose-400', emoji: '📄' },
                          image: { gradient: 'from-blue-500 to-sky-600', bg: 'bg-blue-500/5', border: 'border-blue-500/20', badge: 'bg-blue-500/15', text: 'text-blue-400', emoji: '🖼️' },
                          link: { gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', badge: 'bg-emerald-500/15', text: 'text-emerald-400', emoji: '🔗' },
                          other: { gradient: 'from-slate-500 to-slate-600', bg: 'bg-slate-500/5', border: 'border-slate-500/20', badge: 'bg-slate-500/15', text: 'text-slate-400', emoji: '📎' },
                        }
                        const fc = fileColors[file.type as keyof typeof fileColors] || fileColors.other
                        return (
                          <a
                            key={file.id}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group flex items-center gap-3.5 p-4 rounded-xl border ${fc.border} ${fc.bg} backdrop-blur-md transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5`}
                          >
                            <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${fc.gradient} text-lg shadow-md group-hover:scale-105 transition-transform duration-300`}>
                              <span className="text-white font-bold">{fc.emoji}</span>
                            </div>
                            <div className="flex-1 min-w-0 text-right">
                              <h4 className={`text-xs sm:text-sm font-bold ${isDark ? "text-white" : "text-slate-900"} truncate mb-1`}>{file.title}</h4>
                              <div className="flex items-center gap-2">
                                <span className={`inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold ${fc.badge} ${fc.text}`}>
                                  <FileTypeLabel type={file.type} />
                                </span>
                                {file.description && (
                                  <p className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"} truncate flex-1`}>{file.description}</p>
                                )}
                              </div>
                            </div>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ─── School Info Cards ─── */}
      <section className={`relative z-10 border-t ${tc.border} px-4 py-12 sm:px-6 ${isDark ? "bg-slate-900" : tc.bg50} backdrop-blur-md`}>
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-3 border ${tc.border200} ${isDark ? "bg-slate-800" : tc.bg100} ${isDark ? tc.textLight : tc.text}`}>
              <Shield className="h-3.5 w-3.5" />
              <span>معلومات المدرسة</span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>{schoolName}</h2>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"} mt-1`}>مؤسسة تعليمية حكومية تخدم أبناء المنطقة منذ سنوات</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <MapPin className="h-4 w-4 text-white" />, gradient: `${tc.from} ${tc.via.replace("via-", "to-")}`, title: "الموقع", value: "كفر عقب — القدس", sub: "الضفة الغربية" },
              { icon: <Phone className="h-4 w-4 text-white" />, gradient: `${tc.from} ${tc.via.replace("via-", "to-")}`, title: "للتواصل", value: "02-234-5678", sub: "أوقات الدوام", ltr: true },
              { icon: <Users className="h-4 w-4 text-white" />, gradient: `${tc.from} ${tc.via.replace("via-", "to-")}`, title: "المراحل الدراسية", value: "الصف الأول — التاسع", sub: "9 صفوف دراسية" },
              { icon: <Calendar className="h-4 w-4 text-white" />, gradient: `${tc.from} ${tc.via.replace("via-", "to-")}`, title: "الدوام المدرسي", value: "الأحد — الخميس", sub: "08:00 صباحاً — 02:00 م" },
            ].map((card, i) => (
              <div
                key={i}
                className={`rounded-2xl p-4 border ${tc.border} ${isDark ? "bg-slate-800" : "bg-white"} shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:${tc.border200} hover:shadow-md`}
              >
                <div className={`flex h-9 w-9 mb-3 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-md ${tc.shadow}/20`}>
                  {card.icon}
                </div>
                <h3 className={`text-[11px] font-semibold ${isDark ? "text-slate-500" : "text-slate-400"} mb-1 uppercase tracking-wide`}>{card.title}</h3>
                <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`} dir={card.ltr ? "ltr" : "rtl"}>{card.value}</p>
                <p className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"} mt-0.5`}>{card.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className={`relative z-10 border-t ${tc.border} px-4 py-8 sm:px-6 ${isDark ? "bg-slate-900" : tc.bg50} backdrop-blur-md safe-area-bottom`}>
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${tc.from} ${tc.via.replace("via-", "to-")} shadow-md ${tc.shadow}/20`}>
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{schoolName}</span>
          </div>
          <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {`جميع الحقوق محفوظة © 2026 — ${schoolName}`}
          </p>
          <div className={`mt-2.5 flex items-center justify-center gap-1 text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            <Sparkles className="h-3 w-3" />
            <span>نظام الإدارة والتعليم الذكي</span>
            <Sparkles className="h-3 w-3" />
          </div>
        </div>
      </footer>
    </main>
  )
}
