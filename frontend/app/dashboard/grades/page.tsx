"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Plus,
  Trash2,
  Search,
  GraduationCap,
  Filter,
  Award,
  TrendingUp,
  BookOpen,
  Calendar,
  User,
  School,
  Save,
  BarChart3,
  ChevronLeft,
  Users,
  ClipboardList,
  Eye,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import type { Student, SchoolClass, Teacher, Grade } from "@/lib/store"
import {
  fetchGrades,
  fetchStudents,
  fetchClasses,
  fetchTeachers,
  createGrade,
  deleteGrade,
} from "@/lib/supabase-school"
import { motion, AnimatePresence } from "framer-motion"

const ACADEMIC_YEARS = ["2024-2025", "2023-2024", "2022-2023"]
const SEMESTERS = ["الفصل الأول", "الفصل الثاني", "الفصل الصيفي"]

const SEMESTER_MAP: Record<string, string> = {
  "الفصل الأول": "first",
  "الفصل الثاني": "second",
  "الفصل الصيفي": "second",
}

const SEMESTER_DISPLAY: Record<string, string> = {
  first: "الفصل الأول",
  second: "الفصل الثاني",
}

const EXAM_TYPES = ["كويز", "نصف الفصل", "أسايمنت (واجب)", "مشاريع", "امتحان نهائي", "اختبار قصير"]

const EXAM_TYPE_MAP: Record<string, string> = {
  كويز: "quiz",
  "اختبار قصير": "quiz",
  "نصف الفصل": "exam",
  "امتحان نهائي": "exam",
  "أسايمنت (واجب)": "homework",
  مشاريع: "project",
}

const EXAM_TYPE_DISPLAY: Record<string, string> = {
  quiz: "كويز",
  exam: "امتحان نهائي",
  homework: "أسايمنت (واجب)",
  project: "مشاريع",
}

const SUBJECTS = [
  "اللغة العربية",
  "الرياضيات",
  "العلوم",
  "اللغة الإنجليزية",
  "الدراسات الاجتماعية",
  "الحاسوب",
  "التربية الفنية",
  "التربية الرياضية",
  "التربية الإسلامية",
]

type ViewMode = "classes" | "students" | "all-grades" | "all-grades-class" | "all-grades-student"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
}

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("classes")
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null)
  const [allGradesSelectedStudent, setAllGradesSelectedStudent] = useState<Student | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSemester, setSelectedSemester] = useState<string>("الفصل الأول")
  const [selectedYear, setSelectedYear] = useState<string>("2024-2025")
  const [filterTeacherId, setFilterTeacherId] = useState<string>("all")

  // View 2 filters (for class grades view)
  const [classFilterTeacher, setClassFilterTeacher] = useState<string>("all")
  const [classFilterSubject, setClassFilterSubject] = useState<string>("all")
  const [classFilterExamType, setClassFilterExamType] = useState<string>("all")
  const [classStudentSearch, setClassStudentSearch] = useState("")

  // Add grade dialog
  const [addGradeOpen, setAddGradeOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  // Form states
  const [newGrade, setNewGrade] = useState("")
  const [newMaxGrade, setNewMaxGrade] = useState("100")
  const [newNotes, setNewNotes] = useState("")

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [gradesData, studentsData, classesData, teachersData] = await Promise.all([
        fetchGrades(),
        fetchStudents(),
        fetchClasses(),
        fetchTeachers(),
      ])
      setGrades(gradesData)
      setStudents(studentsData)
      setClasses(classesData)
      setTeachers(teachersData)
    } catch (error) {
      toast.error("حدث خطأ أثناء تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  // Get students for selected class
  const studentsInClass = selectedClass
    ? students.filter((s) => s.classId === selectedClass.id)
    : []

  // Get grades for student
  const getStudentGrades = (studentId: string) => {
    const semesterDb = SEMESTER_MAP[selectedSemester] || "first"
    return grades.filter(
      (g) =>
        g.studentId === studentId &&
        g.academicYear === selectedYear &&
        g.semester === semesterDb
    )
  }

  async function handleAddGrade() {
    if (!selectedStudent) {
      toast.error("يرجى اختيار الطالب")
      return
    }
    if (classFilterTeacher === "all") {
      toast.error("يرجى اختيار المعلم من الفلاتر أولاً")
      return
    }
    if (classFilterSubject === "all") {
      toast.error("يرجى اختيار المادة من الفلاتر أولاً")
      return
    }
    if (classFilterExamType === "all") {
      toast.error("يرجى اختيار نوع التقييم من الفلاتر أولاً")
      return
    }
    const gradeValue = parseFloat(newGrade)
    const maxGradeValue = parseFloat(newMaxGrade)
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > maxGradeValue) {
      toast.error(`يرجى إدخال علامة صحيحة بين 0 و ${maxGradeValue}`)
      return
    }

    try {
      const examTypeDb = EXAM_TYPE_MAP[classFilterExamType] || "exam"
      const semesterDb = SEMESTER_MAP[selectedSemester] || "first"

      const created = await createGrade(
        selectedStudent.id,
        classFilterSubject,
        gradeValue,
        maxGradeValue,
        semesterDb,
        selectedYear,
        examTypeDb,
        classFilterTeacher,
        newNotes.trim()
      )

      if (!created) {
        toast.error("فشل إضافة العلامة - قد تكون هناك مشكلة في الاتصال بقاعدة البيانات")
        return
      }

      resetForm()
      setAddGradeOpen(false)
      void reload()
      toast.success(`تمت إضافة العلامة بنجاح للطالب ${selectedStudent.name}`)
    } catch (error) {
      console.error("Error in handleAddGrade:", error)
      toast.error("حدث خطأ غير متوقع أثناء إضافة العلامة")
    }
  }

  async function handleDeleteGrade(id: string) {
    await deleteGrade(id)
    void reload()
    toast.success("تم حذف العلامة بنجاح")
  }

  function resetForm() {
    setNewGrade("")
    setNewMaxGrade("100")
    setNewNotes("")
  }

  function openAddGrade(student: Student) {
    setSelectedStudent(student)
    resetForm()
    setAddGradeOpen(true)
  }

  function getClassName(classId: string): string {
    const cls = classes.find((c) => c.id === classId)
    return cls?.name || "غير معروف"
  }

  function getTeacherName(teacherId: string | null): string {
    if (!teacherId) return "-"
    const teacher = teachers.find((t) => t.id === teacherId)
    return teacher?.name || "غير معروف"
  }

  function getGradeColor(percentage: number): string {
    if (percentage >= 90) return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (percentage >= 80) return "bg-indigo-50 text-indigo-750 border-indigo-200"
    if (percentage >= 70) return "bg-amber-50 text-amber-700 border-amber-200"
    if (percentage >= 60) return "bg-orange-50 text-orange-700 border-orange-200"
    return "bg-rose-50 text-rose-700 border-rose-250"
  }

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  // VIEW 1: Classes List
  if (viewMode === "classes") {
    return (
      <motion.div
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="space-y-6 text-right"
        dir="rtl"
      >
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 border border-slate-100 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-505">
              <School className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">رصد وإدخال العلامات</h1>
              <p className="text-xs sm:text-sm text-slate-400">اختر الصف الدراسي للبدء برصد الدرجات والتقييمات للطلاب</p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setViewMode("all-grades")}
            className="h-10 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold flex items-center gap-2 w-full sm:w-auto"
          >
            <ClipboardList className="h-4.5 w-4.5" />
            <span>سجل الدرجات العام</span>
          </Button>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-11 w-11 bg-slate-50 text-slate-650 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-5.5 w-5.5" />
              </div>
              <div>
                <p className="text-xl font-black text-slate-850">{grades.length}</p>
                <p className="text-[11px] font-semibold text-slate-400">إجمالي الدرجات المرصودة</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-11 w-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <School className="h-5.5 w-5.5" />
              </div>
              <div>
                <p className="text-xl font-black text-slate-850">{classes.length}</p>
                <p className="text-[11px] font-semibold text-slate-400">الصفوف الدراسية</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-11 w-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <Users className="h-5.5 w-5.5" />
              </div>
              <div>
                <p className="text-xl font-black text-slate-850">{students.length}</p>
                <p className="text-[11px] font-semibold text-slate-400">الطلاب المسجلون</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-11 w-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <Award className="h-5.5 w-5.5" />
              </div>
              <div>
                <p className="text-xl font-black text-slate-850">{teachers.length}</p>
                <p className="text-[11px] font-semibold text-slate-400">المعلمون</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Classes Grid */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h2 className="text-sm font-bold text-slate-700">الصفوف الدراسية المتوفرة</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {classes.map((cls) => {
              const classStudents = students.filter((s) => s.classId === cls.id)
              const classGrades = grades.filter((g) => classStudents.some((s) => s.id === g.studentId))
              const gradedStudents = new Set(classGrades.map((g) => g.studentId)).size

              return (
                <Card
                  key={cls.id}
                  className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group rounded-2xl relative overflow-hidden"
                  onClick={() => {
                    setSelectedClass(cls)
                    setViewMode("students")
                  }}
                >
                  <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-650 transition-colors">
                        <School className="h-5 w-5" />
                      </div>
                      <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 text-xs rounded-lg">
                        {classStudents.length} طلاب
                      </Badge>
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-base mb-1">{cls.name}</h3>
                    <p className="text-xs text-slate-400 mb-4">
                      تم رصد علامات لـ {gradedStudents} من أصل {classStudents.length} طلاب
                    </p>

                    <div className="flex items-center gap-1 text-xs font-bold text-indigo-650 pt-2 border-t border-slate-100/60">
                      <span>عرض قائمة الطلاب والرصد</span>
                      <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // VIEW 2: Students in Class
  if (viewMode === "students" && selectedClass) {
    return (
      <motion.div
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="space-y-6 text-right"
        dir="rtl"
      >
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-white p-5 border border-slate-100 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setViewMode("classes")
                setSelectedClass(null)
              }}
              className="text-slate-500 hover:bg-slate-100 h-9 w-9 p-0 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5 rotate-180" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">{selectedClass.name}</h1>
              <p className="text-xs sm:text-sm text-slate-400">رصد العلامات للفصل والدراسة الحالية</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="بحث عن طالب بالاسم..."
                value={classStudentSearch}
                onChange={(e) => setClassStudentSearch(e.target.value)}
                className="w-full sm:w-44 pr-9 border-slate-200 rounded-xl h-9 text-xs"
              />
            </div>
            <Select value={classFilterTeacher} onValueChange={setClassFilterTeacher}>
              <SelectTrigger className="w-36 border-slate-200 rounded-xl h-9 text-xs">
                <SelectValue placeholder="اختر المعلم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المعلمين</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={classFilterSubject} onValueChange={setClassFilterSubject}>
              <SelectTrigger className="w-36 border-slate-200 rounded-xl h-9 text-xs">
                <SelectValue placeholder="اختر المادة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المواد</SelectItem>
                {SUBJECTS.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={classFilterExamType} onValueChange={setClassFilterExamType}>
              <SelectTrigger className="w-36 border-slate-200 rounded-xl h-9 text-xs">
                <SelectValue placeholder="نوع التقييم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التقييمات</SelectItem>
                {EXAM_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-36 border-slate-200 rounded-xl h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEMESTERS.map((sem) => (
                  <SelectItem key={sem} value={sem}>
                    {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32 border-slate-200 rounded-xl h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACADEMIC_YEARS.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Filter Alert and Tips */}
        <motion.div variants={itemVariants}>
          <Card className="bg-slate-50 border border-slate-100 shadow-sm rounded-xl">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-2.5">
                <Filter className="h-5 w-5 text-indigo-500 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">فلاتر الرصد النشطة:</span>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <Badge variant="outline" className={`rounded text-[10px] ${classFilterTeacher === "all" ? "border-rose-200 text-rose-600 bg-rose-50/20" : "border-indigo-200 text-indigo-700 bg-indigo-50/10"}`}>
                      المعلم: {classFilterTeacher === "all" ? "غير محدد" : getTeacherName(classFilterTeacher)}
                    </Badge>
                    <Badge variant="outline" className={`rounded text-[10px] ${classFilterSubject === "all" ? "border-rose-200 text-rose-600 bg-rose-50/20" : "border-indigo-200 text-indigo-700 bg-indigo-50/10"}`}>
                      المادة: {classFilterSubject === "all" ? "غير محدد" : classFilterSubject}
                    </Badge>
                    <Badge variant="outline" className={`rounded text-[10px] ${classFilterExamType === "all" ? "border-rose-200 text-rose-600 bg-rose-50/20" : "border-indigo-200 text-indigo-700 bg-indigo-50/10"}`}>
                      التقييم: {classFilterExamType === "all" ? "غير محدد" : classFilterExamType}
                    </Badge>
                  </div>
                </div>
              </div>
              { (classFilterTeacher === "all" || classFilterSubject === "all" || classFilterExamType === "all") && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span>يرجى اختيار (المعلم والمادة ونوع التقييم) لإضافة درجات جديدة للطلاب.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Students List Container */}
        <motion.div variants={itemVariants} className="space-y-4">
          {studentsInClass.length === 0 ? (
            <Card className="bg-white border border-slate-100 p-12 text-center rounded-2xl shadow-sm">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">لا يوجد طلاب مسجلون في هذا الصف</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {studentsInClass
                .filter((student) =>
                  classStudentSearch === "" ||
                  student.name.toLowerCase().includes(classStudentSearch.toLowerCase())
                )
                .map((student) => {
                  let studentGrades = getStudentGrades(student.id)
                  if (classFilterTeacher !== "all") {
                    studentGrades = studentGrades.filter((g) => g.teacherId === classFilterTeacher)
                  }
                  if (classFilterSubject !== "all") {
                    studentGrades = studentGrades.filter((g) => g.subject === classFilterSubject)
                  }
                  if (classFilterExamType !== "all") {
                    const examTypeDb = EXAM_TYPE_MAP[classFilterExamType]
                    studentGrades = studentGrades.filter((g) => g.examType === examTypeDb)
                  }
                  const average =
                    studentGrades.length > 0
                      ? Math.round(
                          studentGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 100, 0) /
                            studentGrades.length
                        )
                      : null

                  return (
                    <Card
                      key={student.id}
                      className="bg-white border border-slate-100 shadow-sm overflow-hidden rounded-2xl hover:border-slate-200 transition-colors"
                    >
                      {/* Sub Header per student */}
                      <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 rounded-xl">
                            <AvatarFallback className="bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              href={`/dashboard/student/${student.id}`}
                              className="font-bold text-slate-800 hover:text-indigo-650 transition-colors text-sm"
                            >
                              {student.name}
                            </Link>
                            <p className="text-[10px] text-slate-400 mt-0.5">العمر: {student.age} سنة</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {average !== null && (
                            <Badge className={`rounded-lg py-1 px-2.5 font-bold border ${getGradeColor(average)}`}>
                              المعدل المرشح: {average}%
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            onClick={() => openAddGrade(student)}
                            disabled={
                              classFilterTeacher === "all" ||
                              classFilterSubject === "all" ||
                              classFilterExamType === "all"
                            }
                            className="bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl h-8 text-xs font-bold border-0 disabled:bg-slate-150 disabled:text-slate-400 shadow-sm"
                          >
                            <Plus className="h-3.5 w-3.5 ml-1" />
                            <span>رصد علامة</span>
                          </Button>
                        </div>
                      </div>

                      {/* Grades Table */}
                      {studentGrades.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-right">
                            <thead>
                              <tr className="bg-slate-50/20 border-b border-slate-100">
                                <th className="px-5 py-2.5 font-bold text-slate-400 text-xs">المادة</th>
                                <th className="px-5 py-2.5 font-bold text-slate-400 text-xs text-center">التقييم</th>
                                <th className="px-5 py-2.5 font-bold text-slate-400 text-xs text-center">المعلم</th>
                                <th className="px-5 py-2.5 font-bold text-slate-400 text-xs text-center">العلامة</th>
                                <th className="px-5 py-2.5 font-bold text-slate-400 text-xs text-center">النسبة</th>
                                <th className="px-5 py-2.5 w-12"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/60">
                              {studentGrades.map((grade) => {
                                const pct = Math.round((grade.grade / grade.maxGrade) * 100)
                                return (
                                  <tr key={grade.id} className="hover:bg-slate-50/20 transition-colors">
                                    <td className="px-5 py-3">
                                      <span className="font-bold text-slate-700">{grade.subject}</span>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                      <Badge variant="outline" className="text-[10px] font-bold rounded bg-slate-50 border-slate-205">
                                        {EXAM_TYPE_DISPLAY[grade.examType] || grade.examType}
                                      </Badge>
                                    </td>
                                    <td className="px-5 py-3 text-center text-xs text-slate-505">
                                      {getTeacherName(grade.teacherId)}
                                    </td>
                                    <td className="px-5 py-3 text-center font-bold text-slate-700">
                                      {grade.grade} / {grade.maxGrade}
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                      <Badge className={`rounded-lg font-bold border ${getGradeColor(pct)}`}>
                                        {pct}%
                                      </Badge>
                                    </td>
                                    <td className="px-5 py-3 text-left">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteGrade(grade.id)}
                                        className="text-rose-450 hover:text-rose-600 hover:bg-rose-50 h-7 w-7 p-0 rounded-lg"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-slate-400">
                          <p className="text-xs font-semibold">لا توجد درجات مرصودة لهذا الطالب بالخيارات المحددة.</p>
                        </div>
                      )}
                    </Card>
                  )
                })}

              {studentsInClass.filter((student) =>
                classStudentSearch === "" ||
                student.name.toLowerCase().includes(classStudentSearch.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-10 bg-slate-50/20 border border-slate-100 rounded-xl">
                  <Search className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-550 font-bold">لا يوجد نتائج بحث مطابقة</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Add Grade Modal */}
        <Dialog open={addGradeOpen} onOpenChange={setAddGradeOpen}>
          <DialogContent className="text-right bg-white border-slate-100 rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-slate-900 font-extrabold text-lg flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                رصد علامة جديدة للطفل
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 pt-2">
              <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">الطالب:</span>
                  <span className="font-bold text-slate-800">{selectedStudent?.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">المعلم:</span>
                  <span className="font-bold text-slate-800">{getTeacherName(classFilterTeacher)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">المادة:</span>
                  <span className="font-bold text-slate-850">{classFilterSubject}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">نوع التقييم:</span>
                  <span className="font-bold text-slate-850">{classFilterExamType}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-slate-705 font-bold text-xs">العلامة *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    min={0}
                    max={parseInt(newMaxGrade)}
                    className="bg-white border-slate-200 focus:border-indigo-500 rounded-xl h-10 text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-705 font-bold text-xs">من أصل</Label>
                  <Input
                    type="number"
                    value={newMaxGrade}
                    onChange={(e) => setNewMaxGrade(e.target.value)}
                    min={1}
                    className="bg-white border-slate-200 focus:border-indigo-500 rounded-xl h-10 text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-705 font-bold text-xs">النسبة المئوية</Label>
                  <div className="h-10 flex items-center justify-center bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700">
                    {newGrade && newMaxGrade
                      ? Math.round((parseFloat(newGrade) / parseFloat(newMaxGrade)) * 100) + "%"
                      : "—"}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-705 font-bold text-xs">ملاحظات التقييم</Label>
                <Textarea
                  placeholder="مثال: أداء ممتاز، يحتاج للتركيز أكثر..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  className="bg-white border-slate-200 focus:border-indigo-500 rounded-xl resize-none text-slate-800 text-sm"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <DialogClose asChild>
                  <Button variant="outline" className="border-slate-200 rounded-xl h-10">
                    إلغاء
                  </Button>
                </DialogClose>
                <Button
                  onClick={handleAddGrade}
                  className="bg-gradient-to-r from-indigo-550 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl h-10 px-5 border-0 font-bold"
                >
                  حفظ العلامة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    )
  }

  // VIEW 3: All Grades Search
  if (viewMode === "all-grades") {
    const filteredStudents = students.filter((student) =>
      searchTerm === "" || student.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const studentsWithGrades = filteredStudents
      .map((student) => {
        const studentGrades = grades.filter(
          (g) =>
            g.studentId === student.id &&
            g.academicYear === selectedYear &&
            (filterTeacherId === "all" || g.teacherId === filterTeacherId)
        )
        const avg =
          studentGrades.length > 0
            ? Math.round(
                studentGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 100, 0) /
                  studentGrades.length
              )
            : null
        return {
          student,
          grades: studentGrades,
          average: avg,
        }
      })
      .filter(
        (sg) =>
          searchTerm === "" ||
          sg.grades.length > 0 ||
          sg.student.name.toLowerCase().includes(searchTerm.toLowerCase())
      )

    return (
      <motion.div
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="space-y-6 text-right"
        dir="rtl"
      >
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 border border-slate-100 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setViewMode("classes")
                setSearchTerm("")
              }}
              className="text-slate-500 hover:bg-slate-100 h-9 w-9 p-0 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5 rotate-180" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">السجل العام للعلامات</h1>
              <p className="text-xs sm:text-sm text-slate-400">مراجعة والبحث في درجات الطلاب بكل الفئات التعليمية</p>
            </div>
          </div>
        </motion.div>

        {/* Search controls */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="ابحث باسم الطالب هنا للفلترة والتصفية..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-9 border-slate-200 focus:border-indigo-505 rounded-xl h-10 text-sm bg-slate-50/50"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filterTeacherId} onValueChange={setFilterTeacherId}>
                    <SelectTrigger className="w-44 border-slate-200 rounded-xl h-10 text-xs">
                      <SelectValue placeholder="المعلم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المعلمين</SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-32 border-slate-200 rounded-xl h-10 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACADEMIC_YEARS.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search Results */}
        <motion.div variants={itemVariants} className="space-y-4">
          {searchTerm !== "" ? (
            studentsWithGrades.length > 0 ? (
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-400">نتائج البحث المطابقة: {studentsWithGrades.length} طالب</p>
                {studentsWithGrades.map(({ student, grades: studentGrades, average }) => (
                  <Card
                    key={student.id}
                    className="bg-white border border-slate-100 shadow-sm overflow-hidden rounded-2xl"
                  >
                    <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 rounded-xl">
                          <AvatarFallback className="bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/dashboard/student/${student.id}`}
                            className="font-bold text-slate-800 hover:text-indigo-650 transition-colors text-sm"
                          >
                            {student.name}
                          </Link>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {getClassName(student.classId)} | العمر: {student.age} سنة
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {average !== null && (
                          <Badge className={`rounded-lg py-1 px-2.5 font-bold border ${getGradeColor(average)}`}>
                            المعدل: {average}%
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          onClick={() => {
                            setAllGradesSelectedStudent(student)
                            setViewMode("all-grades-student")
                          }}
                          className="bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-650 rounded-xl h-8 px-4 text-xs font-bold border-0 shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5 ml-1" />
                          <span>عرض السجل الكامل</span>
                        </Button>
                      </div>
                    </div>

                    {studentGrades.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right">
                          <thead>
                            <tr className="bg-slate-50/20 border-b border-slate-100">
                              <th className="px-5 py-2.5 font-bold text-slate-400 text-xs">المادة</th>
                              <th className="px-5 py-2.5 font-bold text-slate-400 text-xs text-center">التقييم</th>
                              <th className="px-5 py-2.5 font-bold text-slate-400 text-xs text-center">المعلم</th>
                              <th className="px-5 py-2.5 font-bold text-slate-400 text-xs text-center">العلامة</th>
                              <th className="px-5 py-2.5 font-bold text-slate-400 text-xs text-center">النسبة</th>
                              <th className="px-5 py-2.5 w-12"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100/60">
                            {studentGrades.map((grade) => {
                              const pct = Math.round((grade.grade / grade.maxGrade) * 100)
                              return (
                                <tr key={grade.id} className="hover:bg-slate-50/20 transition-colors">
                                  <td className="px-5 py-3">
                                    <span className="font-bold text-slate-700">{grade.subject}</span>
                                  </td>
                                  <td className="px-5 py-3 text-center">
                                    <Badge variant="outline" className="text-[10px] font-bold rounded bg-slate-50 border-slate-205">
                                      {EXAM_TYPE_DISPLAY[grade.examType] || grade.examType}
                                    </Badge>
                                  </td>
                                  <td className="px-5 py-3 text-center text-xs text-slate-505">
                                    {getTeacherName(grade.teacherId)}
                                  </td>
                                  <td className="px-5 py-3 text-center font-bold text-slate-700">
                                    {grade.grade} / {grade.maxGrade}
                                  </td>
                                  <td className="px-5 py-3 text-center">
                                    <Badge className={`rounded-lg font-bold border ${getGradeColor(pct)}`}>
                                      {pct}%
                                    </Badge>
                                  </td>
                                  <td className="px-5 py-3 text-left">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteGrade(grade.id)}
                                      className="text-rose-450 hover:text-rose-600 hover:bg-rose-50 h-7 w-7 p-0 rounded-lg"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-slate-400">
                        <p className="text-xs font-semibold">لا توجد علامات مسجلة لهذا الطالب</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white border border-slate-100 p-12 text-center rounded-2xl shadow-sm">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">لا يوجد طلاب متطابقون مع كلمة البحث</p>
              </Card>
            )
          ) : (
            <Card className="bg-white border border-slate-100 p-12 text-center rounded-2xl shadow-sm">
              <Search className="h-12 w-12 text-slate-350 mx-auto mb-4" />
              <h3 className="text-base font-bold text-slate-750">رصد الدرجات وسجل البحث</h3>
              <p className="text-xs text-slate-405 mt-1 max-w-xs mx-auto">
                قم بإدخال اسم الطالب في حقل البحث أعلاه ليتم رصد وتلخيص درجاته بالفصل المحدد.
              </p>
            </Card>
          )}
        </motion.div>
      </motion.div>
    )
  }

  // VIEW 3c: All Grades - Single Student Detail Dashboard
  if (viewMode === "all-grades-student" && allGradesSelectedStudent) {
    const studentGrades = grades.filter(
      (g) =>
        g.studentId === allGradesSelectedStudent.id &&
        g.academicYear === selectedYear &&
        (filterTeacherId === "all" || g.teacherId === filterTeacherId)
    )
    const average =
      studentGrades.length > 0
        ? Math.round(
            studentGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 100, 0) /
              studentGrades.length
          )
        : null

    return (
      <motion.div
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="space-y-6 text-right"
        dir="rtl"
      >
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 border border-slate-100 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setViewMode("all-grades")
                setAllGradesSelectedStudent(null)
              }}
              className="text-slate-500 hover:bg-slate-100 h-9 w-9 p-0 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5 rotate-180" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">{allGradesSelectedStudent.name}</h1>
              <p className="text-xs sm:text-sm text-slate-400">سجل الدرجات المفصل والدرجات الأكاديمية</p>
            </div>
          </div>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32 border-slate-200 rounded-xl h-10 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACADEMIC_YEARS.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Detailed Grades Card */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white border border-slate-100 shadow-sm overflow-hidden rounded-2xl">
            <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">بيانات التقييمات</h3>
                <p className="text-xs text-slate-400 mt-0.5">الصف: {getClassName(allGradesSelectedStudent.classId)}</p>
              </div>

              {average !== null && (
                <Badge className={`rounded-xl py-1.5 px-3 font-bold border ${getGradeColor(average)}`}>
                  المعدل الأكاديمي: {average}%
                </Badge>
              )}
            </div>

            {studentGrades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead>
                    <tr className="bg-slate-50/20 border-b border-slate-100">
                      <th className="px-5 py-2.5 font-bold text-slate-400 text-xs">المادة</th>
                      <th className="px-5 py-2.5 font-bold text-slate-400 text-xs text-center">التقييم</th>
                      <th className="px-5 py-2.5 font-bold text-slate-400 text-xs text-center">المعلم</th>
                      <th className="px-5 py-2.5 font-bold text-slate-400 text-xs text-center">العلامة</th>
                      <th className="px-5 py-2.5 font-bold text-slate-400 text-xs text-center">النسبة</th>
                      <th className="px-5 py-2.5 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {studentGrades.map((grade) => {
                      const pct = Math.round((grade.grade / grade.maxGrade) * 100)
                      return (
                        <tr key={grade.id} className="hover:bg-slate-50/20 transition-colors">
                          <td className="px-5 py-3">
                            <span className="font-bold text-slate-700">{grade.subject}</span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <Badge variant="outline" className="text-[10px] font-bold rounded bg-slate-50 border-slate-205">
                              {EXAM_TYPE_DISPLAY[grade.examType] || grade.examType}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-center text-xs text-slate-505">
                            {getTeacherName(grade.teacherId)}
                          </td>
                          <td className="px-5 py-3 text-center font-bold text-slate-700">
                            {grade.grade} / {grade.maxGrade}
                          </td>
                          <td className="px-5 py-3 text-center">
                            <Badge className={`rounded-lg font-bold border ${getGradeColor(pct)}`}>
                              {pct}%
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-left">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGrade(grade.id)}
                              className="text-rose-450 hover:text-rose-600 hover:bg-rose-50 h-7 w-7 p-0 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-slate-400">
                <p className="text-xs font-semibold">لا توجد درجات مسجلة لهذا الطالب في العام المحدد.</p>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    )
  }

  return null
}
