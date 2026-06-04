"use client"

import { useMemo } from "react"
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  Award,
  Activity,
} from "lucide-react"
import { motion, type Variants } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useAdminAnalytics } from "@/lib/hooks/use-admin-data"
import { SkeletonStats, SkeletonTable } from "@/components/skeletons"
import { useLanguage } from "@/lib/i18n/context"
import dynamic from "next/dynamic"

const OverviewGrowthChart = dynamic(
  () => import("./charts-client").then((mod) => mod.OverviewGrowthChart),
  { ssr: false, loading: () => <div className="h-[260px] w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/40" /> }
)

const OverviewAgePieChart = dynamic(
  () => import("./charts-client").then((mod) => mod.OverviewAgePieChart),
  { ssr: false, loading: () => <div className="h-[260px] w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/40" /> }
)

const StudentsClassBarChart = dynamic(
  () => import("./charts-client").then((mod) => mod.StudentsClassBarChart),
  { ssr: false, loading: () => <div className="h-[260px] w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/40" /> }
)

const TeachersSubjectBarChart = dynamic(
  () => import("./charts-client").then((mod) => mod.TeachersSubjectBarChart),
  { ssr: false, loading: () => <div className="h-[260px] w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/40" /> }
)

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
}

export default function AnalyticsPage() {
  const { t, language } = useLanguage()
  const ap = t.analyticsPage
  const { data: analytics, isLoading } = useAdminAnalytics()

  if (isLoading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-100" />
        <SkeletonStats />
        <SkeletonTable rows={4} cols={4} />
      </div>
    )
  }

  // Format ISO month timestamps → Arabic display labels
  const monthlyData = analytics.monthlyGrowth.map(p => ({
    ...p,
    month: new Date(p.month).toLocaleDateString(language === "ar" ? 'ar-SA' : 'en-US', { month: 'short', year: '2-digit' }),
  }))

  // Recharts BarChart expects { name, value }
  const subjectData = analytics.charts.subjectDistribution.map(s => ({
    name: s.subject,
    value: s.count,
  }))

  // Growth % from first to current month
  const firstStudents = monthlyData[0]?.students ?? 0
  const growthPct = firstStudents > 0
    ? Math.round(((analytics.totals.students / firstStudents) - 1) * 100)
    : 0

  const avgPerClass = analytics.totals.classes > 0
    ? Math.round(analytics.totals.students / analytics.totals.classes)
    : 0

  const kpiCards = [
    {
      label: ap.totalStudents,
      value: analytics.totals.students.toString(),
      sub: `${t.stats.averageGrade} ${avgPerClass}`,
      icon: <Users className="h-4 w-4" />,
      iconBg: "bg-primary/10 text-primary",
      trend: growthPct >= 0 ? `+${growthPct}%` : `${growthPct}%`,
      trendUp: growthPct >= 0,
    },
    {
      label: ap.totalTeachers,
      value: analytics.totals.teachers.toString(),
      sub: `${analytics.quality.teachersWithSubject} ${t.teachersPage.subject}`,
      icon: <BookOpen className="h-4 w-4" />,
      iconBg: "bg-emerald-500/10 text-emerald-600",
      trend: analytics.totals.teachers > 0 ? `${analytics.totals.teachers}` : "—",
      trendUp: true,
    },
    {
      label: ap.totalClasses,
      value: analytics.totals.classes.toString(),
      sub: `${analytics.quality.classesWithTeacher}`,
      icon: <Calendar className="h-4 w-4" />,
      iconBg: "bg-amber-500/10 text-amber-600",
      trend: analytics.quality.teacherClassRatioPct > 0 ? `${analytics.quality.teacherClassRatioPct}%` : "—",
      trendUp: analytics.quality.teacherClassRatioPct > 0,
    },
    {
      label: t.stats.attendanceRate,
      value: analytics.attendance.ratePct !== null ? `${analytics.attendance.ratePct}%` : "—",
      sub: analytics.attendance.totalSlots > 0
        ? `${analytics.attendance.presentCount} / ${analytics.attendance.totalSlots}`
        : ap.noData,
      icon: <Activity className="h-4 w-4" />,
      iconBg: "bg-purple-500/10 text-purple-600",
      trend: analytics.attendance.ratePct !== null
        ? analytics.attendance.ratePct >= 80 ? ap.trend : ap.period
        : "—",
      trendUp: analytics.attendance.ratePct !== null && analytics.attendance.ratePct >= 80,
    },
  ]

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className={`space-y-6 ${language === "ar" ? "text-right" : "text-left"}`}
    >
      {/* ── Header ── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-foreground">{ap.title}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{ap.overview}</p>
          </div>
        </div>
        {analytics.grades.totalRecords > 0 && (
          <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-4 py-2.5 border border-border/50">
            <Award className="h-4 w-4 text-amber-500" />
            <div className={language === "ar" ? "text-right" : "text-left"}>
              <p className="text-[10px] text-muted-foreground font-medium">{ap.averageGrade}</p>
              <p className="text-sm font-black text-foreground">
                {analytics.grades.passRatePct !== null ? `${analytics.grades.passRatePct}%` : "—"}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── KPI Cards ── */}
      <motion.div variants={itemVariants} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, i) => (
          <Card key={i} className="bg-card border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}>
                  {card.icon}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  card.trendUp
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                }`}>
                  {card.trend}
                </span>
              </div>
              <p className="text-2xl font-black text-foreground leading-none mb-1">{card.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium">{card.label}</p>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* ── Charts Tabs ── */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="bg-card border border-border/50 rounded-2xl p-1.5 shadow-sm">
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 bg-muted/60 rounded-xl p-1 gap-1 h-auto">
              {[
                { value: "overview", label: ap.overview },
                { value: "students", label: ap.studentsAnalytics },
                { value: "classes", label: ap.classesAnalytics },
                { value: "teachers", label: ap.teachersAnalytics },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-lg text-xs font-semibold py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── Overview ── */}
          <TabsContent value="overview" className="space-y-4 mt-0">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-card border border-border/50 shadow-sm rounded-2xl">
                <CardHeader className="pb-2 border-b border-border/30">
                  <CardTitle className="text-sm font-bold text-foreground">{ap.totalStudents}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">{ap.overview}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <OverviewGrowthChart monthlyData={monthlyData} ap={ap} />
                </CardContent>
              </Card>

              <Card className="bg-card border border-border/50 shadow-sm rounded-2xl">
                <CardHeader className="pb-2 border-b border-border/30">
                  <CardTitle className="text-sm font-bold text-foreground">{ap.studentsAnalytics}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">{ap.overview}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <OverviewAgePieChart ageDistribution={analytics.charts.ageDistribution} ap={ap} />
                </CardContent>
              </Card>
            </div>

            {/* Summary Stats Row */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: ap.totalStudents, value: analytics.quality.studentsWithPhone, total: analytics.totals.students, color: "bg-primary" },
                { label: ap.totalTeachers, value: analytics.quality.teachersWithSubject, total: analytics.totals.teachers, color: "bg-emerald-500" },
                { label: ap.totalClasses, value: analytics.quality.studentsInTeacherClasses, total: analytics.totals.students, color: "bg-amber-500" },
              ].map((item, i) => (
                <Card key={i} className="bg-card border border-border/50 shadow-sm rounded-2xl">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-3">{item.label}</p>
                    <div className="flex items-end gap-2 mb-2">
                      <span className="text-2xl font-black text-foreground">{item.value}</span>
                      <span className="text-xs text-muted-foreground mb-0.5">/ {item.total}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-700`}
                        style={{ width: item.total > 0 ? `${Math.round((item.value / item.total) * 100)}%` : "0%" }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">
                      {item.total > 0 ? `${Math.round((item.value / item.total) * 100)}%` : "0%"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Students ── */}
          <TabsContent value="students" className="space-y-4 mt-0">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-card border border-border/50 shadow-sm rounded-2xl">
                <CardHeader className="pb-2 border-b border-border/30">
                  <CardTitle className="text-sm font-bold text-foreground">{ap.classesAnalytics}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">{ap.totalClasses}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <StudentsClassBarChart classBreakdown={analytics.charts.classBreakdown} ap={ap} />
                </CardContent>
              </Card>

              <Card className="bg-card border border-border/50 shadow-sm rounded-2xl">
                <CardHeader className="pb-2 border-b border-border/30">
                  <CardTitle className="text-sm font-bold text-foreground">{ap.studentsAnalytics}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">{ap.totalStudents}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {[
                    { label: ap.totalStudents, value: analytics.totals.students, icon: <Users className="h-4 w-4 text-primary" />, bg: "bg-primary/10" },
                    { label: ap.exportReport, value: analytics.quality.studentsWithPhone, icon: <Activity className="h-4 w-4 text-emerald-500" />, bg: "bg-emerald-500/10" },
                    { label: ap.period, value: analytics.quality.averageAge, icon: <Calendar className="h-4 w-4 text-amber-500" />, bg: "bg-amber-500/10" },
                    { label: ap.totalClasses, value: analytics.totals.classes, icon: <BookOpen className="h-4 w-4 text-purple-500" />, bg: "bg-purple-500/10" },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${row.bg} flex-shrink-0`}>
                        {row.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium truncate">{row.label}</p>
                      </div>
                      <span className="text-sm font-bold text-foreground">{row.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Classes ── */}
          <TabsContent value="classes" className="space-y-4 mt-0">
            <Card className="bg-card border border-border/50 shadow-sm rounded-2xl">
              <CardHeader className="pb-2 border-b border-border/30">
                <CardTitle className="text-sm font-bold text-foreground">{ap.classesAnalytics}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{ap.totalClasses}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {analytics.charts.classBreakdown.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-52 text-muted-foreground">
                    <BookOpen className="h-10 w-10 text-muted-foreground/20 mb-2" />
                    <p className="text-xs font-semibold">{ap.noData}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analytics.charts.classBreakdown.map((cls, i) => {
                      const pct = Math.min(Math.round((cls.students / 30) * 100), 100)
                      return (
                        <div key={i} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground">{cls.name}</span>
                            <span className="text-muted-foreground font-medium">{cls.students} / 30</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                pct >= 90 ? "bg-rose-400" : pct >= 70 ? "bg-amber-400" : "bg-primary"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground font-medium">{pct}%</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Teachers ── */}
          <TabsContent value="teachers" className="space-y-4 mt-0">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-card border border-border/50 shadow-sm rounded-2xl">
                <CardHeader className="pb-2 border-b border-border/30">
                  <CardTitle className="text-sm font-bold text-foreground">{ap.teachersAnalytics}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">{ap.totalTeachers}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <TeachersSubjectBarChart subjectData={subjectData} ap={ap} />
                </CardContent>
              </Card>

              <Card className="bg-card border border-border/50 shadow-sm rounded-2xl">
                <CardHeader className="pb-2 border-b border-border/30">
                  <CardTitle className="text-sm font-bold text-foreground">{ap.teachersAnalytics}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">{ap.totalTeachers}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {[
                    { label: ap.totalTeachers, value: analytics.totals.teachers, icon: <Users className="h-4 w-4 text-primary" />, bg: "bg-primary/10" },
                    { label: ap.trend, value: analytics.quality.teachersWithSubject, icon: <Award className="h-4 w-4 text-emerald-500" />, bg: "bg-emerald-500/10" },
                    { label: ap.period, value: analytics.totals.teachers > 0 ? `${(analytics.totals.students / analytics.totals.teachers).toFixed(1)}:1` : "—", icon: <TrendingUp className="h-4 w-4 text-amber-500" />, bg: "bg-amber-500/10" },
                    { label: ap.gradesAnalytics, value: subjectData.length, icon: <BookOpen className="h-4 w-4 text-purple-500" />, bg: "bg-purple-500/10" },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${row.bg} flex-shrink-0`}>
                        {row.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium truncate">{row.label}</p>
                      </div>
                      <span className="text-sm font-bold text-foreground">{row.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}

