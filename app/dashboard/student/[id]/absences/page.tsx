"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, User, XCircle, CheckCircle, AlertCircle, Clock, Eye, Edit, Download, FileText, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { toast } from "sonner"
import type { Student } from "@/lib/store"
import { fetchStudentById, fetchAttendanceByStudent } from "@/lib/supabase-school"

// Helper function to process attendance data
const processAttendanceData = (records: { date: string; present: boolean }[]) => {
  return records.map((record, index) => ({
    id: index + 1,
    date: record.date,
    status: record.present ? "حاضر" : "غائب",
    reason: record.present ? "-" : "غير محدد",
    type: record.present ? "present" : "unexcused"
  }))
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
      
      // Fetch real attendance data from Supabase
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

  const totalDays = absences.length
  const absentDays = absences.filter((a: any) => a.status === "غائب").length
  const presentDays = absences.filter((a: any) => a.status === "حاضر").length
  const excusedAbsences = absences.filter((a: any) => a.type === "excused").length
  const unexcusedAbsences = absences.filter((a: any) => a.type === "unexcused").length
  const attendanceRate = Math.round((presentDays / totalDays) * 100)

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
            <XCircle className="ml-1 h-3 w-3" />
            سجل الغيابات
          </Badge>
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
                <Badge variant="secondary" className="text-xs bg-orange-100 text-gray-700 border-orange-200">
                  <XCircle className="ml-1 h-3 w-3" />
                  سجل الغيابات
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
          {/* Attendance Rate */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                نسبة الحضور
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4">
                <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-gray-800">{attendanceRate}%</p>
                <p className="text-sm text-gray-600 mt-1">
                  {attendanceRate >= 90 ? "ممتاز" : attendanceRate >= 80 ? "جيد جداً" : attendanceRate >= 70 ? "جيد" : "يحتاج تحسين"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Absence Stats */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                إحصائيات الغياب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-emerald-100">
                <span className="text-sm text-gray-600">إجمالي الأيام</span>
                <span className="text-sm font-bold text-gray-800">{totalDays}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-emerald-100">
                <span className="text-sm text-gray-600">أيام الحضور</span>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{presentDays}</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-emerald-100">
                <span className="text-sm text-gray-600">أيام الغياب</span>
                <Badge className="bg-rose-100 text-rose-700 border-rose-200">{absentDays}</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-emerald-100">
                <span className="text-sm text-gray-600">غياب بعذر</span>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">{excusedAbsences}</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">غياب بدون عذر</span>
                <Badge className="bg-red-100 text-red-700 border-red-200">{unexcusedAbsences}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Absence List */}
        <div className="space-y-3">
          {/* Absences List */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                سجل الحضور والغياب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {absences.map((record: any) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      record.status === "حاضر" 
                        ? "bg-emerald-100" 
                        : record.type === "excused"
                        ? "bg-amber-100"
                        : "bg-rose-100"
                    }`}>
                      {record.status === "حاضر" ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      ) : record.type === "excused" ? (
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{record.date}</p>
                      <p className="text-xs text-gray-600">
                        {record.status === "حاضر" ? "حاضر" : `غائب - ${record.reason}`}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={
                      record.status === "حاضر"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200 text-xs"
                        : record.type === "excused"
                        ? "bg-amber-100 text-amber-700 border-amber-200 text-xs"
                        : "bg-rose-100 text-rose-700 border-rose-200 text-xs"
                    }
                  >
                    {record.status === "حاضر" ? "حاضر" : "غائب"}
                  </Badge>
                </div>
              ))}
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
              إضافة غياب
            </Button>
            <Button variant="outline" size="sm" className="h-8 bg-emerald-50 border-emerald-200 text-gray-700 hover:bg-emerald-100">
              <TrendingUp className="ml-1 h-3 w-3" />
              تحليل الغيابات
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
