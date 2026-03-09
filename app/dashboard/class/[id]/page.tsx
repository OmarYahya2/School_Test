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
  Eye,
  Edit3,
  Download,
  Search,
  FileText,
  StickyNote,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import type { SchoolClass, Student, Teacher, AttendanceRecord } from "@/lib/store"
import type { AttendanceWithNames } from "@/lib/supabase-school"
import { fetchClassById, fetchStudentsByClass, createStudent, deleteStudentById, fetchAttendanceByClass, saveAttendanceRecord, updateStudentById } from "@/lib/supabase-school"
import { fetchTeachers } from "@/lib/supabase-teachers"

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string

  const [cls, setCls] = useState<SchoolClass | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [attendance, setAttendance] = useState<AttendanceWithNames[]>([])
  const [addOpen, setAddOpen] = useState(false)

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

type Note = {
  id: string
  content: string
  createdAt: string
  updatedAt?: string
  category?: "academic" | "behavioral" | "general" | "health"
  author?: string
}

  const parseNotes = (notesString: string): Note[] => {
    if (!notesString) return []
    try {
      const parsed = JSON.parse(notesString)
      if (Array.isArray(parsed)) {
        // Regenerate all IDs to ensure uniqueness and fix duplicate key issues
        const seen = new Set<string>()
        return parsed.map((note: Note) => {
          // If this ID was already seen, generate a new unique ID
          let uniqueId = note.id
          if (seen.has(note.id)) {
            uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 5)}`
          }
          seen.add(uniqueId)
          return {
            ...note,
            id: uniqueId
          }
        })
      }
      if (typeof parsed === "string" && parsed.trim()) {
        return [{
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content: parsed,
          createdAt: new Date().toISOString(),
          category: "general",
        }]
      }
      return []
    } catch {
      if (notesString.trim()) {
        return [{
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content: notesString,
          createdAt: new Date().toISOString(),
          category: "general",
        }]
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
    const updatedNotes = currentNotes.map(note =>
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
    const updatedNotes = currentNotes.filter(note => note.id !== noteId)
    
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
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "behavioral":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "health":
        return "bg-rose-100 text-rose-700 border-rose-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
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
    const found = await fetchClassById(classId)
    if (!found) {
      router.push("/dashboard")
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

  if (!cls) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const today = new Date().toISOString().split("T")[0]
  const todayAttendance = attendance.find((a) => a.date === today)
  const todayPresentCount = todayAttendance ? todayAttendance.records.filter((r) => r.present).length : 0
  const todayAbsentCount = students.length - todayPresentCount
  const todayAttendanceRate = students.length > 0 ? Math.round((todayPresentCount / students.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="bg-emerald-50 border-emerald-200 text-gray-700 hover:bg-emerald-100">
            <Link href="/dashboard/classes">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة للصفوف
            </Link>
          </Button>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
            <GraduationCap className="ml-1 h-3 w-3" />
            الصف الدراسي
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="ml-2 h-4 w-4" />
            تصدير البيانات
          </Button>
        </div>
      </div>

      {/* Class Header Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-20 w-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center border-2 border-amber-200 shadow-lg">
                <BookOpen className="h-10 w-10 text-amber-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 border-2 border-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent">{cls.name}</h1>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <Badge variant="secondary" className="bg-amber-100 text-gray-700 border-amber-200">
                  <Users className="ml-1 h-3 w-3" />
                  {students.length} طالب
                </Badge>
                <Badge variant="secondary" className="bg-orange-100 text-gray-700 border-orange-200">
                  <UserCircle className="ml-1 h-3 w-3" />
                  {teacher ? teacher.name : "لم يتم التعيين"}
                </Badge>
                {students.length > 0 && (
                  <Badge variant="secondary" className="bg-emerald-100 text-gray-700 border-emerald-200">
                    <Activity className="ml-1 h-3 w-3" />
                    متوسط العمر: {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.age, 0) / students.length) : 0} سنة
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-3 md:grid-cols-4 mb-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 via-white to-teal-50">
          <CardContent className="p-3 text-center">
            <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">{students.length}</p>
            <p className="text-xs text-gray-600">إجمالي الطلاب</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <CardContent className="p-3 text-center">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">{todayPresentCount}</p>
            <p className="text-xs text-gray-600">الحضور اليوم</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-50 via-white to-pink-50">
          <CardContent className="p-3 text-center">
            <div className="h-10 w-10 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <XCircle className="h-5 w-5 text-rose-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">{todayAbsentCount}</p>
            <p className="text-xs text-gray-600">الغياب اليوم</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 via-white to-violet-50">
          <CardContent className="p-3 text-center">
            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">{todayAttendanceRate}%</p>
            <p className="text-xs text-gray-600">نسبة الحضور</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Student - Compact Button & Search */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="بحث عن طالب..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="w-64 pr-10 bg-white border-gray-200 focus:border-emerald-500"
          />
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md gap-2 px-6">
              <Plus className="h-5 w-5" />
              إضافة طالب
            </Button>
          </DialogTrigger>
        <DialogContent dir="rtl" className="text-right bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-emerald-200">
          <DialogHeader>
            <DialogTitle className="text-gray-800 flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
              إضافة طالب جديد
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-gray-700">اسم الطالب</Label>
                <Input
                  placeholder="أدخل اسم الطالب"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  dir="rtl"
                  className="text-right bg-white border-emerald-200 focus:border-emerald-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-gray-700">العمر</Label>
                <Input
                  type="number"
                  placeholder="العمر"
                  value={newAge}
                  onChange={(e) => setNewAge(e.target.value)}
                  min={3}
                  max={25}
                  className="bg-white border-emerald-200 focus:border-emerald-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-gray-700">هاتف ولي الأمر</Label>
                <Input
                  placeholder="رقم هاتف ولي الأمر"
                  value={newParentPhone}
                  onChange={(e) => setNewParentPhone(e.target.value)}
                  dir="ltr"
                  className="text-right bg-white border-emerald-200 focus:border-emerald-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-gray-700">ملاحظات</Label>
                <Textarea
                  placeholder="ملاحظات إضافية (اختياري)"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  dir="rtl"
                  className="text-right bg-white border-emerald-200 focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <DialogClose asChild>
                <Button variant="outline" className="bg-white border-gray-200">إلغاء</Button>
              </DialogClose>
              <Button onClick={handleAddStudent} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="ml-2 h-4 w-4" />
                إضافة الطالب
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="mb-4 bg-emerald-50 border border-emerald-200 p-1">
          <TabsTrigger value="students" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm gap-2">
            <Users className="h-4 w-4" />
            الطلاب
          </TabsTrigger>
          <TabsTrigger value="attendance" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm gap-2">
            <ClipboardCheck className="h-4 w-4" />
            الحضور
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-0">
          {students.length === 0 ? (
            <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 via-white to-gray-50">
              <CardContent className="p-12 text-center">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-700 mb-1">لا يوجد طلاب في هذا الصف</p>
                <p className="text-sm text-gray-500 mb-4">أضف طالباً جديداً للبدء</p>
                <Button onClick={() => setAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة طالب
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card" dir="rtl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">الاسم</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground hidden sm:table-cell">العمر</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground hidden md:table-cell">هاتف ولي الأمر</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground hidden lg:table-cell">تاريخ التسجيل</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground w-24">الملاحظات</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {students
                    .filter(student => 
                      studentSearch === "" || 
                      student.name.toLowerCase().includes(studentSearch.toLowerCase())
                    )
                    .map((student) => {
                      const notesCount = getNotesCount(student)
                      return (
                      <tr key={student.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3">
                          <Link
                            href={`/dashboard/student/${student.id}`}
                            className="font-medium text-card-foreground hover:text-primary transition-colors"
                          >
                            {student.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{student.age} سنة</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell" dir="ltr">{student.parentPhone || "-"}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                          {new Date(student.createdAt).toLocaleDateString("ar-EG")}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => openNotesDialog(student)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                              notesCount > 0
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200"
                            }`}
                          >
                            <StickyNote className="h-3 w-3" />
                            {notesCount > 0 ? `${notesCount} ملاحظة` : "إضافة"}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                aria-label="حذف الطالب"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-foreground">حذف الطالب</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف الطالب &quot;{student.name}&quot;؟
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex gap-2">
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteStudent(student.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    )})}
                </tbody>
              </table>
              {students.filter(student => 
                studentSearch === "" || 
                student.name.toLowerCase().includes(studentSearch.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-500">لا يوجد طلاب بهذا الاسم</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="attendance" className="mt-0">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                تسجيل الحضور
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                  <Label className="text-gray-700">التاريخ</Label>
                  <Input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="w-48 bg-white border-emerald-200 focus:border-emerald-500"
                    dir="ltr"
                  />
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    حاضر: {todayPresentCount}
                  </Badge>
                  <Badge className="bg-rose-100 text-rose-700 border-rose-200">
                    غائب: {todayAbsentCount}
                  </Badge>
                </div>
              </div>

              {students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ClipboardCheck className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>لا يوجد طلاب لتسجيل الحضور</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4" dir="rtl">
                    {students
                      .filter(student => 
                        studentSearch === "" || 
                        student.name.toLowerCase().includes(studentSearch.toLowerCase())
                      )
                      .map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-100">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-emerald-700">
                              {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <span className="text-gray-800 font-medium">{student.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm ${attendanceMap[student.id] ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {attendanceMap[student.id] ? 'حاضر' : 'غائب'}
                          </span>
                          <Checkbox
                            checked={attendanceMap[student.id] ?? true}
                            onCheckedChange={() => toggleAttendance(student.id)}
                            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {students.filter(student => 
                    studentSearch === "" || 
                    student.name.toLowerCase().includes(studentSearch.toLowerCase())
                  ).length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>لا يوجد طلاب بهذا الاسم</p>
                    </div>
                  )}
                  <Button
                    onClick={handleSaveAttendance}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  >
                    <ClipboardCheck className="ml-2 h-4 w-4" />
                    حفظ الحضور
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Attendance History */}
          {attendance.length > 0 && (
            <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 via-white to-gray-50 mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
                  <div className="h-3 w-3 rounded-full bg-gradient-to-r from-slate-500 to-gray-500" />
                  سجل الحضور السابق
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3" dir="rtl">
                  {attendance
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .slice(0, 10)
                    .map((record) => {
                      const present = record.records.filter((r) => r.present).length
                      const absent = record.records.length - present
                      const rate = Math.round((present / record.records.length) * 100)
                      
                      // Get names of absent students
                      const absentStudents = record.records
                        .filter(r => !r.present)
                        .map(r => r.studentName)
                        .slice(0, 3) // Show max 3 names
                      
                      return (
                        <div
                          key={record.id}
                          className="p-3 bg-white rounded-lg border border-slate-100"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-700 font-medium" dir="ltr">{record.date}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                حاضر: {present}
                              </Badge>
                              <Badge className="bg-rose-100 text-rose-700 border-rose-200">
                                غائب: {absent}
                              </Badge>
                              <span className="text-sm font-medium text-gray-600 w-12 text-left">{rate}%</span>
                            </div>
                          </div>
                          {absentStudents.length > 0 && (
                            <div className="text-xs text-rose-600 bg-rose-50 rounded px-2 py-1">
                              الغائبون: {absentStudents.join(", ")}
                              {absent < record.records.filter(r => !r.present).length && ` وآخرون`}
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent dir="rtl" className="text-right max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-800 font-semibold flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-amber-500" />
              ملاحظات: {selectedStudentForNotes?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            {/* Add New Note */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-sm font-medium text-slate-700 mb-2">إضافة ملاحظة جديدة</p>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 flex-wrap">
                  {(["general", "academic", "behavioral", "health"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewNoteCategory(cat)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        newNoteCategory === cat
                          ? getCategoryColor(cat)
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {getCategoryLabel(cat)}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="اكتب الملاحظة هنا..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={2}
                    dir="rtl"
                    className="text-right border-slate-200 resize-none flex-1 text-sm"
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNoteContent.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-auto"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Notes List */}
            <div className="space-y-2">
              {studentNotes.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <FileText className="h-12 w-12 mx-auto mb-2" />
                  <p>لا توجد ملاحظات</p>
                </div>
              ) : (
                studentNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 bg-white rounded-lg border border-slate-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={`text-xs ${getCategoryColor(note.category)}`}>
                            {getCategoryLabel(note.category)}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {new Date(note.createdAt).toLocaleDateString("ar-EG", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                            {note.updatedAt && (
                              <span className="text-slate-300"> (تم التعديل)</span>
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditNoteDialog(note)}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف الملاحظة</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف هذه الملاحظة؟
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex gap-2">
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteNote(note.id)}
                                className="bg-rose-600 hover:bg-rose-700 text-white"
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={editNoteDialogOpen} onOpenChange={setEditNoteDialogOpen}>
        <DialogContent dir="rtl" className="text-right max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-800 font-semibold flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-emerald-500" />
              تعديل الملاحظة
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              <Label className="text-slate-700 text-sm">الفئة</Label>
              <div className="flex gap-2 flex-wrap">
                {(["general", "academic", "behavioral", "health"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNewNoteCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      newNoteCategory === cat
                        ? getCategoryColor(cat)
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {getCategoryLabel(cat)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-slate-700 text-sm">محتوى الملاحظة</Label>
              <Textarea
                placeholder="اكتب الملاحظة هنا..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={4}
                dir="rtl"
                className="text-right border-slate-200 resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <DialogClose asChild>
                <Button variant="outline" className="border-slate-200">
                  إلغاء
                </Button>
              </DialogClose>
              <Button onClick={handleEditNote} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                حفظ التعديلات
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
