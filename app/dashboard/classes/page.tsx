"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, Pencil, Trash2, BookOpen, Users, GraduationCap, Search, Filter, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
      teacherId: editTeacherId || null,
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
    if (!teacherId) return "لم يتم التعيين"
    const t = teachers.find((t) => t.id === teacherId)
    return t ? t.name : "غير معروف"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
            <GraduationCap className="ml-1 h-3 w-3" />
            الصفوف الدراسية
          </Badge>
        </div>
        <div className="flex gap-2">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md gap-2 px-6">
                <Plus className="h-5 w-5" />
                إضافة صف
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl" className="text-right bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-emerald-200">
              <DialogHeader>
                <DialogTitle className="text-gray-800 flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                  إضافة صف جديد
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-gray-700">اسم الصف</Label>
                  <Input
                    placeholder="مثال: الصف الأول"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    className="bg-white border-emerald-200 focus:border-emerald-500"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">المعلم المسؤول (اختياري)</Label>
                  <Select
                    value={newClassTeacherId}
                    onValueChange={setNewClassTeacherId}
                  >
                    <SelectTrigger className="bg-white border-emerald-200 focus:border-emerald-500">
                      <SelectValue placeholder="اختر المعلم" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <DialogClose asChild>
                    <Button variant="outline" className="bg-white border-gray-200">إلغاء</Button>
                  </DialogClose>
                  <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Page Title */}
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent">الصفوف الدراسية</h1>
              <p className="text-gray-600 mt-1">
                إدارة جميع الصفوف في المدرسة • {classes.length} صف
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {classes.length === 0 ? (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-700 mb-1">لا توجد صفوف بعد</p>
            <p className="text-sm text-gray-500 mb-4">أضف صفاً جديداً للبدء</p>
            <Button onClick={() => setAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="ml-2 h-4 w-4" />
              إضافة صف
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => {
            const studentCount = studentCounts[cls.id] ?? 0
            return (
              <Card
                key={cls.id}
                className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 via-white to-teal-50 hover:shadow-md transition-all duration-200 group"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <Link
                      href={`/dashboard/class/${cls.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="h-12 w-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center border-2 border-amber-200 shadow-sm">
                        <BookOpen className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 hover:text-emerald-600 transition-colors">
                          {cls.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          المعلم: {getTeacherName(cls.teacherId)}
                        </p>
                      </div>
                    </Link>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingClass(cls)
                          setEditName(cls.name)
                          setEditTeacherId(cls.teacherId || "")
                          setEditOpen(true)
                        }}
                        className="h-8 w-8 p-0 text-gray-600 hover:bg-emerald-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-600 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gradient-to-br from-rose-50 via-white to-pink-50 border-rose-200">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-gray-800 flex items-center gap-2">
                              <div className="h-4 w-4 rounded-full bg-rose-500" />
                              حذف الصف
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600">
                              هل أنت متأكد من حذف صف &quot;{cls.name}&quot;؟ سيتم حذف جميع الطلاب وسجلات الحضور المرتبطة.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex gap-2">
                            <AlertDialogCancel className="bg-white border-gray-200">إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(cls.id)}
                              className="bg-rose-600 hover:bg-rose-700 text-white"
                            >
                              <Trash2 className="ml-2 h-4 w-4" />
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/class/${cls.id}`}
                    className="flex items-center justify-between"
                  >
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1">
                      <Users className="h-3 w-3" />
                      {studentCount} طالب
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-8 text-emerald-600 hover:bg-emerald-50 gap-1">
                      عرض الصف
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent dir="rtl" className="text-right bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-emerald-200">
          <DialogHeader>
            <DialogTitle className="text-gray-800 flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
              تعديل الصف
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="space-y-2">
              <Label className="text-gray-700">اسم الصف</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEdit()}
                className="bg-white border-emerald-200 focus:border-emerald-500"
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">المعلم المسؤول (اختياري)</Label>
              <Select
                value={editTeacherId}
                onValueChange={setEditTeacherId}
              >
                <SelectTrigger className="bg-white border-emerald-200 focus:border-emerald-500">
                  <SelectValue placeholder="اختر المعلم" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <DialogClose asChild>
                <Button variant="outline" className="bg-white border-gray-200">إلغاء</Button>
              </DialogClose>
              <Button onClick={handleEdit} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Pencil className="ml-2 h-4 w-4" />
                حفظ التعديلات
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
