"use client"

import { useState, useEffect, useCallback } from "react"
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
import { motion, AnimatePresence } from "framer-motion"

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

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
}

export default function LandingHero() {
  const searchParams = useSearchParams()
  const [view, setView] = useState<ViewState>({ type: "grades" })
  const [files, setFiles] = useState<SubjectFile[]>([])
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([])
  const [teachersList, setTeachersList] = useState<Teacher[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Check if accessed via QR code
  const isViaQR = searchParams.get('grade') !== null

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle URL parameters for direct navigation to semester selection
  useEffect(() => {
    const gradeParam = searchParams.get('grade')
    if (gradeParam) {
      const gradeId = parseInt(gradeParam, 10)
      const grade = grades.find(g => g.id === gradeId)
      if (grade) {
        setView({
          type: "semesters",
          gradeId: grade.id,
          gradeName: grade.name,
        })
      }
    }
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

  if (!mounted) return null

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-slate-100 overflow-x-hidden relative selection:bg-indigo-500 selection:text-white">
      
      {/* ─── Premium Glassmorphic / Animated Background Orbs ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] rounded-full opacity-30 blur-[120px] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] left-[-15%] w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full opacity-20 blur-[130px] bg-gradient-to-br from-teal-500 via-emerald-600 to-indigo-700 animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute top-[35%] left-[25%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full opacity-15 blur-[100px] bg-blue-600 animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
      </div>

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 bg-slate-950/65 backdrop-blur-xl border-b border-slate-800/60 safe-area-top transition-all duration-300">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl shadow-lg shadow-indigo-500/20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-slate-950">
                <GraduationCap className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
            </div>
            <div>
              <span className="block text-sm sm:text-base font-bold tracking-tight text-white">مدرسة كفر عقب</span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-medium">الأساسية المختلطة</span>
            </div>
          </div>

          {/* Actions */}
          {!isViaQR && (
            <Link href="/login">
              <Button className="h-9 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/25 border-0 flex items-center gap-1.5 transition-all duration-300 hover:scale-105 active:scale-95">
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
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold mb-6 border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            <span>الموقع الرسمي للمدرسة</span>
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          </motion.div>

          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight"
          >
            مستقبل تعليمي مشرق في
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              مدرسة كفر عقب الأساسية
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 text-sm sm:text-base md:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed"
          >
            نسعى لتقديم بيئة تعليمية ذكية ومحفزة تنمي قدرات الطلاب وتدعم تواصلهم المستمر مع المواد والمقررات الدراسية من الصف الأول إلى التاسع.
          </motion.p>

          {/* Stats Pills */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          >
            {[
              { icon: <Users className="h-4 w-4 text-indigo-400" />, label: "9 صفوف دراسية" },
              { icon: <BookOpen className="h-4 w-4 text-purple-400" />, label: "7 مواد أساسية" },
              { icon: <Award className="h-4 w-4 text-teal-400" />, label: "بيئة ذكية متكاملة" },
            ].map((stat, i) => (
              <div 
                key={i} 
                className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium border border-slate-800/80 bg-slate-900/50 backdrop-blur-md text-slate-300"
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
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 transition-all duration-200"
              >
                <GraduationCap className="h-4 w-4" />
                الصفوف الدراسية
              </button>

              {(view.type === "semesters" || view.type === "subjects" || view.type === "files") && (
                <>
                  <ChevronLeft className="h-4 w-4 text-slate-600" />
                  {view.type === "semesters" ? (
                    <span className="rounded-lg px-3 py-1.5 font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                      {view.gradeName}
                    </span>
                  ) : (
                    <button
                      onClick={() => setView({ type: "semesters", gradeId: view.gradeId, gradeName: view.gradeName })}
                      className="rounded-lg px-3 py-1.5 font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 transition-all"
                    >
                      {view.gradeName}
                    </button>
                  )}
                </>
              )}

              {(view.type === "subjects" || view.type === "files") && (
                <>
                  <ChevronLeft className="h-4 w-4 text-slate-600" />
                  {view.type === "subjects" ? (
                    <span className="rounded-lg px-3 py-1.5 font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                      {view.semester === "first" ? "الفصل الأول" : "الفصل الثاني"}
                    </span>
                  ) : (
                    <button
                      onClick={() => setView({ type: "subjects", gradeId: view.gradeId, gradeName: view.gradeName, semester: view.semester })}
                      className="rounded-lg px-3 py-1.5 font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 transition-all"
                    >
                      {view.semester === "first" ? "الفصل الأول" : "الفصل الثاني"}
                    </button>
                  )}
                </>
              )}

              {view.type === "files" && (
                <>
                  <ChevronLeft className="h-4 w-4 text-slate-600" />
                  <span className="rounded-lg px-3 py-1.5 font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                    {view.subject}
                  </span>
                </>
              )}
            </motion.nav>
          )}

          {/* Views with AnimatePresence */}
          <AnimatePresence mode="wait">
            
            {/* ══════════════════════════ GRADES VIEW ══════════════════════════ */}
            {view.type === "grades" && (
              <motion.div
                key="grades"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="space-y-6"
              >
                {/* QR Message */}
                <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl p-5 border border-slate-800/80 bg-slate-900/40 backdrop-blur-md max-w-2xl mx-auto mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg flex-shrink-0">
                    <QrCode className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-center sm:text-right">
                    <h2 className="text-base font-bold text-white mb-0.5">مسح رمز الصف الإلكتروني</h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      إذا كان لديك رمز الاستجابة السريعة (QR) الخاص بصفك، يمكنك مسحه للدخول المباشر إلى المقررات. أو اختر صفك يدوياً أدناه.
                    </p>
                  </div>
                </div>

                {/* Grade Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-w-4xl mx-auto">
                  {grades.map((grade) => (
                    <motion.button
                      key={grade.id}
                      variants={itemVariants}
                      onClick={() => setView({ type: "semesters", gradeId: grade.id, gradeName: grade.name })}
                      className="group relative rounded-2xl p-4 sm:p-5 text-right overflow-hidden border border-slate-800/80 bg-slate-900/40 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${grade.color} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300`} />
                      <div className="relative z-10">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${grade.color} text-xl shadow-lg mb-3.5 group-hover:scale-110 transition-transform duration-300`}>
                          <span className="drop-shadow-md">{grade.icon}</span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white mb-1">{grade.name}</h3>
                        <p className="text-xs text-slate-400">{grade.desc}</p>
                      </div>
                      
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                        <ChevronLeft className="h-4 w-4 text-indigo-400" />
                      </div>
                    </motion.button>
                  ))}
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
                  <div className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold mb-4 border border-indigo-500/20 bg-indigo-500/5 text-indigo-300">
                    <span>🎓</span>
                    <span>{view.gradeName}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">اختر الفصل الدراسي</h2>
                  <p className="text-sm text-slate-400">تصفح المواد الدراسية والجداول المخصصة لكل فصل</p>
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
                      className="group relative rounded-2xl p-5 sm:p-6 text-right overflow-hidden border border-slate-800/80 bg-slate-900/40 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${sem.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300`} />
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                          <div className="flex items-center gap-3.5 mb-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${sem.gradient} text-2xl shadow-xl group-hover:rotate-6 transition-transform duration-300`}>
                              {sem.emoji}
                            </div>
                            <div>
                              <h3 className="text-base sm:text-lg font-bold text-white mb-0.5">{sem.label}</h3>
                              <p className="text-xs text-slate-400">{sem.period}</p>
                            </div>
                          </div>
                          <div className="space-y-2 mb-6">
                            {sem.features.map((f, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                                <div className={`flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-indigo-400 text-[10px] font-bold`}>✓</div>
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
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
                <div className="rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900/30 backdrop-blur-md">
                  <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                      <CalendarDays className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm sm:text-base">
                        جدول الحصص الأسبوعي ({view.gradeName})
                      </h3>
                      <p className="text-[11px] text-slate-400">الفصل الدراسي {view.semester === "first" ? "الأول" : "الثاني"}</p>
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
                            <Calendar className="h-10 w-10 mx-auto mb-2 text-slate-600" />
                            <p className="text-xs text-slate-400">لا يوجد صف دراسي معرّف حالياً لهذا المستوى</p>
                          </div>
                        )
                      }
                      
                      const semesterNumber = view.semester === "first" ? 1 : 2
                      const fullSchedule = getClassFullSchedule(gradeClass.id, semesterNumber)
                      const hasSchedule = Object.values(fullSchedule).some(day => day.length > 0)
                      
                      if (!hasSchedule) {
                        return (
                          <div className="text-center py-8">
                            <Clock className="h-10 w-10 mx-auto mb-2 text-slate-600" />
                            <p className="text-xs text-slate-400">لم يتم إدخال جدول الحصص لهذا الفصل بعد</p>
                          </div>
                        )
                      }

                      return (
                        <>
                          {/* Desktop Grid View */}
                          <div className="hidden sm:block min-w-[750px]">
                            <div className="grid grid-cols-9 gap-2 mb-2">
                              <div className="text-center py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800/80 text-slate-400">
                                اليوم / الحصة
                              </div>
                              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                <div key={n} className="text-center py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800/80 text-slate-400">
                                  {n}
                                </div>
                              ))}
                            </div>
                            {[0, 1, 2, 3, 4, 5].map((dayIndex) => {
                              const daySchedule = fullSchedule[dayIndex] || []
                              const isToday = dayIndex === new Date().getDay()
                              return (
                                <div key={dayIndex} className="grid grid-cols-9 gap-2 mb-2">
                                  <div className={`text-center py-2 rounded-xl text-xs font-bold flex items-center justify-center border ${isToday ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                                    {dayNames[dayIndex]}
                                  </div>
                                  {[1, 2, 3, 4, 5, 6, 7, 8].map((periodNum) => {
                                    const item = daySchedule.find(s => s.periodNumber === periodNum)
                                    if (!item) return (
                                      <div key={periodNum} className="text-center rounded-xl flex items-center justify-center min-h-[56px] bg-slate-900/20 border border-slate-900/60">
                                        <span className="text-slate-700 text-xs">-</span>
                                      </div>
                                    )
                                    return (
                                      <div key={periodNum} className={`p-1.5 rounded-xl text-center min-h-[56px] flex flex-col items-center justify-center border transition-all duration-300 ${isToday ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'}`}>
                                        <p className="text-[11px] font-bold text-white truncate w-full">{item.subject}</p>
                                        <span className="text-[9px] text-slate-400 mt-1">{item.startTime}</span>
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
                                <div key={dayIndex} className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900/20">
                                  <div className={`px-3 py-2 flex items-center justify-between ${isToday ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-slate-900/85 border-b border-slate-800 text-slate-300'}`}>
                                    <div className="font-bold text-xs">{dayNames[dayIndex]}</div>
                                    <div className="text-[10px] opacity-80">{dayLessons} حصص</div>
                                  </div>
                                  <div className="p-2 space-y-1.5">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((periodNum) => {
                                      const item = daySchedule.find(s => s.periodNumber === periodNum)
                                      if (!item) return null
                                      return (
                                        <div key={periodNum} className={`flex items-center gap-2.5 p-2 rounded-lg border ${isToday ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-950/60 border-slate-900'}`}>
                                          <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${isToday ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-300'}`}>
                                            {periodNum}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-xs text-white truncate">{item.subject}</div>
                                            <div className="text-[9px] text-slate-500">{item.startTime} - {item.endTime}</div>
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
                    <div className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold mb-2 border border-purple-500/20 bg-purple-500/5 text-purple-300">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>المواد التعليمية</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">مواد {view.gradeName}</h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {subjects.map((subj) => (
                      <button
                        key={subj.name}
                        onClick={() => setView({ type: "files", gradeId: view.gradeId, gradeName: view.gradeName, semester: view.semester, subject: subj.name, subjectColor: subj.color })}
                        className="group relative rounded-xl p-4 text-center border border-slate-800/80 bg-slate-900/40 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${subj.color} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300`} />
                        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${subj.color}`} />

                        <div className="relative flex flex-col items-center gap-3">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${subj.color} text-2xl shadow-md group-hover:scale-105 group-hover:rotate-2 transition-all duration-300`}>
                            {subj.emoji}
                          </div>
                          <div>
                            <h3 className="text-xs sm:text-sm font-bold text-white mb-0.5">{subj.name}</h3>
                            <p className="text-[10px] text-slate-400">{subj.desc}</p>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-indigo-400">
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
                <div className="flex items-center gap-4 rounded-2xl p-5 border border-slate-800 bg-slate-900/30 backdrop-blur-md">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${view.subjectColor} text-3xl shadow-md`}>
                    {subjects.find((s) => s.name === view.subject)?.emoji || "📚"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-1.5">{view.subject}</h2>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-md px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700/60">{view.gradeName}</span>
                      <span className="rounded-md px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700/60">
                        الفصل {view.semester === "first" ? "الأول" : "الثاني"}
                      </span>
                    </div>
                  </div>
                </div>

                {files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-800 py-16 px-6 text-center bg-slate-900/10">
                    <span className="text-4xl mb-4">📂</span>
                    <h3 className="text-sm sm:text-base font-bold text-white mb-1">لا توجد ملفات حالياً</h3>
                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                      لم يقم معلم المادة برفع أي أوراق عمل أو ملفات لهذا الفصل بعد. سيتم توفيرها قريباً.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-semibold text-slate-300">الملفات والمرفقات ({files.length})</span>
                      <span className="text-slate-400">انقر على الملف لتحميله أو فتحه</span>
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
                              <h4 className="text-xs sm:text-sm font-bold text-white truncate mb-1">{file.title}</h4>
                              <div className="flex items-center gap-2">
                                <span className={`inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold ${fc.badge} ${fc.text}`}>
                                  <FileTypeLabel type={file.type} />
                                </span>
                                {file.description && (
                                  <p className="text-[10px] text-slate-400 truncate flex-1">{file.description}</p>
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
      <section className="relative z-10 border-t border-slate-900/60 px-4 py-10 sm:px-6 bg-slate-950/40 backdrop-blur-md">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: <MapPin className="h-5 w-5 text-white" />, gradient: "from-sky-500 to-blue-600", title: "موقع المدرسة", value: "كفر عقب - القدس" },
            { icon: <Phone className="h-5 w-5 text-white" />, gradient: "from-violet-500 to-purple-600", title: "هاتف وتواصل", value: "02-234-5678", ltr: true },
            { icon: <Users className="h-5 w-5 text-white" />, gradient: "from-rose-500 to-pink-600", title: "الفئات المستهدفة", value: "الصفوف الأساسية (1 - 9)" },
          ].map((card, i) => (
            <div
              key={i}
              className="group rounded-xl p-4 sm:p-5 border border-slate-900 bg-slate-900/30 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3.5">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg shadow-indigo-500/5`}>
                  {card.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-white mb-0.5">{card.title}</h3>
                  <p className="text-xs text-slate-400" dir={card.ltr ? "ltr" : "rtl"}>{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-slate-900 px-4 py-6 sm:px-6 bg-slate-950/80 safe-area-bottom">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">مدرسة كفر عقب الأساسية</span>
          </div>
          <p className="text-[10px] text-slate-500">
            جميع الحقوق محفوظة © 2026 — مدرسة كفر عقب الأساسية المختلطة
          </p>
          <div className="mt-2.5 flex items-center justify-center gap-1 text-[10px] text-slate-600">
            <Sparkles className="h-3 w-3" />
            <span>نظام الإدارة والتعليم الذكي</span>
            <Sparkles className="h-3 w-3" />
          </div>
        </div>
      </footer>
    </main>
  )
}
