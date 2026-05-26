"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Calendar,
  Award,
  Activity,
  Download,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import type { SchoolClass, Teacher, Student } from "@/lib/store"
import {
  fetchClasses,
  fetchStudents,
} from "@/lib/supabase-school"
import { fetchTeachers } from "@/lib/supabase-teachers"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function AnalyticsPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("month")

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [cls, t, s] = await Promise.all([
        fetchClasses(),
        fetchTeachers(),
        fetchStudents(),
      ])
      setClasses(cls)
      setTeachers(t)
      setStudents(s)
    } catch (error) {
      toast.error("حدث خطأ أثناء تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  // Calculate statistics
  const stats = {
    totalClasses: classes.length,
    totalTeachers: teachers.length,
    totalStudents: students.length,
    averageStudentsPerClass: classes.length > 0 ? Math.round(students.length / classes.length) : 0,
    averageAge: students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.age, 0) / students.length) : 0,
    studentsWithPhone: students.filter(s => s.parentPhone).length,
    teachersWithSubjects: teachers.filter(t => t.subject).length,
  }

  // Prepare data for charts
  const classData = classes.map(cls => {
    const studentCount = students.filter(s => s.classId === cls.id).length
    return {
      name: cls.name,
      students: studentCount,
      averageAge: students.filter(s => s.classId === cls.id).reduce((sum, s) => sum + s.age, 0) / studentCount || 0,
    }
  })

  const ageDistribution = [
    { range: '6-8', count: students.filter(s => s.age >= 6 && s.age <= 8).length },
    { range: '9-11', count: students.filter(s => s.age >= 9 && s.age <= 11).length },
    { range: '12-14', count: students.filter(s => s.age >= 12 && s.age <= 14).length },
    { range: '15-17', count: students.filter(s => s.age >= 15 && s.age <= 17).length },
    { range: '18+', count: students.filter(s => s.age >= 18).length },
  ]

  const subjectDistribution = teachers.reduce((acc, teacher) => {
    if (teacher.subject) {
      acc[teacher.subject] = (acc[teacher.subject] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const subjectData = Object.entries(subjectDistribution).map(([subject, count]) => ({
    name: subject,
    value: count,
  }))

  // Mock monthly data for demonstration
  const monthlyData = [
    { month: 'يناير', students: 45, classes: 8, teachers: 12 },
    { month: 'فبراير', students: 52, classes: 9, teachers: 13 },
    { month: 'مارس', students: 48, classes: 9, teachers: 13 },
    { month: 'أبريل', students: 58, classes: 10, teachers: 14 },
    { month: 'مايو', students: 62, classes: 11, teachers: 15 },
    { month: 'يونيو', students: students.length, classes: classes.length, teachers: teachers.length },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 rounded-xl"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between bg-white/80 backdrop-blur-lg border border-slate-200 rounded-xl p-5 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">التحليلات</h1>
          <p className="mt-1 text-muted-foreground">إحصائيات وتقارير مفصلة عن أداء المدرسة</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 border-slate-200 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">آخر أسبوع</SelectItem>
              <SelectItem value="month">آخر شهر</SelectItem>
              <SelectItem value="quarter">آخر ربع سنة</SelectItem>
              <SelectItem value="year">آخر سنة</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-slate-200 rounded-xl">
            <Download className="mr-2 h-4 w-4" />
            تصدير التقرير
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نمو الطلاب</CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">+{Math.round((students.length / 45 - 1) * 100)}%</div>
            <p className="text-xs text-muted-foreground">مثل الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الحضور</CardTitle>
            <Activity className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.5%</div>
            <p className="text-xs text-muted-foreground">+2.1% من الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل النجاح</CardTitle>
            <Award className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.3%</div>
            <p className="text-xs text-muted-foreground">+1.5% من الفصل السابق</p>
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">كفاءة المعلمين</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.1%</div>
            <p className="text-xs text-muted-foreground">تقييم الأداء</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <motion.div variants={itemVariants} className="space-y-4">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="students">الطلاب</TabsTrigger>
            <TabsTrigger value="classes">الصفوف</TabsTrigger>
            <TabsTrigger value="teachers">المعلمون</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-white/70 backdrop-blur-sm border border-slate-200">
                <CardHeader>
                  <CardTitle>نمو الالتحاق بالمدرسة</CardTitle>
                  <CardDescription>تطور أعداد الطلاب والصفوف والمعلمين</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="students" stroke="#8884d8" strokeWidth={2} name="الطلاب" />
                      <Line type="monotone" dataKey="classes" stroke="#82ca9d" strokeWidth={2} name="الصفوف" />
                      <Line type="monotone" dataKey="teachers" stroke="#ffc658" strokeWidth={2} name="المعلمون" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border border-slate-200">
                <CardHeader>
                  <CardTitle>توزيع الطلاب حسب الفئات العمرية</CardTitle>
                  <CardDescription>نسبة الطلاب في كل فئة عمرية</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={ageDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ range, count, percent }) => `${range}: ${count} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {ageDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-white/70 backdrop-blur-sm border border-slate-200">
                <CardHeader>
                  <CardTitle>إجمالي الطلاب</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalStudents}</div>
                  <p className="text-sm text-muted-foreground">طالب مسجل</p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>مع أرقام هواتف</span>
                    <Badge variant="secondary">{stats.studentsWithPhone}</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/70 backdrop-blur-sm border border-slate-200">
                <CardHeader>
                  <CardTitle>عدد المعلمين</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={classData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="students" fill="#8884d8" name="عدد المعلمين" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
