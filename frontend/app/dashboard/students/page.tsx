"use client"

import { useState, useCallback } from "react"
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

import { Card, CardContent } from "@/components/ui/card" 

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
import { useAdminStudents, useAdminClasses } from "@/lib/hooks/use-admin-data"
import {
  createStudent,
  deleteStudentById,
} from "@/lib/supabase-school"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"

// Note type for parsing notes
type Note = {
  id: string
  content: string
  createdAt: string
  updatedAt?: string
  category?: "academic" | "behavioral" | "general" | "health"
  author?: string
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
}

export default function StudentsPage() {
  const { t, language } = useLanguage()
  const sp = t.studentsPage
  const { data: students = [], isLoading: studentsLoading, refetch: refetchStudents } = useAdminStudents()
  const { data: classes = [] } = useAdminClasses()
  const loading = studentsLoading
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

  const reload = useCallback(() => {
    refetchStudents()
  }, [refetchStudents])

  async function handleAddStudent() {
    if (!newName.trim()) {
      toast.error(sp.studentName)
      return
    }
    if (!newClassId) {
      toast.error(sp.studentClass)
      return
    }
    const age = parseInt(newAge)
    if (isNaN(age) || age < 3 || age > 25) {
      toast.error(t.forms.age)
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
      toast.error(sp.addStudent)
      return
    }
    setNewName("")
    setNewAge("")
    setNewParentPhone("")
    setNewNotes("")
    setNewClassId("")
    setAddOpen(false)
    void reload()
    toast.success(sp.addSuccess)
  }

  async function handleDeleteStudent(id: string) {
    await deleteStudentById(id)
    void reload()
    toast.success(sp.deleteSuccess)
  }

  function getClassName(classId: string): string {
    const cls = classes.find((c) => c.id === classId)
    return cls ? cls.name : sp.notAssigned
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
      className={`space-y-6 ${language === "ar" ? "text-right" : "text-left"}`}
    >
      {/* Header section with add student dialog */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-5 border border-border/50 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-foreground">{sp.title}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{sp.noStudentsDesc}</p>
          </div>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10 px-5 font-bold shadow-md border-0 flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              <span>{sp.addStudent}</span>
            </Button>
          </DialogTrigger>
          <DialogContent dir={language === "ar" ? "rtl" : "ltr"} className={`${language === "ar" ? "text-right" : "text-left"} max-w-md bg-card border-border rounded-2xl`}>
            <DialogHeader>
              <DialogTitle className="text-foreground font-extrabold text-lg">{sp.addStudentTitle}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs sm:text-sm">{sp.studentName}</Label>
                <Input
                  placeholder={sp.studentName}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-background border-border rounded-xl h-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs sm:text-sm">{t.forms.age}</Label>
                  <Input
                    type="number"
                    placeholder="8"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    min={3}
                    max={25}
                    className="bg-background border-border rounded-xl h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs sm:text-sm">{sp.studentClass}</Label>
                  <Select value={newClassId} onValueChange={setNewClassId}>
                    <SelectTrigger className="border-border bg-background rounded-xl h-10">
                      <SelectValue placeholder={t.forms.selectClass} />
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
                <Label className="text-muted-foreground text-xs sm:text-sm">{sp.studentPhone}</Label>
                <Input
                  placeholder="0599123456"
                  value={newParentPhone}
                  onChange={(e) => setNewParentPhone(e.target.value)}
                  dir="ltr"
                  className="bg-background border-border rounded-xl h-10 text-right placeholder:text-right"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs sm:text-sm">{sp.studentNotes}</Label>
                <Textarea
                  placeholder={sp.studentNotes}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={3}
                  className="bg-background border-border rounded-xl resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <DialogClose asChild>
                  <Button variant="outline" className="border-border rounded-xl">
                    {t.actions.cancel}
                  </Button>
                </DialogClose>
                <Button onClick={handleAddStudent} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 font-bold border-0 h-10">
                  {sp.addStudent}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Metrics Summary cards */}
      <motion.div variants={itemVariants} className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: sp.totalStudents, value: loading ? "—" : stats.totalStudents,       icon: <Users className="h-4 w-4" />,    iconBg: "bg-primary/10 text-primary" },
          { label: t.forms.age,      value: loading ? "—" : `${stats.averageAge}`,       icon: <Calendar className="h-4 w-4" />,  iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" },
          { label: t.nav.classes,    value: loading ? "—" : stats.totalClasses,          icon: <School className="h-4 w-4" />,    iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" },
          { label: t.forms.phone,    value: loading ? "—" : stats.studentsWithPhone,     icon: <Phone className="h-4 w-4" />,     iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" },
        ].map((card, index) => (
          <Card key={index} className="border-border/50 bg-card shadow-sm">
            <CardContent className="p-4">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg mb-3 ${card.iconBg}`}>
                {card.icon}
              </div>
              <p className="text-xl font-black text-foreground leading-none">{card.value}</p>
              <p className="text-[11px] font-semibold text-muted-foreground mt-1.5">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Search and Filters Section */}
      <motion.div variants={itemVariants} className="bg-card rounded-2xl border border-border/50 shadow-sm">
        <div className="p-4 border-b border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-xs sm:text-sm font-bold text-foreground">{sp.filter}</h2>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/15 rounded-lg text-xs font-bold">
            {filteredStudents.length}
          </Badge>
        </div>
        <div className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            {/* Search Input */}
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-2 block font-semibold">{sp.searchPlaceholder}</Label>
              <div className="relative">
                <Search className={`absolute ${language === "ar" ? "right-3.5" : "left-3.5"} top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground`} />
                <Input
                  placeholder={sp.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setDisplayCount(INITIAL_DISPLAY_COUNT)
                  }}
                  className={`${language === "ar" ? "pr-10" : "pl-10"} border-border rounded-xl h-10`}
                />
              </div>
            </div>

            {/* Class Filter select */}
            <div className="w-full md:w-48">
              <Label className="text-xs text-muted-foreground mb-2 block font-semibold">{sp.filter}</Label>
              <Select value={selectedClass} onValueChange={(v) => {
                setSelectedClass(v)
                setDisplayCount(INITIAL_DISPLAY_COUNT)
              }}>
                <SelectTrigger className="border-border rounded-xl h-10">
                  <SelectValue placeholder={sp.allClasses} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{sp.allClasses}</SelectItem>
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
              <Label className="text-xs text-muted-foreground mb-2 block font-semibold">{t.table.name}</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-border rounded-xl h-10">
                  <ArrowUpDown className="h-4 w-4 ms-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">{t.table.name}</SelectItem>
                  <SelectItem value="age">{t.forms.age}</SelectItem>
                  <SelectItem value="class">{t.table.class}</SelectItem>
                  <SelectItem value="createdAt">{t.table.date}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-border gap-2 rounded-xl h-10">
                  <Download className="h-4 w-4" />
                  <span>{t.actions.export ?? "Export"}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-border rounded-xl">
                <DropdownMenuItem onClick={exportToExcel} className="gap-2 cursor-pointer font-semibold py-2">
                  <FileText className="h-4 w-4 text-emerald-500" />
                  Excel (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToWord} className="gap-2 cursor-pointer font-semibold py-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Word
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Students Data Grid/Table */}
      <motion.div variants={itemVariants}>
        {loading ? (
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border/30">
              <div className="h-4 w-32 skeleton" />
            </div>
            <div className="divide-y divide-border/30">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-9 w-9 rounded-lg skeleton flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-40 skeleton" />
                    <div className="h-2.5 w-24 skeleton" />
                  </div>
                  <div className="h-6 w-20 skeleton rounded-full" />
                  <div className="h-6 w-24 skeleton rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-12 text-center">
            <div className="h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3.5">
              <UserCircle className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="text-sm sm:text-base font-bold text-foreground">{sp.noResults}</p>
            <p className="text-xs text-muted-foreground mt-1">{sp.noResultsDesc}</p>
          </div>
        ) : (
          <div className="space-y-3">
            
            {/* Desktop Table View */}
            <div className="hidden md:block bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border/50">
                      <th className="px-5 py-3 text-start text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t.table.name}</th>
                      <th className="px-5 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t.forms.age}</th>
                      <th className="px-5 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t.table.class}</th>
                      <th className="px-5 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t.table.phone}</th>
                      <th className="px-5 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t.table.date}</th>
                      <th className="px-5 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t.table.notes}</th>
                      <th className="px-5 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-24">{t.table.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {displayedStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-muted/20 transition-colors group">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                              {getInitials(student.name)}
                            </div>
                            <div>
                              <Link 
                                href={`/dashboard/student/${student.id}`}
                                className="font-bold text-foreground hover:text-primary transition-colors block text-xs sm:text-sm"
                              >
                                {student.name}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className="text-xs sm:text-sm text-foreground/70 font-medium">{student.age}</span>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs font-medium">
                            {getClassName(student.classId)}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5 text-center" dir="ltr">
                          <span className="text-xs sm:text-sm text-muted-foreground font-mono">
                            {student.parentPhone || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className="text-xs text-muted-foreground font-semibold">
                            {new Date(student.createdAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
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
                                className="h-6 px-2 bg-primary/10 border-primary/20 text-primary hover:bg-primary/15 rounded-md text-xs font-bold"
                              >
                                <Link href={`/dashboard/student/${student.id}/notes`}>
                                  <StickyNote className="me-1 h-3 w-3" />
                                  <span>{notesCount}</span>
                                </Link>
                              </Button>
                            ) : (
                              <span className="text-muted-foreground/40 text-xs">-</span>
                            )
                          })()}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button 
                              asChild 
                              variant="ghost" 
                              size="sm"
                              className="h-7 px-2.5 text-xs text-muted-foreground hover:bg-accent rounded-lg"
                            >
                              <Link href={`/dashboard/student/${student.id}`}>
                                <Eye className="me-1 h-3.5 w-3.5" />
                                {sp.viewProfile}
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className={`bg-card border-border rounded-2xl ${language === "ar" ? "text-right" : "text-left"}`}>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-foreground font-extrabold">{sp.deleteStudent}</AlertDialogTitle>
                                  <AlertDialogDescription className="text-muted-foreground">
                                    {sp.deleteConfirm} &quot;{student.name}&quot;
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex gap-2 justify-end mt-2">
                                  <AlertDialogCancel className="border-border rounded-xl">
                                    {t.actions.cancel}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteStudent(student.id)}
                                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl border-0"
                                  >
                                    {sp.deleteAction}
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
                  className="bg-card rounded-2xl border border-border/50 p-4 space-y-3 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs flex-shrink-0">
                        {getInitials(student.name)}
                      </div>
                      <div className="min-w-0">
                        <Link 
                          href={`/dashboard/student/${student.id}`}
                          className="font-bold text-foreground hover:text-primary transition-colors block text-sm truncate"
                        >
                          {student.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] font-semibold py-0">
                            {getClassName(student.classId)}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-medium">{student.age}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {student.parentPhone && (
                    <div className="flex items-center gap-2 text-xs text-foreground/70 bg-muted/40 rounded-lg px-2.5 py-1.5" dir="ltr">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="font-mono">{student.parentPhone}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2.5 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const notes = parseNotes(student.notes || "")
                        const notesCount = notes.length
                        return notesCount > 0 ? (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-6.5 px-2 bg-primary/10 border-primary/20 text-primary rounded-md text-[10px] font-bold"
                          >
                            <Link href={`/dashboard/student/${student.id}/notes`}>
                              <StickyNote className="me-1 h-3 w-3" />
                              <span>{notesCount}</span>
                            </Link>
                          </Button>
                        ) : null
                      })()}
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {new Date(student.createdAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        asChild 
                        variant="ghost" 
                        size="sm"
                        className="text-muted-foreground hover:text-foreground hover:bg-accent h-7.5 px-2 text-xs"
                      >
                        <Link href={`/dashboard/student/${student.id}`}>
                          {sp.viewProfile}
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7.5 w-7.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className={`bg-card border-border rounded-2xl ${language === "ar" ? "text-right" : "text-left"}`}>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-foreground font-extrabold">{sp.deleteStudent}</AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground">
                              {sp.deleteConfirm} &quot;{student.name}&quot;
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex gap-2 justify-end mt-2">
                            <AlertDialogCancel className="border-border rounded-xl">
                              {t.actions.cancel}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteStudent(student.id)}
                              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl border-0"
                            >
                              {sp.deleteAction}
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
                  className="gap-2 border-border rounded-xl text-xs sm:text-sm"
                >
                  <span>{t.actions.loadMore ?? "Load More"}</span>
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-bold">
                    {filteredStudents.length - displayCount}
                  </span>
                </Button>
              </div>
            )}
            
            {displayCount > INITIAL_DISPLAY_COUNT && filteredStudents.length <= displayCount && (
              <div className="flex justify-center py-4">
                <Button
                  onClick={() => setDisplayCount(INITIAL_DISPLAY_COUNT)}
                  variant="ghost"
                  className="text-muted-foreground rounded-xl"
                >
                  {t.actions.showLess ?? "Show Less"}
                </Button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

