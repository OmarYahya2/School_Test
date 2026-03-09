"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Plus,
  ArrowLeft,
  Search,
  Filter,
  Download,
  FileText,
  Users,
  User,
  GraduationCap,
  Phone,
  Calendar,
  Trash2,
  StickyNote,
  ArrowUpDown,
  ChevronDown,
  UserCircle,
  School,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { Student, SchoolClass } from "@/lib/store"
import {
  fetchStudents,
  createStudent,
  deleteStudentById,
  fetchClasses,
} from "@/lib/supabase-school"

// Note type for parsing notes
type Note = {
  id: string
  content: string
  createdAt: string
  updatedAt?: string
  category?: "academic" | "behavioral" | "general" | "health"
  author?: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")
  const [addOpen, setAddOpen] = useState(false)
  const [viewStudent, setViewStudent] = useState<Student | null>(null)

  // New student form
  const [newName, setNewName] = useState("")
  const [newAge, setNewAge] = useState("")
  const [newParentPhone, setNewParentPhone] = useState("")
  const [newNotes, setNewNotes] = useState("")
  const [newClassId, setNewClassId] = useState("")

  // Parse notes function
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

  const reload = useCallback(async () => {
    const [studentsData, classesData] = await Promise.all([
      fetchStudents(),
      fetchClasses(),
    ])
    setStudents(studentsData)
    setClasses(classesData)
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  async function handleAddStudent() {
    if (!newName.trim()) {
      toast.error("يرجى إدخال اسم الطالب")
      return
    }
    if (!newClassId) {
      toast.error("يرجى اختيار الصف")
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
      newClassId,
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
    setNewClassId("")
    setAddOpen(false)
    void reload()
    toast.success("تمت إضافة الطالب بنجاح")
  }

  async function handleDeleteStudent(id: string) {
    await deleteStudentById(id)
    void reload()
    toast.success("تم حذف الطالب بنجاح")
  }

  function getClassName(classId: string): string {
    const cls = classes.find((c) => c.id === classId)
    return cls ? cls.name : "غير معروف"
  }

  // Filter students based on search and filters
  const filteredStudents = students
    .filter((student) => {
      const notes = parseNotes(student.notes || "")
      const notesContent = notes.map(n => n.content).join(" ").toLowerCase()
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.parentPhone?.includes(searchTerm) ||
                           notesContent.includes(searchTerm.toLowerCase())
      const matchesClass = selectedClass === "all" || student.classId === selectedClass
      
      return matchesSearch && matchesClass
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "age":
          comparison = a.age - b.age
          break
        case "class":
          comparison = getClassName(a.classId).localeCompare(getClassName(b.classId))
          break
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        default:
          comparison = a.name.localeCompare(b.name)
      }
      return comparison
    })

  // Export functions
  const exportToExcel = () => {
    const headers = ["اسم الطالب", "العمر", "الصف الدراسي", "هاتف ولي الأمر", "تاريخ التسجيل", "عدد الملاحظات"]
    const excelData = filteredStudents.map(student => {
      const notes = parseNotes(student.notes || "")
      return {
        "اسم الطالب": student.name,
        "العمر": student.age + " سنة",
        "الصف الدراسي": getClassName(student.classId),
        "هاتف ولي الأمر": student.parentPhone || "لا يوجد",
        "تاريخ التسجيل": new Date(student.createdAt).toLocaleDateString("ar-EG", { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        "عدد الملاحظات": notes.length + " ملاحظة"
      }
    })
    
    const worksheet = [
      headers,
      ...excelData.map(row => headers.map(header => row[header as keyof typeof row] || ""))
    ]
    
    const csvContent = worksheet.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `بيانات_الطلاب_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success("تم تصدير البيانات لـ Excel بنجاح")
  }

  const exportToWord = () => {
    let wordContent = `
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Arial', sans-serif; direction: rtl; margin: 20px; background-color: #f8fafc; }
          h1 { color: #475569; font-size: 20px; margin-bottom: 20px; font-weight: 600; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 20px; background: white; border-radius: 8px; overflow: hidden; }
          th { background-color: #f1f5f9; border: 1px solid #e2e8f0; padding: 12px; text-align: right; font-weight: 600; color: #475569; }
          td { border: 1px solid #e2e8f0; padding: 10px; text-align: right; color: #64748b; }
          .header { background-color: #64748b; color: white; font-size: 14px; }
          .summary { background-color: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="summary">
          <h1>تقرير بيانات الطلاب</h1>
          <p><strong>تاريخ التصدير:</strong> ${new Date().toLocaleDateString("ar-EG", { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p><strong>إجمالي الطلاب:</strong> ${filteredStudents.length} طالب</p>
        </div>
        
        <table>
          <thead>
            <tr class="header">
              <th>اسم الطالب</th>
              <th>العمر</th>
              <th>الصف الدراسي</th>
              <th>هاتف ولي الأمر</th>
              <th>تاريخ التسجيل</th>
              <th>عدد الملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${filteredStudents.map(student => {
              const notes = parseNotes(student.notes || "")
              return `
              <tr>
                <td>${student.name}</td>
                <td>${student.age} سنة</td>
                <td>${getClassName(student.classId)}</td>
                <td>${student.parentPhone || "لا يوجد"}</td>
                <td>${new Date(student.createdAt).toLocaleDateString("ar-EG")}</td>
                <td>${notes.length} ملاحظة</td>
              </tr>
            `}).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <p style="color: #94a3b8; font-size: 12px;"><strong>ملاحظات:</strong> هذا التقرير تم إنشاؤه تلقائياً من نظام إدارة المدرسة</p>
        </div>
      </body>
      </html>
    `
    
    const blob = new Blob(["\uFEFF" + wordContent], { type: "application/msword;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `تقرير_الطلاب_${new Date().toISOString().split('T')[0]}.doc`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success("تم تصدير البيانات لـ Word بنجاح")
  }

  const stats = {
    totalStudents: students.length,
    averageAge: students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.age, 0) / students.length) : 0,
    totalClasses: classes.length,
    studentsWithPhone: students.filter(s => s.parentPhone).length,
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  // Generate soft color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-slate-200 text-slate-600",
      "bg-zinc-200 text-zinc-600",
      "bg-neutral-200 text-neutral-600",
      "bg-stone-200 text-stone-600",
      "bg-gray-200 text-gray-600",
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                <GraduationCap className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-700">الطلاب</h1>
                <p className="text-sm text-gray-500">
                  إدارة سجل الطلاب في المدرسة
                </p>
              </div>
            </div>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-lg shadow-sm">
                  <Plus className="h-4 w-4" />
                  إضافة طالب
                </Button>
              </DialogTrigger>
              <DialogContent dir="rtl" className="text-right max-w-md bg-white border-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-gray-700 font-semibold">إضافة طالب جديد</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 pt-2">
                  <div className="flex flex-col gap-2">
                    <Label className="text-gray-600 text-sm">اسم الطالب</Label>
                    <Input
                      placeholder="أدخل اسم الطالب"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      dir="rtl"
                      className="text-right border-gray-200 focus:border-gray-400 focus:ring-gray-200"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-gray-600 text-sm">العمر</Label>
                    <Input
                      type="number"
                      placeholder="العمر"
                      value={newAge}
                      onChange={(e) => setNewAge(e.target.value)}
                      min={3}
                      max={25}
                      dir="rtl"
                      className="text-right border-gray-200 focus:border-gray-400 focus:ring-gray-200"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-gray-600 text-sm">الصف</Label>
                    <Select value={newClassId} onValueChange={setNewClassId}>
                      <SelectTrigger className="border-gray-200">
                        <SelectValue placeholder="اختر الصف" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-gray-600 text-sm">هاتف ولي الأمر</Label>
                    <Input
                      placeholder="رقم هاتف ولي الأمر"
                      value={newParentPhone}
                      onChange={(e) => setNewParentPhone(e.target.value)}
                      dir="ltr"
                      className="text-right border-gray-200 focus:border-gray-400 focus:ring-gray-200"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-gray-600 text-sm">ملاحظات</Label>
                    <Textarea
                      placeholder="ملاحظات إضافية (اختياري)"
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      rows={3}
                      dir="rtl"
                      className="text-right border-gray-200 focus:border-gray-400 focus:ring-gray-200 resize-none"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <DialogClose asChild>
                      <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50">
                        إلغاء
                      </Button>
                    </DialogClose>
                    <Button onClick={handleAddStudent} className="bg-blue-600 hover:bg-blue-700 text-white">
                      إضافة
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards - Minimal Design */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">إجمالي الطلاب</p>
                <p className="text-2xl font-semibold text-slate-800">{stats.totalStudents}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-slate-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">متوسط العمر</p>
                <p className="text-2xl font-semibold text-slate-800">{stats.averageAge}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-slate-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">الصفوف الدراسية</p>
                <p className="text-2xl font-semibold text-slate-800">{stats.totalClasses}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <School className="h-5 w-5 text-slate-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">مع أرقام تواصل</p>
                <p className="text-2xl font-semibold text-slate-800">{stats.studentsWithPhone}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Phone className="h-5 w-5 text-slate-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-medium text-slate-700">البحث والتصفية</h2>
              </div>
              <span className="text-xs text-slate-400">
                {filteredStudents.length} طالب
              </span>
            </div>
          </div>
          <div className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              {/* Search */}
              <div className="flex-1">
                <Label className="text-xs text-slate-500 mb-2 block">البحث</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="البحث بالاسم، الهاتف، أو الملاحظات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 border-slate-200 focus:border-slate-400 focus:ring-slate-200"
                  />
                </div>
              </div>

              {/* Class Filter */}
              <div className="w-full md:w-48">
                <Label className="text-xs text-slate-500 mb-2 block">الصف</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="border-slate-200">
                    <SelectValue placeholder="جميع الصفوف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الصفوف</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="w-full md:w-48">
                <Label className="text-xs text-slate-500 mb-2 block">الترتيب</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="border-slate-200">
                    <ArrowUpDown className="h-4 w-4 ml-2 text-slate-400" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">الاسم</SelectItem>
                    <SelectItem value="age">العمر</SelectItem>
                    <SelectItem value="class">الصف</SelectItem>
                    <SelectItem value="createdAt">تاريخ التسجيل</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Export */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 gap-2">
                    <Download className="h-4 w-4" />
                    تصدير
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-slate-200">
                  <DropdownMenuItem onClick={exportToExcel} className="gap-2 text-slate-700">
                    <FileText className="h-4 w-4" />
                    تصدير لـ Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToWord} className="gap-2 text-slate-700">
                    <FileText className="h-4 w-4" />
                    تصدير لـ Word
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                <UserCircle className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-lg font-medium text-slate-600">
                {searchTerm || selectedClass !== "all" ? "لا توجد نتائج للبحث" : "لا يوجد طلاب بعد"}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {searchTerm || selectedClass !== "all" 
                  ? "جرب تغيير معايير البحث أو التصفية" 
                  : "أضف طالباً جديداً للبدء"
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      الطالب
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      العمر
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      الصف
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      هاتف ولي الأمر
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      التسجيل
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      الملاحظات
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider w-20">
                      
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => (
                    <tr 
                      key={student.id} 
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${getAvatarColor(student.name)}`}>
                            {getInitials(student.name)}
                          </div>
                          <div>
                            <Link 
                              href={`/dashboard/student/${student.id}`}
                              className="font-medium text-slate-700 hover:text-slate-900 transition-colors"
                            >
                              {student.name}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-600">{student.age} سنة</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 font-normal">
                          {getClassName(student.classId)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center" dir="ltr">
                        <span className="text-sm text-slate-600 font-mono">
                          {student.parentPhone || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-500">
                          {new Date(student.createdAt).toLocaleDateString("ar-EG", {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const notes = parseNotes(student.notes || "")
                          const notesCount = notes.length
                          return notesCount > 0 ? (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 transition-colors"
                            >
                              <Link href={`/dashboard/student/${student.id}/notes`}>
                                <StickyNote className="ml-1 h-3 w-3" />
                                <span className="text-xs font-medium">{notesCount}</span>
                              </Link>
                            </Button>
                          ) : (
                            <div className="flex items-center justify-center">
                              <div className="h-6 px-2 flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                                <span className="text-gray-400 text-xs">-</span>
                              </div>
                            </div>
                          )
                        })()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button 
                            asChild 
                            variant="ghost" 
                            size="sm"
                            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                          >
                            <Link href={`/dashboard/class/${student.classId}`}>
                              عرض
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white border-slate-200">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-slate-800">حذف الطالب</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-500">
                                  هل أنت متأكد من حذف الطالب &quot;{student.name}&quot;؟
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex gap-2">
                                <AlertDialogCancel className="border-slate-200 text-slate-600 hover:bg-slate-50">
                                  إلغاء
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteStudent(student.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
