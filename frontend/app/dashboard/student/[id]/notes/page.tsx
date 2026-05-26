"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  User,
  FileText,
  Calendar,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { toast } from "sonner"
import type { Student, SchoolClass } from "@/lib/store"
import { fetchStudentById, fetchClasses, updateStudentById } from "@/lib/supabase-school"
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
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
}

export default function StudentNotesPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [classInfo, setClassInfo] = useState<SchoolClass | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
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
            uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
          }
          seen.add(uniqueId)
          return { ...note, id: uniqueId }
        })
      }
      if (typeof parsed === "string" && parsed.trim()) {
        return [{
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          content: parsed,
          createdAt: new Date().toISOString(),
          category: "general",
        }]
      }
      return []
    } catch {
      if (notesString.trim()) {
        return [{
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          content: notesString,
          createdAt: new Date().toISOString(),
          category: "general",
        }]
      }
      return []
    }
  }

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const studentData = await fetchStudentById(studentId)
      if (!studentData) {
        router.push("/dashboard/students")
        return
      }
      setStudent(studentData)
      const parsedNotes = parseNotes(studentData.notes || "")
      setNotes(parsedNotes)

      const classes = await fetchClasses()
      const cls = classes.find(c => c.id === studentData.classId)
      setClassInfo(cls || null)
    } catch (error) {
      toast.error("حدث خطأ أثناء تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }, [studentId, router])

  useEffect(() => {
    void reload()
  }, [reload])

  const saveNotes = async (updatedNotes: Note[]) => {
    if (!student) return
    try {
      const notesJson = JSON.stringify(updatedNotes)
      await updateStudentById(student.id, { notes: notesJson })
      setNotes(updatedNotes)
      toast.success("تم حفظ الملاحظات بنجاح")
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ الملاحظات")
    }
  }

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) {
      toast.error("يرجى إدخال محتوى الملاحظة")
      return
    }

    const newNote: Note = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      content: newNoteContent.trim(),
      createdAt: new Date().toISOString(),
      category: newNoteCategory,
    }

    const updatedNotes = [newNote, ...notes]
    await saveNotes(updatedNotes)
    setNewNoteContent("")
    setNewNoteCategory("general")
    setIsAddDialogOpen(false)
  }

  const handleEditNote = async () => {
    if (!editingNote || !newNoteContent.trim()) {
      toast.error("يرجى إدخال محتوى الملاحظة")
      return
    }

    const updatedNotes = notes.map(note =>
      note.id === editingNote.id
        ? { ...note, content: newNoteContent.trim(), updatedAt: new Date().toISOString() }
        : note
    )

    await saveNotes(updatedNotes)
    setEditingNote(null)
    setNewNoteContent("")
    setIsEditDialogOpen(false)
  }

  const handleDeleteNote = async (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId)
    await saveNotes(updatedNotes)
  }

  const openEditDialog = (note: Note) => {
    setEditingNote(note)
    setNewNoteContent(note.content)
    setNewNoteCategory(note.category || "general")
    setIsEditDialogOpen(true)
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "academic":
        return "bg-blue-50 border-blue-100 text-blue-700"
      case "behavioral":
        return "bg-amber-50 border-amber-100 text-amber-700"
      case "health":
        return "bg-rose-50 border-rose-100 text-rose-700"
      default:
        return "bg-slate-50 border-slate-100 text-slate-655"
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
          <Link href={`/dashboard/student/${student.id}`}>
            <ArrowLeft className="ml-2 h-4 w-4" />
            <span>العودة للملف الشخصي</span>
          </Link>
        </Button>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl h-9 px-4 font-bold shadow-md shadow-indigo-500/10 border-0 flex items-center gap-1.5 transition-all">
              <Plus className="ml-1.5 h-4 w-4" />
              <span>إضافة ملاحظة</span>
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl" className="text-right max-w-lg bg-white border-slate-100 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-slate-805 font-extrabold text-lg flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                تسجيل ملاحظة جديدة للطالب
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-bold text-xs sm:text-sm">تصنيف الملاحظة</Label>
                <div className="flex gap-2 flex-wrap">
                  {(["general", "academic", "behavioral", "health"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewNoteCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        newNoteCategory === cat
                          ? getCategoryColor(cat) + " border-current"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {getCategoryLabel(cat)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-bold text-xs sm:text-sm">محتوى وتفصيل الملاحظة</Label>
                <Textarea
                  placeholder="اكتب تفاصيل الملاحظة هنا..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={4}
                  className="bg-slate-50 border-slate-250 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-850 resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <DialogClose asChild>
                  <Button variant="outline" className="border-slate-200 text-slate-650 rounded-xl hover:bg-slate-50">
                    إلغاء
                  </Button>
                </DialogClose>
                <Button onClick={handleAddNote} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl px-5 font-bold border-0 h-10 shadow-md">
                  حفظ الملاحظة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Student Profile Header Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-100 bg-white shadow-sm shadow-slate-100/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 blur-2xl bg-indigo-500 pointer-events-none" />
          <CardContent className="p-5 sm:p-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border border-indigo-100 shadow-sm flex-shrink-0">
                <AvatarFallback className="text-base sm:text-lg font-extrabold bg-gradient-to-br from-indigo-55 to-indigo-105 text-indigo-600">
                  {student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-right min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">ملاحظات الطالب: {student.name}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <Badge variant="secondary" className="bg-slate-50 border border-slate-100 text-slate-650 rounded-lg text-xs font-semibold">
                    {classInfo ? classInfo.name : "غير محدد"}
                  </Badge>
                  <Badge variant="secondary" className="bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold">
                    ملاحظات وتنبيهات السلوك والدراسة ({notes.length})
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notes List view */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-100 bg-white shadow-sm shadow-slate-100/40">
          <CardContent className="p-5 sm:p-6">
            {notes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-bold mb-3">لا توجد أي ملاحظات مسجلة للطالب</p>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold h-8 px-4 border-0"
                >
                  إضافة ملاحظة أولى
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="group p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all duration-200 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-2 justify-start">
                        <Badge variant="outline" className={`text-[10px] font-bold px-2 rounded-md ${getCategoryColor(note.category)}`}>
                          {getCategoryLabel(note.category)}
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-350" />
                          <span>{new Date(note.createdAt).toLocaleDateString("ar-EG")}</span>
                          {note.updatedAt && <span className="text-indigo-400">(معدلة)</span>}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(note)}
                        className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white border-slate-100 rounded-2xl text-right">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-slate-800 font-extrabold">حذف الملاحظة</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500">
                              هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن استرجاعها بعد الحذف.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex gap-2 justify-end mt-2">
                            <AlertDialogCancel className="border-slate-200 text-slate-650 rounded-xl hover:bg-slate-50">
                              إلغاء
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteNote(note.id)}
                              className="bg-rose-650 hover:bg-rose-700 text-white rounded-xl border-0 shadow-md shadow-rose-650/10"
                            >
                              نعم، احذفها
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit note dialog container */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent dir="rtl" className="text-right max-w-lg bg-white border-slate-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-805 font-extrabold text-lg flex items-center gap-2">
              <Edit className="h-4.5 w-4.5 text-indigo-500" />
              تعديل الملاحظة المسجلة
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-xs sm:text-sm">تصنيف الملاحظة</Label>
              <div className="flex gap-2 flex-wrap">
                {(["general", "academic", "behavioral", "health"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewNoteCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      newNoteCategory === cat
                        ? getCategoryColor(cat) + " border-current"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {getCategoryLabel(cat)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-xs sm:text-sm">محتوى وتفصيل الملاحظة</Label>
              <Textarea
                placeholder="اكتب تفاصيل الملاحظة هنا..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={4}
                className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-850 resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <DialogClose asChild>
                <Button variant="outline" className="border-slate-200 text-slate-650 rounded-xl hover:bg-slate-50">
                  إلغاء
                </Button>
              </DialogClose>
              <Button onClick={handleEditNote} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl px-5 font-bold border-0 h-10 shadow-md">
                حفظ التعديلات
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
