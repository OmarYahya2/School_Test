"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Edit,
  BookOpen,
  Award,
  FileText,
  GraduationCap,
  Home,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  StickyNote,
  Plus,
  Trash2,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import type { Student, SchoolClass, Grade } from "@/lib/store"
import { fetchStudentById, fetchStudentsByClass, fetchAttendanceByStudent, fetchGradesByStudent } from "@/lib/supabase-school"
import { fetchClasses } from "@/lib/supabase-school"
import { motion } from "framer-motion"

type Note = {
  id: string
  content: string
  createdAt: string
  updatedAt?: string
  category?: "academic" | "behavioral" | "general" | "health"
  author?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
}

export default function StudentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [classInfo, setClassInfo] = useState<SchoolClass | null>(null)
  const [classmates, setClassmates] = useState<Student[]>([])
  const [attendanceRate, setAttendanceRate] = useState<number>(0)
  const [grades, setGrades] = useState<Grade[]>([])
  const [gradeAverage, setGradeAverage] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const studentData = await fetchStudentById(studentId)
      if (!studentData) {
        router.push("/dashboard/students")
        return
      }
      setStudent(studentData)

      // Fetch class info
      const classes = await fetchClasses()
      const cls = classes.find(c => c.id === studentData.classId)
      setClassInfo(cls || null)

      // Fetch classmates
      const classmatesData = await fetchStudentsByClass(studentData.classId)
      setClassmates(classmatesData.filter(s => s.id !== studentId))
      
      // Fetch attendance data
      const attendanceRecords = await fetchAttendanceByStudent(studentId)
      if (attendanceRecords.length > 0) {
        const presentCount = attendanceRecords.filter(r => r.present).length
        const rate = Math.round((presentCount / attendanceRecords.length) * 100)
        setAttendanceRate(rate)
      } else {
        setAttendanceRate(95) // Default fallback
      }

      // Fetch grades data
      const studentGrades = await fetchGradesByStudent(studentId)
      setGrades(studentGrades)
      
      // Calculate average
      if (studentGrades.length > 0) {
        const avg = Math.round(studentGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 100, 0) / studentGrades.length)
        setGradeAverage(avg)
      } else {
        setGradeAverage(null)
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تحميل بيانات الطالب")
    } finally {
      setLoading(false)
    }
  }, [studentId, router])

  useEffect(() => {
    void reload()
  }, [reload])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50/50">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
          <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-indigo-500/10" />
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-slate-50/50">
        <User className="h-12 w-12 text-slate-300 mb-3" />
        <h3 className="text-lg font-bold text-slate-800 mb-1">الطالب غير موجود</h3>
        <p className="text-xs text-slate-500 mb-4">لم نتمكن من العثور على سجل الطالب المطلوب.</p>
        <Button asChild className="bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl">
          <Link href="/dashboard/students">العودة لقائمة الطلاب</Link>
        </Button>
      </div>
    )
  }

  const birthYear = new Date().getFullYear() - student.age

  const parseNotes = (notesString: string): Note[] => {
    if (!notesString) return []
    try {
      const parsed = JSON.parse(notesString)
      if (Array.isArray(parsed)) {
        const seen = new Set<string>()
        return parsed.map((note: Note) => {
          let uniqueId = note.id
          if (seen.has(note.id)) {
            uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
          }
          seen.add(uniqueId)
          return { ...note, id: uniqueId }
        })
      }
      if (typeof parsed === "string" && parsed.trim()) {
        return [{
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          content: parsed,
          createdAt: new Date().toISOString(),
          category: "general",
        }]
      }
      return []
    } catch {
      if (notesString.trim()) {
        return [{
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          content: notesString,
          createdAt: new Date().toISOString(),
          category: "general",
        }]
      }
      return []
    }
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "academic":
        return "bg-blue-50 border-blue-100 text-blue-700"
      case "behavioral":
        return "bg-amber-50 border-amber-100 text-amber-700"
      case "health":
        return "bg-rose-50 border-rose-100 text-rose-700"
      default:
        return "bg-slate-50 border-slate-100 text-slate-600"
    }
  }

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case "academic":
        return "أكاديمي"
      case "behavioral":
        return "سلوكي"
      case "health":
        return "صحي"
      default:
        return "عام"
    }
  }

  const studentNotes = parseNotes(student.notes || "")
  const recentNotes = studentNotes.slice(0, 3)

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6 text-right"
    >
      {/* Header / Actions bar */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="h-9 px-3 rounded-lg text-slate-500 hover:bg-slate-100">
          <Link href="/dashboard/students">
            <ArrowLeft className="ml-2 h-4 w-4" />
            <span>العودة لقائمة الطلاب</span>
          </Link>
        </Button>
      </motion.div>

      {/* Student Profile Header Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-100 bg-white shadow-sm shadow-slate-100/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 blur-2xl bg-indigo-500 pointer-events-none" />
          <CardContent className="p-6 sm:p-7 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-indigo-100 shadow-md flex-shrink-0">
                <AvatarFallback className="text-xl sm:text-2xl font-extrabold bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600">
                  {student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-right min-w-0">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{student.name}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <Badge variant="secondary" className="bg-slate-50 border border-slate-100 text-slate-650 rounded-lg text-xs font-semibold">
                    <User className="ml-1 h-3.5 w-3.5 text-slate-400" />
                    {student.age} سنة
                  </Badge>
                  {classInfo && (
                    <Badge variant="secondary" className="bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold">
                      <GraduationCap className="ml-1 h-3.5 w-3.5 text-indigo-500" />
                      {classInfo.name}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-slate-50 border border-slate-100 text-slate-650 rounded-lg text-xs font-semibold">
                    <Calendar className="ml-1 h-3.5 w-3.5 text-slate-400" />
                    مواليد {birthYear}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Grid sections */}
      <motion.div variants={itemVariants} className="grid gap-5 lg:grid-cols-3">
        
        {/* Left Column: Personal and Academic Info (col-span-1) */}
        <div className="space-y-5 lg:col-span-1">
          {/* Personal Info Card */}
          <Card className="border-slate-100 bg-white shadow-sm shadow-slate-100/40">
            <CardHeader className="pb-2 border-b border-slate-50">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                المعلومات الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-xs text-slate-400 font-semibold">تاريخ التسجيل</span>
                <span className="text-xs sm:text-sm font-bold text-slate-700">
                  {new Date(student.createdAt).toLocaleDateString("ar-EG")}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-xs text-slate-400 font-semibold">هاتف ولي الأمر</span>
                <span className="text-xs sm:text-sm font-bold text-slate-700 font-mono" dir="ltr">
                  {student.parentPhone || "غير مسجل"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-slate-400 font-semibold">العنوان والموقع</span>
                <span className="text-xs sm:text-sm font-bold text-slate-700">كفر عقب - القدس</span>
              </div>
            </CardContent>
          </Card>

          {/* Academic Info Card */}
          <Card className="border-slate-100 bg-white shadow-sm shadow-slate-100/40">
            <CardHeader className="pb-2 border-b border-slate-50">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                المعلومات الأكاديمية
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5">
              {classInfo && (
                <>
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-xs text-slate-400 font-semibold">الصف الدراسي الحالي</span>
                    <Badge className="bg-indigo-50 hover:bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-lg">
                      {classInfo.name}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-xs text-slate-400 font-semibold">الزملاء في نفس الصف</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-700">{classmates.length + 1} طلاب</span>
                  </div>
                </>
              )}
              <Button asChild variant="outline" size="sm" className="w-full h-9 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-xs">
                <Link href={`/dashboard/class/${student.classId}`}>
                  <BookOpen className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
                  عرض صفحة الصف
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Attendance, Grades, Notes (col-span-2) */}
        <div className="space-y-5 lg:col-span-2">
          
          {/* Quick Metrics and Stats */}
          <div className="grid gap-3 grid-cols-2">
            <Card className="border-slate-100 bg-white shadow-sm shadow-slate-100/40">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="text-right">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 block">معدل الحضور</span>
                  <span className="text-lg sm:text-xl font-extrabold text-slate-800 block mt-1">{attendanceRate}%</span>
                </div>
                <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-100 bg-white shadow-sm shadow-slate-100/40">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="text-right">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 block">معدل الدرجات</span>
                  <span className="text-lg sm:text-xl font-extrabold text-slate-800 block mt-1">{gradeAverage !== null ? `${gradeAverage}%` : "لا يوجد"}</span>
                </div>
                <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Award className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes summary card */}
          <Card className="border-slate-100 bg-white shadow-sm shadow-slate-100/40">
            <CardHeader className="pb-2 border-b border-slate-50 flex flex-row items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                ملاحظات السلوك والأداء ({studentNotes.length})
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-indigo-650 hover:bg-indigo-50">
                <Link href={`/dashboard/student/${student.id}/notes`}>
                  إدارة الملاحظات
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              {studentNotes.length > 0 ? (
                <div className="space-y-3">
                  {recentNotes.map((note) => (
                    <div key={note.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                      <div className="flex items-center gap-2 mb-1.5 justify-start">
                        <Badge variant="outline" className={`text-[10px] font-bold px-2 rounded-md ${getCategoryColor(note.category)}`}>
                          {getCategoryLabel(note.category)}
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {new Date(note.createdAt).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-450 font-bold mb-3">لا توجد ملاحظات مسجلة للطالب بعد</p>
                  <Button asChild size="sm" variant="outline" className="h-8 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold">
                    <Link href={`/dashboard/student/${student.id}/notes`}>
                      <Plus className="ml-1 h-3.5 w-3.5" />
                      إضافة ملاحظة أولى
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Profile quick sections index */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-100 bg-white shadow-sm shadow-slate-100/40">
          <CardHeader className="pb-2 border-b border-slate-50">
            <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              التقارير والمتابعة التفصيلية
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button asChild variant="outline" className="h-12 border-slate-100 bg-slate-50/50 hover:bg-indigo-50/50 hover:border-indigo-150 rounded-xl text-slate-700 hover:text-indigo-700 font-bold text-xs sm:text-sm transition-all">
                <Link href={`/dashboard/student/${student.id}/notes`}>
                  <StickyNote className="ml-2 h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
                  تعديل وإضافة الملاحظات
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 border-slate-100 bg-slate-50/50 hover:bg-emerald-50/50 hover:border-emerald-150 rounded-xl text-slate-700 hover:text-emerald-700 font-bold text-xs sm:text-sm transition-all">
                <Link href={`/dashboard/student/${student.id}/absences`}>
                  <Users className="ml-2 h-4 w-4 text-slate-400" />
                  متابعة وتفصيل الغيابات
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 border-slate-100 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-150 rounded-xl text-slate-700 hover:text-blue-700 font-bold text-xs sm:text-sm transition-all">
                <Link href={`/dashboard/student/${student.id}/grades`}>
                  <Award className="ml-2 h-4 w-4 text-slate-400" />
                  عرض كشف الدرجات
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
