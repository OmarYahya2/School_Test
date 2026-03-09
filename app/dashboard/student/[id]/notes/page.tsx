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

type Note = {
  id: string
  content: string
  createdAt: string
  updatedAt?: string
  category?: "academic" | "behavioral" | "general" | "health"
  author?: string
}

export default function StudentNotesPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [classInfo, setClassInfo] = useState<SchoolClass | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  // Add/Edit note dialog
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
      // If it's a plain string, convert to array format
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
      // If plain text notes exist, convert to structured format
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

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const studentData = await fetchStudentById(studentId)
      if (!studentData) {
        router.push("/dashboard/students")
        return
      }
      setStudent(studentData)

      // Parse notes
      const parsedNotes = parseNotes(studentData.notes || "")
      setNotes(parsedNotes)

      // Fetch class info
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
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/dashboard/student/${student.id}`}>
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة للملف الشخصي
            </Link>
          </Button>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-200">
                <Plus className="ml-2 h-4 w-4" />
                إضافة ملاحظة
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl" className="text-right max-w-lg bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/20 border-blue-100">
              <DialogHeader>
                <DialogTitle className="text-slate-800 font-semibold flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 shadow-sm" />
                  إضافة ملاحظة جديدة
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-slate-700 font-medium">الفئة</Label>
                  <div className="flex gap-2 flex-wrap">
                    {(["general", "academic", "behavioral", "health"] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setNewNoteCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                          newNoteCategory === cat
                            ? getCategoryColor(cat)
                            : "bg-white/60 text-slate-600 hover:bg-white/80 border border-blue-100/50"
                        }`}
                      >
                        {getCategoryLabel(cat)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-slate-700 font-medium">محتوى الملاحظة</Label>
                  <Textarea
                    placeholder="اكتب الملاحظة هنا..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={5}
                    dir="rtl"
                    className="text-right border-blue-100/50 bg-white/60 focus:bg-white/80 focus:border-blue-200 resize-none transition-colors"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <DialogClose asChild>
                    <Button variant="outline" className="border-blue-100/50 bg-white/60 hover:bg-white/80 text-slate-600">
                      إلغاء
                    </Button>
                  </DialogClose>
                  <Button onClick={handleAddNote} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-200">
                    <Save className="ml-2 h-4 w-4" />
                    حفظ
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Student Header Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-blue-200 shadow-lg">
                <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-blue-100 to-indigo-100 text-gray-700">
                  {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 border-2 border-white shadow-sm" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent">
                ملاحظات: {student.name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="secondary" className="text-xs bg-blue-100/50 text-gray-700 border-blue-200/50">
                  <User className="ml-1 h-3 w-3" />
                  {student.age} سنة
                </Badge>
                {classInfo && (
                  <Badge variant="secondary" className="text-xs bg-indigo-100/50 text-gray-700 border-indigo-200/50">
                    {classInfo.name}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-100/50 to-indigo-100/50 text-blue-700 border-blue-200/50 shadow-sm">
                  <FileText className="ml-1 h-3 w-3" />
                  {notes.length} ملاحظة
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50/30 via-white to-blue-50/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 shadow-sm" />
            جميع الملاحظات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative mb-6">
                <div className="h-20 w-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <FileText className="h-10 w-10 text-blue-300" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 border-2 border-white shadow-sm" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">لا توجد ملاحظات</h3>
              <p className="text-sm text-gray-500 mb-6">يمكنك إضافة ملاحظات جديدة للطالب</p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus className="ml-2 h-4 w-4" />
                إضافة ملاحظة
              </Button>
            </div>
          ) : (
            <div className="space-y-4" dir="rtl">
              {notes.map((note, index) => (
                <div
                  key={note.id}
                  className="group p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-blue-100/50 hover:border-blue-200 hover:bg-white/80 transition-all duration-300 shadow-sm hover:shadow-md"
                  style={{
                    animation: index === 0 ? 'slideIn 0.3s ease-out' : `slideIn 0.3s ease-out ${index * 0.05}s`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline" className={`text-xs px-2.5 py-1 rounded-full ${getCategoryColor(note.category)} shadow-sm`}>
                          {getCategoryLabel(note.category)}
                        </Badge>
                        <span className="text-xs text-blue-400/70 flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          <span className="font-medium">
                            {new Date(note.createdAt).toLocaleDateString("ar-EG", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {note.updatedAt && (
                            <span className="text-blue-300">(تم التعديل)</span>
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                        {note.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(note)}
                        className="h-8 w-8 p-0 text-blue-400/60 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-rose-400/60 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-rose-100">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-gray-800">
                              <AlertCircle className="h-5 w-5 text-rose-500" />
                              حذف الملاحظة
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600">
                              هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex gap-2">
                            <AlertDialogCancel className="border-gray-200 text-gray-600 hover:bg-gray-50">
                              إلغاء
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteNote(note.id)}
                              className="bg-rose-500 hover:bg-rose-600 text-white"
                            >
                              حذف
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
        </CardContent>
      </Card>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent dir="rtl" className="text-right max-w-lg bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/20 border-blue-100">
          <DialogHeader>
            <DialogTitle className="text-slate-800 font-semibold flex items-center gap-2">
              <Edit className="h-4 w-4 text-blue-500" />
              تعديل الملاحظة
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              <Label className="text-slate-700 font-medium">الفئة</Label>
              <div className="flex gap-2 flex-wrap">
                {(["general", "academic", "behavioral", "health"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNewNoteCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                      newNoteCategory === cat
                        ? getCategoryColor(cat)
                        : "bg-white/60 text-slate-600 hover:bg-white/80 border border-blue-100/50"
                    }`}
                  >
                    {getCategoryLabel(cat)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-slate-700 font-medium">محتوى الملاحظة</Label>
              <Textarea
                placeholder="اكتب الملاحظة هنا..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={5}
                dir="rtl"
                className="text-right border-blue-100/50 bg-white/60 focus:bg-white/80 focus:border-blue-200 resize-none transition-colors"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <DialogClose asChild>
                <Button variant="outline" className="border-blue-100/50 bg-white/60 hover:bg-white/80 text-slate-600">
                  إلغاء
                </Button>
              </DialogClose>
              <Button onClick={handleEditNote} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-200">
                <Save className="ml-2 h-4 w-4" />
                حفظ التعديلات
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
