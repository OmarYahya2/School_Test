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
  Eye,
  MoreHorizontal
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
import { motion, AnimatePresence } from "framer-motion"

// Note type for parsing notes
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
    transition: {
      staggerChildren: 0.04
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")
  const [addOpen, setAddOpen] = useState(false)
  
  // Pagination state - show 10 students initially
  const [displayCount, setDisplayCount] = useState(10)
  const INITIAL_DISPLAY_COUNT = 10

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
  
  // Get displayed students
  const displayedStudents = filteredStudents.slice(0, displayCount)
  const hasMoreStudents = filteredStudents.length > displayCount

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
    
    toast.success("تم تصدير البيانات لـ CSV بنجاح")
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
        </style>
      </head>
      <body>
        <h1>تقرير بيانات الطلاب</h1>
        <p><strong>تاريخ التصدير:</strong> ${new Date().toLocaleDateString("ar-EG")}</p>
        <p><strong>إجمالي الطلاب:</strong> ${filteredStudents.length} طالب</p>
        <table>
          <thead>
            <tr class="header">
              <th>اسم الطالب</th>
              <th>العمر</th>
              <th>الصف الدراسي</th>
              <th>هاتف ولي الأمر</th>
              <th>تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody>
            ${filteredStudents.map(student => `
              <tr>
                <td>${student.name}</td>
                <td>${student.age} سنة</td>
                <td>${getClassName(student.classId)}</td>
                <td>${student.parentPhone || "لا يوجد"}</td>
                <td>${new Date(student.createdAt).toLocaleDateString("ar-EG")}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
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
    
    toast.success("تم تصدير التقرير بنجاح")
  }

  const stats = {
    totalStudents: students.length,
    averageAge: students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.age, 0) / students.length) : 0,
    totalClasses: classes.length,
    studentsWithPhone: students.filter(s => s.parentPhone).length,
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6 text-right"
    >
      {/* Header section with add student dialog */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 border border-slate-100 rounded-2xl shadow-sm shadow-slate-100/40">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">سجل الطلاب</h1>
            <p className="text-xs sm:text-sm text-slate-400">إدارة وتسجيل الطلاب وتخصيص الصفوف ومتابعة الملاحظات</p>
          </div>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-650 hover:to-purple-700 text-white rounded-xl h-10 px-5 font-bold shadow-md shadow-indigo-500/10 border-0 flex items-center gap-1.5 transition-all duration-300 hover:scale-103 active:scale-97">
              <Plus className="h-4 w-4" />
              <span>تسجيل طالب جديد</span>
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl" className="text-right max-w-md bg-white border-slate-100 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-slate-800 font-extrabold text-lg">تسجيل طالب جديد في النظام</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-slate-650 text-xs sm:text-sm">اسم الطالب الكامل</Label>
                <Input
                  placeholder="أدخل اسم الطالب رباعي"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl h-10 text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-slate-650 text-xs sm:text-sm">العمر (سنوات)</Label>
                  <Input
                    type="number"
                    placeholder="مثال: 8"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    min={3}
                    max={25}
                    className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl h-10 text-slate-850"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-650 text-xs sm:text-sm">الصف الدراسي</Label>
                  <Select value={newClassId} onValueChange={setNewClassId}>
                    <SelectTrigger className="border-slate-200 bg-slate-50 rounded-xl h-10">
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
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-650 text-xs sm:text-sm">رقم هاتف ولي الأمر</Label>
                <Input
                  placeholder="مثال: 0599123456"
                  value={newParentPhone}
                  onChange={(e) => setNewParentPhone(e.target.value)}
                  dir="ltr"
                  className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl h-10 text-right text-slate-850 placeholder:text-right"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-650 text-xs sm:text-sm">ملاحظات أولية</Label>
                <Textarea
                  placeholder="ملاحظات صحية، سلوكية، أو دراسية (اختياري)"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={3}
                  className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-850 resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <DialogClose asChild>
                  <Button variant="outline" className="border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50">
                    إلغاء
                  </Button>
                </DialogClose>
                <Button onClick={handleAddStudent} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl px-5 font-bold shadow-md shadow-indigo-500/10 border-0 h-10">
                  إضافة الطالب
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Metrics Summary cards */}
      <motion.div variants={itemVariants} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "إجمالي الطلاب", value: stats.totalStudents, icon: <Users className="h-5 w-5 text-indigo-500" /> },
          { label: "متوسط أعمار الطلاب", value: `${stats.averageAge} سنوات`, icon: <Calendar className="h-5 w-5 text-emerald-500" /> },
          { label: "الصفوف الدراسية", value: stats.totalClasses, icon: <School className="h-5 w-5 text-blue-500" /> },
          { label: "أرقام تواصل مسجلة", value: stats.studentsWithPhone, icon: <Phone className="h-5 w-5 text-amber-500" /> },
        ].map((card, index) => (
          <Card key={index} className="border-slate-100 bg-white shadow-sm shadow-slate-100/40">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-500">{card.label}</span>
                <p className="text-lg sm:text-xl font-extrabold text-slate-800 mt-1">{card.value}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                {card.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Search and Filters Section */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/40">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-800">خيارات البحث والتصفية</h2>
          </div>
          <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold">
            {filteredStudents.length} طالباً مطابقاً
          </Badge>
        </div>
        <div className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            {/* Search Input */}
            <div className="flex-1">
              <Label className="text-xs text-slate-500 mb-2 block font-semibold">ابحث بالاسم أو الهاتف</Label>
              <div className="relative">
                <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="ابحث عن طالب بالاسم أو رقم هاتف ولي الأمر..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setDisplayCount(INITIAL_DISPLAY_COUNT)
                  }}
                  className="pr-10 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl h-10 text-slate-800"
                />
              </div>
            </div>

            {/* Class Filter select */}
            <div className="w-full md:w-48">
              <Label className="text-xs text-slate-500 mb-2 block font-semibold">تصفية حسب الصف</Label>
              <Select value={selectedClass} onValueChange={(v) => {
                setSelectedClass(v)
                setDisplayCount(INITIAL_DISPLAY_COUNT)
              }}>
                <SelectTrigger className="border-slate-200 rounded-xl h-10">
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

            {/* Sort Filter select */}
            <div className="w-full md:w-48">
              <Label className="text-xs text-slate-500 mb-2 block font-semibold">ترتيب النتائج</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-slate-200 rounded-xl h-10">
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

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 rounded-xl h-10">
                  <Download className="h-4 w-4" />
                  <span>تصدير البيانات</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-slate-100 rounded-xl">
                <DropdownMenuItem onClick={exportToExcel} className="gap-2 text-slate-700 cursor-pointer font-semibold py-2">
                  <FileText className="h-4 w-4 text-emerald-500" />
                  تصدير لـ Excel (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToWord} className="gap-2 text-slate-700 cursor-pointer font-semibold py-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  تصدير تقرير Word
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Students Data Grid/Table */}
      <motion.div variants={itemVariants}>
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3.5">
              <UserCircle className="h-7 w-7 text-slate-350" />
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-700">لا توجد نتائج مطابقة لبحثك</p>
            <p className="text-xs text-slate-400 mt-1">تأكد من كتابة الاسم بشكل صحيح أو تغيير الصف المحدد.</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-600">
                      <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider">الطالب</th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold uppercase tracking-wider">العمر</th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold uppercase tracking-wider">الصف الدراسي</th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold uppercase tracking-wider">هاتف ولي الأمر</th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold uppercase tracking-wider">تاريخ التسجيل</th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold uppercase tracking-wider">الملاحظات</th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold uppercase tracking-wider w-24">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {displayedStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 font-bold text-xs">
                              {getInitials(student.name)}
                            </div>
                            <div>
                              <Link 
                                href={`/dashboard/student/${student.id}`}
                                className="font-bold text-slate-800 hover:text-indigo-600 transition-colors block text-xs sm:text-sm"
                              >
                                {student.name}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className="text-xs sm:text-sm text-slate-600 font-medium">{student.age} سنة</span>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <Badge variant="secondary" className="bg-slate-50 border-slate-100 text-slate-600 text-xs font-medium">
                            {getClassName(student.classId)}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5 text-center" dir="ltr">
                          <span className="text-xs sm:text-sm text-slate-500 font-mono">
                            {student.parentPhone || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className="text-xs text-slate-400 font-semibold">
                            {new Date(student.createdAt).toLocaleDateString("ar-EG", {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          {(() => {
                            const notes = parseNotes(student.notes || "")
                            const notesCount = notes.length
                            return notesCount > 0 ? (
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100 rounded-md text-xs font-bold"
                              >
                                <Link href={`/dashboard/student/${student.id}/notes`}>
                                  <StickyNote className="ml-1 h-3 w-3" />
                                  <span>{notesCount}</span>
                                </Link>
                              </Button>
                            ) : (
                              <span className="text-slate-300 text-xs">-</span>
                            )
                          })()}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button 
                              asChild 
                              variant="ghost" 
                              size="sm"
                              className="h-7 px-2.5 text-xs text-slate-500 hover:bg-slate-50 rounded-lg"
                            >
                              <Link href={`/dashboard/student/${student.id}`}>
                                <Eye className="ml-1 h-3.5 w-3.5" />
                                ملفه
                              </Link>
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
                                  <AlertDialogTitle className="text-slate-800 font-extrabold">حذف سجل الطالب</AlertDialogTitle>
                                  <AlertDialogDescription className="text-slate-500">
                                    هل أنت متأكد من حذف الطالب &quot;{student.name}&quot; نهائياً؟ سيتم حذف جميع درجاته وغياباته أيضاً.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex gap-2 justify-end mt-2">
                                  <AlertDialogCancel className="border-slate-200 text-slate-650 rounded-xl hover:bg-slate-50">
                                    إلغاء
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteStudent(student.id)}
                                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl border-0 shadow-md shadow-rose-650/10"
                                  >
                                    نعم، احذف الطالب
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {displayedStudents.map((student) => (
                <div 
                  key={student.id}
                  className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-650 font-bold text-xs flex-shrink-0">
                        {getInitials(student.name)}
                      </div>
                      <div className="min-w-0">
                        <Link 
                          href={`/dashboard/student/${student.id}`}
                          className="font-bold text-slate-850 hover:text-indigo-600 transition-colors block text-sm truncate"
                        >
                          {student.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary" className="bg-slate-50 border-slate-100 text-slate-650 text-[10px] font-semibold py-0">
                            {getClassName(student.classId)}
                          </Badge>
                          <span className="text-[10px] text-slate-450 font-medium">{student.age} سنة</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {student.parentPhone && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-2.5 py-1.5" dir="ltr">
                      <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-mono">{student.parentPhone}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-105">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const notes = parseNotes(student.notes || "")
                        const notesCount = notes.length
                        return notesCount > 0 ? (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-6.5 px-2 bg-indigo-50 border-indigo-100 text-indigo-600 rounded-md text-[10px] font-bold"
                          >
                            <Link href={`/dashboard/student/${student.id}/notes`}>
                              <StickyNote className="ml-1 h-3 w-3" />
                              <span>{notesCount} ملاحظة</span>
                            </Link>
                          </Button>
                        ) : null
                      })()}
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {new Date(student.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        asChild 
                        variant="ghost" 
                        size="sm"
                        className="text-slate-500 hover:text-slate-700 hover:bg-slate-50 h-7.5 px-2 text-xs"
                      >
                        <Link href={`/dashboard/student/${student.id}`}>
                          عرض الملف
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7.5 w-7.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white border-slate-100 rounded-2xl text-right">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-slate-800 font-extrabold">حذف سجل الطالب</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500">
                              هل أنت متأكد من حذف الطالب &quot;{student.name}&quot;؟
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex gap-2 justify-end mt-2">
                            <AlertDialogCancel className="border-slate-200 text-slate-650 rounded-xl hover:bg-slate-50">
                              إلغاء
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteStudent(student.id)}
                              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl border-0 shadow-md shadow-rose-650/10"
                            >
                              حذف الطالب
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {hasMoreStudents && (
              <div className="flex justify-center py-4">
                <Button
                  onClick={() => setDisplayCount(prev => prev + INITIAL_DISPLAY_COUNT)}
                  variant="outline"
                  className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs sm:text-sm"
                >
                  <span>عرض المزيد من الطلاب</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold">
                    {filteredStudents.length - displayCount} متبقي
                  </span>
                </Button>
              </div>
            )}
            
            {displayCount > INITIAL_DISPLAY_COUNT && filteredStudents.length <= displayCount && (
              <div className="flex justify-center py-4">
                <Button
                  onClick={() => setDisplayCount(INITIAL_DISPLAY_COUNT)}
                  variant="ghost"
                  className="text-slate-500 hover:text-slate-700 rounded-xl"
                >
                  إظهار أقل
                </Button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
