"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, UserCheck, BookOpen, GraduationCap, Phone, Pencil, ArrowUpRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { toast } from "sonner"
import type { Teacher, TeacherAssignment } from "@/lib/store"
import {
  fetchTeachers,
  createTeacher,
  deleteTeacherById,
  fetchTeacherAssignments,
  createTeacherAssignment,
  deleteTeacherAssignmentById,
} from "@/lib/supabase-teachers"
import { motion, AnimatePresence } from "framer-motion"

const grades = [
  { id: 1, name: "الصف الأول" },
  { id: 2, name: "الصف الثاني" },
  { id: 3, name: "الصف الثالث" },
  { id: 4, name: "الصف الرابع" },
  { id: 5, name: "الصف الخامس" },
  { id: 6, name: "الصف السادس" },
  { id: 7, name: "الصف السابع" },
  { id: 8, name: "الصف الثامن" },
  { id: 9, name: "الصف التاسع" },
]

const subjectsList = [
  "اللغة العربية",
  "اللغة الإنجليزية",
  "الرياضيات",
  "العلوم والحياة",
  "التربية الدينية",
  "الدراسات الاجتماعية",
  "التكنولوجيا",
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([])
  const [newName, setNewName] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newSubject, setNewSubject] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)

  // Assignment form
  const [assignTeacherId, setAssignTeacherId] = useState("")
  const [assignGrade, setAssignGrade] = useState("1")
  const [assignSemester, setAssignSemester] = useState("first")
  const [assignSubject, setAssignSubject] = useState(subjectsList[0])

  const reload = useCallback(async () => {
    const [t, a] = await Promise.all([fetchTeachers(), fetchTeacherAssignments()])
    setTeachers(t)
    setAssignments(a)
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  async function handleAdd() {
    if (!newName.trim()) {
      toast.error("يرجى إدخال اسم المعلم")
      return
    }
    const created = await createTeacher(newName.trim(), newPhone.trim(), newSubject.trim())
    if (!created) {
      toast.error("حدث خطأ أثناء إضافة المعلم")
      return
    }
    setNewName("")
    setNewPhone("")
    setNewSubject("")
    setAddOpen(false)
    void reload()
    toast.success("تمت إضافة المعلم بنجاح")
  }

  async function handleDelete(id: string) {
    await deleteTeacherById(id)
    void reload()
    toast.success("تم حذف المعلم بنجاح")
  }

  async function handleAssign() {
    if (!assignTeacherId) {
      toast.error("يرجى اختيار المعلم")
      return
    }
    const created = await createTeacherAssignment(
      assignTeacherId,
      Number(assignGrade),
      assignSemester,
      assignSubject
    )
    if (!created) {
      toast.error("حدث خطأ أثناء تعيين المعلم")
      return
    }
    setAssignOpen(false)
    void reload()
    toast.success("تم تعيين المعلم للمادة بنجاح")
  }

  async function handleRemoveAssignment(id: string) {
    await deleteTeacherAssignmentById(id)
    void reload()
    toast.success("تم إزالة التعيين")
  }

  function getTeacherName(id: string): string {
    return teachers.find((t) => t.id === id)?.name || "غير معروف"
  }

  function getTeacherAssignmentsList(teacherId: string): TeacherAssignment[] {
    return assignments.filter((a) => a.teacherId === teacherId)
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6 text-right"
    >
      {/* Header section with add options */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 border border-slate-100 rounded-2xl shadow-sm shadow-slate-100/40">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">سجل المعلمين</h1>
            <p className="text-xs sm:text-sm text-slate-400">إدارة المعلمين وتعيينهم للمواد والصفوف الأكاديمية المختلفة</p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-10 border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 rounded-xl text-xs sm:text-sm font-bold flex-1 sm:flex-none">
                <BookOpen className="h-4 w-4 text-slate-450" />
                <span>تعيين معلم لمادة</span>
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl" className="text-right bg-white border-slate-100 rounded-2xl max-w-md">
              <DialogHeader>
                <DialogTitle className="text-slate-800 font-extrabold text-lg flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  تعيين معلم لمادة دراسية
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-slate-750 text-xs sm:text-sm">المعلم</Label>
                  <Select value={assignTeacherId} onValueChange={setAssignTeacherId}>
                    <SelectTrigger className="bg-slate-55/40 border-slate-200 rounded-xl h-10">
                      <SelectValue placeholder="اختر المعلم من القائمة" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} {t.subject ? `(${t.subject})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-slate-750 text-xs sm:text-sm">الصف</Label>
                    <Select value={assignGrade} onValueChange={setAssignGrade}>
                      <SelectTrigger className="bg-slate-55/40 border-slate-200 rounded-xl h-10">
                        <SelectValue placeholder="اختر الصف" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.map((g) => (
                          <SelectItem key={g.id} value={String(g.id)}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-750 text-xs sm:text-sm">الفصل الدراسي</Label>
                    <Select value={assignSemester} onValueChange={setAssignSemester}>
                      <SelectTrigger className="bg-slate-55/40 border-slate-200 rounded-xl h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first">الفصل الأول</SelectItem>
                        <SelectItem value="second">الفصل الثاني</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-750 text-xs sm:text-sm">المادة الدراسية</Label>
                  <Select value={assignSubject} onValueChange={setAssignSubject}>
                    <SelectTrigger className="bg-slate-55/40 border-slate-200 rounded-xl h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectsList.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <DialogClose asChild>
                    <Button variant="outline" className="border-slate-200 text-slate-650 rounded-xl hover:bg-slate-50">إلغاء</Button>
                  </DialogClose>
                  <Button onClick={handleAssign} className="bg-gradient-to-r from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl px-5 font-bold h-10 border-0 shadow-md">
                    تأكيد التعيين
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-650 hover:to-purple-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/10 border-0 flex items-center gap-1.5 flex-1 sm:flex-none">
                <Plus className="h-4.5 w-4.5" />
                <span>إضافة معلم جديد</span>
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl" className="text-right bg-white border-slate-100 rounded-2xl max-w-md">
              <DialogHeader>
                <DialogTitle className="text-slate-805 font-extrabold text-lg flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  تسجيل معلم جديد
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold text-xs sm:text-sm">اسم المعلم</Label>
                  <Input
                    placeholder="أدخل الاسم الكامل للمعلم"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-slate-55/40 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl h-10 text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold text-xs sm:text-sm">رقم الهاتف</Label>
                  <Input
                    placeholder="مثال: 0599123456"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    dir="ltr"
                    className="bg-slate-55/40 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl h-10 text-right text-slate-800 placeholder:text-right"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold text-xs sm:text-sm">التخصص الأساسي</Label>
                  <Select value={newSubject} onValueChange={setNewSubject}>
                    <SelectTrigger className="bg-slate-55/40 border-slate-200 rounded-xl h-10">
                      <SelectValue placeholder="اختر التخصص" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectsList.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <DialogClose asChild>
                    <Button variant="outline" className="border-slate-200 text-slate-650 rounded-xl hover:bg-slate-50">إلغاء</Button>
                  </DialogClose>
                  <Button onClick={handleAdd} className="bg-gradient-to-r from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl px-5 font-bold h-10 border-0 shadow-md">
                    إضافة المعلم
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Teachers Grid */}
      <motion.div variants={itemVariants}>
        {teachers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3.5">
              <UserCheck className="h-7 w-7 text-slate-350" />
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-700">لا يوجد معلمون مسجلون حالياً</p>
            <p className="text-xs text-slate-400 mt-1">ابدأ بالضغط على زر &quot;إضافة معلم جديد&quot; بالأعلى لتسجيل كادر التدريس.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => {
              const teacherAssigns = getTeacherAssignmentsList(teacher.id)
              return (
                <Card
                  key={teacher.id}
                  className="border-slate-100 bg-white shadow-sm shadow-slate-100/40 hover:shadow-md transition-all duration-200 relative overflow-hidden group rounded-2xl"
                >
                  <CardContent className="p-5 flex flex-col justify-between h-full min-h-[175px]">
                    <div>
                      {/* Top Header Card row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                            <AvatarFallback className="bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 font-extrabold text-xs">
                              {teacher.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-right">
                            <h3 className="font-bold text-slate-800 text-xs sm:text-sm truncate max-w-[140px]">{teacher.name}</h3>
                            {teacher.phone && (
                              <p className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold mt-0.5" dir="ltr">
                                <Phone className="h-3 w-3 text-slate-350" />
                                <span>{teacher.phone}</span>
                              </p>
                            )}
                          </div>
                        </div>

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
                          <AlertDialogContent className="bg-white border-slate-100 rounded-2xl text-right max-w-md">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-slate-800 font-extrabold">حذف المعلم</AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-500">
                                هل أنت متأكد من حذف المعلم &quot;{teacher.name}&quot;؟ سيتم إلغاء جميع تعييناته للمواد الدراسية.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex gap-2 justify-end mt-2">
                              <AlertDialogCancel className="border-slate-200 text-slate-655 rounded-xl hover:bg-slate-50">إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(teacher.id)}
                                className="bg-rose-650 hover:bg-rose-700 text-white rounded-xl border-0 shadow-md shadow-rose-650/10"
                              >
                                نعم، احذف المعلم
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      {/* Primary Subject specialty */}
                      {teacher.subject && (
                        <div className="mb-3.5 flex justify-start">
                          <Badge variant="secondary" className="bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold">
                            <BookOpen className="ml-1 h-3 w-3 text-indigo-500" />
                            <span>تخصص: {teacher.subject}</span>
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Classes assigned list */}
                    <div className="border-t border-slate-50 pt-3 mt-auto">
                      <p className="text-[10px] text-slate-400 font-bold mb-1.5">التعيينات الدراسية:</p>
                      {teacherAssigns.length === 0 ? (
                        <p className="text-[10px] text-slate-400 font-medium">لم يتم التعيين لأي مادة دراسية بعد</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 justify-start">
                          {teacherAssigns.slice(0, 3).map((a) => {
                            const gradeName = grades.find((g) => g.id === a.gradeId)?.name || ""
                            return (
                              <Badge
                                key={a.id}
                                variant="outline"
                                className="bg-slate-50 border-slate-100 text-slate-600 rounded-md text-[9px] font-bold flex items-center gap-1 group/badge"
                              >
                                <span>{a.subject} ({gradeName})</span>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    void handleRemoveAssignment(a.id);
                                  }}
                                  className="text-slate-400 hover:text-rose-500 rounded p-[1px] hover:bg-rose-50 flex-shrink-0"
                                  title="إلغاء التعيين"
                                >
                                  <X className="h-2 w-2" />
                                </button>
                              </Badge>
                            )
                          })}
                          {teacherAssigns.length > 3 && (
                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[9px] rounded-md font-bold">
                              +{teacherAssigns.length - 3} صفوف أخرى
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
