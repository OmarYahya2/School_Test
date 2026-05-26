"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, User, XCircle, CheckCircle, AlertCircle, Clock, Eye, Edit, Download, FileText, TrendingUp, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { toast } from "sonner"
import type { Student } from "@/lib/store"
import { fetchStudentById, fetchAttendanceByStudent } from "@/lib/supabase-school"
import { motion } from "framer-motion"

const processAttendanceData = (records: { date: string; present: boolean }[]) => {
  return records.map((record, index) => ({
    id: index + 1,
    date: record.date,
    status: record.present ? "حاضر" : "غائب",
    reason: record.present ? "-" : "غير محدد",
    type: record.present ? "present" : "unexcused"
  }))
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

export default function StudentAbsencesPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [absences, setAbsences] = useState<any[]>([])
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
      
      const attendanceRecords = await fetchAttendanceByStudent(studentId)
      const processedData = processAttendanceData(attendanceRecords)
      setAbsences(processedData)
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
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-650" />
          <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-indigo-500/10" />
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
        <Button asChild className="bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl">
          <Link href="/dashboard/students">العودة لقائمة الطلاب</Link>
        </Button>
      </div>
    )
  }

  const totalDays = absences.length
  const absentDays = absences.filter((a: any) => a.status === "غائب").length
  const presentDays = absences.filter((a: any) => a.status === "حاضر").length
  const excusedAbsences = absences.filter((a: any) => a.type === "excused").length
  const unexcusedAbsences = absences.filter((a: any) => a.type === "unexcused").length
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6 text-right"
    >
      {/* Header bar */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="h-9 px-3 rounded-lg text-slate-500 hover:bg-slate-100">
          <Link href={`/dashboard/student/${studentId}`}>
            <ArrowLeft className="ml-2 h-4 w-4" />
            <span>العودة للملف الشخصي</span>
          </Link>
        </Button>
      </motion.div>

      {/* Student Profile Header Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-100 bg-white shadow-sm shadow-slate-100/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 blur-2xl bg-indigo-500 pointer-events-none" />
          <CardContent className="p-5 sm:p-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border border-indigo-100 shadow-sm flex-shrink-0">
                <AvatarFallback className="text-base sm:text-lg font-extrabold bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600">
                  {student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-right min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">{student.name}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <Badge variant="secondary" className="bg-slate-50 border border-slate-100 text-slate-650 rounded-lg text-xs font-semibold">
                    {student.age} سنة
                  </Badge>
                  <Badge variant="secondary" className="bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold">
                    متابعة الغيابات والحضور
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Grid sections */}
      <motion.div variants={itemVariants} className="grid gap-5 lg:grid-cols-3">
        
        {/* Left column: Summary Stats cards */}
        <div className="space-y-5 lg:col-span-1">
          {/* Rate card */}
          <Card className="border-slate-100 bg-white shadow-sm shadow-slate-100/40">
            <CardHeader className="pb-2 border-b border-slate-50">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                نسبة حضور الطالب الكلية
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-center">
              <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-extrabold text-slate-850">{attendanceRate}%</p>
              <p className="text-xs text-slate-450 mt-1 font-semibold">
                {attendanceRate >= 90 ? "حضور ممتاز" : attendanceRate >= 80 ? "حضور متوسط" : "يحتاج متابعة وتنبيه"}
              </p>
            </CardContent>
          </Card>

          {/* Details breakdown card */}
          <Card className="border-slate-100 bg-white shadow-sm shadow-slate-100/40">
            <CardHeader className="pb-2 border-b border-slate-50">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                تحليل أيام حضور السجل
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-xs text-slate-400 font-semibold">إجمالي الأيام المسجلة</span>
                <span className="text-xs sm:text-sm font-bold text-slate-700">{totalDays} يوم</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-xs text-slate-400 font-semibold">حاضر</span>
                <Badge className="bg-emerald-50 hover:bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold">
                  {presentDays} أيام
                </Badge>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-slate-400 font-semibold">غائب</span>
                <Badge className="bg-rose-50 hover:bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-bold">
                  {absentDays} أيام
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Timetable absences list */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="border-slate-100 bg-white shadow-sm shadow-slate-100/40">
            <CardHeader className="pb-2 border-b border-slate-50">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                سجل الأيام التفصيلي
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {absences.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-9 w-9 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-550 font-bold">لا يوجد سجلات حضور مسجلة لهذا الطالب</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {absences.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-55/40 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          record.status === "حاضر" ? "bg-emerald-55/15 text-emerald-600" : "bg-rose-55/15 text-rose-600"
                        }`}>
                          {record.status === "حاضر" ? <CheckCircle className="h-4.5 w-4.5" /> : <XCircle className="h-4.5 w-4.5" />}
                        </div>
                        <div className="text-right">
                          <p className="text-xs sm:text-sm font-bold text-slate-800">{record.date}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">الحالة: {record.status}</p>
                        </div>
                      </div>
                      <Badge className={`text-[10px] font-bold rounded-lg border ${
                        record.status === "حاضر" 
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                          : "bg-rose-50 border-rose-100 text-rose-700"
                      }`}>
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  )
}
