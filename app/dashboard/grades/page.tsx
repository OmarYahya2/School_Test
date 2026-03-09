"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Plus,
  Trash2,
  Search,
  GraduationCap,
  Filter,
  ArrowUpDown,
  Download,
  FileText,
  ChevronDown,
  Award,
  TrendingUp,
  BookOpen,
  Calendar,
  Edit2,
  User,
  School,
  X,
  Save,
  BarChart3,
  ChevronLeft,
  CheckCircle2,
  Users,
  ClipboardList,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import type { Student, SchoolClass, Teacher, Grade } from "@/lib/store"
import {
  fetchGrades,
  fetchGradesByClass,
  fetchStudents,
  fetchClasses,
  fetchTeachers,
  createGrade,
  updateGrade,
  deleteGrade,
} from "@/lib/supabase-school"

const ACADEMIC_YEARS = ["2024-2025", "2023-2024", "2022-2023"]
const SEMESTERS = ["الفصل الأول", "الفصل الثاني", "الفصل الصيفي"]
const EXAM_TYPES = ["كويز", "نصف الفصل", "أسايمنت (واجب)", "مشاريع", "امتحان نهائي", "اختبار قصير"]
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

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("classes")
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null)
  const [allGradesSelectedClass, setAllGradesSelectedClass] = useState<SchoolClass | null>(null)
  const [allGradesSelectedStudent, setAllGradesSelectedStudent] = useState<Student | null>(null)
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set())

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSemester, setSelectedSemester] = useState<string>("الفصل الأول")
  const [selectedYear, setSelectedYear] = useState<string>("2024-2025")
  const [filterClassId, setFilterClassId] = useState<string>("all")
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
  const [newSubject, setNewSubject] = useState("")
  const [newGrade, setNewGrade] = useState("")
  const [newMaxGrade, setNewMaxGrade] = useState("100")
  const [newExamType, setNewExamType] = useState(EXAM_TYPES[0])
  const [newTeacherId, setNewTeacherId] = useState("")
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
    return grades.filter(
      (g) =>
        g.studentId === studentId &&
        g.academicYear === selectedYear &&
        g.semester === selectedSemester
    )
  }

  // Calculate student average
  const getStudentAverage = (studentId: string) => {
    const studentGrades = getStudentGrades(studentId)
    if (studentGrades.length === 0) return null
    const avg = studentGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 100, 0) / studentGrades.length
    return Math.round(avg)
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

    const created = await createGrade(
      selectedStudent.id,
      classFilterSubject,
      gradeValue,
      maxGradeValue,
      selectedSemester,
      selectedYear,
      classFilterExamType,
      classFilterTeacher,
      newNotes.trim()
    )

    if (!created) {
      toast.error("حدث خطأ أثناء إضافة العلامة")
      return
    }

    resetForm()
    setAddGradeOpen(false)
    void reload()
    toast.success(`تمت إضافة العلامة بنجاح للطالب ${selectedStudent.name}`)
  }

  async function handleDeleteGrade(id: string) {
    await deleteGrade(id)
    void reload()
    toast.success("تم حذف العلامة بنجاح")
  }

  function resetForm() {
    setNewSubject("")
    setNewGrade("")
    setNewMaxGrade("100")
    setNewExamType(EXAM_TYPES[0])
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
    if (percentage >= 90) return "bg-emerald-100 text-emerald-700 border-emerald-200"
    if (percentage >= 80) return "bg-blue-100 text-blue-700 border-blue-200"
    if (percentage >= 70) return "bg-amber-100 text-amber-700 border-amber-200"
    if (percentage >= 60) return "bg-orange-100 text-orange-700 border-orange-200"
    return "bg-rose-100 text-rose-700 border-rose-200"
  }

  // Get initials
  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-400 border-t-transparent mx-auto mb-4" />
          <p className="text-slate-500">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  // VIEW 1: Classes List
  if (viewMode === "classes") {
    return (
      <div className="min-h-screen bg-gray-50/30">
        <div className="bg-white border-b border-gray-100">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <School className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-800">إدخال العلامات</h1>
                  <p className="text-sm text-slate-500">اختر الصف لعرض الطلاب وإدخال العلامات</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setViewMode("all-grades")}
                  className="border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  <ClipboardList className="h-4 w-4 ml-2" />
                  عرض جميع العلامات
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Stats */}
          <div className="grid gap-3 md:grid-cols-4 mb-4">
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">إجمالي العلامات</p>
                    <p className="text-xl font-semibold text-gray-700">{grades.length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-slate-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">عدد الصفوف</p>
                    <p className="text-xl font-semibold text-gray-700">{classes.length}</p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <School className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">عدد الطلاب</p>
                    <p className="text-xl font-semibold text-gray-700">{students.length}</p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">المعلمون</p>
                    <p className="text-xl font-semibold text-gray-700">{teachers.length}</p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Award className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Classes Grid */}
          <h2 className="text-base font-semibold text-gray-700 mb-3">اختر الصف الدراسي</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {classes.map((cls) => {
              const classStudents = students.filter((s) => s.classId === cls.id)
              const classGrades = grades.filter((g) => classStudents.some((s) => s.id === g.studentId))
              const gradedStudents = new Set(classGrades.map((g) => g.studentId)).size

              return (
                <Card
                  key={cls.id}
                  className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedClass(cls)
                    setViewMode("students")
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                        <School className="h-5 w-5 text-gray-600" />
                      </div>
                      <Badge variant="secondary" className="bg-gray-50 text-gray-600">
                        {classStudents.length} طالب
                      </Badge>
                    </div>
                  <h3 className="text-base font-semibold text-gray-700 mb-1">{cls.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">
                      {gradedStudents} من {classStudents.length} طلاب لديهم علامات
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
                      <span>إدخال العلامات</span>
                      <ChevronLeft className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // VIEW 2: Students in Class
  if (viewMode === "students" && selectedClass) {
    return (
      <div className="min-h-screen bg-gray-50/30">
        <div className="bg-white border-b border-gray-100">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("classes")}
                  className="text-slate-600 hover:bg-slate-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Users className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-800">{selectedClass.name}</h1>
                  <p className="text-sm text-slate-500">اختر الطالب لإضافة علامة</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="بحث عن طالب..."
                    value={classStudentSearch}
                    onChange={(e) => setClassStudentSearch(e.target.value)}
                    className="w-48 pr-10 border-slate-200"
                  />
                </div>
                <Select value={classFilterTeacher} onValueChange={setClassFilterTeacher}>
                  <SelectTrigger className="w-36 border-slate-200">
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
                <Select value={classFilterSubject} onValueChange={setClassFilterSubject}>
                  <SelectTrigger className="w-36 border-slate-200">
                    <SelectValue placeholder="المادة" />
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
                  <SelectTrigger className="w-36 border-slate-200">
                    <SelectValue placeholder="نوع التقييم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    {EXAM_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="w-36 border-slate-200">
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
                  <SelectTrigger className="w-32 border-slate-200">
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
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Filters Summary Card */}
          <Card className="bg-white border-gray-100 shadow-sm">
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">الفلاتر المحددة:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={classFilterTeacher === "all" ? "border-rose-200 text-rose-600" : "border-emerald-200 text-emerald-700"}>
                    المعلم: {classFilterTeacher === "all" ? "غير محدد" : getTeacherName(classFilterTeacher)}
                  </Badge>
                  <Badge variant="outline" className={classFilterSubject === "all" ? "border-rose-200 text-rose-600" : "border-emerald-200 text-emerald-700"}>
                    المادة: {classFilterSubject === "all" ? "غير محدد" : classFilterSubject}
                  </Badge>
                  <Badge variant="outline" className={classFilterExamType === "all" ? "border-rose-200 text-rose-600" : "border-emerald-200 text-emerald-700"}>
                    النوع: {classFilterExamType === "all" ? "غير محدد" : classFilterExamType}
                  </Badge>
                </div>
              </div>
              {classFilterTeacher === "all" && (
                <p className="text-xs text-rose-500 mt-2">يرجى اختيار المعلم والمادة ونوع التقييم من الفلاتر أعلاه لإضافة علامات</p>
              )}
            </CardContent>
          </Card>

          {/* Students List with Grades */}
          {studentsInClass.length === 0 ? (
            <Card className="bg-white border-slate-200 shadow-sm">
              <div className="flex flex-col items-center justify-center py-16">
                <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-lg font-medium text-slate-600">لا يوجد طلاب في هذا الصف</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {studentsInClass
                .filter(student => 
                  classStudentSearch === "" || 
                  student.name.toLowerCase().includes(classStudentSearch.toLowerCase())
                )
                .map((student) => {
                // Get filtered grades for this student
                let studentGrades = getStudentGrades(student.id)
                if (classFilterTeacher !== "all") {
                  studentGrades = studentGrades.filter(g => g.teacherId === classFilterTeacher)
                }
                if (classFilterSubject !== "all") {
                  studentGrades = studentGrades.filter(g => g.subject === classFilterSubject)
                }
                if (classFilterExamType !== "all") {
                  studentGrades = studentGrades.filter(g => g.examType === classFilterExamType)
                }
                const average = studentGrades.length > 0 
                  ? Math.round(studentGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 100, 0) / studentGrades.length)
                  : null

                return (
                  <Card key={student.id} className="bg-white border-slate-200 shadow-sm overflow-hidden">
                    {/* Student Header */}
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-slate-200 text-slate-600 text-sm">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              href={`/dashboard/student/${student.id}`}
                              className="font-semibold text-slate-800 hover:text-slate-900 transition-colors"
                            >
                              {student.name}
                            </Link>
                            <p className="text-xs text-slate-500">{student.age} سنة</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {average !== null && (
                            <Badge className={getGradeColor(average)}>
                              المعدل: {average}%
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            onClick={() => openAddGrade(student)}
                            disabled={classFilterTeacher === "all" || classFilterSubject === "all" || classFilterExamType === "all"}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-300"
                          >
                            <Plus className="h-4 w-4 ml-1" />
                            إضافة علامة
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Grades Table for this Student */}
                    {studentGrades.length > 0 ? (
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
                              {studentGrades.map((grade) => {
                                const pct = Math.round((grade.grade / grade.maxGrade) * 100)
                                return (
                                  <tr key={grade.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-2">
                                      <span className="text-sm text-slate-700">{grade.subject}</span>
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
                        <p className="text-sm text-slate-400">لا توجد علامات مسجلة بهذه الفلاتر</p>
                      </div>
                    )}
                  </Card>
                )
              })
              }
              {studentsInClass.filter(student => 
                classStudentSearch === "" || 
                student.name.toLowerCase().includes(classStudentSearch.toLowerCase())
              ).length === 0 && (
                <Card className="bg-white border-slate-200 shadow-sm">
                  <div className="flex flex-col items-center justify-center py-12">
                    <Search className="h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-md font-medium text-slate-600">لا يوجد طلاب بهذا الاسم</p>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Add Grade Dialog - Simplified */}
        <Dialog open={addGradeOpen} onOpenChange={setAddGradeOpen}>
          <DialogContent dir="rtl" className="text-right max-w-sm bg-white border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-slate-800 font-semibold">
                إضافة علامة للطالب: {selectedStudent?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              {/* Selected Filters Display */}
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">المعلم:</span>
                  <span className="font-medium text-slate-700">
                    {classFilterTeacher !== "all" ? getTeacherName(classFilterTeacher) : <span className="text-rose-500">يرجى اختيار معلم من الفلاتر</span>}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">المادة:</span>
                  <span className="font-medium text-slate-700">
                    {classFilterSubject !== "all" ? classFilterSubject : <span className="text-rose-500">يرجى اختيار مادة</span>}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">نوع التقييم:</span>
                  <span className="font-medium text-slate-700">
                    {classFilterExamType !== "all" ? classFilterExamType : <span className="text-rose-500">يرجى اختيار نوع</span>}
                  </span>
                </div>
              </div>

              {/* Grade Input */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-2">
                  <Label className="text-slate-700 text-sm font-medium">العلامة *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    min={0}
                    max={parseInt(newMaxGrade)}
                    dir="rtl"
                    className="text-right border-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-slate-700 text-sm font-medium">من</Label>
                  <Input
                    type="number"
                    value={newMaxGrade}
                    onChange={(e) => setNewMaxGrade(e.target.value)}
                    min={1}
                    dir="rtl"
                    className="text-right border-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-slate-700 text-sm font-medium">النسبة</Label>
                  <div className="h-10 flex items-center justify-center px-2 bg-emerald-50 rounded-md border border-emerald-200 text-sm font-medium text-emerald-700">
                    {newGrade && newMaxGrade
                      ? Math.round((parseFloat(newGrade) / parseFloat(newMaxGrade)) * 100) + "%"
                      : "-"}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-2">
                <Label className="text-slate-700 text-sm">ملاحظات</Label>
                <Textarea
                  placeholder="ملاحظات إضافية (اختياري)"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  dir="rtl"
                  className="text-right border-slate-200 resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <DialogClose asChild>
                  <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                    إلغاء
                  </Button>
                </DialogClose>
                <Button 
                  onClick={handleAddGrade} 
                  className="bg-slate-800 hover:bg-slate-700 text-white"
                  disabled={classFilterTeacher === "all" || classFilterSubject === "all" || classFilterExamType === "all"}
                >
                  <Save className="h-4 w-4 ml-1" />
                  حفظ
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // VIEW 3: All Grades - Grouped by Class
  const filteredGrades = grades
    .filter((grade) => {
      const student = students.find((s) => s.id === grade.studentId)
      const matchesSearch = student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grade.subject.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesClass = filterClassId === "all" || student?.classId === filterClassId
      const matchesTeacher = filterTeacherId === "all" || grade.teacherId === filterTeacherId
      return matchesSearch && matchesClass && matchesTeacher && grade.academicYear === selectedYear
    })

  // VIEW 3: All Grades - Search by Student Name
  if (viewMode === "all-grades") {
    // Filter students by search term
    const filteredStudents = students.filter(student => 
      searchTerm === "" || student.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Get students with their grades
    const studentsWithGrades = filteredStudents.map(student => {
      const studentGrades = grades.filter(g => 
        g.studentId === student.id &&
        g.academicYear === selectedYear &&
        (filterTeacherId === "all" || g.teacherId === filterTeacherId)
      )
      const avg = studentGrades.length > 0 
        ? Math.round(studentGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 100, 0) / studentGrades.length)
        : null
      return {
        student,
        grades: studentGrades,
        average: avg
      }
    }).filter(sg => searchTerm === "" || sg.grades.length > 0 || sg.student.name.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
      <div className="min-h-screen bg-gray-50/30">
        <div className="bg-white border-b border-gray-100">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("classes")}
                  className="text-slate-600 hover:bg-slate-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <ClipboardList className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-800">سجل جميع العلامات</h1>
                  <p className="text-sm text-slate-500">ابحث عن طالب لعرض علاماته</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Search and Filters */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="ابحث باسم الطالب..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10 border-slate-200"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filterTeacherId} onValueChange={setFilterTeacherId}>
                    <SelectTrigger className="w-40 border-slate-200">
                      <SelectValue placeholder="جميع المعلمين" />
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
                    <SelectTrigger className="w-32 border-slate-200">
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

          {/* Search Results - Students with Grades */}
          {searchTerm !== "" ? (
            studentsWithGrades.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">نتائج البحث: {studentsWithGrades.length} طالب</p>
                {studentsWithGrades.map(({ student, grades: studentGrades, average }) => (
                  <Card key={student.id} className="bg-white border-slate-200 shadow-sm overflow-hidden">
                    {/* Student Header */}
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-slate-200 text-slate-600 text-sm">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              href={`/dashboard/student/${student.id}`}
                              className="font-semibold text-slate-800 hover:text-slate-900 transition-colors"
                            >
                              {student.name}
                            </Link>
                            <p className="text-xs text-slate-500">{getClassName(student.classId)} | {student.age} سنة</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {average !== null && (
                            <Badge className={getGradeColor(average)}>
                              المعدل: {average}%
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            onClick={() => {
                              setAllGradesSelectedStudent(student)
                              setViewMode("all-grades-student")
                            }}
                            className="bg-slate-600 hover:bg-slate-700 text-white"
                          >
                            <Eye className="h-4 w-4 ml-1" />
                            عرض
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Grades Table */}
                    {studentGrades.length > 0 ? (
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
                            {studentGrades.map((grade) => {
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
                        <p className="text-sm text-slate-400">لا توجد علامات مسجلة لهذا الطالب</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white border-slate-200 shadow-sm">
                <div className="flex flex-col items-center justify-center py-16">
                  <Search className="h-16 w-16 text-slate-300 mb-4" />
                  <p className="text-lg font-medium text-slate-600">لا يوجد طلاب بهذا الاسم</p>
                </div>
              </Card>
            )
          ) : (
            <Card className="bg-white border-slate-200 shadow-sm">
              <div className="flex flex-col items-center justify-center py-16">
                <Search className="h-16 w-16 text-slate-300 mb-4" />
                <p className="text-lg font-medium text-slate-600 mb-2">ابحث عن طالب</p>
                <p className="text-sm text-slate-500">اكتب اسم الطالب في مربع البحث أعلاه</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // VIEW 3b: All Grades - Class Detail (Students with detailed grades)
  if (viewMode === "all-grades-class" && allGradesSelectedClass) {
    const classStudents = students.filter(s => s.classId === allGradesSelectedClass.id)
    const classGrades = grades.filter(g => 
      classStudents.some(s => s.id === g.studentId) &&
      g.academicYear === selectedYear &&
      (filterTeacherId === "all" || g.teacherId === filterTeacherId)
    )

    // Group grades by student
    const studentsWithGrades = classStudents.map(student => {
      const studentGrades = classGrades.filter(g => g.studentId === student.id)
      return {
        student,
        grades: studentGrades
      }
    })

    return (
      <div className="min-h-screen bg-gray-50/30">
        <div className="bg-white border-b border-gray-100">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setViewMode("all-grades")
                    setAllGradesSelectedClass(null)
                  }}
                  className="text-slate-600 hover:bg-slate-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <School className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-800">{allGradesSelectedClass.name}</h1>
                  <p className="text-sm text-slate-500">علامات الطلاب مفصلة حسب المادة</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32 border-slate-200">
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
          </div>
        </div>

        <div className="p-4 space-y-4">
          {studentsWithGrades.map(({ student, grades: studentGrades }) => (
            <Card key={student.id} className="bg-white border-slate-200 shadow-sm overflow-hidden">
              {/* Student Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-slate-200 text-slate-600 text-sm">
                        {getInitials(student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link
                        href={`/dashboard/student/${student.id}`}
                        className="font-semibold text-slate-800 hover:text-slate-900 transition-colors"
                      >
                        {student.name}
                      </Link>
                      <p className="text-xs text-slate-500">{student.age} سنة</p>
                    </div>
                  </div>
                  {studentGrades.length > 0 && (
                    <Badge className={getGradeColor(Math.round(studentGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 100, 0) / studentGrades.length))}>
                      المعدل: {Math.round(studentGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 100, 0) / studentGrades.length)}%
                    </Badge>
                  )}
                </div>
              </div>

              {/* Detailed Grades Table - Each grade on separate row */}
              {studentGrades.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">المادة</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-slate-500">نوع التقييم</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-slate-500">المعلم</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-slate-500">العلامة</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-slate-500">النسبة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {studentGrades.map((grade) => {
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
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-slate-400">لا توجد علامات مسجلة لهذا الطالب</p>
                </div>
              )}
            </Card>
          ))}

          {studentsWithGrades.length === 0 && (
            <Card className="bg-white border-slate-200 shadow-sm">
              <div className="flex flex-col items-center justify-center py-16">
                <Users className="h-16 w-16 text-slate-300 mb-4" />
                <p className="text-lg font-medium text-slate-600">لا يوجد طلاب في هذا الصف</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // VIEW 3c: All Grades - Single Student Detail
  if (viewMode === "all-grades-student" && allGradesSelectedStudent) {
    const studentGrades = grades.filter(g => 
      g.studentId === allGradesSelectedStudent.id &&
      g.academicYear === selectedYear &&
      (filterTeacherId === "all" || g.teacherId === filterTeacherId)
    )
    const average = studentGrades.length > 0 
      ? Math.round(studentGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 100, 0) / studentGrades.length)
      : null

    return (
      <div className="min-h-screen bg-gray-50/30">
        <div className="bg-white border-b border-gray-100">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setViewMode("all-grades")
                    setAllGradesSelectedStudent(null)
                  }}
                  className="text-slate-600 hover:bg-slate-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <User className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-800">{allGradesSelectedStudent.name}</h1>
                  <p className="text-sm text-slate-500">{getClassName(allGradesSelectedStudent.classId)} | إضافة علامة جديدة</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32 border-slate-200">
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
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Student Grades Card */}
          <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
            {/* Student Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-slate-200 text-slate-600 text-sm">
                      {getInitials(allGradesSelectedStudent.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      href={`/dashboard/student/${allGradesSelectedStudent.id}`}
                      className="font-semibold text-slate-800 hover:text-slate-900 transition-colors"
                    >
                      {allGradesSelectedStudent.name}
                    </Link>
                    <p className="text-xs text-slate-500">{allGradesSelectedStudent.age} سنة</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {average !== null && (
                    <Badge className={getGradeColor(average)}>
                      المعدل: {average}%
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Grades Table */}
            {studentGrades.length > 0 ? (
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
                    {studentGrades.map((grade) => {
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
                <p className="text-sm text-slate-400">لا توجد علامات مسجلة لهذا الطالب</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    )
  }

  return null
}
