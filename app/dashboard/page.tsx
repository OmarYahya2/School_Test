 "use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { 
  Users, 
  BookOpen, 
  UserCheck, 
  TrendingUp,
  ArrowLeft,
  Plus,
  Sparkles,
  GraduationCap,
  Calendar,
  Clock,
  Activity,
  ChevronLeft,
  FileText,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Bell,
  School,
  BarChart3,
  MapPin,
  Phone,
  Mail,
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import type { SchoolClass, Teacher, Student, ScheduleItem, SubjectFile } from "@/lib/store"
import {
  fetchClasses,
  fetchStudents,
  fetchAllSchedule,
} from "@/lib/supabase-school"
import { fetchTeachers } from "@/lib/supabase-teachers"
import { fetchSubjectFiles } from "@/lib/supabase-files"

// Day names in Arabic
const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

export default function DashboardPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [files, setFiles] = useState<SubjectFile[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [cls, tch, std, sch, fls] = await Promise.all([
        fetchClasses(),
        fetchTeachers(),
        fetchStudents(),
        fetchAllSchedule(),
        fetchSubjectFiles(),
      ])
      setClasses(cls)
      setTeachers(tch)
      setStudents(std)
      setSchedule(sch)
      setFiles(fls)
    } catch (error) {
      toast.error("حدث خطأ أثناء تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  // Stats calculations
  const stats = useMemo(() => {
    const totalClasses = classes.length
    const totalTeachers = teachers.length
    const totalStudents = students.length
    const avgStudentsPerClass = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0
    const teacherStudentRatio = totalTeachers > 0 ? (totalStudents / totalTeachers).toFixed(1) : "0"
    const maxCapacity = totalClasses * 30
    const occupancyRate = maxCapacity > 0 ? Math.round((totalStudents / maxCapacity) * 100) : 0
    
    return {
      totalClasses,
      totalTeachers,
      totalStudents,
      avgStudentsPerClass,
      teacherStudentRatio,
      occupancyRate,
      totalFiles: files.length,
      totalScheduleItems: schedule.length,
    }
  }, [classes, teachers, students, files, schedule])

  // Today's schedule
  const todaySchedule = useMemo(() => {
    const today = currentTime.getDay()
    return schedule
      .filter(item => item.dayOfWeek === today)
      .sort((a, b) => a.periodNumber - b.periodNumber)
      .slice(0, 5)
  }, [schedule, currentTime])

  // Recent data (last 7 days)
  const recentStudents = useMemo(() => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return students
      .filter(s => new Date(s.createdAt) >= sevenDaysAgo)
      .slice(0, 5)
  }, [students])

  const recentFiles = useMemo(() => {
    return files.slice(0, 4)
  }, [files])

  // Students by class for mini chart
  const studentsByClass = useMemo(() => {
    return classes.map(cls => ({
      ...cls,
      count: students.filter(s => s.classId === cls.id).length,
    })).sort((a, b) => b.count - a.count).slice(0, 5)
  }, [classes, students])

  // Get teacher name by ID
  const getTeacherName = (id: string | null) => {
    if (!id) return "غير محدد"
    const teacher = teachers.find(t => t.id === id)
    return teacher?.name || "غير محدد"
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
          <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-full bg-teal-50/50" />
        </div>
      </div>
    )
  }

  const formattedDate = currentTime.toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formattedTime = currentTime.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="space-y-8">
      {/* ========== HEADER SECTION ========== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-800 p-8 text-white shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-20 top-10 h-4 w-4 rounded-full bg-amber-400/60 animate-pulse" />
        <div className="absolute left-32 bottom-20 h-2 w-2 rounded-full bg-teal-300/60 animate-pulse delay-700" />
        
        <div className="relative z-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            {/* Left: Welcome message */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                </div>
                <span className="text-sm font-medium text-teal-200">مرحباً بك في لوحة التحكم</span>
              </div>
              <h1 className="text-4xl font-bold mb-2">نظرة عامة على المدرسة</h1>
              <p className="text-slate-300 max-w-xl leading-relaxed">
                تتبع أداء المدرسة، إحصائيات الطلاب والمعلمين، الجداول الدراسية، والمواد التعليمية في مكان واحد
              </p>
              
              {/* Quick stats row */}
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                  <School className="h-4 w-4 text-teal-300" />
                  <span className="text-sm">{classes.length} صف دراسي</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                  <Users className="h-4 w-4 text-blue-300" />
                  <span className="text-sm">{students.length} طالب</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                  <UserCheck className="h-4 w-4 text-violet-300" />
                  <span className="text-sm">{teachers.length} معلم</span>
                </div>
              </div>
            </div>

            {/* Right: Date & Actions */}
            <div className="flex flex-col items-start md:items-end gap-4">
              <div className="text-left md:text-right">
                <p className="text-2xl font-semibold">{formattedTime}</p>
                <p className="text-sm text-slate-400">{formattedDate}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  asChild 
                  variant="outline" 
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                >
                  <Link href="/dashboard/classes">
                    <BookOpen className="ml-2 h-4 w-4" />
                    الصفوف
                  </Link>
                </Button>
                <Button 
                  asChild 
                  className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg shadow-white/10"
                >
                  <Link href="/dashboard/students?action=add">
                    <Plus className="ml-2 h-4 w-4" />
                    طالب جديد
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== STATS CARDS ========== */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Classes */}
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-white/5" />
          <CardHeader className="pb-2 relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-50">الصفوف الدراسية</CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats.totalClasses}</div>
            <div className="mt-2 flex items-center gap-2">
              <Progress value={stats.occupancyRate} className="h-1.5 flex-1 bg-white/20" />
              <span className="text-xs text-blue-100">{stats.occupancyRate}%</span>
            </div>
            <p className="mt-2 text-xs text-blue-100">
              {stats.totalClasses > 0 ? "صف نشط" : "لا توجد صفوف"}
            </p>
          </CardContent>
        </Card>

        {/* Teachers */}
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-white/5" />
          <CardHeader className="pb-2 relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-violet-50">المعلمون</CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats.totalTeachers}</div>
            <div className="mt-2 flex items-center gap-2 text-xs text-violet-100">
              <TrendingUp className="h-3 w-3" />
              <span>نسبة 1:{stats.teacherStudentRatio} معلم/طالب</span>
            </div>
            <p className="mt-2 text-xs text-violet-100">
              {stats.totalTeachers > 0 ? "معلم نشط" : "لا يوجد معلمون"}
            </p>
          </CardContent>
        </Card>

        {/* Students */}
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-white/5" />
          <CardHeader className="pb-2 relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-emerald-50">الطلاب</CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats.totalStudents}</div>
            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-100">
              <BarChart3 className="h-3 w-3" />
              <span>متوسط {stats.avgStudentsPerClass} طالب/صف</span>
            </div>
            <p className="mt-2 text-xs text-emerald-100">
              {recentStudents.length > 0 ? `+${recentStudents.length} جديد هذا الأسبوع` : "لا يوجد طلاب جدد"}
            </p>
          </CardContent>
        </Card>

        {/* Files/Materials */}
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-white/5" />
          <CardHeader className="pb-2 relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-amber-50">المواد التعليمية</CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <FileText className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats.totalFiles}</div>
            <div className="mt-2 flex items-center gap-2 text-xs text-amber-100">
              <Download className="h-3 w-3" />
              <span>{stats.totalScheduleItems} حصة مجدولة</span>
            </div>
            <p className="mt-2 text-xs text-amber-100">
              {stats.totalFiles > 0 ? "ملف متاح للتحميل" : "لا توجد ملفات"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats & Activity Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* School Overview */}
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>نظرة عامة على المدرسة</CardTitle>
                  <CardDescription>إحصائيات ومؤشرات الأداء</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                <Activity className="ml-1 h-3 w-3" />
                نشط
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Occupancy Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">نسبة إشغال الصفوف</span>
                <span className="font-semibold text-slate-800">{stats.occupancyRate}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-1000"
                  style={{ width: `${stats.occupancyRate}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {stats.totalStudents} طالب من أصل {stats.totalClasses * 30} مقعد متاح
              </p>
            </div>

            {/* Teacher-Student Ratio */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">نسبة المعلمين للطلاب</p>
                  <p className="text-lg font-bold text-slate-800">
                    1:{stats.totalTeachers > 0 ? Math.round(stats.totalStudents / stats.totalTeachers) : 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">الفصول الدراسية</p>
                  <p className="text-lg font-bold text-slate-800">{stats.totalClasses}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - Modern Glass Cards */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            إجراءات سريعة
          </h3>
          
          <Link href="/dashboard/classes?action=add" className="group block">
            <div className="flex items-center gap-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 transition-all duration-300 hover:shadow-md hover:from-blue-100 hover:to-blue-200/50 border border-blue-200/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/25 transition-transform group-hover:scale-110">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">إضافة صف جديد</p>
                <p className="text-xs text-slate-500">إنشاء صف دراسي جديد</p>
              </div>
              <ChevronLeft className="h-5 w-5 text-slate-400 transition-transform group-hover:-translate-x-1" />
            </div>
          </Link>

          <Link href="/dashboard/teachers?action=add" className="group block">
            <div className="flex items-center gap-4 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100/50 p-4 transition-all duration-300 hover:shadow-md hover:from-violet-100 hover:to-violet-200/50 border border-violet-200/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500 shadow-lg shadow-violet-500/25 transition-transform group-hover:scale-110">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">إضافة معلم جديد</p>
                <p className="text-xs text-slate-500">تسجيل معلم في النظام</p>
              </div>
              <ChevronLeft className="h-5 w-5 text-slate-400 transition-transform group-hover:-translate-x-1" />
            </div>
          </Link>

          <Link href="/dashboard/students?action=add" className="group block">
            <div className="flex items-center gap-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 transition-all duration-300 hover:shadow-md hover:from-emerald-100 hover:to-emerald-200/50 border border-emerald-200/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/25 transition-transform group-hover:scale-110">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">إضافة طالب جديد</p>
                <p className="text-xs text-slate-500">تسجيل طالب في صف</p>
              </div>
              <ChevronLeft className="h-5 w-5 text-slate-400 transition-transform group-hover:-translate-x-1" />
            </div>
          </Link>

          <Link href="/dashboard/files" className="group block">
            <div className="flex items-center gap-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 transition-all duration-300 hover:shadow-md hover:from-amber-100 hover:to-amber-200/50 border border-amber-200/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 shadow-lg shadow-amber-500/25 transition-transform group-hover:scale-110">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">إضافة ملف تعليمي</p>
                <p className="text-xs text-slate-500">رفع مادة دراسية</p>
              </div>
              <ChevronLeft className="h-5 w-5 text-slate-400 transition-transform group-hover:-translate-x-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Data Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Classes */}
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-base">الصفوف الأخيرة</CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600">
                <Link href="/dashboard/classes">
                  عرض الكل
                  <ArrowLeft className="mr-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {classes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-3">
                  <BookOpen className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">لا توجد صفوف بعد</p>
                <p className="text-sm text-slate-400 mt-1">ابدأ بإضافة صف دراسي جديد</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {classes.slice(0, 5).map((cls: SchoolClass, index: number) => {
                  const studentCount = students.filter(s => s.classId === cls.id).length
                  const fillPercentage = Math.min((studentCount / 30) * 100, 100)
                  return (
                    <div key={cls.id} className="group flex items-center gap-4 p-4 transition-colors hover:bg-slate-50/80">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm shadow-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{cls.name}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden max-w-[100px]">
                            <div 
                              className="h-full rounded-full bg-blue-500 transition-all"
                              style={{ width: `${fillPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">{studentCount} طالب</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                        {studentCount}/30
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Teachers */}
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100">
                  <UserCheck className="h-4 w-4 text-violet-600" />
                </div>
                <CardTitle className="text-base">المعلمون الأخيرون</CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-slate-600 hover:text-violet-600">
                <Link href="/dashboard/teachers">
                  عرض الكل
                  <ArrowLeft className="mr-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {teachers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-3">
                  <UserCheck className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">لا يوجد معلمون بعد</p>
                <p className="text-sm text-slate-400 mt-1">قم بإضافة معلمين للمدرسة</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {teachers.slice(0, 5).map((teacher: Teacher, index: number) => (
                  <div key={teacher.id} className="group flex items-center gap-4 p-4 transition-colors hover:bg-slate-50/80">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 text-white font-bold text-sm shadow-sm">
                      {teacher.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{teacher.name}</p>
                      <p className="text-xs text-slate-500">
                        {teacher.subject || "لم يحدد التخصص"}
                      </p>
                    </div>
                    {teacher.subject ? (
                      <Badge variant="outline" className="border-violet-200 text-violet-700 bg-violet-50">
                        {teacher.subject}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-slate-600">
                        <Clock className="ml-1 h-3 w-3" />
                        جديد
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
