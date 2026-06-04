"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Award, User, BookOpen, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { toast } from "sonner"
import type { Student, Grade, Teacher, SchoolClass } from "@/lib/store"
import { useAdminStudent, useAdminGradesByStudent, useAdminTeachers, useAdminClasses, useDeleteGradeMutation } from "@/lib/hooks/use-admin-data"
import { SkeletonTable } from "@/components/skeletons"
import { motion, type Variants } from "framer-motion"

const ACADEMIC_YEARS = ["2026", "2025", "2024-2025", "2023-2024"]

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

export default function StudentGradesPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const { data: student, isLoading: studentLoading } = useAdminStudent(studentId)
  const { data: gradesRaw = [] } = useAdminGradesByStudent(studentId)
  const { data: teachers = [] } = useAdminTeachers()
  const { data: classes = [] } = useAdminClasses()
  const deleteGrade = useDeleteGradeMutation()
  const [selectedYear, setSelectedYear] = useState<string>("2026")
  const loading = studentLoading

  const grades = gradesRaw

  async function handleDeleteGrade(gradeId: string) {
    deleteGrade.mutate(gradeId, {
      onSuccess: () => {
        toast.success("تم حذف العلامة بنجاح")
      },
      onError: () => {
        toast.error("حدث خطأ أثناء حذف العلامة")
      },
    })
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
    if (percentage >= 90) return "bg-emerald-50 border-emerald-100 text-emerald-700"
    if (percentage >= 80) return "bg-blue-50 border-blue-100 text-blue-700"
    if (percentage >= 70) return "bg-amber-50 border-amber-100 text-amber-700"
    if (percentage >= 60) return "bg-orange-50 border-orange-100 text-orange-700"
    return "bg-rose-50 border-rose-100 text-rose-700"
  }

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
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50/50">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600" />
          <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-violet-500/10" />
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-slate-50/50">
        <User className="h-12 w-12 text-slate-350 mb-3" />
        <h3 className="text-lg font-bold text-slate-800 mb-1">الطالب غير موجود</h3>
        <p className="text-xs text-slate-500 mb-4">لم نتمكن من العثور على سجل الطالب المطلوب.</p>
        <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
          <Link href="/dashboard/students">العودة لقائمة الطلاب</Link>
        </Button>
      </div>
    )
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6 text-right"
    >
      {/* Header bar */}
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-4 flex-wrap">
        <Button asChild variant="ghost" size="sm" className="h-9 px-3 rounded-lg text-slate-500 hover:bg-slate-100">
          <Link href={`/dashboard/student/${studentId}`}>
            <ArrowLeft className="ml-2 h-4 w-4" />
            <span>العودة للملف الشخصي</span>
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500 font-bold"
          >
            {ACADEMIC_YEARS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Student Profile Header Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-100 bg-white shadow-sm shadow-slate-100/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 blur-2xl bg-violet-500 pointer-events-none" />
          <CardContent className="p-5 sm:p-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border border-violet-100 shadow-sm flex-shrink-0">
                <AvatarFallback className="text-base sm:text-lg font-extrabold bg-gradient-to-br from-violet-50 to-violet-100 text-violet-600">
                  {student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-right min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">{student.name}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <Badge variant="secondary" className="bg-slate-50 border border-slate-100 text-slate-650 rounded-lg text-xs font-semibold">
                    {getClassName(student.classId)}
                  </Badge>
                  <Badge variant="secondary" className="bg-violet-50 border border-violet-100 text-violet-700 rounded-lg text-xs font-semibold">
                    سجل العلامات والتحصيل
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Grid sections */}
      <motion.div variants={itemVariants} className="grid gap-5 lg:grid-cols-3">
        
        {/* Left column: Summary statistics */}
        <div className="space-y-5 lg:col-span-1">
          {/* Average Card */}
          <Card className="border-slate-100 bg-white shadow-sm shadow-slate-100/40">
            <CardHeader className="pb-2 border-b border-slate-50">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                المعدل العام
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-center">
              <div className="h-10 w-10 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="h-5 w-5 text-violet-500" />
              </div>
              <p className="text-3xl font-extrabold text-slate-850">{average}%</p>
              <p className="text-xs text-slate-450 mt-1 font-semibold">
                {average >= 90 ? "ممتاز" : average >= 80 ? "جيد جداً" : average >= 70 ? "جيد" : average >= 60 ? "مقبول" : "ضعيف"}
              </p>
            </CardContent>
          </Card>

          {/* Performance breakdown card */}
          <Card className="border-slate-100 bg-white shadow-sm shadow-slate-100/40">
            <CardHeader className="pb-2 border-b border-slate-50">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                مؤشرات الأداء
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-xs text-slate-400 font-semibold">أعلى تقييم دراسي</span>
                <Badge className="bg-emerald-50 hover:bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold">
                  {Math.round(highestGrade)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-xs text-slate-400 font-semibold">أقل تقييم دراسي</span>
                <Badge className="bg-rose-50 hover:bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-bold">
                  {Math.round(lowestGrade)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-slate-400 font-semibold">إجمالي التقييمات</span>
                <span className="text-xs sm:text-sm font-bold text-slate-700">{filteredGrades.length} تقييمات</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Detailed Grades Table */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="border-slate-100 bg-white shadow-sm shadow-slate-100/40 overflow-hidden">
            <CardHeader className="pb-2 border-b border-slate-50 bg-slate-50/20">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                تفاصيل درجات المواد
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredGrades.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500">
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase">المادة</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase">نوع التقييم</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase">المعلم</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase">العلامة</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase">النسبة</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase w-12">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredGrades.map((grade) => {
                        const pct = Math.round((grade.grade / grade.maxGrade) * 100)
                        return (
                          <tr key={grade.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="px-4 py-3">
                              <span className="text-xs sm:text-sm font-bold text-slate-800">{grade.subject}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant="outline" className="text-[10px] font-bold bg-slate-50 border-slate-200/80 text-slate-600 rounded-md">
                                {grade.examType}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-[11px] text-slate-550 font-semibold">{getTeacherName(grade.teacherId)}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-xs sm:text-sm font-bold text-slate-800 font-mono">
                                {grade.grade} / {grade.maxGrade}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge className={`text-[10px] font-bold rounded-lg border ${getGradeColor(pct)}`}>
                                {pct}%
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteGrade(grade.id)}
                                className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
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
                <div className="text-center py-10">
                  <BookOpen className="h-9 w-9 text-slate-350 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-bold">لا يوجد درجات مسجلة للفصل الدراسي المحدد</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  )
}
