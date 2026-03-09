"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Award, Calendar, TrendingUp, User, BookOpen, FileText, Download, Eye, Edit, Trash2, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { toast } from "sonner"
import type { Student, Grade, Teacher, SchoolClass } from "@/lib/store"
import { fetchStudentById, fetchGrades, fetchTeachers, fetchClasses, deleteGrade } from "@/lib/supabase-school"

const ACADEMIC_YEARS = ["2024-2025", "2023-2024", "2022-2023"]

export default function StudentGradesPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [grades, setGrades] = useState<Grade[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [selectedYear, setSelectedYear] = useState<string>("2024-2025")
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [studentData, gradesData, teachersData, classesData] = await Promise.all([
        fetchStudentById(studentId),
        fetchGrades(),
        fetchTeachers(),
        fetchClasses(),
      ])
      if (!studentData) {
        router.push("/dashboard/students")
        return
      }
      setStudent(studentData)
      // Filter grades for this student
      const studentGrades = gradesData.filter(g => g.studentId === studentId)
      setGrades(studentGrades)
      setTeachers(teachersData)
      setClasses(classesData)
    } catch (error) {
      toast.error("حدث خطأ أثناء تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }, [studentId, router])

  useEffect(() => {
    void reload()
  }, [reload])

  async function handleDeleteGrade(gradeId: string) {
    await deleteGrade(gradeId)
    void reload()
    toast.success("تم حذف العلامة بنجاح")
  }

  function getTeacherName(teacherId: string | null): string {
    if (!teacherId) return "-"
    const teacher = teachers.find((t) => t.id === teacherId)
    return teacher?.name || "غير معروف"
  }

  function getClassName(classId: string): string {
    const cls = classes.find((c) => c.id === classId)
    return cls?.name || "غير معروف"
  }

  function getGradeColor(percentage: number): string {
    if (percentage >= 90) return "bg-emerald-100 text-emerald-700 border-emerald-200"
    if (percentage >= 80) return "bg-blue-100 text-blue-700 border-blue-200"
    if (percentage >= 70) return "bg-amber-100 text-amber-700 border-amber-200"
    if (percentage >= 60) return "bg-orange-100 text-orange-700 border-orange-200"
    return "bg-rose-100 text-rose-700 border-rose-200"
  }

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  }

  // Filter grades by selected year
  const filteredGrades = grades.filter(g => g.academicYear === selectedYear)
  
  const average = filteredGrades.length > 0 
    ? Math.round(filteredGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 100, 0) / filteredGrades.length)
    : 0
  const highestGrade = filteredGrades.length > 0 
    ? Math.max(...filteredGrades.map((g) => (g.grade / g.maxGrade) * 100))
    : 0
  const lowestGrade = filteredGrades.length > 0 
    ? Math.min(...filteredGrades.map((g) => (g.grade / g.maxGrade) * 100))
    : 0

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="bg-emerald-50 border-emerald-200 text-gray-700 hover:bg-emerald-100">
            <Link href={`/dashboard/student/${studentId}`}>
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة للملف الشخصي
            </Link>
          </Button>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
            <Award className="ml-1 h-3 w-3" />
            سجل العلامات
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-9 px-3 rounded-md border border-emerald-200 bg-emerald-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {ACADEMIC_YEARS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Header Card - Same design as profile */}
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
                <Badge variant="secondary" className="text-xs bg-orange-100 text-gray-700 border-orange-200">
                  {getClassName(student.classId)}
                </Badge>
                <Button asChild variant="ghost" size="sm" className="h-6 px-2 text-gray-600 hover:bg-amber-50">
                  <Link href={`/dashboard/student/${studentId}`}>
                    <Eye className="ml-1 h-3 w-3" />
                    عرض الملف الشخصي
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-3">
          {/* Average Grade */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                المعدل العام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4">
                <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-gray-800">{average}%</p>
                <p className="text-sm text-gray-600 mt-1">
                  {average >= 90 ? "ممتاز" : average >= 80 ? "جيد جداً" : average >= 70 ? "جيد" : average >= 60 ? "مقبول" : "ضعيف"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                إحصائيات الأداء
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-emerald-100">
                <span className="text-sm text-gray-600">أعلى نسبة</span>
                <span className="text-sm font-bold text-gray-800">{Math.round(highestGrade)}%</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-emerald-100">
                <span className="text-sm text-gray-600">أقل نسبة</span>
                <span className="text-sm font-bold text-gray-800">{Math.round(lowestGrade)}%</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">عدد التقييمات</span>
                <span className="text-sm font-bold text-gray-800">{filteredGrades.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Grades Table */}
        <div className="space-y-3">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 via-white to-teal-50 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                تفاصيل العلامات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredGrades.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">المادة</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-slate-500">نوع التقييم</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-slate-500">المعلم</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-slate-500">العلامة</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-slate-500">النسبة</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredGrades.map((grade) => {
                        const pct = Math.round((grade.grade / grade.maxGrade) * 100)
                        return (
                          <tr key={grade.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-2">
                              <span className="text-sm font-medium text-slate-700">{grade.subject}</span>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <Badge variant="outline" className="text-xs">
                                {grade.examType}
                              </Badge>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span className="text-xs text-slate-600">{getTeacherName(grade.teacherId)}</span>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span className="text-sm font-medium text-slate-700">
                                {grade.grade} / {grade.maxGrade}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <Badge className={`text-xs ${getGradeColor(pct)}`}>
                                {pct}%
                              </Badge>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteGrade(grade.id)}
                                className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 h-7 w-7 p-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-4 py-6 text-center">
                  <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">لا توجد علامات مسجلة لهذا الطالب</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            إجراءات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button variant="outline" size="sm" className="h-8 bg-emerald-50 border-emerald-200 text-gray-700 hover:bg-emerald-100" asChild>
              <Link href={`/dashboard/grades`}>
                <Plus className="ml-1 h-3 w-3" />
                إضافة علامة
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-8 bg-emerald-50 border-emerald-200 text-gray-700 hover:bg-emerald-100">
              <Download className="ml-1 h-3 w-3" />
              تحميل PDF
            </Button>
            <Button variant="outline" size="sm" className="h-8 bg-emerald-50 border-emerald-200 text-gray-700 hover:bg-emerald-100">
              <FileText className="ml-1 h-3 w-3" />
              طباعة التقرير
            </Button>
            <Button variant="outline" size="sm" className="h-8 bg-emerald-50 border-emerald-200 text-gray-700 hover:bg-emerald-100">
              <Calendar className="ml-1 h-3 w-3" />
              جدول الامتحانات
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
