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
  Download,
  ArrowUpRight,
  TrendingDown
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
import { motion } from "framer-motion"

// Day names in Arabic
const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50/50">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-650" />
          <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-indigo-500/10" />
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
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6 text-right"
    >
      {/* ========== HEADER SECTION - Premium Welcome Banner ========== */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white shadow-xl shadow-slate-950/20"
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl bg-indigo-500 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full opacity-10 blur-2xl bg-teal-500 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 justify-start">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-indigo-300" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-indigo-200">لوحة الإدارة والمؤشرات</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold mb-1">مرحباً بك في لوحة تحكم مدرسة كفر عقب</h1>
            <p className="text-xs sm:text-sm text-slate-350 max-w-xl leading-relaxed">
              تابع إحصائيات المعلمين والطلاب، الجداول الدراسية الأسبوعية، والملفات المقررة بكل سهولة وسرعة.
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 bg-slate-900/30 border border-slate-700/30 rounded-xl p-4 min-w-[200px] backdrop-blur-md">
            <div className="text-right">
              <p className="text-lg sm:text-xl font-bold tracking-tight text-white leading-none">{formattedTime}</p>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1">{formattedDate}</p>
            </div>
            <div className="flex gap-2">
              <Button asChild size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-650 hover:to-purple-700 text-white rounded-lg font-bold text-xs shadow-md shadow-indigo-500/20 border-0 h-8">
                <Link href="/dashboard/students?action=add">
                  <Plus className="ml-1 h-3.5 w-3.5" />
                  طالب جديد
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ========== STATS CARDS - Premium Flat / Glowing style ========== */}
      <motion.div 
        variants={itemVariants}
        className="grid gap-4 grid-cols-2 lg:grid-cols-4"
      >
        {[
          { title: "الصفوف الدراسية", value: stats.totalClasses, info: `${stats.totalClasses} صف نشط حالياً`, icon: <School className="h-5 w-5 text-indigo-500" />, fill: stats.occupancyRate, fillText: `${stats.occupancyRate}% إشغال` },
          { title: "المعلمون", value: stats.totalTeachers, info: `نسبة التوزيع 1:${stats.teacherStudentRatio}`, icon: <UserCheck className="h-5 w-5 text-emerald-500" /> },
          { title: "الطلاب المسجلون", value: stats.totalStudents, info: `متوسط ${stats.avgStudentsPerClass} طالباً / صف`, icon: <Users className="h-5 w-5 text-blue-500" />, label: recentStudents.length > 0 ? `+${recentStudents.length} جديد هذا الأسبوع` : "لا يوجد طلاب جدد" },
          { title: "المواد والملفات", value: stats.totalFiles, info: `${stats.totalScheduleItems} حصة بالجدول`, icon: <FileText className="h-5 w-5 text-amber-500" /> },
        ].map((card, idx) => (
          <Card key={idx} className="border-slate-100 bg-white shadow-sm shadow-slate-100/40 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{card.title}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50">
                  {card.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-black text-slate-900">{card.value}</div>
              
              {card.fill !== undefined ? (
                <div className="mt-2.5 space-y-1">
                  <div className="flex justify-between text-[9px] font-semibold text-slate-400">
                    <span>{card.fillText}</span>
                  </div>
                  <Progress value={card.fill} className="h-1 bg-slate-100 text-indigo-500" />
                </div>
              ) : (
                <p className="text-[10px] text-slate-450 mt-2 font-medium">
                  {card.label || card.info}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* ========== MAIN CONTENT GRID ========== */}
      <motion.div 
        variants={itemVariants}
        className="grid gap-5 lg:grid-cols-3"
      >
        {/* School Occupancy and stats overview */}
        <Card className="border-slate-150 bg-white shadow-sm shadow-slate-100/40 lg:col-span-2">
          <CardHeader className="pb-3 border-b border-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-slate-900">أداء وإحصاءات المدرسة</CardTitle>
                <CardDescription className="text-xs">المعدلات الحالية للمجموعات الدراسية</CardDescription>
              </div>
              <Badge variant="outline" className="bg-emerald-50 border-emerald-100 text-emerald-700 font-bold text-[10px]">
                <Activity className="ml-1 h-3 w-3 animate-pulse" />
                نشط
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-6">
            {/* Occupancy Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">نسبة استيعاب الطلاب الكلية</span>
                <span className="text-slate-900">{stats.occupancyRate}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-l from-indigo-500 to-indigo-650 rounded-full transition-all duration-700"
                  style={{ width: `${stats.occupancyRate}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-450">
                تسجيل {stats.totalStudents} طالباً من أصل {stats.totalClasses * 30} مقعداً إجمالياً (بمعدل 30 طالباً للقسم الواحد).
              </p>
            </div>

            {/* Sub-grid of indicators */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              <div className="flex items-center gap-3 bg-slate-50/50 border border-slate-100 rounded-xl p-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 flex-shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div className="min-w-0 text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">معدل الطلاب لكل معلم</span>
                  <span className="text-sm font-bold text-slate-800">
                    {stats.totalTeachers > 0 ? (stats.totalStudents / stats.totalTeachers).toFixed(1) : 0} طالباً
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50/50 border border-slate-100 rounded-xl p-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500 flex-shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="min-w-0 text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">الحصص الدراسية المضافة</span>
                  <span className="text-sm font-bold text-slate-800">
                    {stats.totalScheduleItems} حصص نشطة
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="border-slate-150 bg-white shadow-sm shadow-slate-100/40">
          <CardHeader className="pb-3 border-b border-slate-50">
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900">لوحة الإجراءات السريعة</CardTitle>
            <CardDescription className="text-xs">الوصول المباشر لوظائف النظام</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5">
            {[
              { label: "إضافة صف دراسي جديد", desc: "فتح قسم أو مرحلة جديدة", href: "/dashboard/classes?action=add", bg: "hover:bg-indigo-50/40 hover:border-indigo-150", iconBg: "bg-indigo-500/10 text-indigo-500" },
              { label: "إضافة معلم جديد", desc: "تسجيل حساب وتخصص لمعلم", href: "/dashboard/teachers?action=add", bg: "hover:bg-emerald-50/40 hover:border-emerald-150", iconBg: "bg-emerald-500/10 text-emerald-500" },
              { label: "إضافة طالب جديد", desc: "تسكين طالب في صف دراسي", href: "/dashboard/students?action=add", bg: "hover:bg-blue-50/40 hover:border-blue-150", iconBg: "bg-blue-500/10 text-blue-500" },
              { label: "رفع ملف تعليمي جديد", desc: "مشاركة أوراق العمل والمواد", href: "/dashboard/files", bg: "hover:bg-amber-50/40 hover:border-amber-150", iconBg: "bg-amber-500/10 text-amber-500" },
            ].map((action, i) => (
              <Link key={i} href={action.href} className="block group">
                <div className={`flex items-center gap-3.5 border border-slate-100 rounded-xl p-3 transition-all duration-205 ${action.bg}`}>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform ${action.iconBg}`}>
                    <Plus className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="font-bold text-slate-800 text-xs sm:text-sm">{action.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{action.desc}</p>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-slate-350 group-hover:-translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* ========== RECENT RECORDS GRID ========== */}
      <motion.div 
        variants={itemVariants}
        className="grid gap-5 lg:grid-cols-2"
      >
        {/* Recent Classes Card */}
        <Card className="border-slate-150 bg-white shadow-sm shadow-slate-100/40 overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-indigo-500" />
                <CardTitle className="text-sm sm:text-base font-bold text-slate-900">الصفوف الدراسية الأخيرة</CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-bold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700">
                <Link href="/dashboard/classes">
                  عرض الكل
                  <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {classes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <BookOpen className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs text-slate-550 font-bold">لا توجد صفوف دراسية حالياً</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {classes.slice(0, 4).map((cls, index) => {
                  const studentCount = students.filter(s => s.classId === cls.id).length
                  const fillPercentage = Math.min((studentCount / 30) * 100, 100)
                  return (
                    <div key={cls.id} className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50/50">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 font-extrabold text-xs flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0 text-right">
                          <p className="font-bold text-slate-800 text-xs sm:text-sm truncate">{cls.name}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="h-1 w-16 rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full bg-indigo-500" style={{ width: `${fillPercentage}%` }} />
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold">{studentCount} طالباً</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-slate-50 border-slate-200/80 text-slate-650 font-bold text-[10px] rounded-lg">
                        {studentCount} / 30 مقعد
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Teachers Card */}
        <Card className="border-slate-150 bg-white shadow-sm shadow-slate-100/40 overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4.5 w-4.5 text-emerald-500" />
                <CardTitle className="text-sm sm:text-base font-bold text-slate-900">أحدث المعلمين</CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-bold text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700">
                <Link href="/dashboard/teachers">
                  عرض الكل
                  <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {teachers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <UserCheck className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs text-slate-550 font-bold">لا يوجد معلمون مسجلون بعد</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {teachers.slice(0, 4).map((teacher) => (
                  <div key={teacher.id} className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-9 w-9 border border-emerald-100">
                        <AvatarFallback className="bg-emerald-50 text-emerald-600 font-bold text-xs">
                          {teacher.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 text-right">
                        <p className="font-bold text-slate-800 text-xs sm:text-sm truncate">{teacher.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{teacher.phone || "بدون رقم هاتف"}</p>
                      </div>
                    </div>
                    {teacher.subject ? (
                      <Badge className="bg-emerald-50 hover:bg-emerald-50 border-emerald-100 text-emerald-700 font-bold text-[10px] rounded-lg">
                        {teacher.subject}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="font-bold text-[10px] rounded-lg text-slate-500">
                        غير محدد
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
