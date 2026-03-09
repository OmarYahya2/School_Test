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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import type { Student, SchoolClass, Grade } from "@/lib/store"
import { fetchStudentById, fetchStudentsByClass, fetchAttendanceByStudent, fetchGradesByStudent } from "@/lib/supabase-school"
import { fetchClasses } from "@/lib/supabase-school"

type Note = {
  id: string
  content: string
  createdAt: string
  updatedAt?: string
  category?: "academic" | "behavioral" | "general" | "health"
  author?: string
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
        setAttendanceRate(95) // Default if no records
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل بيانات الطالب...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">الطالب غير موجود</h3>
          <p className="text-muted-foreground mb-4">لم يتم العثور على بيانات هذا الطالب</p>
          <Button asChild>
            <Link href="/dashboard/students">
              العودة لقائمة الطلاب
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const birthYear = new Date().getFullYear() - student.age
  const enrollmentDate = new Date(student.createdAt)

  const parseNotes = (notesString: string): Note[] => {
    if (!notesString) return []
    try {
      const parsed = JSON.parse(notesString)
      if (Array.isArray(parsed)) {
        // Regenerate all IDs to ensure uniqueness and fix duplicate key issues
        const seen = new Set<string>()
        return parsed.map((note: Note) => {
          // If this ID was already seen, generate a new unique ID
          let uniqueId = note.id
          if (seen.has(note.id)) {
            uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 5)}`
          }
          seen.add(uniqueId)
          return {
            ...note,
            id: uniqueId
          }
        })
      }
      if (typeof parsed === "string" && parsed.trim()) {
        return [{
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content: parsed,
          createdAt: new Date().toISOString(),
          category: "general",
        }]
      }
      return []
    } catch {
      if (notesString.trim()) {
        return [{
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "behavioral":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "health":
        return "bg-rose-100 text-rose-700 border-rose-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/students">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة للطلاب
            </Link>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="ml-2 h-4 w-4" />
            تعديل البيانات
          </Button>
        </div>
      </div>

      {/* Student Header Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-amber-200 shadow-lg">
                <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-amber-100 to-orange-100 text-gray-700">
                  {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 border-2 border-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent">{student.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="secondary" className="text-xs bg-amber-100 text-gray-700 border-amber-200">
                  <User className="ml-1 h-3 w-3" />
                  {student.age} سنة
                </Badge>
                {classInfo && (
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-gray-700 border-orange-200">
                    <GraduationCap className="ml-1 h-3 w-3" />
                    {classInfo.name}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs bg-amber-100 text-gray-700 border-amber-200">
                  <Calendar className="ml-1 h-3 w-3" />
                  مواليد {birthYear}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid Layout */}
      <div className="grid gap-3 lg:grid-cols-2">
        {/* Left Column - Student Information */}
        <div className="space-y-3">
          {/* Personal Information */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                معلومات شخصية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between py-1 border-b border-emerald-100">
                <span className="text-sm font-semibold text-gray-600">العمر</span>
                <span className="text-sm font-bold text-gray-800">{student.age} سنة</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-emerald-100">
                <span className="text-sm font-semibold text-gray-600">الجنس</span>
                <span className="text-sm font-bold text-gray-800">ذكر</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-emerald-100">
                <span className="text-sm font-semibold text-gray-600">هاتف ولي الأمر</span>
                <span className="text-sm font-bold text-gray-800" dir="ltr">
                  {student.parentPhone || "غير متوفر"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm font-semibold text-gray-600">العنوان</span>
                <span className="text-sm font-bold text-gray-800">غير متوفر</span>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                معلومات أكاديمية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {classInfo && (
                <>
                  <div className="flex items-center justify-between py-1 border-b border-emerald-100">
                    <span className="text-xs text-gray-600">الصف الدراسي</span>
                    <Badge variant="default" className="text-xs bg-emerald-100 text-gray-700 border-emerald-200">
                      {classInfo.name}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-emerald-100">
                    <span className="text-xs text-gray-600">المعلم المسؤول</span>
                    <span className="text-xs font-medium text-gray-800">
                      {classInfo.teacherId ? "سيتم التعيين" : "لم يتم التعيين"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-emerald-100">
                    <span className="text-xs text-gray-600">عدد الطلاب</span>
                    <span className="text-xs font-medium text-gray-800">
                      {classmates.length + 1} طالب
                    </span>
                  </div>
                </>
              )}
              <Button asChild variant="outline" size="sm" className="w-full h-8 bg-emerald-50 border-emerald-200 text-gray-700 hover:bg-emerald-100">
                <Link href={`/dashboard/class/${student.classId}`}>
                  <BookOpen className="ml-1 h-3 w-3" />
                  عرض صفحة الصف
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Overview and Notes */}
        <div className="space-y-3">
          {/* Stats */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                نظرة عامة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-emerald-100 rounded-lg border border-emerald-200">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                  <p className="text-sm font-bold text-gray-700">{attendanceRate}%</p>
                  <p className="text-xs text-gray-600">نسبة الحضور</p>
                </div>
                <div className="text-center p-2 bg-teal-100 rounded-lg border border-teal-200">
                  <Award className="h-4 w-4 text-teal-600 mx-auto mb-1" />
                  <p className="text-sm font-bold text-gray-700">{gradeAverage !== null ? gradeAverage + '%' : '-'}</p>
                  <p className="text-xs text-gray-600">المعدل الدراسي</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button asChild variant="outline" size="sm" className="flex-1 h-8 bg-emerald-50 border-emerald-200 text-gray-700 hover:bg-emerald-100">
                  <Link href={`/dashboard/student/${student.id}/absences`}>
                    <Users className="ml-1 h-3 w-3" />
                    الغيابات
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="flex-1 h-8 bg-emerald-50 border-emerald-200 text-gray-700 hover:bg-emerald-100">
                  <Link href={`/dashboard/student/${student.id}/grades`}>
                    <Award className="ml-1 h-3 w-3" />
                    سجل العلامات
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
                  <div className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                  ملاحظات الطالب
                </CardTitle>
                <Badge variant="outline" className="text-xs bg-white border-emerald-200 text-emerald-700">
                  <StickyNote className="ml-1 h-3 w-3" />
                  {studentNotes.length} ملاحظة
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {studentNotes.length > 0 ? (
                <div className="space-y-2">
                  {recentNotes.map((note) => (
                    <div key={note.id} className="p-2 bg-white rounded border border-emerald-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`text-xs ${getCategoryColor(note.category)}`}>
                          {getCategoryLabel(note.category)}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(note.createdAt).toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-800 leading-relaxed line-clamp-2">
                        {note.content}
                      </p>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2">
                    {studentNotes.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{studentNotes.length - 3} ملاحظات أخرى
                      </span>
                    )}
                    <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-emerald-600 hover:bg-emerald-50 ml-auto">
                      <Link href={`/dashboard/student/${student.id}/notes`}>
                        <Edit className="ml-1 h-3 w-3" />
                        إدارة الملاحظات
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 mb-2">لا توجد ملاحظات مسجلة</p>
                  <Button asChild variant="outline" size="sm" className="h-8 bg-emerald-50 border-emerald-200 text-gray-700 hover:bg-emerald-100">
                    <Link href={`/dashboard/student/${student.id}/notes`}>
                      <Plus className="ml-1 h-3 w-3" />
                      إضافة ملاحظة
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions - Full Width */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            إجراءات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button asChild variant="outline" size="sm" className="h-9 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors">
              <Link href={`/dashboard/student/${student.id}/notes`}>
                <FileText className="ml-2 h-4 w-4" />
                إضافة ملاحظة
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-9 bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors">
              <Link href={`/dashboard/student/${student.id}/absences`}>
                <Users className="ml-2 h-4 w-4" />
                عرض الغيابات
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-9 bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors">
              <Link href={`/dashboard/student/${student.id}/grades`}>
                <Award className="ml-2 h-4 w-4" />
                سجل العلامات
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
