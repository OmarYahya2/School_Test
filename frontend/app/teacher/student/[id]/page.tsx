"use client"

import { useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, User, Calendar, Phone, BookOpen, Award, Clock, TrendingUp, GraduationCap, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useTeacherLanguage } from "@/lib/teacher-language-context"
import type { Grade } from "@/lib/store"
import {
  useTeacherProfile,
  useTeacherStudent,
  useTeacherGradesByStudent,
  useTeacherAttendanceByStudent,
} from "@/lib/hooks/use-teacher-data"
import { X } from "lucide-react"

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
  const { t } = useTeacherLanguage()
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const { data: teacherProfile } = useTeacherProfile()
  const { data: rawStudent, isLoading: studentLoading } = useTeacherStudent(studentId)
  const student = rawStudent as StudentWithClass | null
  const { data: studentGrades = [], isLoading: gradesLoading } = useTeacherGradesByStudent(studentId)
  const { data: attendanceData = [], isLoading: attendanceLoading } = useTeacherAttendanceByStudent(studentId)

  const loading = studentLoading || gradesLoading || attendanceLoading

  // All hooks must be before any early return
  const teacherSubjects = useMemo(() => {
    if (!teacherProfile) return new Set<string>()
    return new Set(
      [
        ...(teacherProfile.teacherAssignments?.map((a) => a.subject) || []),
        ...(teacherProfile.assignedSubjects || []),
        teacherProfile.subject
      ].filter(Boolean)
    )
  }, [teacherProfile])

  const filteredGrades = useMemo(() => {
    if (!studentGrades.length) return []
    return teacherSubjects.size > 0
      ? studentGrades.filter((g) => teacherSubjects.has(g.subject))
      : studentGrades
  }, [studentGrades, teacherSubjects])

  const gradeAverage = useMemo(() => {
    if (!filteredGrades.length) return null
    return Math.round(
      filteredGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 100, 0) /
        filteredGrades.length
    )
  }, [filteredGrades])

  const attendanceRate = useMemo(() => {
    if (!attendanceData.length) return null
    const presentCount = attendanceData.filter((r) => r.present).length
    return Math.round((presentCount / attendanceData.length) * 100)
  }, [attendanceData])

  // Redirect if student not found after loading
  useEffect(() => {
    if (!loading && !student) {
      toast.error("لا يمكنك الوصول إلى بيانات هذا الطالب")
      router.push("/teacher/students")
    }
  }, [loading, student, router])

  if (!loading && !student) {
    return null
  }

  const attendanceRecords = attendanceData

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20">
        <User className="h-12 w-12 text-slate-300 mb-3" />
        <h3 className="text-lg font-bold text-slate-800 mb-1">{t.teacher.studentNotFound}</h3>
        <p className="text-xs text-slate-500 mb-4">{t.teacher.studentNotFoundDesc}</p>
        <Link
          href="/teacher/students"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
        >
          {t.teacher.backToStudents}
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
      <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-sky-300/10 rounded-full blur-3xl -z-10 opacity-60" />
        <div className="flex items-center gap-3">
          <Link
            href="/teacher/students"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/60 text-slate-500 hover:bg-white/80 hover:text-slate-700 transition-colors shadow-sm border border-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">{t.teacher.studentProfile}</h1>
            <p className="text-xs text-slate-500">{t.teacher.studentData}</p>
          </div>
        </div>
      </div>

      {/* Student Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-5"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-2xl opacity-30 -z-10" />
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xl font-bold shadow-sm">
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
                {student.age} {t.teacher.years}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {t.teacher.born} {birthYear}
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
          className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-4"
        >
          <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-teal-300/10 rounded-full blur-2xl opacity-30 -z-10" />
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shadow-sm">
              <Award className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-slate-500">{t.teacher.gradeAverage}</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {gradeAverage !== null ? `${gradeAverage}%` : "—"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-4"
        >
          <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-sky-400/20 to-blue-300/10 rounded-full blur-2xl opacity-30 -z-10" />
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 shadow-sm">
              <Clock className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-slate-500">{t.teacher.attendanceRate}</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {attendanceRate !== null ? `${attendanceRate}%` : "—"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-4"
        >
          <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-orange-300/10 rounded-full blur-2xl opacity-30 -z-10" />
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 shadow-sm">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-slate-500">{t.teacher.totalGrades}</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{studentGrades.length}</p>
        </motion.div>
      </div>

      {/* Attendance History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-5"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rose-400/20 to-transparent rounded-full blur-2xl opacity-30 -z-10" />
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-rose-600" />
          {t.teacher.absenceRecord}
        </h3>

        {attendanceRecords.filter(rec => !rec.present).length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">{t.teacher.noAbsences}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="pb-2 text-right text-xs font-semibold text-slate-500">{t.teacher.date}</th>
                  <th className="pb-2 text-center text-xs font-semibold text-slate-500">{t.teacher.status}</th>
                </tr>
              </thead>
              <tbody>
                {[...attendanceRecords]
                  .filter(rec => !rec.present)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((rec, i) => (
                  <tr key={i} className="border-b border-white/10 last:border-0">
                    <td className="py-2.5 text-right font-medium text-slate-700">
                      {new Date(rec.date).toLocaleDateString("ar-SA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-2.5 text-center">
                      <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold bg-rose-50/70 text-rose-600 border border-rose-200/50 backdrop-blur-sm">
                        <X className="h-3 w-3" />
                        {t.teacher.absent}
                      </span>
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
        className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-5"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-2xl opacity-30 -z-10" />
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-600" />
          {t.teacher.mySubjectsOnly}
        </h3>

        {filteredGrades.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">{t.teacher.noSubjectGrades}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="pb-2 text-right text-xs font-semibold text-slate-500">{t.table.subject}</th>
                  <th className="pb-2 text-center text-xs font-semibold text-slate-500">{t.teacher.type}</th>
                  <th className="pb-2 text-center text-xs font-semibold text-slate-500">{t.teacher.grade}</th>
                  <th className="pb-2 text-center text-xs font-semibold text-slate-500">{t.teacher.from}</th>
                  <th className="pb-2 text-center text-xs font-semibold text-slate-500">{t.teacher.percentage}</th>
                  <th className="pb-2 text-center text-xs font-semibold text-slate-500">{t.teacher.semester}</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((grade) => {
                  const pct = Math.round((grade.grade / grade.maxGrade) * 100)
                  return (
                    <tr key={grade.id} className="border-b border-white/10 last:border-0">
                      <td className="py-2.5 text-right font-medium text-slate-700">{grade.subject}</td>
                      <td className="py-2.5 text-center text-xs text-slate-500">{grade.examType}</td>
                      <td className="py-2.5 text-center font-bold text-slate-900">{grade.grade}</td>
                      <td className="py-2.5 text-center text-slate-500">{grade.maxGrade}</td>
                      <td className="py-2.5 text-center">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold border backdrop-blur-sm ${
                            pct >= 80
                              ? "bg-emerald-50/70 text-emerald-600 border-emerald-200/50"
                              : pct >= 60
                              ? "bg-amber-50/70 text-amber-600 border-amber-200/50"
                              : "bg-rose-50/70 text-rose-600 border-rose-200/50"
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
          className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-5"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-2xl opacity-30 -z-10" />
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            {t.teacher.subjectAverages}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(subjectStats).map(([subject, stat]) => {
              const avg = Math.round(stat.total / stat.count)
              return (
                <div key={subject} className="flex items-center gap-3 rounded-xl bg-white/50 border border-white/20 p-3 backdrop-blur-sm">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-700">{subject}</p>
                    <p className="text-[10px] text-slate-400">{stat.count} {t.teacher.grade}</p>
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
