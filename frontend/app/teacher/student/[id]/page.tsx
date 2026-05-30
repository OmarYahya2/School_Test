"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  BookOpen,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  GraduationCap,
  Users,
  AlertCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import type { Grade } from "@/lib/store"
import { fetchStudentById } from "@/lib/api/students.api"
import { fetchGradesByStudent } from "@/lib/api/grades.api"
import { fetchAttendanceByStudent } from "@/lib/api/attendance.api"
import { getTeacherProfile, type TeacherProfile } from "@/lib/api/teacher.api"
import { Check, X } from "lucide-react"

interface StudentWithClass {
  id: string
  name: string
  age: number
  classId: string
  class?: { id: string; name: string }
  parentPhone: string
  notes: string
  createdAt: string
}

export default function TeacherStudentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [student, setStudent] = useState<StudentWithClass | null>(null)
  const [attendanceRate, setAttendanceRate] = useState<number | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<{ date: string; present: boolean }[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [filteredGrades, setFilteredGrades] = useState<Grade[]>([])
  const [gradeAverage, setGradeAverage] = useState<number | null>(null)
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // Fetch teacher profile, student, grades, attendance in parallel
        const [profileData, studentData, studentGrades, attendanceData] = await Promise.all([
          getTeacherProfile(),
          fetchStudentById(studentId) as Promise<StudentWithClass | null>,
          fetchGradesByStudent(studentId),
          fetchAttendanceByStudent(studentId),
        ])

        setTeacherProfile(profileData)

        if (!studentData) {
          toast.error("لا يمكنك الوصول إلى بيانات هذا الطالب")
          router.push("/teacher/students")
          return
        }
        setStudent(studentData)

        // Filter grades to teacher's subjects only
        const teacherSubjects = new Set(
          (profileData?.teacherAssignments.map((a) => a.subject) || []).concat(
            profileData?.assignedSubjects || []
          )
        )
        const myGrades = teacherSubjects.size > 0
          ? studentGrades.filter((g) => teacherSubjects.has(g.subject))
          : studentGrades

        setGrades(studentGrades)
        setFilteredGrades(myGrades)
        if (myGrades.length > 0) {
          const avg = Math.round(
            myGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 100, 0) /
              myGrades.length
          )
          setGradeAverage(avg)
        } else {
          setGradeAverage(null)
        }

        // Attendance
        setAttendanceRecords(attendanceData)
        if (attendanceData.length > 0) {
          const presentCount = attendanceData.filter((r) => r.present).length
          const rate = Math.round((presentCount / attendanceData.length) * 100)
          setAttendanceRate(rate)
        } else {
          setAttendanceRate(null)
        }
      } catch (error: any) {
        if (error?.status === 403) {
          toast.error("لا يمكنك الوصول إلى بيانات هذا الطالب")
          router.push("/teacher/students")
        } else {
          toast.error("حدث خطأ أثناء تحميل بيانات الطالب")
        }
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [studentId, router])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <User className="h-12 w-12 text-slate-300 mb-3" />
        <h3 className="text-lg font-bold text-slate-800 mb-1">الطالب غير موجود</h3>
        <p className="text-xs text-slate-500 mb-4">لم نتمكن من العثور على سجل الطالب المطلوب.</p>
        <Link
          href="/teacher/students"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          العودة لقائمة الطلاب
        </Link>
      </div>
    )
  }

  const birthYear = new Date().getFullYear() - student.age

  const subjectStats: Record<string, { total: number; count: number }> = {}
  filteredGrades.forEach((g) => {
    if (!subjectStats[g.subject]) subjectStats[g.subject] = { total: 0, count: 0 }
    subjectStats[g.subject].total += (g.grade / g.maxGrade) * 100
    subjectStats[g.subject].count += 1
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/teacher/students"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">ملف الطالب</h1>
          <p className="text-xs text-slate-500">بيانات الطالب والدرجات والحضور</p>
        </div>
      </div>

      {/* Student Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xl font-bold">
            {student.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{student.name}</h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" />
                {student.class?.name || "—"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {student.age} سنة
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                مواليد {birthYear}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <Phone className="h-3.5 w-3.5" />
              <span dir="ltr">{student.parentPhone || "—"}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Award className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-slate-500">متوسط الدرجات</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {gradeAverage !== null ? `${gradeAverage}%` : "—"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Clock className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-slate-500">نسبة الحضور</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {attendanceRate !== null ? `${attendanceRate}%` : "—"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-slate-500">إجمالي الدرجات</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{grades.length}</p>
        </motion.div>
      </div>

      {/* Attendance History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-sky-600" />
          سجل الحضور
        </h3>

        {attendanceRecords.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">لا توجد سجلات حضور</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-2 text-right text-xs font-semibold text-slate-500">التاريخ</th>
                  <th className="pb-2 text-center text-xs font-semibold text-slate-500">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {[...attendanceRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((rec, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 text-right font-medium text-slate-700">
                      {new Date(rec.date).toLocaleDateString("ar-SA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-2.5 text-center">
                      {rec.present ? (
                        <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-600">
                          <Check className="h-3 w-3" />
                          حاضر
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold bg-rose-50 text-rose-600">
                          <X className="h-3 w-3" />
                          غائب
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Grades Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-600" />
          درجات الطالب — موادي فقط
        </h3>

        {filteredGrades.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">لا توجد درجات مسجلة لموادك</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-2 text-right text-xs font-semibold text-slate-500">المادة</th>
                  <th className="pb-2 text-center text-xs font-semibold text-slate-500">النوع</th>
                  <th className="pb-2 text-center text-xs font-semibold text-slate-500">الدرجة</th>
                  <th className="pb-2 text-center text-xs font-semibold text-slate-500">من</th>
                  <th className="pb-2 text-center text-xs font-semibold text-slate-500">%</th>
                  <th className="pb-2 text-center text-xs font-semibold text-slate-500">الفصل</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((grade) => {
                  const pct = Math.round((grade.grade / grade.maxGrade) * 100)
                  return (
                    <tr key={grade.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5 text-right font-medium text-slate-700">{grade.subject}</td>
                      <td className="py-2.5 text-center text-xs text-slate-500">{grade.examType}</td>
                      <td className="py-2.5 text-center font-bold text-slate-900">{grade.grade}</td>
                      <td className="py-2.5 text-center text-slate-500">{grade.maxGrade}</td>
                      <td className="py-2.5 text-center">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold ${
                            pct >= 80
                              ? "bg-emerald-50 text-emerald-600"
                              : pct >= 60
                              ? "bg-amber-50 text-amber-600"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>
                      <td className="py-2.5 text-center text-xs text-slate-500">{grade.semester}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Subject Averages */}
      {Object.keys(subjectStats).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            متوسط كل مادة
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(subjectStats).map(([subject, stat]) => {
              const avg = Math.round(stat.total / stat.count)
              return (
                <div key={subject} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-700">{subject}</p>
                    <p className="text-[10px] text-slate-400">{stat.count} درجة</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-extrabold ${
                        avg >= 80
                          ? "text-emerald-600"
                          : avg >= 60
                          ? "text-amber-600"
                          : "text-rose-600"
                      }`}
                    >
                      {avg}%
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
