"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Plus,
  Trash2,
  ArrowLeft,
  UserCircle,
  ClipboardCheck,
  Activity,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  CheckCircle,
  XCircle,
  TrendingUp,
  Edit3,
  Download,
  Search,
  FileText,
  StickyNote,
  UserCheck,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { toast } from "sonner"
import type { SchoolClass, Student, Teacher } from "@/lib/store"
import type { AttendanceWithNames } from "@/lib/supabase-school"
import {
  fetchClassById,
  fetchStudentsByClass,
  createStudent,
  deleteStudentById,
  fetchAttendanceByClass,
  saveAttendanceRecord,
  updateStudentById,
} from "@/lib/supabase-school"
import { fetchTeachers } from "@/lib/supabase-teachers"
import { motion, AnimatePresence } from "framer-motion"

type Note = {
  id: string
  content: string
  createdAt: string
  updatedAt?: string
  category?: "academic" | "behavioral" | "general" | "health"
  author?: string
}

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

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string

  const [cls, setCls] = useState<SchoolClass | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [attendance, setAttendance] = useState<AttendanceWithNames[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // New student form
  const [newName, setNewName] = useState("")
  const [newAge, setNewAge] = useState("")
  const [newParentPhone, setNewParentPhone] = useState("")
  const [newNotes, setNewNotes] = useState("")

  // Attendance
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({})

  // Student search
  const [studentSearch, setStudentSearch] = useState("")

  // Notes management
  const [selectedStudentForNotes, setSelectedStudentForNotes] = useState<Student | null>(null)
  const [studentNotes, setStudentNotes] = useState<Note[]>([])
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)
  const [editNoteDialogOpen, setEditNoteDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newNoteContent, setNewNoteContent] = useState("")
  const [newNoteCategory, setNewNoteCategory] = useState<Note["category"]>("general")

  const parseNotes = (notesString: string): Note[] => {
    if (!notesString) return []
    try {
      const parsed = JSON.parse(notesString)
      if (Array.isArray(parsed)) {
        const seen = new Set<string>()
        return parsed.map((note: Note) => {
          let uniqueId = note.id
          if (seen.has(note.id)) {
            uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 5)}`
          }
          seen.add(uniqueId)
          return {
            ...note,
            id: uniqueId,
          }
        })
      }
      if (typeof parsed === "string" && parsed.trim()) {
        return [
          {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            content: parsed,
            createdAt: new Date().toISOString(),
            category: "general",
          },
        ]
      }
      return []
    } catch {
      if (notesString.trim()) {
        return [
          {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            content: notesString,
            createdAt: new Date().toISOString(),
            category: "general",
          },
        ]
      }
      return []
    }
  }

  const saveNotes = async (student: Student, updatedNotes: Note[]) => {
    try {
      const notesJson = JSON.stringify(updatedNotes)
      await updateStudentById(student.id, { notes: notesJson })
      void reload()
      toast.success("تم حفظ الملاحظات بنجاح")
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ الملاحظات")
    }
  }

  const handleAddNote = async () => {
    if (!selectedStudentForNotes || !newNoteContent.trim()) {
      toast.error("يرجى إدخال محتوى الملاحظة")
      return
    }

    const newNote: Note = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: newNoteContent.trim(),
      createdAt: new Date().toISOString(),
      category: newNoteCategory,
    }

    const currentNotes = parseNotes(selectedStudentForNotes.notes || "")
    const updatedNotes = [newNote, ...currentNotes]

    await saveNotes(selectedStudentForNotes, updatedNotes)
    setStudentNotes(updatedNotes)
    setNewNoteContent("")
    setNewNoteCategory("general")
  }

  const handleEditNote = async () => {
    if (!selectedStudentForNotes || !editingNote || !newNoteContent.trim()) {
      toast.error("يرجى إدخال محتوى الملاحظة")
      return
    }

    const currentNotes = parseNotes(selectedStudentForNotes.notes || "")
    const updatedNotes = currentNotes.map((note) =>
      note.id === editingNote.id
        ? { ...note, content: newNoteContent.trim(), updatedAt: new Date().toISOString() }
        : note
    )

    await saveNotes(selectedStudentForNotes, updatedNotes)
    setStudentNotes(updatedNotes)
    setEditingNote(null)
    setNewNoteContent("")
    setEditNoteDialogOpen(false)
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!selectedStudentForNotes) return

    const currentNotes = parseNotes(selectedStudentForNotes.notes || "")
    const updatedNotes = currentNotes.filter((note) => note.id !== noteId)

    await saveNotes(selectedStudentForNotes, updatedNotes)
    setStudentNotes(updatedNotes)
  }

  const openNotesDialog = (student: Student) => {
    setSelectedStudentForNotes(student)
    const parsed = parseNotes(student.notes || "")
    setStudentNotes(parsed)
    setNotesDialogOpen(true)
  }

  const openEditNoteDialog = (note: Note) => {
    setEditingNote(note)
    setNewNoteContent(note.content)
    setNewNoteCategory(note.category || "general")
    setEditNoteDialogOpen(true)
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "academic":
        return "bg-indigo-50 text-indigo-700 border-indigo-200"
      case "behavioral":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "health":
        return "bg-rose-55 text-rose-700 border-rose-200"
      default:
        return "bg-slate-50 text-slate-700 border-slate-200"
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

  const getNotesCount = (student: Student) => {
    return parseNotes(student.notes || "").length
  }

  const reload = useCallback(async () => {
    try {
      const found = await fetchClassById(classId)
      if (!found) {
        router.push("/dashboard/classes")
        return
      }
      setCls(found)
      const studs = await fetchStudentsByClass(classId)
      setStudents(studs)
      const teachers = await fetchTeachers()
      setTeacher(found.teacherId ? teachers.find((t) => t.id === found.teacherId) || null : null)
      const att = await fetchAttendanceByClass(classId)
      setAttendance(att)

      // Load attendance for selected date
      const existing = att.find((a) => a.date === attendanceDate)
      if (existing) {
        const map: Record<string, boolean> = {}
        existing.records.forEach((r) => {
          map[r.studentId] = r.present
        })
        setAttendanceMap(map)
      } else {
        const map: Record<string, boolean> = {}
        studs.forEach((s) => {
          map[s.id] = true
        })
        setAttendanceMap(map)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [classId, router, attendanceDate])

  useEffect(() => {
    void reload()
  }, [reload])

  async function handleAddStudent() {
    if (!newName.trim()) {
      toast.error("يرجى إدخال اسم الطالب")
      return
    }
    const age = parseInt(newAge)
    if (isNaN(age) || age < 3 || age > 25) {
      toast.error("يرجى إدخال عمر صحيح (3-25)")
      return
    }
    const created = await createStudent(
      newName.trim(),
      age,
      classId,
      newParentPhone.trim(),
      newNotes.trim()
    )
    if (!created) {
      toast.error("حدث خطأ أثناء إضافة الطالب")
      return
    }
    setNewName("")
    setNewAge("")
    setNewParentPhone("")
    setNewNotes("")
    setAddOpen(false)
    void reload()
    toast.success("تمت إضافة الطالب بنجاح")
  }

  async function handleDeleteStudent(id: string) {
    await deleteStudentById(id)
    void reload()
    toast.success("تم حذف الطالب بنجاح")
  }

  async function handleSaveAttendance() {
    const records = students.map((s) => ({
      studentId: s.id,
      present: attendanceMap[s.id] ?? true,
    }))
    const saved = await saveAttendanceRecord(classId, attendanceDate, records)
    if (!saved) {
      toast.error("حدث خطأ أثناء حفظ الحضور")
      return
    }
    void reload()
    toast.success("تم حفظ الحضور بنجاح")
  }

  function toggleAttendance(studentId: string) {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }))
  }

  if (loading || !cls) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  const today = new Date().toISOString().split("T")[0]
  const todayAttendance = attendance.find((a) => a.date === today)
  const todayPresentCount = todayAttendance
    ? todayAttendance.records.filter((r) => r.present).length
    : students.filter((s) => attendanceMap[s.id] !== false).length
  const todayAbsentCount = students.length - todayPresentCount
  const todayAttendanceRate =
    students.length > 0 ? Math.round((todayPresentCount / students.length) * 100) : 0

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6 text-right"
      dir="rtl"
    >
      {/* Header Controls */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            <Link href="/dashboard/classes" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4 ml-1" />
              <span>العودة للصفوف</span>
            </Link>
          </Button>
          <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-50 rounded-lg py-1 px-2.5">
            <GraduationCap className="ml-1 h-3.5 w-3.5" />
            <span>تفاصيل الصف</span>
          </Badge>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="بحث عن طالب بالاسم..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full sm:w-64 pr-9 bg-white border-slate-200 focus:border-indigo-500 rounded-xl h-10"
            />
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 bg-gradient-to-r from-indigo-650 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/10 border-0 flex items-center gap-1.5">
                <Plus className="h-4.5 w-4.5" />
                <span>إضافة طالب</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="text-right bg-white border-slate-100 rounded-2xl max-w-md">
              <DialogHeader>
                <DialogTitle className="text-slate-900 font-extrabold text-lg flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  إضافة طالب جديد للصف
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold text-xs sm:text-sm">اسم الطالب</Label>
                  <Input
                    placeholder="الاسم الكامل للطالب"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-slate-50/50 border-slate-200 focus:border-indigo-500 rounded-xl h-10 text-slate-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-slate-700 font-bold text-xs sm:text-sm">العمر</Label>
                    <Input
                      type="number"
                      placeholder="العمر"
                      value={newAge}
                      onChange={(e) => setNewAge(e.target.value)}
                      min={3}
                      max={25}
                      className="bg-slate-55/50 border-slate-200 focus:border-indigo-500 rounded-xl h-10 text-slate-850"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-700 font-bold text-xs sm:text-sm">هاتف ولي الأمر</Label>
                    <Input
                      placeholder="رقم الهاتف"
                      value={newParentPhone}
                      onChange={(e) => setNewParentPhone(e.target.value)}
                      className="bg-slate-55/50 border-slate-200 focus:border-indigo-500 rounded-xl h-10 text-slate-850 text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold text-xs sm:text-sm">ملاحظات أولية</Label>
                  <Textarea
                    placeholder="ملاحظات صحية أو دراسية خاصة بالطالب..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    rows={3}
                    className="bg-slate-55/50 border-slate-200 focus:border-indigo-500 rounded-xl text-slate-850 resize-none"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <DialogClose asChild>
                    <Button variant="outline" className="border-slate-250 rounded-xl h-10">
                      إلغاء
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={handleAddStudent}
                    className="bg-gradient-to-r from-indigo-550 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl h-10 px-5"
                  >
                    إضافة الطالب
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Class Meta Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white overflow-hidden relative rounded-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                  <BookOpen className="h-8 w-8 text-indigo-200" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight">{cls.name}</h1>
                  <p className="text-xs text-indigo-200 mt-1">الصف الدراسي والمجموعة التعليمية الحالية</p>
                </div>
              </div>

              <div className="flex items-center gap-6 flex-wrap md:justify-end">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl text-center">
                  <span className="block text-xs text-indigo-305">عدد الطلاب</span>
                  <span className="text-lg font-black">{students.length}</span>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl text-center">
                  <span className="block text-xs text-indigo-305">مربي الصف</span>
                  <span className="text-lg font-black text-indigo-200">{teacher ? teacher.name : "غير معين"}</span>
                </div>
                {students.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl text-center">
                    <span className="block text-xs text-indigo-305">متوسط الأعمار</span>
                    <span className="text-lg font-black">
                      {Math.round(students.reduce((sum, s) => sum + s.age, 0) / students.length)} سنة
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-850">{students.length}</p>
              <p className="text-xs font-semibold text-slate-400">إجمالي طلاب الصف</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-850">{todayPresentCount}</p>
              <p className="text-xs font-semibold text-slate-400">الحضور اليوم</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-850">{todayAbsentCount}</p>
              <p className="text-xs font-semibold text-slate-400">الغياب اليوم</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 bg-purple-50 text-purple-650 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-850">{todayAttendanceRate}%</p>
              <p className="text-xs font-semibold text-slate-400">معدل حضور اليوم</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs Layout */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="bg-slate-100 border border-slate-200/60 p-1 rounded-xl mb-6">
            <TabsTrigger
              value="students"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-650 data-[state=active]:shadow-sm px-5 py-2 font-bold transition-all text-sm gap-2"
            >
              <Users className="h-4 w-4" />
              <span>قائمة الطلاب ({students.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-650 data-[state=active]:shadow-sm px-5 py-2 font-bold transition-all text-sm gap-2"
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>تسجيل الحضور والغياب</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="mt-0 outline-none">
            {students.length === 0 ? (
              <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl">
                <CardContent className="p-12 text-center">
                  <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">لا يوجد طلاب بالصف حالياً</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-6">
                    قم بإضافة الطلاب المسجلين بالصف الدراسي لبدء رصد الحضور وتسجيل درجاتهم وملاحظاتهم السلوكية.
                  </p>
                  <Button
                    onClick={() => setAddOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md px-6 h-10 border-0"
                  >
                    <Plus className="ml-1.5 h-4.5 w-4.5" />
                    <span>إضافة أول طالب</span>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="px-6 py-4 font-bold text-slate-700 text-xs">اسم الطالب</th>
                        <th className="px-6 py-4 font-bold text-slate-700 text-xs hidden sm:table-cell">العمر</th>
                        <th className="px-6 py-4 font-bold text-slate-700 text-xs hidden md:table-cell">هاتف ولي الأمر</th>
                        <th className="px-6 py-4 font-bold text-slate-700 text-xs hidden lg:table-cell">تاريخ التسجيل</th>
                        <th className="px-6 py-4 font-bold text-slate-700 text-xs text-center w-32">الملاحظات</th>
                        <th className="px-6 py-4 w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <AnimatePresence mode="popLayout">
                        {students
                          .filter((student) =>
                            studentSearch === "" ||
                            student.name.toLowerCase().includes(studentSearch.toLowerCase())
                          )
                          .map((student) => {
                            const notesCount = getNotesCount(student)
                            return (
                              <motion.tr
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                key={student.id}
                                className="hover:bg-slate-50/30 transition-colors group"
                              >
                                <td className="px-6 py-4">
                                  <Link
                                    href={`/dashboard/student/${student.id}`}
                                    className="font-bold text-slate-800 hover:text-indigo-650 flex items-center gap-2 group-hover:translate-x-[-4px] transition-transform duration-200"
                                  >
                                    <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xs">
                                      {student.name.substring(0, 1)}
                                    </div>
                                    <span>{student.name}</span>
                                  </Link>
                                </td>
                                <td className="px-6 py-4 text-slate-500 hidden sm:table-cell">{student.age} سنة</td>
                                <td className="px-6 py-4 text-slate-500 hidden md:table-cell font-mono" dir="ltr">
                                  {student.parentPhone || "—"}
                                </td>
                                <td className="px-6 py-4 text-slate-500 hidden lg:table-cell">
                                  {new Date(student.createdAt).toLocaleDateString("ar-EG", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    onClick={() => openNotesDialog(student)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                      notesCount > 0
                                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                                        : "bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200"
                                    }`}
                                  >
                                    <StickyNote className="h-3.5 w-3.5" />
                                    <span>{notesCount > 0 ? `${notesCount} ملاحظات` : "إضافة ملاحظة"}</span>
                                  </button>
                                </td>
                                <td className="px-6 py-4 text-left">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <button className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="text-right bg-white rounded-2xl border-slate-100">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-slate-900 font-extrabold">
                                          تأكيد حذف الطالب
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-slate-500">
                                          هل أنت متأكد من حذف الطالب "{student.name}" نهائياً من قاعدة البيانات؟ لا يمكن التراجع عن هذا الإجراء.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter className="flex gap-2 justify-end">
                                        <AlertDialogCancel className="border-slate-200 rounded-xl">إلغاء</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteStudent(student.id)}
                                          className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl border-0"
                                        >
                                          نعم، احذف الطالب
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </td>
                              </motion.tr>
                            )
                          })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
                {students.filter((student) =>
                  studentSearch === "" ||
                  student.name.toLowerCase().includes(studentSearch.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-10 bg-slate-50/20">
                    <Search className="h-10 w-10 mx-auto text-slate-305 mb-2" />
                    <p className="text-slate-400 text-sm font-semibold">لا توجد نتائج بحث مطابقة</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="attendance" className="mt-0 outline-none space-y-4">
            <div className="grid gap-6 lg:grid-cols-3 items-start">
              {/* Daily Attendance Sheet */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl">
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-800">بيانات الحضور اليومي</h3>
                      <p className="text-xs text-slate-405 mt-0.5">اختر التاريخ وعلم حضور أو غياب الطلاب</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-bold text-slate-500 whitespace-nowrap">تاريخ الرصد:</Label>
                      <Input
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="bg-slate-50 border-slate-200 focus:border-indigo-500 rounded-xl h-9 text-slate-800 text-sm"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <CardContent className="p-5">
                    {students.length === 0 ? (
                      <div className="text-center py-10 text-slate-400">
                        <ClipboardCheck className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <p className="text-sm font-semibold">لا يوجد طلاب بالصف حالياً لتسجيل الحضور</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {students
                          .filter((student) =>
                            studentSearch === "" ||
                            student.name.toLowerCase().includes(studentSearch.toLowerCase())
                          )
                          .map((student) => {
                            const isPresent = attendanceMap[student.id] ?? true
                            return (
                              <div
                                key={student.id}
                                onClick={() => toggleAttendance(student.id)}
                                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                                  isPresent
                                    ? "bg-emerald-50/20 border-emerald-100 hover:bg-emerald-50/40"
                                    : "bg-rose-50/20 border-rose-100 hover:bg-rose-50/40"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${
                                      isPresent
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-rose-100 text-rose-700"
                                    }`}
                                  >
                                    {student.name.substring(0, 1)}
                                  </div>
                                  <div>
                                    <span className="block font-bold text-slate-800 text-sm">{student.name}</span>
                                    <span className="text-[10px] text-slate-400">انقر للتغيير</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                  <Badge
                                    className={`rounded-lg py-1 px-2.5 font-bold ${
                                      isPresent
                                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                        : "bg-rose-100 text-rose-700 hover:bg-rose-100"
                                    }`}
                                  >
                                    {isPresent ? "حاضر" : "غائب"}
                                  </Badge>
                                  <Checkbox
                                    checked={isPresent}
                                    onCheckedChange={() => toggleAttendance(student.id)}
                                    className="data-[state=checked]:bg-emerald-555 data-[state=checked]:border-emerald-555 h-5 w-5 rounded-md"
                                  />
                                </div>
                              </div>
                            )
                          })}

                        <div className="pt-4 border-t border-slate-100 mt-6 flex justify-end">
                          <Button
                            onClick={handleSaveAttendance}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md px-8 font-bold flex items-center gap-2 h-10 border-0"
                          >
                            <ClipboardCheck className="h-4.5 w-4.5" />
                            <span>حفظ سجل الحضور</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Attendance History Sidebar */}
              <div className="space-y-4">
                <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl">
                  <div className="p-5 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="h-4.5 w-4.5 text-indigo-500" />
                      <span>السجل التاريخي للحضور</span>
                    </h3>
                    <p className="text-xs text-slate-405 mt-0.5">آخر 10 أيام تم رصدها</p>
                  </div>

                  <CardContent className="p-5">
                    {attendance.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Calendar className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-semibold">لا توجد سجلات سابقة للمقارنة</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {attendance
                          .sort((a, b) => b.date.localeCompare(a.date))
                          .slice(0, 10)
                          .map((record) => {
                            const present = record.records.filter((r) => r.present).length
                            const absent = record.records.length - present
                            const rate = Math.round((present / record.records.length) * 100)

                            const absentStudents = record.records
                              .filter((r) => !r.present)
                              .map((r) => r.studentName)
                              .slice(0, 3)

                            return (
                              <div
                                key={record.id}
                                className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all"
                              >
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <span className="font-bold text-slate-700 text-xs font-mono">{record.date}</span>
                                  <Badge className="bg-indigo-50 hover:bg-indigo-50 text-indigo-700 text-[10px] rounded px-1.5 py-0.5">
                                    حضور: {rate}%
                                  </Badge>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                                  <span>الحضور: {present} طلاب</span>
                                  <span className="text-rose-600">الغياب: {absent} طلاب</span>
                                </div>

                                {absentStudents.length > 0 && (
                                  <div className="text-[10px] text-rose-600 bg-rose-50/50 border border-rose-100/60 rounded px-2 py-1 mt-1.5 leading-relaxed">
                                    <strong>الغائبون: </strong>
                                    {absentStudents.join("، ")}
                                    {absent > 3 && ` وآخرون`}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="text-right bg-white border-slate-100 rounded-2xl max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-slate-900 font-extrabold text-lg flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-amber-500" />
              <span>ملاحظات الطالب: {selectedStudentForNotes?.name}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6 pt-4">
            {/* Add New Note */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4">
              <span className="block text-xs font-bold text-slate-500 mb-3">كتابة ملاحظة جديدة</span>
              <div className="flex flex-col gap-3">
                <div className="flex gap-1.5 flex-wrap">
                  {(["general", "academic", "behavioral", "health"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewNoteCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                        newNoteCategory === cat
                          ? getCategoryColor(cat)
                          : "bg-white text-slate-500 hover:bg-slate-100 border-slate-200"
                      }`}
                    >
                      {getCategoryLabel(cat)}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="اكتب تفاصيل الملاحظة هنا..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={2}
                    className="border-slate-250 bg-white rounded-xl text-slate-850 resize-none flex-1 text-sm focus:border-indigo-500"
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNoteContent.trim()}
                    className="bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl h-auto px-4 self-stretch border-0 flex items-center justify-center shadow-sm"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Notes List */}
            <div className="space-y-3">
              <span className="block text-xs font-bold text-slate-500">الملاحظات المسجلة</span>
              {studentNotes.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50/20 border border-slate-100 rounded-xl">
                  <FileText className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">لا توجد ملاحظات مسجلة لهذا الطالب</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {studentNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 bg-white border border-slate-150 rounded-xl relative group hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className={`text-[10px] rounded-md font-bold px-2 py-0.5 border ${getCategoryColor(
                                note.category
                              )}`}
                            >
                              {getCategoryLabel(note.category)}
                            </Badge>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(note.createdAt).toLocaleDateString("ar-EG", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                              {note.updatedAt && <span className="text-indigo-500"> (معدل)</span>}
                            </span>
                          </div>
                          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                            {note.content}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditNoteDialog(note)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="text-right bg-white rounded-2xl border-slate-100">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="font-extrabold text-slate-900">
                                  حذف الملاحظة
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-500 text-sm">
                                  هل أنت متأكد من حذف هذه الملاحظة؟ لن يكون من الممكن استعادتها.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex gap-2 justify-end">
                                <AlertDialogCancel className="border-slate-200 rounded-xl">إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl border-0"
                                >
                                  نعم، احذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={editNoteDialogOpen} onOpenChange={setEditNoteDialogOpen}>
        <DialogContent className="text-right bg-white border-slate-100 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-extrabold text-lg flex items-center gap-2">
              <Edit3 className="h-4.5 w-4.5 text-indigo-500" />
              <span>تعديل تفاصيل الملاحظة</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-xs">فئة الملاحظة</Label>
              <div className="flex gap-1.5 flex-wrap">
                {(["general", "academic", "behavioral", "health"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNewNoteCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      newNoteCategory === cat
                        ? getCategoryColor(cat)
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200 border-transparent"
                    }`}
                  >
                    {getCategoryLabel(cat)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-xs">محتوى الملاحظة المعدل</Label>
              <Textarea
                placeholder="اكتب الملاحظة الجديدة..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={4}
                className="border-slate-200 bg-slate-50/50 focus:border-indigo-500 rounded-xl text-slate-800 resize-none text-sm"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <DialogClose asChild>
                <Button variant="outline" className="border-slate-200 rounded-xl h-10">
                  إلغاء
                </Button>
              </DialogClose>
              <Button
                onClick={handleEditNote}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-5"
              >
                حفظ التعديلات
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
