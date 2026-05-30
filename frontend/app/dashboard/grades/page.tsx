"use client"

import { useState, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
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
  createGrade,
  deleteGrade,
} from "@/lib/supabase-school"
import { useAdminGrades, useAdminStudents, useAdminClasses, useAdminTeachers } from "@/lib/hooks/use-admin-data"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"

const ACADEMIC_YEARS = ["2024-2025", "2023-2024", "2022-2023"]

const EXAM_TYPES = [
  { value: "quiz", label: { ar: "كويز", en: "Quiz" } },
  { value: "exam", label: { ar: "امتحان", en: "Exam" } },
  { value: "homework", label: { ar: "واجب", en: "Homework" } },
  { value: "project", label: { ar: "مشروع", en: "Project" } },
]

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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
}

export default function GradesPage() {
  const { t, language } = useLanguage()
  const gp = t.gradesPage
  const queryClient = useQueryClient()
  const { data: grades = [], isLoading: gradesLoading } = useAdminGrades()
  const { data: students = [], isLoading: studentsLoading } = useAdminStudents()
  const { data: classes = [] } = useAdminClasses()
  const { data: teachers = [] } = useAdminTeachers()
  const loading = gradesLoading || studentsLoading

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("classes")
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null)
  const [allGradesSelectedStudent, setAllGradesSelectedStudent] = useState<Student | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSemester, setSelectedSemester] = useState<string>("first")
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

  const reload = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin", "grades"] })
    queryClient.invalidateQueries({ queryKey: ["admin", "students"] })
  }, [queryClient])

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

  async function handleAddGrade() {
    if (!selectedStudent) {
      toast.error(t.forms.required)
      return
    }
    if (classFilterTeacher === "all") {
      toast.error(t.forms.selectTeacher)
      return
    }
    if (classFilterSubject === "all") {
      toast.error(t.forms.selectSubject)
      return
    }
    if (classFilterExamType === "all") {
      toast.error(gp.examType)
      return
    }
    const gradeValue = parseFloat(newGrade)
    const maxGradeValue = parseFloat(newMaxGrade)
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > maxGradeValue) {
      toast.error(`${gp.grade}: 0 - ${maxGradeValue}`)
      return
    }

    try {
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
        toast.error(t.dashboard.loadingError)
        return
      }

      resetForm()
      setAddGradeOpen(false)
      reload()
      toast.success(gp.addSuccess)
    } catch (error) {
      console.error("Error in handleAddGrade:", error)
      toast.error(t.dashboard.loadingError)
    }
  }

  async function handleDeleteGrade(id: string) {
    await deleteGrade(id)
    reload()
    toast.success(gp.noGrades)
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
    return cls?.name || t.table.noData
  }

  function getTeacherName(teacherId: string | null): string {
    if (!teacherId) return "-"
    const tc = teachers.find((tc) => tc.id === teacherId)
    return tc?.name || t.table.noData
  }

  function getExamTypeLabel(examType: string): string {
    const et = EXAM_TYPES.find((e) => e.value === examType)
    return et ? et.label[language as "ar" | "en"] : examType
  }

  function getGradeColor(percentage: number): string {
    if (percentage >= 90) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    if (percentage >= 80) return "bg-primary/10 text-primary border-primary/20"
    if (percentage >= 70) return "bg-amber-500/10 text-amber-600 border-amber-500/20"
    if (percentage >= 60) return "bg-orange-500/10 text-orange-600 border-orange-500/20"
    return "bg-rose-500/10 text-rose-600 border-rose-500/20"
  }

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${language === "ar" ? "text-right" : "text-left"}`} dir={language === "ar" ? "rtl" : "ltr"}>
        <div className="bg-card rounded-2xl border border-border/50 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl skeleton" />
            <div className="space-y-2">
              <div className="h-4 w-36 skeleton" />
              <div className="h-3 w-52 skeleton" />
            </div>
          </div>
          <div className="h-9 w-32 skeleton rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border/50 p-4">
              <div className="h-11 w-11 rounded-xl skeleton mb-3" />
              <div className="h-5 w-12 skeleton mb-2" />
              <div className="h-3 w-28 skeleton" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border/50 p-5 space-y-3">
              <div className="flex justify-between">
                <div className="h-10 w-10 rounded-xl skeleton" />
                <div className="h-6 w-16 skeleton rounded-full" />
              </div>
              <div className="h-5 w-28 skeleton" />
              <div className="h-3 w-40 skeleton" />
              <div className="border-t border-border/30 pt-3">
                <div className="h-3.5 w-32 skeleton" />
              </div>
            </div>
          ))}
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
        className={`space-y-6 ${language === "ar" ? "text-right" : "text-left"}`}
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-5 border border-border/50 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <School className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-foreground">{gp.title}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">{gp.noGradesDesc}</p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setViewMode("all-grades")}
            className="h-10 border-border text-foreground hover:bg-muted rounded-xl font-bold flex items-center gap-2 w-full sm:w-auto"
          >
            <ClipboardList className="h-4 w-4" />
            <span>{gp.searchPlaceholder}</span>
          </Button>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-border/50 bg-card shadow-sm rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-11 w-11 bg-muted text-muted-foreground rounded-xl flex items-center justify-center">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">{grades.length}</p>
                <p className="text-[11px] font-semibold text-muted-foreground">{gp.title}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card shadow-sm rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-11 w-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <School className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">{classes.length}</p>
                <p className="text-[11px] font-semibold text-muted-foreground">{t.dashboard.classesStat}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card shadow-sm rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-11 w-11 bg-purple-500/10 text-purple-600 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">{students.length}</p>
                <p className="text-[11px] font-semibold text-muted-foreground">{t.dashboard.studentsStat}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card shadow-sm rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-11 w-11 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">{teachers.length}</p>
                <p className="text-[11px] font-semibold text-muted-foreground">{t.dashboard.teachersStat}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Classes Grid */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground">{t.dashboard.classesStat}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {classes.map((cls) => {
              const classStudents = students.filter((s) => s.classId === cls.id)
              const classGrades = grades.filter((g) => classStudents.some((s) => s.id === g.studentId))
              const gradedStudents = new Set(classGrades.map((g) => g.studentId)).size

              return (
                <Card
                  key={cls.id}
                  className="bg-card border border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer group rounded-2xl relative overflow-hidden"
                  onClick={() => {
                    setSelectedClass(cls)
                    setViewMode("students")
                  }}
                >
                  <div className="absolute top-0 right-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-r-2xl" />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-10 w-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <School className="h-5 w-5" />
                      </div>
                      <Badge className="bg-muted text-muted-foreground hover:bg-muted text-xs rounded-lg">
                        {classStudents.length} {t.stats.totalStudents}
                      </Badge>
                    </div>
                    <h3 className="font-extrabold text-foreground text-base mb-1">{cls.name}</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {gradedStudents} / {classStudents.length}
                    </p>

                    <div className="flex items-center gap-1 text-xs font-bold text-primary pt-2 border-t border-border/30">
                      <span>{t.actions.view}</span>
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
        className={`space-y-6 ${language === "ar" ? "text-right" : "text-left"}`}
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-card p-5 border border-border/50 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setViewMode("classes")
                setSelectedClass(null)
              }}
              className="text-muted-foreground hover:bg-muted h-9 w-9 p-0 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5 rotate-180" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-foreground">{selectedClass.name}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">{gp.semester}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={gp.searchPlaceholder}
                value={classStudentSearch}
                onChange={(e) => setClassStudentSearch(e.target.value)}
                className="w-full sm:w-44 pr-9 border-border rounded-xl h-9 text-xs"
              />
            </div>
            <Select value={classFilterTeacher} onValueChange={setClassFilterTeacher}>
              <SelectTrigger className="w-36 border-border rounded-xl h-9 text-xs">
                <SelectValue placeholder={t.forms.selectTeacher} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.forms.selectTeacher}</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={classFilterSubject} onValueChange={setClassFilterSubject}>
              <SelectTrigger className="w-36 border-border rounded-xl h-9 text-xs">
                <SelectValue placeholder={t.forms.selectSubject} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.forms.selectSubject}</SelectItem>
                {SUBJECTS.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={classFilterExamType} onValueChange={setClassFilterExamType}>
              <SelectTrigger className="w-36 border-border rounded-xl h-9 text-xs">
                <SelectValue placeholder={gp.examType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.forms.selectSubject}</SelectItem>
                {EXAM_TYPES.map((et) => (
                  <SelectItem key={et.value} value={et.value}>
                    {et.label[language as "ar" | "en"]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-36 border-border rounded-xl h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first">{t.teachersPage.firstSemester}</SelectItem>
                <SelectItem value="second">{t.teachersPage.secondSemester}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32 border-border rounded-xl h-9 text-xs">
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
          <Card className="bg-muted/30 border border-border/50 shadow-sm rounded-xl">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-2.5">
                <Filter className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-foreground block">{t.actions.filter}</span>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <Badge variant="outline" className={`rounded text-[10px] ${classFilterTeacher === "all" ? "border-rose-500/30 text-rose-600 bg-rose-500/5" : "border-primary/30 text-primary bg-primary/5"}`}>
                      {t.table.actions}: {classFilterTeacher === "all" ? "-" : getTeacherName(classFilterTeacher)}
                    </Badge>
                    <Badge variant="outline" className={`rounded text-[10px] ${classFilterSubject === "all" ? "border-rose-500/30 text-rose-600 bg-rose-500/5" : "border-primary/30 text-primary bg-primary/5"}`}>
                      {gp.subject}: {classFilterSubject === "all" ? "-" : classFilterSubject}
                    </Badge>
                    <Badge variant="outline" className={`rounded text-[10px] ${classFilterExamType === "all" ? "border-rose-500/30 text-rose-600 bg-rose-500/5" : "border-primary/30 text-primary bg-primary/5"}`}>
                      {gp.examType}: {classFilterExamType === "all" ? "-" : getExamTypeLabel(classFilterExamType)}
                    </Badge>
                  </div>
                </div>
              </div>
              { (classFilterTeacher === "all" || classFilterSubject === "all" || classFilterExamType === "all") && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span>{t.forms.selectTeacher} + {t.forms.selectSubject}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Students List Container */}
        <motion.div variants={itemVariants} className="space-y-4">
          {studentsInClass.length === 0 ? (
            <Card className="bg-card border border-border/50 p-12 text-center rounded-2xl shadow-sm">
              <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-bold text-foreground">{gp.noGrades}</p>
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
                    studentGrades = studentGrades.filter((g) => g.examType === classFilterExamType)
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
                      className="bg-card border border-border/50 shadow-sm overflow-hidden rounded-2xl hover:border-border transition-colors"
                    >
                      {/* Sub Header per student */}
                      <div className="bg-muted/30 border-b border-border/50 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 rounded-xl">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold rounded-xl">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              href={`/dashboard/student/${student.id}`}
                              className="font-bold text-foreground hover:text-primary transition-colors text-sm"
                            >
                              {student.name}
                            </Link>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{t.forms.age}: {student.age}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {average !== null && (
                            <Badge className={`rounded-lg py-1 px-2.5 font-bold border ${getGradeColor(average)}`}>
                              {gp.percentage}: {average}%
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
                            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-8 text-xs font-bold border-0 disabled:opacity-40 shadow-sm"
                          >
                            <Plus className="h-3.5 w-3.5 ml-1" />
                            <span>{gp.addGrade}</span>
                          </Button>
                        </div>
                      </div>

                      {/* Grades Table */}
                      {studentGrades.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className={`w-full text-sm ${language === "ar" ? "text-right" : "text-left"}`}>
                            <thead>
                              <tr className="bg-muted/20 border-b border-border/50">
                                <th className="px-5 py-2.5 font-bold text-muted-foreground text-xs">{gp.subject}</th>
                                <th className="px-5 py-2.5 font-bold text-muted-foreground text-xs text-center">{gp.examType}</th>
                                <th className="px-5 py-2.5 font-bold text-muted-foreground text-xs text-center">{t.table.actions}</th>
                                <th className="px-5 py-2.5 font-bold text-muted-foreground text-xs text-center">{gp.grade}</th>
                                <th className="px-5 py-2.5 font-bold text-muted-foreground text-xs text-center">{gp.percentage}</th>
                                <th className="px-5 py-2.5 w-12"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                              {studentGrades.map((grade) => {
                                const pct = Math.round((grade.grade / grade.maxGrade) * 100)
                                return (
                                  <tr key={grade.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-5 py-3">
                                      <span className="font-bold text-foreground">{grade.subject}</span>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                      <Badge variant="outline" className="text-[10px] font-bold rounded bg-muted border-border">
                                        {getExamTypeLabel(grade.examType)}
                                      </Badge>
                                    </td>
                                    <td className="px-5 py-3 text-center text-xs text-muted-foreground">
                                      {getTeacherName(grade.teacherId)}
                                    </td>
                                    <td className="px-5 py-3 text-center font-bold text-foreground">
                                      {grade.grade} / {grade.maxGrade}
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                      <Badge className={`rounded-lg font-bold border ${getGradeColor(pct)}`}>
                                        {pct}%
                                      </Badge>
                                    </td>
                                    <td className="px-5 py-3">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteGrade(grade.id)}
                                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-7 w-7 p-0 rounded-lg"
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
                        <div className="p-6 text-center text-muted-foreground">
                          <p className="text-xs font-semibold">{gp.noGrades}</p>
                        </div>
                      )}
                    </Card>
                  )
                })}

              {studentsInClass.filter((student) =>
                classStudentSearch === "" ||
                student.name.toLowerCase().includes(classStudentSearch.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-10 bg-muted/20 border border-border/50 rounded-xl">
                  <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground font-bold">{t.table.noData}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Add Grade Modal */}
        <Dialog open={addGradeOpen} onOpenChange={setAddGradeOpen}>
          <DialogContent className={`${language === "ar" ? "text-right" : "text-left"} bg-card border-border/50 rounded-2xl max-w-md`} dir={language === "ar" ? "rtl" : "ltr"}>
            <DialogHeader>
              <DialogTitle className="text-foreground font-extrabold text-lg flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {gp.addGrade}
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 pt-2">
              <div className="bg-muted/50 border border-border/50 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{gp.studentName}:</span>
                  <span className="font-bold text-foreground">{selectedStudent?.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t.schedulePage.teacher}:</span>
                  <span className="font-bold text-foreground">{getTeacherName(classFilterTeacher)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{gp.subject}:</span>
                  <span className="font-bold text-foreground">{classFilterSubject}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{gp.examType}:</span>
                  <span className="font-bold text-foreground">{getExamTypeLabel(classFilterExamType)}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-foreground font-bold text-xs">{gp.grade} *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    min={0}
                    max={parseInt(newMaxGrade)}
                    className="bg-background border-border rounded-xl h-10 text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-foreground font-bold text-xs">{gp.maxGrade}</Label>
                  <Input
                    type="number"
                    value={newMaxGrade}
                    onChange={(e) => setNewMaxGrade(e.target.value)}
                    min={1}
                    className="bg-background border-border rounded-xl h-10 text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-foreground font-bold text-xs">{gp.percentage}</Label>
                  <div className="h-10 flex items-center justify-center bg-primary/10 border border-primary/20 rounded-xl text-xs font-bold text-primary">
                    {newGrade && newMaxGrade
                      ? Math.round((parseFloat(newGrade) / parseFloat(newMaxGrade)) * 100) + "%"
                      : "—"}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-foreground font-bold text-xs">{t.forms.notes}</Label>
                <Textarea
                  placeholder={t.forms.notes}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  className="bg-background border-border rounded-xl resize-none text-foreground text-sm"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <DialogClose asChild>
                  <Button variant="outline" className="border-border rounded-xl h-10">
                    {t.actions.cancel}
                  </Button>
                </DialogClose>
                <Button
                  onClick={handleAddGrade}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10 px-5 border-0 font-bold"
                >
                  {t.actions.save}
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
        className={`space-y-6 ${language === "ar" ? "text-right" : "text-left"}`}
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-5 border border-border/50 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setViewMode("classes")
                setSearchTerm("")
              }}
              className="text-muted-foreground hover:bg-muted h-9 w-9 p-0 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5 rotate-180" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-foreground">{gp.title}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">{gp.noGradesDesc}</p>
            </div>
          </div>
        </motion.div>

        {/* Search controls */}
        <motion.div variants={itemVariants}>
          <Card className="bg-card border border-border/50 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={gp.searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-9 border-border rounded-xl h-10 text-sm bg-muted/30"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filterTeacherId} onValueChange={setFilterTeacherId}>
                    <SelectTrigger className="w-44 border-border rounded-xl h-10 text-xs">
                      <SelectValue placeholder={t.forms.selectTeacher} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.forms.selectTeacher}</SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-32 border-border rounded-xl h-10 text-xs">
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
                <p className="text-xs font-bold text-muted-foreground">{studentsWithGrades.length} {t.stats.totalStudents}</p>
                {studentsWithGrades.map(({ student, grades: studentGrades, average }) => (
                  <Card
                    key={student.id}
                    className="bg-card border border-border/50 shadow-sm overflow-hidden rounded-2xl"
                  >
                    <div className="bg-muted/30 border-b border-border/50 px-5 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 rounded-xl">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold rounded-xl">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/dashboard/student/${student.id}`}
                            className="font-bold text-foreground hover:text-primary transition-colors text-sm"
                          >
                            {student.name}
                          </Link>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {getClassName(student.classId)} | {t.forms.age}: {student.age}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {average !== null && (
                          <Badge className={`rounded-lg py-1 px-2.5 font-bold border ${getGradeColor(average)}`}>
                            {gp.percentage}: {average}%
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          onClick={() => {
                            setAllGradesSelectedStudent(student)
                            setViewMode("all-grades-student")
                          }}
                          className="bg-muted hover:bg-primary/10 text-foreground hover:text-primary rounded-xl h-8 px-4 text-xs font-bold border-0 shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5 ml-1" />
                          <span>{t.actions.view}</span>
                        </Button>
                      </div>
                    </div>

                    {studentGrades.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className={`w-full text-sm ${language === "ar" ? "text-right" : "text-left"}`}>
                          <thead>
                            <tr className="bg-muted/20 border-b border-border/50">
                              <th className="px-5 py-2.5 font-bold text-muted-foreground text-xs">{gp.subject}</th>
                              <th className="px-5 py-2.5 font-bold text-muted-foreground text-xs text-center">{gp.examType}</th>
                              <th className="px-5 py-2.5 font-bold text-muted-foreground text-xs text-center">{t.schedulePage.teacher}</th>
                              <th className="px-5 py-2.5 font-bold text-muted-foreground text-xs text-center">{gp.grade}</th>
                              <th className="px-5 py-2.5 font-bold text-muted-foreground text-xs text-center">{gp.percentage}</th>
                              <th className="px-5 py-2.5 w-12"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40">
                            {studentGrades.map((grade) => {
                              const pct = Math.round((grade.grade / grade.maxGrade) * 100)
                              return (
                                <tr key={grade.id} className="hover:bg-muted/20 transition-colors">
                                  <td className="px-5 py-3">
                                    <span className="font-bold text-foreground">{grade.subject}</span>
                                  </td>
                                  <td className="px-5 py-3 text-center">
                                    <Badge variant="outline" className="text-[10px] font-bold rounded bg-muted border-border">
                                      {getExamTypeLabel(grade.examType)}
                                    </Badge>
                                  </td>
                                  <td className="px-5 py-3 text-center text-xs text-muted-foreground">
                                    {getTeacherName(grade.teacherId)}
                                  </td>
                                  <td className="px-5 py-3 text-center font-bold text-foreground">
                                    {grade.grade} / {grade.maxGrade}
                                  </td>
                                  <td className="px-5 py-3 text-center">
                                    <Badge className={`rounded-lg font-bold border ${getGradeColor(pct)}`}>
                                      {pct}%
                                    </Badge>
                                  </td>
                                  <td className="px-5 py-3">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteGrade(grade.id)}
                                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-7 w-7 p-0 rounded-lg"
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
                      <div className="p-6 text-center text-muted-foreground">
                        <p className="text-xs font-semibold">{gp.noGrades}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card border border-border/50 p-12 text-center rounded-2xl shadow-sm">
                <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-bold text-foreground">{gp.noGrades}</p>
              </Card>
            )
          ) : (
            <Card className="bg-card border border-border/50 p-12 text-center rounded-2xl shadow-sm">
              <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-base font-bold text-foreground">{gp.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                {gp.noGradesDesc}
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
        className={`space-y-6 ${language === "ar" ? "text-right" : "text-left"}`}
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-5 border border-border/50 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setViewMode("all-grades")
                setAllGradesSelectedStudent(null)
              }}
              className="text-muted-foreground hover:bg-muted h-9 w-9 p-0 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5 rotate-180" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-foreground">{allGradesSelectedStudent.name}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">{gp.title}</p>
            </div>
          </div>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32 border-border rounded-xl h-10 text-xs">
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
          <Card className="bg-card border border-border/50 shadow-sm overflow-hidden rounded-2xl">
            <div className="bg-muted/30 border-b border-border/50 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground">{gp.examType}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t.forms.class}: {getClassName(allGradesSelectedStudent.classId)}</p>
              </div>

              {average !== null && (
                <Badge className={`rounded-xl py-1.5 px-3 font-bold border ${getGradeColor(average)}`}>
                  {gp.percentage}: {average}%
                </Badge>
              )}
            </div>

            {studentGrades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className={`w-full text-sm ${language === "ar" ? "text-right" : "text-left"}`}>
                  <thead>
                    <tr className="bg-muted/20 border-b border-border/50">
                      <th className="px-5 py-2.5 font-bold text-muted-foreground text-xs">{gp.subject}</th>
                      <th className="px-5 py-2.5 font-bold text-muted-foreground text-xs text-center">{gp.examType}</th>
                      <th className="px-5 py-2.5 font-bold text-muted-foreground text-xs text-center">{t.schedulePage.teacher}</th>
                      <th className="px-5 py-2.5 font-bold text-muted-foreground text-xs text-center">{gp.grade}</th>
                      <th className="px-5 py-2.5 font-bold text-muted-foreground text-xs text-center">{gp.percentage}</th>
                      <th className="px-5 py-2.5 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {studentGrades.map((grade) => {
                      const pct = Math.round((grade.grade / grade.maxGrade) * 100)
                      return (
                        <tr key={grade.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-3">
                            <span className="font-bold text-foreground">{grade.subject}</span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <Badge variant="outline" className="text-[10px] font-bold rounded bg-muted border-border">
                              {getExamTypeLabel(grade.examType)}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-center text-xs text-muted-foreground">
                            {getTeacherName(grade.teacherId)}
                          </td>
                          <td className="px-5 py-3 text-center font-bold text-foreground">
                            {grade.grade} / {grade.maxGrade}
                          </td>
                          <td className="px-5 py-3 text-center">
                            <Badge className={`rounded-lg font-bold border ${getGradeColor(pct)}`}>
                              {pct}%
                            </Badge>
                          </td>
                          <td className="px-5 py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGrade(grade.id)}
                              className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-7 w-7 p-0 rounded-lg"
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
              <div className="p-10 text-center text-muted-foreground">
                <p className="text-xs font-semibold">{gp.noGrades}</p>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    )
  }

  return null
}

