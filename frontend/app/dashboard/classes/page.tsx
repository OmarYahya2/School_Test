"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, Pencil, Trash2, BookOpen, Users, GraduationCap, Search, Filter, ArrowUpRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import type { SchoolClass, Teacher } from "@/lib/store"
import { fetchTeachers } from "@/lib/supabase-teachers"
import {
  fetchClasses,
  createClass,
  updateClassById,
  deleteClassById,
  fetchStudents,
} from "@/lib/supabase-school"
import { motion, AnimatePresence } from "framer-motion"

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

export default function ClassesPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [newClassName, setNewClassName] = useState("")
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null)
  const [editName, setEditName] = useState("")
  const [newClassTeacherId, setNewClassTeacherId] = useState("")
  const [editTeacherId, setEditTeacherId] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({})

  const reload = useCallback(async () => {
    const [cls, t, students] = await Promise.all([
      fetchClasses(),
      fetchTeachers(),
      fetchStudents(),
    ])
    setClasses(cls)
    setTeachers(t)
    const counts: Record<string, number> = {}
    students.forEach((s) => {
      counts[s.classId] = (counts[s.classId] || 0) + 1
    })
    setStudentCounts(counts)
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  async function handleAdd() {
    if (!newClassName.trim()) {
      toast.error("يرجى إدخال اسم الصف")
      return
    }
    const created = await createClass(newClassName.trim())
    if (!created) {
      toast.error("حدث خطأ أثناء إضافة الصف")
      return
    }
    if (newClassTeacherId) {
      await updateClassById(created.id, { teacherId: newClassTeacherId })
    }
    setNewClassName("")
    setNewClassTeacherId("")
    setAddOpen(false)
    void reload()
    toast.success("تمت إضافة الصف بنجاح")
  }

  async function handleEdit() {
    if (!editingClass || !editName.trim()) return
    const updated = await updateClassById(editingClass.id, {
      name: editName.trim(),
      teacherId: editTeacherId === "none" ? null : editTeacherId,
    })
    if (!updated) {
      toast.error("حدث خطأ أثناء تعديل الصف")
      return
    }
    setEditingClass(null)
    setEditName("")
    setEditTeacherId("")
    setEditOpen(false)
    void reload()
    toast.success("تم تعديل الصف بنجاح")
  }

  async function handleDelete(id: string) {
    await deleteClassById(id)
    void reload()
    toast.success("تم حذف الصف بنجاح")
  }

  function getTeacherName(teacherId: string | null): string {
    if (!teacherId) return "لم يتم تعيين مربي"
    const t = teachers.find((t) => t.id === teacherId)
    return t ? t.name : "غير معروف"
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6 text-right"
    >
      {/* Header card with action controls */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 border border-slate-100 rounded-2xl shadow-sm shadow-slate-100/40">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">الصفوف الدراسية</h1>
            <p className="text-xs sm:text-sm text-slate-400">إدارة صفوف المدرسة وتعيين مربي الصفوف ومتابعة الكثافة الطلابية</p>
          </div>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 bg-gradient-to-r from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/10 border-0 flex items-center gap-1.5 w-full sm:w-auto">
              <Plus className="h-4.5 w-4.5" />
              <span>إضافة صف جديد</span>
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl" className="text-right bg-white border-slate-100 rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-slate-805 font-extrabold text-lg flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                إنشاء صف دراسي جديد
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-bold text-xs sm:text-sm">اسم الصف</Label>
                <Input
                  placeholder="مثال: الصف الخامس (أ)"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="bg-slate-55/40 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl h-10 text-slate-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-bold text-xs sm:text-sm">مربي الصف</Label>
                <Select value={newClassTeacherId} onValueChange={setNewClassTeacherId}>
                  <SelectTrigger className="bg-slate-55/40 border-slate-200 rounded-xl h-10">
                    <SelectValue placeholder="اختر المعلم (اختياري)" />
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
              <div className="flex gap-2 justify-end pt-2">
                <DialogClose asChild>
                  <Button variant="outline" className="border-slate-200 text-slate-650 rounded-xl hover:bg-slate-50">إلغاء</Button>
                </DialogClose>
                <Button onClick={handleAdd} className="bg-gradient-to-r from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl px-5 font-bold h-10 border-0 shadow-md">
                  إنشاء الصف
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Classes Grid */}
      <motion.div variants={itemVariants}>
        {classes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3.5">
              <BookOpen className="h-7 w-7 text-slate-350" />
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-700">لا توجد صفوف دراسية مسجلة حالياً</p>
            <p className="text-xs text-slate-400 mt-1">ابدأ بالضغط على زر &quot;إضافة صف جديد&quot; بالأعلى لتسجيل الصفوف.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => {
              const count = studentCounts[cls.id] || 0
              const capacityPercent = Math.min((count / 30) * 100, 100)
              return (
                <Card
                  key={cls.id}
                  className="border-slate-100 bg-white shadow-sm shadow-slate-100/40 hover:shadow-md transition-all duration-200 relative overflow-hidden group rounded-2xl"
                >
                  <CardContent className="p-5 flex flex-col justify-between h-full min-h-[175px]">
                    <div>
                      {/* Top Header details */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="text-right">
                          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">{cls.name}</h3>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                            مربي الصف: {getTeacherName(cls.teacherId)}
                          </span>
                        </div>

                        {/* Quick edit triggers */}
                        <div className="flex gap-1">
                          <Dialog open={editOpen && editingClass?.id === cls.id} onOpenChange={(v) => {
                            if (v) {
                              setEditingClass(cls)
                              setEditName(cls.name)
                              setEditTeacherId(cls.teacherId || "none")
                            }
                            setEditOpen(v)
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent dir="rtl" className="text-right bg-white border-slate-100 rounded-2xl max-w-md">
                              <DialogHeader>
                                <DialogTitle className="text-slate-850 font-extrabold text-lg flex items-center gap-2">
                                  <Pencil className="h-4.5 w-4.5 text-indigo-500" />
                                  تعديل بيانات الصف الدراسي
                                </DialogTitle>
                              </DialogHeader>
                              <div className="flex flex-col gap-4 pt-2">
                                <div className="space-y-1.5">
                                  <Label className="text-slate-700 font-bold text-xs sm:text-sm">اسم الصف</Label>
                                  <Input
                                    placeholder="مثال: الصف الخامس (أ)"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="bg-slate-55/40 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl h-10 text-slate-800"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-slate-700 font-bold text-xs sm:text-sm">مربي الصف</Label>
                                  <Select value={editTeacherId} onValueChange={setEditTeacherId}>
                                    <SelectTrigger className="bg-slate-55/40 border-slate-200 rounded-xl h-10">
                                      <SelectValue placeholder="اختر المعلم" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">بدون مربي صف</SelectItem>
                                      {teachers.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                          {t.name} {t.subject ? `(${t.subject})` : ""}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex gap-2 justify-end pt-2">
                                  <DialogClose asChild>
                                    <Button variant="outline" className="border-slate-200 text-slate-655 rounded-xl hover:bg-slate-50">إلغاء</Button>
                                  </DialogClose>
                                  <Button onClick={handleEdit} className="bg-gradient-to-r from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl px-5 font-bold h-10 border-0 shadow-md">
                                    تأكيد التعديل
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

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
                                <AlertDialogTitle className="text-slate-800 font-extrabold">حذف الصف الدراسي</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-500">
                                  هل أنت متأكد من حذف الصف &quot;{cls.name}&quot;؟ سيتم فك ارتباط جميع الطلاب والغيابات والجداول المرتبطة به.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex gap-2 justify-end mt-2">
                                <AlertDialogCancel className="border-slate-200 text-slate-655 rounded-xl hover:bg-slate-50">إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(cls.id)}
                                  className="bg-rose-650 hover:bg-rose-700 text-white rounded-xl border-0 shadow-md shadow-rose-650/10"
                                >
                                  حذف الصف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {/* Student Capacity Progress indicator */}
                      <div className="space-y-1.5 mb-4 mt-2">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                          <span>{count} طالباً مسجلاً</span>
                          <span>سعة القسم: 30</span>
                        </div>
                        <Progress value={capacityPercent} className="h-1 bg-slate-100 text-indigo-500" />
                      </div>
                    </div>

                    {/* Bottom Link buttons */}
                    <div className="border-t border-slate-50 pt-3 mt-auto">
                      <Button asChild variant="outline" size="sm" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-xs h-9 flex items-center justify-between group/btn">
                        <Link href={`/dashboard/class/${cls.id}`} className="w-full flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-slate-450" />
                            <span>كشف تفاصيل الطلاب والحضور</span>
                          </span>
                          <ChevronLeft className="h-4 w-4 text-slate-400 group-hover/btn:-translate-x-0.5 transition-transform" />
                        </Link>
                      </Button>
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
