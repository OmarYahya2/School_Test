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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SubjectFile, TeacherAssignment, Teacher, SchoolClass, ScheduleItem } from "@/lib/store"
import { fetchSubjectFilesByFilter } from "@/lib/supabase-files"
import { fetchTeacherAssignments, fetchTeachers } from "@/lib/supabase-teachers"
import { fetchClasses, fetchAllSchedule } from "@/lib/supabase-school"

const grades = [
  { id: 1, name: "الصف الأول", color: "from-sky-400 to-blue-500", icon: "🎨", desc: "بداية الرحلة" },
  { id: 2, name: "الصف الثاني", color: "from-blue-400 to-indigo-500", icon: "🚀", desc: "اكتشاف جديد" },
  { id: 3, name: "الصف الثالث", color: "from-indigo-400 to-violet-500", icon: "⭐", desc: "تطور مستمر" },
  { id: 4, name: "الصف الرابع", color: "from-violet-400 to-purple-500", icon: "🔬", desc: "علوم ممتعة" },
  { id: 5, name: "الصف الخامس", color: "from-purple-400 to-fuchsia-500", icon: "📚", desc: "معرفة أعمق" },
  { id: 6, name: "الصف السادس", color: "from-fuchsia-400 to-pink-500", icon: "🎯", desc: "تحضير منهجي" },
  { id: 7, name: "الصف السابع", color: "from-rose-400 to-red-500", icon: "💡", desc: "مرحلة جديدة" },
  { id: 8, name: "الصف الثامن", color: "from-orange-400 to-amber-500", icon: "⚡", desc: "تقدم ملحوظ" },
  { id: 9, name: "الصف التاسع", color: "from-emerald-400 to-teal-500", icon: "🏆", desc: "الإنجاز النهائي" },
]

const subjects = [
  { name: "اللغة العربية", emoji: "📖", color: "from-blue-400 to-blue-500", desc: "لغتنا الجميلة" },
  { name: "اللغة الإنجليزية", emoji: "🔤", color: "from-indigo-400 to-purple-500", desc: "English Language" },
  { name: "الرياضيات", emoji: "🔢", color: "from-purple-400 to-fuchsia-500", desc: "أرقام وحساب" },
  { name: "العلوم والحياة", emoji: "🔬", color: "from-emerald-400 to-green-500", desc: "اكتشاف العلوم" },
  { name: "التربية الدينية", emoji: "🕌", color: "from-amber-400 to-yellow-500", desc: "تعليم ديني" },
  { name: "الدراسات الاجتماعية", emoji: "🌍", color: "from-rose-400 to-red-500", desc: "التاريخ والجغرافيا" },
  { name: "التكنولوجيا", emoji: "💻", color: "from-cyan-400 to-sky-500", desc: "عالم التقنية" },
]

const subjectIcons: Record<string, string> = {
  ar: "ع",
  en: "E",
  math: "+",
  sci: "~",
  rel: "d",
  soc: "G",
  tech: "</>",
}

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
      return <FileText className="h-5 w-5 text-destructive" />
    case "image":
      return <ImageIcon className="h-5 w-5 text-primary" />
    case "link":
      return <LinkIcon className="h-5 w-5 text-accent-foreground" />
    default:
      return <FileIcon className="h-5 w-5 text-muted-foreground" />
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

export default function LandingHero() {
  const searchParams = useSearchParams()
  const [view, setView] = useState<ViewState>({ type: "grades" })
  const [files, setFiles] = useState<SubjectFile[]>([])
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([])
  const [teachersList, setTeachersList] = useState<Teacher[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])

  // Check if accessed via QR code
  const isViaQR = searchParams.get('grade') !== null

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

  function getTeacherNameForSubject(
    gradeId: number,
    semester: string,
    subjectName: string
  ): string | null {
    const assignment = assignments.find(
      (a) =>
        a.gradeId === gradeId &&
        a.semester === semester &&
        a.subject === subjectName
    )
    if (!assignment) return null
    const teacher = teachersList.find((t) => t.id === assignment.teacherId)
    return teacher?.name || null
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Header - Mobile Optimized */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm safe-area-top">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 md:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-foreground md:text-lg">
                مدرسة كفر عقب
              </span>
              <p className="hidden text-xs text-muted-foreground sm:block">
                الأساسية المختلطة
              </p>
            </div>
          </div>
          {!isViaQR && (
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 sm:gap-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground touch-target-sm px-2.5 sm:px-3"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">دخول الإدارة</span>
                <span className="sm:hidden text-xs">دخول</span>
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section - Mobile Optimized */}
      <section className="relative bg-gradient-to-br from-sky-50 via-white to-indigo-50 px-3 py-8 sm:px-4 sm:py-12 md:px-6 md:py-16 lg:py-20 overflow-hidden">
        {/* Fun Background Pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iIzNiODJmNiIgZmlsbC1vcGFjaXR5PSIwLjIiLz48L3N2Zz4=')] bg-repeat"></div>
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-4 sm:mb-6 inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-gradient-to-r from-sky-100 to-indigo-100 px-3 py-1.5 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-indigo-600">
            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>موقع مدرستنا الرسمي</span>
          </div>
          <h1 className="mb-4 sm:mb-6 text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 text-balance leading-tight">
            مدرسة كفر عقب
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500 mt-1 sm:mt-2">الأساسية المختلطة</span>
          </h1>
          <p className="mb-6 sm:mb-8 md:mb-10 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-slate-600 text-pretty max-w-2xl mx-auto px-2 sm:px-0">
            نرحب بكم في موقع مدرستنا. نسعى لتقديم بيئة تعليمية متميزة لأبنائنا
            الطلبة من الصف الأول حتى الصف التاسع.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 md:gap-8 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-sm">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-sky-500" />
              <span className="font-medium text-slate-700">9 صفوف دراسية</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-sm">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />
              <span className="font-medium text-slate-700">7 مواد دراسية</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-sm">
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-violet-500" />
              <span className="font-medium text-slate-700">بيئة محفزة</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Mobile Optimized */}
      <section className="flex-1 px-3 py-6 sm:px-4 sm:py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-5xl">
          {/* Breadcrumb */}
          {view.type !== "grades" && (
            <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm">
              <button
                onClick={() => setView({ type: "grades" })}
                className="font-medium text-primary hover:underline"
              >
                الصفوف الدراسية
              </button>

              {(view.type === "semesters" ||
                view.type === "subjects" ||
                view.type === "files") && (
                <>
                  <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
                  {view.type === "semesters" ? (
                    <span className="font-medium text-foreground">
                      {view.gradeName}
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        setView({
                          type: "semesters",
                          gradeId: view.gradeId,
                          gradeName: view.gradeName,
                        })
                      }
                      className="font-medium text-primary hover:underline"
                    >
                      {view.gradeName}
                    </button>
                  )}
                </>
              )}

              {(view.type === "subjects" || view.type === "files") && (
                <>
                  <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
                  {view.type === "subjects" ? (
                    <span className="font-medium text-foreground">
                      {view.semester === "first"
                        ? "الفصل الأول"
                        : "الفصل الثاني"}
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        setView({
                          type: "subjects",
                          gradeId: view.gradeId,
                          gradeName: view.gradeName,
                          semester: view.semester,
                        })
                      }
                      className="font-medium text-primary hover:underline"
                    >
                      {view.semester === "first"
                        ? "الفصل الأول"
                        : "الفصل الثاني"}
                    </button>
                  )}
                </>
              )}

              {view.type === "files" && (
                <>
                  <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    {view.subject}
                  </span>
                </>
              )}
            </nav>
          )}

          {/* === Grades View - Hidden on main page === */}
          {view.type === "grades" && (
            <div className="max-w-4xl mx-auto text-center py-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-100 to-indigo-100 text-indigo-600 px-5 py-3 rounded-full text-sm font-semibold mb-6">
                <QrCode className="h-5 w-5" />
                <span>الوصول للصفوف عبر QR</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                الرجاء مسح رمز QR
              </h2>
              <p className="text-slate-500 max-w-md mx-auto">
                يرجى استخدام رمز QR الموجود في المدرسة للوصول للصفوف والمواد الدراسية
              </p>
            </div>
          )}

          {/* === Semester Selection - Kid-Friendly Beautiful Design === */}
          {view.type === "semesters" && (
            <div className="max-w-3xl mx-auto">
              {/* Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-100 to-indigo-100 text-indigo-600 px-5 py-2 rounded-full text-sm font-semibold mb-4">
                  <span className="text-xl">🎓</span>
                  <span>{view.gradeName}</span>
                  <span className="text-xl">📚</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                  اختر الفصل الدراسي
                </h2>
                <p className="text-slate-500">
                  كل فصل يحتوي على مواد وملفات متنوعة
                </p>
              </div>

              {/* Semesters Grid */}
              <div className="grid gap-5 sm:grid-cols-2">
                {[
                  {
                    key: "first",
                    label: "الفصل الأول",
                    emoji: "🍂",
                    period: "سبتمبر - يناير",
                    months: "🗓️ 5 أشهر",
                    color: "from-orange-400 to-amber-500",
                    bgColor: "from-orange-50 to-amber-50",
                    borderColor: "border-orange-200",
                    features: ["بداية العام", "تأسيس قوي", "أنشطة خريفية"],
                  },
                  {
                    key: "second",
                    label: "الفصل الثاني",
                    emoji: "🌸",
                    period: "فبراير - يونيو",
                    months: "🗓️ 5 أشهر",
                    color: "from-emerald-400 to-teal-500",
                    bgColor: "from-emerald-50 to-teal-50",
                    borderColor: "border-emerald-200",
                    features: ["نهاية العام", "التحضير للامتحانات", "أنشطة ربيعية"],
                  },
                ].map((sem) => (
                  <button
                    key={sem.key}
                    onClick={() =>
                      setView({
                        type: "subjects",
                        gradeId: view.gradeId,
                        gradeName: view.gradeName,
                        semester: sem.key,
                      })
                    }
                    className={`group relative bg-gradient-to-br ${sem.bgColor} rounded-3xl p-6 border-2 ${sem.borderColor} hover:border-transparent hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-right overflow-hidden`}
                  >
                    {/* Decorative Background */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${sem.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
                    
                    {/* Emoji Badge */}
                    <div className="relative flex items-center gap-4 mb-5">
                      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${sem.color} text-4xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                        {sem.emoji}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-1">{sem.label}</h3>
                        <p className="text-sm text-slate-500">{sem.period}</p>
                      </div>
                    </div>
                    
                    {/* Info Badge */}
                    <div className="relative flex items-center gap-2 mb-4">
                      <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-slate-600 shadow-sm">
                        {sem.months}
                      </span>
                      <span className="bg-white/50 px-2 py-1 rounded-full text-xs text-slate-500">
                        📖 مواد متنوعة
                      </span>
                    </div>
                    
                    {/* Features List */}
                    <div className="relative space-y-2">
                      {sem.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${sem.color} text-white text-xs`}>
                            ✓
                          </span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Hover Arrow */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-1 text-slate-400 group-hover:text-slate-600 transition-colors">
                      <span className="text-sm font-medium">اختر الفصل</span>
                      <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Fun Footer */}
              <div className="mt-10 text-center">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-100 to-orange-100 px-5 py-2 rounded-full">
                  <span className="text-xl">✨</span>
                  <span className="text-sm font-bold text-orange-600">عام دراسي ممتع ومليء بالإنجازات</span>
                  <span className="text-xl">🌟</span>
                </div>
              </div>
            </div>
          )}

          {/* === Subjects View - With Real Schedule from Admin === */}
          {view.type === "subjects" && (
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Schedule Section - Real data from admin */}
              <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm">
                {/* Schedule Header */}
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-500 to-teal-600">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white shadow-sm">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">
                        جدول {view.gradeName} - {view.semester === "first" ? "الفصل الأول" : "الفصل الثاني"}
                      </h3>
                      <p className="text-xs text-emerald-100">
                        البيانات من لوحة إدارة المدرسة
                      </p>
                    </div>
                  </div>
                </div>

                {/* Weekly Schedule Table - Mobile Optimized */}
                <div className="p-3 sm:p-4 overflow-x-auto -mx-3 sm:mx-0">
                  {(() => {
                    // Find the class for this grade - try multiple matching strategies
                    const gradeClass = classes.find(c => {
                      const name = c.name.toLowerCase()
                      const gradeNum = view.gradeId.toString()
                      // Try different matching patterns: "1", "first", "أول", etc.
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
                        <div className="text-center py-8 bg-slate-50 rounded-xl">
                          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500 mb-2">لا يوجد صف مسجل لهذا المستوى</p>
                          {classes.length === 0 ? (
                            <p className="text-xs text-slate-400">لا توجد أي صفوف في قاعدة البيانات</p>
                          ) : (
                            <p className="text-xs text-slate-400">الصفوف المتاحة: {classes.map(c => c.name).join(", ")}</p>
                          )}
                        </div>
                      )
                    }
                    
                    const semesterNumber = view.semester === "first" ? 1 : 2
                    const fullSchedule = getClassFullSchedule(gradeClass.id, semesterNumber)
                    const hasSchedule = Object.values(fullSchedule).some(day => day.length > 0)
                    
                    if (!hasSchedule) {
                      return (
                        <div className="text-center py-8 bg-slate-50 rounded-xl">
                          <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500">لا يوجد جدول مجدول بعد</p>
                          <p className="text-sm text-slate-400 mt-1">
                            سيتم إضافة الجدول من لوحة الإدارة
                          </p>
                        </div>
                      )
                    }

                      return (
                        <>
                          {/* Desktop Grid View */}
                          <div className="hidden sm:block min-w-[600px] sm:min-w-[800px]">
                            {/* Header Row - Period numbers */}
                            <div className="grid grid-cols-9 gap-1.5 sm:gap-2 mb-2">
                              <div className="text-center py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg font-bold text-[10px] sm:text-xs bg-slate-100 text-slate-700">
                                اليوم / الحصة
                              </div>
                              {[1, 2, 3, 4, 5, 6, 7, 8].map((periodNum) => (
                                <div
                                  key={periodNum}
                                  className="text-center py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg font-bold text-[10px] sm:text-xs bg-slate-100 text-slate-700"
                                >
                                  {periodNum}
                                </div>
                              ))}
                            </div>
                            
                            {/* Schedule Rows - Each day is a row */}
                            {[0, 1, 2, 3, 4, 5].map((dayIndex) => {
                              const daySchedule = fullSchedule[dayIndex] || []
                              const isToday = dayIndex === new Date().getDay()
                              
                              return (
                                <div key={dayIndex} className="grid grid-cols-9 gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                  {/* Day name cell */}
                                  <div
                                    className={`text-center py-2 sm:py-3 px-1 sm:px-2 rounded-lg font-bold text-[10px] sm:text-xs flex items-center justify-center ${
                                      isToday
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {dayNames[dayIndex]}
                                  </div>
                                  
                                  {/* Period cells for this day */}
                                  {[1, 2, 3, 4, 5, 6, 7, 8].map((periodNum) => {
                                    const item = daySchedule.find(s => s.periodNumber === periodNum)
                                    
                                    if (!item) {
                                      return (
                                        <div 
                                          key={periodNum}
                                          className="text-center py-2 sm:py-3 bg-slate-50 rounded-lg border border-slate-100 min-h-[50px] sm:min-h-[60px] flex items-center justify-center"
                                        >
                                          <span className="text-[9px] sm:text-[10px] text-slate-400">-</span>
                                        </div>
                                      )
                                    }
                                    
                                    return (
                                      <div
                                        key={periodNum}
                                        className={`p-1.5 sm:p-2 rounded-lg border text-center ${
                                          isToday
                                            ? 'bg-emerald-50 border-emerald-200'
                                            : 'bg-white border-slate-200'
                                        }`}
                                      >
                                        <p className="text-[9px] sm:text-[10px] font-medium text-slate-700 truncate leading-tight">
                                          {item.subject}
                                        </p>
                                        <span className="text-[8px] sm:text-[9px] text-slate-500">
                                          {item.startTime}
                                        </span>
                                      </div>
                                    )
                                  })}
                                </div>
                              )
                            })}
                          </div>

                          {/* Mobile Card View */}
                          <div className="sm:hidden space-y-3">
                            {[0, 1, 2, 3, 4, 5].map((dayIndex) => {
                              const daySchedule = fullSchedule[dayIndex] || []
                              const isToday = dayIndex === new Date().getDay()
                              const dayLessons = daySchedule.length
                              
                              // Skip empty days on mobile to save space
                              if (dayLessons === 0) return null
                              
                              return (
                                <div key={dayIndex} className="border rounded-xl overflow-hidden bg-white">
                                  {/* Day Header */}
                                  <div className={`px-4 py-2.5 flex items-center justify-between ${
                                    isToday ? 'bg-emerald-500 text-white' : 'bg-slate-100'
                                  }`}>
                                    <div className="font-bold text-sm">{dayNames[dayIndex]}</div>
                                    <div className={`text-xs ${isToday ? 'text-emerald-100' : 'text-slate-500'}`}>
                                      {dayLessons} حصة
                                    </div>
                                  </div>
                                  {/* Day Schedule */}
                                  <div className="p-3 space-y-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((periodNum) => {
                                      const item = daySchedule.find(s => s.periodNumber === periodNum)
                                      
                                      if (!item) return null
                                      
                                      return (
                                        <div
                                          key={periodNum}
                                          className={`flex items-center gap-3 p-2.5 rounded-lg border ${
                                            isToday 
                                              ? 'bg-emerald-50 border-emerald-200' 
                                              : 'bg-white border-slate-200'
                                          }`}
                                        >
                                          {/* Period Number */}
                                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                                            isToday ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-200 text-slate-600'
                                          }`}>
                                            {periodNum}
                                          </div>
                                          {/* Subject Info */}
                                          <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm text-slate-800 truncate">
                                              {item.subject}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                              {item.startTime} - {item.endTime}
                                            </div>
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

              {/* Subjects Section */}
              <div>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 px-5 py-2 rounded-full text-sm font-semibold mb-4">
                    <BookOpen className="h-4 w-4" />
                    <span>المواد الدراسية</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
                    مواد {view.gradeName}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    اختر المادة لعرض الملفات والمصادر
                  </p>
                </div>

                {/* Subjects Grid - Mobile Optimized */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {subjects.map((subj) => (
                    <button
                      key={subj.name}
                      onClick={() =>
                        setView({
                          type: "files",
                          gradeId: view.gradeId,
                          gradeName: view.gradeName,
                          semester: view.semester,
                          subject: subj.name,
                          subjectColor: subj.color,
                        })
                      }
                      className="group relative bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border-2 border-slate-100 hover:border-transparent hover:shadow-xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 overflow-hidden touch-target-sm"
                    >
                      {/* Background Color on Hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${subj.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                      
                      {/* Top Color Bar */}
                      <div className={`absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r ${subj.color}`} />
                      
                      <div className="relative flex flex-col items-center gap-2 sm:gap-3 text-center">
                        {/* Emoji Circle */}
                        <div className={`flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${subj.color} text-2xl sm:text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                          <span>{subj.emoji}</span>
                        </div>
                        
                        {/* Subject Name */}
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-700 mb-0.5 sm:mb-1 group-hover:text-slate-900 transition-colors">
                            {subj.name}
                          </h3>
                          <p className="text-[10px] sm:text-xs text-slate-400">{subj.desc}</p>
                        </div>
                        
                        {/* Arrow Indicator */}
                        <div className="mt-0.5 sm:mt-1 flex items-center gap-1 text-[10px] sm:text-xs text-slate-300 group-hover:text-slate-400 transition-colors">
                          <span>عرض الملفات</span>
                          <ChevronLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* === Subject Files View - Kid-Friendly Beautiful Design === */}
          {view.type === "files" && (
            <div className="max-w-4xl mx-auto">
              {/* Subject Header Card - Mobile Optimized */}
              <div className="flex items-center gap-3 sm:gap-5 mb-6 sm:mb-8 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-slate-100 shadow-sm">
                <div className={`${view.subjectColor} flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0`}>
                  <span className="text-white text-3xl sm:text-5xl">
                    {subjects.find((s) => s.name === view.subject)?.emoji || "📚"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-800 truncate">{view.subject}</h2>
                    <span className="text-xl sm:text-2xl">🎯</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500">
                    <span className="bg-slate-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">{view.gradeName}</span>
                    <span>•</span>
                    <span className="bg-slate-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">{view.semester === "first" ? "الفصل الأول 🍂" : "الفصل الثاني 🌸"}</span>
                  </div>
                </div>
              </div>

              {files.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-dashed border-slate-200 bg-gradient-to-br from-sky-50 to-indigo-50 px-4 sm:px-6 py-12 sm:py-20 text-center">
                  <div className="mb-4 sm:mb-6 flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-white shadow-md">
                    <span className="text-4xl sm:text-6xl">📂</span>
                  </div>
                  <h3 className="mb-2 sm:mb-3 text-xl sm:text-2xl font-bold text-slate-600">لا توجد ملفات حالياً</h3>
                  <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">سيتم إضافة المحتوى قريباً إن شاء الله</p>
                  <div className="flex gap-2 sm:gap-3 text-2xl sm:text-3xl">
                    <span>📝</span>
                    <span>📚</span>
                    <span>✨</span>
                    <span>🎓</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Files Count Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📁</span>
                      <span className="font-bold text-slate-700">الملفات المتاحة</span>
                      <span className="bg-gradient-to-r from-sky-400 to-indigo-400 text-white text-sm font-bold px-3 py-1 rounded-full">
                        {files.length}
                      </span>
                    </div>
                    <span className="text-sm text-slate-400">اضغط على أي ملف للتحميل</span>
                  </div>

                  {/* Files Grid - Mobile Optimized Compact Layout */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                    {files.map((file, index) => (
                      <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 border-2 border-slate-100 hover:border-transparent hover:shadow-lg hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300 overflow-hidden relative text-center touch-target-sm"
                      >
                        {/* Background Color on Hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${
                          file.type === 'pdf' ? 'from-red-50 to-orange-50' :
                          file.type === 'image' ? 'from-sky-50 to-blue-50' :
                          file.type === 'link' ? 'from-emerald-50 to-green-50' :
                          'from-slate-50 to-gray-50'
                        } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                        
                        {/* File Icon - Smaller for mobile */}
                        <div className={`flex h-10 w-10 sm:h-12 sm:w-12 mx-auto items-center justify-center rounded-lg sm:rounded-xl text-lg sm:text-2xl shadow-md group-hover:scale-110 transition-transform duration-300 mb-1.5 sm:mb-2 ${
                          file.type === 'pdf' ? 'bg-gradient-to-br from-red-400 to-orange-500' :
                          file.type === 'image' ? 'bg-gradient-to-br from-sky-400 to-blue-500' :
                          file.type === 'link' ? 'bg-gradient-to-br from-emerald-400 to-green-500' :
                          'bg-gradient-to-br from-slate-400 to-gray-500'
                        }`}>
                          <span className="text-white">
                            {file.type === 'pdf' && '📄'}
                            {file.type === 'image' && '🖼️'}
                            {file.type === 'link' && '🔗'}
                            {file.type !== 'pdf' && file.type !== 'image' && file.type !== 'link' && '📎'}
                          </span>
                        </div>
                        
                        {/* File Info - Compact */}
                        <div className="relative">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-700 truncate group-hover:text-slate-900 transition-colors mb-1">{file.title}</h4>
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            <span className={`inline-flex items-center gap-1 rounded-full px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold ${
                              file.type === 'pdf' ? 'bg-red-100 text-red-600' :
                              file.type === 'image' ? 'bg-sky-100 text-sky-600' :
                              file.type === 'link' ? 'bg-emerald-100 text-emerald-600' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              <FileTypeLabel type={file.type} />
                            </span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </>
              )}
              
              {/* Fun Footer */}
              <div className="mt-10 text-center">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 px-6 py-3 rounded-full shadow-sm">
                  <span className="text-xl">🌟</span>
                  <span className="text-base font-bold text-orange-600">تعلم ممتع مع مدرستنا</span>
                  <span className="text-xl">🎓</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* School Info - Mobile Optimized */}
      <section className="border-t border-slate-100 bg-gradient-to-br from-sky-50 to-indigo-50 px-3 py-8 sm:px-4 sm:py-10 md:px-6 md:py-12">
        <div className="mx-auto grid max-w-5xl gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-slate-100 hover:border-sky-200 hover:shadow-lg transition-all">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-md">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-slate-700 mb-0.5 sm:mb-1">الموقع</h3>
                <p className="text-xs sm:text-sm text-slate-500">كفر عقب - القدس</p>
              </div>
            </div>
          </div>
          <div className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 text-white shadow-md">
                <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-slate-700 mb-0.5 sm:mb-1">التواصل</h3>
                <p className="text-xs sm:text-sm text-slate-500" dir="ltr">02-234-5678</p>
              </div>
            </div>
          </div>
          <div className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-slate-100 hover:border-violet-200 hover:shadow-lg transition-all sm:col-span-2 lg:col-span-1">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 text-white shadow-md">
                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-slate-700 mb-0.5 sm:mb-1">الطلاب</h3>
                <p className="text-xs sm:text-sm text-slate-500">صفوف من الأول حتى التاسع</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Mobile Optimized */}
      <footer className="border-t border-slate-100 bg-white px-3 py-6 sm:px-4 sm:py-8 text-center safe-area-bottom">
        <div className="mx-auto max-w-4xl">
          <div className="mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-md">
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="text-sm sm:text-base font-bold text-slate-700">مدرسة كفر عقب</span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 px-2">
            مدرسة كفر عقب الأساسية المختلطة - جميع الحقوق محفوظة © 2026
          </p>
        </div>
      </footer>
    </main>
  )
}
