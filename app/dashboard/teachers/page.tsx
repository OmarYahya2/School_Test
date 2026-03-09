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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-sky-100 text-sky-700 border-sky-200">
            <GraduationCap className="ml-1 h-3 w-3" />
            المعلمون
          </Badge>
        </div>
        <div className="flex gap-2">
          <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-10 border-sky-200 text-sky-700 hover:bg-sky-50 gap-2">
                <BookOpen className="h-4 w-4" />
                تعيين لمادة
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl" className="text-right bg-gradient-to-br from-sky-50 via-white to-blue-50 border-sky-200">
              <DialogHeader>
                <DialogTitle className="text-gray-800 flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-gradient-to-r from-sky-500 to-blue-500" />
                  تعيين معلم لمادة
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-gray-700">المعلم</Label>
                  <Select
                    value={assignTeacherId}
                    onValueChange={setAssignTeacherId}
                  >
                    <SelectTrigger className="bg-white border-sky-200 focus:border-sky-500">
                      <SelectValue placeholder="اختر المعلم" />
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
                <div className="space-y-2">
                  <Label className="text-gray-700">الصف</Label>
                  <Select value={assignGrade} onValueChange={setAssignGrade}>
                    <SelectTrigger className="bg-white border-sky-200 focus:border-sky-500">
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
                <div className="space-y-2">
                  <Label className="text-gray-700">الفصل الدراسي</Label>
                  <Select
                    value={assignSemester}
                    onValueChange={setAssignSemester}
                  >
                    <SelectTrigger className="bg-white border-indigo-200 focus:border-indigo-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first">الفصل الأول</SelectItem>
                      <SelectItem value="second">الفصل الثاني</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">المادة</Label>
                  <Select
                    value={assignSubject}
                    onValueChange={setAssignSubject}
                  >
                    <SelectTrigger className="bg-white border-indigo-200 focus:border-indigo-500">
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
                <div className="flex gap-2 justify-end">
                  <DialogClose asChild>
                    <Button variant="outline" className="bg-white border-gray-200">إلغاء</Button>
                  </DialogClose>
                  <Button
                    onClick={handleAssign}
                    className="bg-sky-600 hover:bg-sky-700 text-white"
                  >
                    <BookOpen className="ml-2 h-4 w-4" />
                    تعيين
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-md gap-2 px-6">
                <Plus className="h-5 w-5" />
                إضافة معلم
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl" className="text-right bg-gradient-to-br from-sky-50 via-white to-blue-50 border-sky-200">
              <DialogHeader>
                <DialogTitle className="text-gray-800 flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-gradient-to-r from-sky-500 to-blue-500" />
                  إضافة معلم جديد
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-gray-700">اسم المعلم</Label>
                  <Input
                    placeholder="أدخل اسم المعلم"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-white border-sky-200 focus:border-sky-500"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">رقم الهاتف</Label>
                  <Input
                    placeholder="رقم الهاتف"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    dir="ltr"
                    className="bg-white border-indigo-200 focus:border-indigo-500 text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">التخصص</Label>
                  <Select
                    value={newSubject}
                    onValueChange={setNewSubject}
                  >
                    <SelectTrigger className="bg-white border-indigo-200 focus:border-indigo-500">
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
                <div className="flex gap-2 justify-end">
                  <DialogClose asChild>
                    <Button variant="outline" className="bg-white border-gray-200">إلغاء</Button>
                  </DialogClose>
                  <Button
                    onClick={handleAdd}
                    className="bg-sky-600 hover:bg-sky-700 text-white"
                  >
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
      <Card className="border-0 shadow-sm bg-gradient-to-br from-sky-50 via-white to-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-20 w-20 bg-gradient-to-br from-sky-100 to-blue-100 rounded-2xl flex items-center justify-center border-2 border-sky-200 shadow-lg">
                <Users className="h-10 w-10 text-sky-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 border-2 border-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent">المعلمون</h1>
              <p className="text-gray-600 mt-1">
                إدارة المعلمين وتعيينهم للمواد في الصفوف • {teachers.length} معلم
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {teachers.length === 0 ? (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-700 mb-1">لا يوجد معلمون بعد</p>
            <p className="text-sm text-gray-500 mb-4">أضف معلماً جديداً للبدء</p>
            <Button onClick={() => setAddOpen(true)} className="bg-sky-600 hover:bg-sky-700">
              <Plus className="ml-2 h-4 w-4" />
              إضافة معلم
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => {
            const teacherAssigns = getTeacherAssignmentsList(teacher.id)
            return (
              <Card
                key={teacher.id}
                className="border-0 shadow-sm bg-gradient-to-br from-sky-50 via-white to-blue-50 hover:shadow-md transition-all duration-200 group"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-sky-200">
                        <AvatarFallback className="bg-gradient-to-br from-sky-100 to-blue-100 text-sky-700 font-bold">
                          {teacher.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-gray-800">{teacher.name}</h3>
                        {teacher.phone && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {teacher.phone}
                          </p>
                        )}
                      </div>
                    </div>
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
                            حذف المعلم
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600">
                            هل أنت متأكد من حذف المعلم &quot;{teacher.name}&quot;؟
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex gap-2">
                          <AlertDialogCancel className="bg-white border-gray-200">إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(teacher.id)}
                            className="bg-rose-600 hover:bg-rose-700 text-white"
                          >
                            <Trash2 className="ml-2 h-4 w-4" />
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {/* Subject Badge */}
                  {teacher.subject && (
                    <div className="mb-3">
                      <Badge variant="secondary" className="bg-sky-100 text-sky-700 border-sky-200">
                        <BookOpen className="ml-1 h-3 w-3" />
                        {teacher.subject}
                      </Badge>
                    </div>
                  )}

                  {/* Assignments */}
                  <div className="space-y-2">
                    {teacherAssigns.length === 0 ? (
                      <p className="text-xs text-gray-400">لم يتم التعيين لأي مادة</p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {teacherAssigns.slice(0, 3).map((a) => {
                          const gradeName = grades.find((g) => g.id === a.gradeId)?.name || ""
                          return (
                            <Badge
                              key={a.id}
                              variant="secondary"
                              className="bg-sky-100 text-sky-700 border-sky-200 text-xs"
                            >
                              {a.subject} | {gradeName}
                            </Badge>
                          )
                        })}
                        {teacherAssigns.length > 3 && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                            +{teacherAssigns.length - 3}
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
    </div>
  )
}
