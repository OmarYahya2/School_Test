"use client"

import { useEffect, useMemo, useState } from "react"
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
import type { SchoolClass, Teacher, Student, ScheduleItem, SubjectFile } from "@/lib/store"
import { useAdminClasses, useAdminStudents, useAdminTeachers, useAdminSchedule, useAdminFiles } from "@/lib/hooks/use-admin-data"
import { SkeletonStats, SkeletonTable, SkeletonGrid } from "@/components/skeletons"
import { motion, type Variants } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"

const containerVariants: Variants = {
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

export default function DashboardPage() {
  const { t, language } = useLanguage()
  const d = t.dashboard
  const { data: classes = [] } = useAdminClasses()
  const { data: teachers = [] } = useAdminTeachers()
  const { data: students = [] } = useAdminStudents()
  const { data: schedule = [] } = useAdminSchedule()
  const { data: files = [] } = useAdminFiles()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

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

  const loading = !classes.length && !teachers.length && !students.length
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-100" />
        <SkeletonStats />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <SkeletonTable rows={4} cols={4} />
          </div>
          <SkeletonGrid count={3} />
        </div>
      </div>
    )
  }

  const locale = language === "ar" ? "ar-SA" : "en-US"
  const formattedDate = currentTime.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formattedTime = currentTime.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className={`space-y-6 ${language === "ar" ? "text-right" : "text-left"}`}
    >
      {/* ========== HEADER SECTION - Premium Welcome Banner ========== */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white shadow-xl"
        style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 35%, oklch(0.08 0.05 259)) 0%, color-mix(in srgb, var(--primary) 18%, oklch(0.07 0.06 265)) 100%)" }}
      >
        <div className="absolute top-0 end-0 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl bg-white pointer-events-none" />
        <div className="absolute bottom-0 start-0 w-[300px] h-[300px] rounded-full opacity-10 blur-2xl bg-white pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/80 border border-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {formattedDate}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold mb-2 leading-snug">{d.welcomeTitle}</h1>
            <p className="text-xs sm:text-sm text-white/55 max-w-md leading-relaxed">
              {d.welcomeSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="bg-white/8 border border-white/10 rounded-2xl px-4 py-3 text-center backdrop-blur-sm">
              <p className="text-xl font-bold text-white leading-none">{formattedTime}</p>
              <p className="text-[10px] text-white/40 mt-1">{d.currentTime}</p>
            </div>
            <Button asChild size="sm" className="bg-white/15 hover:bg-white/25 text-white rounded-xl font-bold text-xs border border-white/20 h-10 px-4">
              <Link href="/dashboard/students">
                <Plus className="ms-0 me-1 h-3.5 w-3.5" />
                {d.newStudent}
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ========== STATS CARDS - Premium Flat / Glowing style ========== */}
      <motion.div 
        variants={itemVariants}
        className="grid gap-4 grid-cols-2 lg:grid-cols-4"
      >
        {[
          { title: d.classesStat,  value: stats.totalClasses,  sub: `${stats.totalClasses} ${d.activeClassesSub}`,                          icon: <School className="h-4 w-4" />,   iconBg: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",   accent: "border-t-violet-500",  href: "/dashboard/classes"  },
          { title: d.teachersStat, value: stats.totalTeachers, sub: `${d.ratioSub} 1:${stats.teacherStudentRatio}`,                          icon: <UserCheck className="h-4 w-4" />, iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400", accent: "border-t-emerald-500", href: "/dashboard/teachers" },
          { title: d.studentsStat, value: stats.totalStudents, sub: `${d.avgPerClassSub} ${stats.avgStudentsPerClass} ${d.perClass}`,          icon: <Users className="h-4 w-4" />,    iconBg: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",               accent: "border-t-sky-500",    href: "/dashboard/students" },
          { title: d.filesStat,    value: stats.totalFiles,    sub: `${stats.totalScheduleItems} ${d.scheduledSub}`,                          icon: <FileText className="h-4 w-4" />,  iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",         accent: "border-t-amber-500",  href: "/dashboard/files"    },
        ].map((card, idx) => (
          <Link key={idx} href={card.href}>
            <Card className={`border-border bg-card shadow-sm relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border-t-4 ${card.accent}`}>
              <CardContent className="p-4">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl mb-3 ${card.iconBg}`}>
                  {card.icon}
                </div>
                <div className="text-2xl font-black text-foreground leading-none">{card.value}</div>
                <p className="text-xs font-semibold text-foreground/70 mt-1.5">{card.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{card.sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </motion.div>

      {/* ========== MAIN CONTENT GRID ========== */}
      <motion.div 
        variants={itemVariants}
        className="grid gap-5 lg:grid-cols-3"
      >
        {/* School Occupancy and stats overview */}
        <Card className="border-border bg-card shadow-sm lg:col-span-2">
          <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">{d.schoolPerformance}</CardTitle>
                <CardDescription className="text-xs">{d.schoolMetrics}</CardDescription>
              </div>
              <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                <Activity className="me-1 h-3 w-3 animate-pulse" />
                {d.activeBadge}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-6">
            {/* Occupancy Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground/70">{d.totalCapacity}</span>
                <span className="text-foreground">{stats.occupancyRate}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${stats.occupancyRate}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {d.enrolled} {stats.totalStudents} {d.student} {d.outOf} {stats.totalClasses * 30} {d.totalSeats} ({d.seatsNote}).
              </p>
            </div>

            {/* Sub-grid of indicators */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              <div className="flex items-center gap-3 bg-muted/40 border border-border/60 rounded-xl p-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div className={`min-w-0 ${language === "ar" ? "text-right" : "text-left"}`}>
                  <span className="text-[10px] text-muted-foreground block font-semibold">{d.studentsPerTeacher}</span>
                  <span className="text-sm font-bold text-foreground">
                    {stats.totalTeachers > 0 ? (stats.totalStudents / stats.totalTeachers).toFixed(1) : 0} {d.student}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-muted/40 border border-border/60 rounded-xl p-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className={`min-w-0 ${language === "ar" ? "text-right" : "text-left"}`}>
                  <span className="text-[10px] text-muted-foreground block font-semibold">{d.activePeriods}</span>
                  <span className="text-sm font-bold text-foreground">
                    {stats.totalScheduleItems} {d.activePeriodsSuffix}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm sm:text-base font-bold text-foreground">{d.quickActions}</CardTitle>
            <CardDescription className="text-xs">{d.directAccess}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5">
            {[
              { label: d.addNewClass,   desc: d.addNewClassDesc,   href: "/dashboard/classes?action=add",  bg: "hover:bg-primary/5 hover:border-primary/20",      iconBg: "bg-primary/10 text-primary" },
              { label: d.addNewTeacher, desc: d.addNewTeacherDesc, href: "/dashboard/teachers?action=add", bg: "hover:bg-emerald-50/60 hover:border-emerald-100 dark:hover:bg-emerald-950/20", iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
              { label: d.addNewStudent, desc: d.addNewStudentDesc, href: "/dashboard/students?action=add", bg: "hover:bg-sky-50/60 hover:border-sky-100 dark:hover:bg-sky-950/20",         iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
              { label: d.uploadFile,    desc: d.uploadFileDesc,    href: "/dashboard/files",                bg: "hover:bg-amber-50/60 hover:border-amber-100 dark:hover:bg-amber-950/20",   iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
            ].map((action, i) => (
              <Link key={i} href={action.href} className="block group">
                <div className={`flex items-center gap-3.5 border border-border/60 rounded-xl p-3 transition-all duration-200 ${action.bg}`}>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform ${action.iconBg}`}>
                    <Plus className="h-4 w-4" />
                  </div>
                  <div className={`flex-1 min-w-0 ${language === "ar" ? "text-right" : "text-left"}`}>
                    <p className="font-bold text-foreground text-xs sm:text-sm">{action.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{action.desc}</p>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:-translate-x-0.5 transition-transform" />
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
        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">{d.recentClasses}</CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-bold text-primary hover:bg-primary/5">
                <Link href="/dashboard/classes">
                  {d.viewAll}
                  <ArrowLeft className="ms-0 me-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {classes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/20 mb-2" />
                <p className="text-xs text-muted-foreground font-semibold">{d.noClassesYet}</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {classes.slice(0, 4).map((cls, index) => {
                  const studentCount = students.filter(s => s.classId === cls.id).length
                  const fillPercentage = Math.min((studentCount / 30) * 100, 100)
                  return (
                    <div key={cls.id} className="flex items-center justify-between p-4 transition-colors hover:bg-muted/30">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-extrabold text-xs flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className={`min-w-0 ${language === "ar" ? "text-right" : "text-left"}`}>
                          <p className="font-bold text-foreground text-xs sm:text-sm truncate">{cls.name}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="h-1 w-16 rounded-full bg-muted overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${fillPercentage}%` }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground font-semibold">{studentCount} {d.students}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-muted/50 border-border text-foreground/70 font-bold text-[10px] rounded-lg">
                        {studentCount} / 30
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Teachers Card */}
        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">{d.recentTeachers}</CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                <Link href="/dashboard/teachers">
                  {d.viewAll}
                  <ArrowLeft className="ms-0 me-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {teachers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <UserCheck className="h-10 w-10 text-muted-foreground/20 mb-2" />
                <p className="text-xs text-muted-foreground font-semibold">{d.noTeachersYet}</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {teachers.slice(0, 4).map((teacher) => (
                  <div key={teacher.id} className="flex items-center justify-between p-4 transition-colors hover:bg-muted/30">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-9 w-9 border border-emerald-100 dark:border-emerald-900">
                        <AvatarFallback className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                          {teacher.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`min-w-0 ${language === "ar" ? "text-right" : "text-left"}`}>
                        <p className="font-bold text-foreground text-xs sm:text-sm truncate">{teacher.name}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">{teacher.phone || d.noPhone}</p>
                      </div>
                    </div>
                    {teacher.subject ? (
                      <Badge className="bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-50 border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] rounded-full">
                        {teacher.subject}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="font-bold text-[10px] rounded-full text-muted-foreground">
                        {d.noSubject}
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

