"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Plus,
  Trash2,
  Clock,
  Calendar,
  BookOpen,
  User,
  GraduationCap,
  Edit3,
  Save,
  School,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { ScheduleItem, SchoolClass, Teacher } from "@/lib/store"
import {
  fetchScheduleByClass,
  createScheduleItem,
  updateScheduleItem,
  deleteScheduleItem,
  fetchClasses,
  fetchTeachers,
} from "@/lib/supabase-school"
import { motion } from "framer-motion"

const DAYS = [
  { id: 0, name: "الأحد", short: "أحد" },
  { id: 1, name: "الإثنين", short: "إثن" },
  { id: 2, name: "الثلاثاء", short: "ثل" },
  { id: 3, name: "الأربعاء", short: "أرب" },
  { id: 4, name: "الخميس", short: "خم" },
]

const DEFAULT_PERIODS = [
  { number: 1, start: "08:00", end: "08:45" },
  { number: 2, start: "08:45", end: "09:30" },
  { number: 3, start: "09:30", end: "10:15" },
  { number: 4, start: "10:15", end: "11:00" },
  { number: 5, start: "11:00", end: "11:45" },
  { number: 6, start: "11:45", end: "12:30" },
  { number: 7, start: "12:30", end: "13:15" },
  { number: 8, start: "13:15", end: "14:00" },
]

const SUBJECT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "رياضيات": { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
  "علوم": { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  "لغة عربية": { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  "لغة إنجليزية": { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  "تربية إسلامية": { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700" },
  "تربية وطنية": { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
  "تاريخ": { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  "جغرافيا": { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700" },
  "فيزياء": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  "كيمياء": { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700" },
  "أحياء": { bg: "bg-lime-50", border: "border-lime-200", text: "text-lime-700" },
  "حاسوب": { bg: "bg-slate-100", border: "border-slate-300", text: "text-slate-700" },
  "فن": { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700" },
  "رياضة": { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
}

const COMMON_SUBJECTS = Object.keys(SUBJECT_COLORS)

function getSubjectColor(subject: string) {
  return SUBJECT_COLORS[subject] || { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700" }
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedSemester, setSelectedSemester] = useState<number>(1)
  const [loading, setLoading] = useState(true)

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null)

  const [selectedDay, setSelectedDay] = useState<number>(0)
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1)
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [customSubject, setCustomSubject] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState<string>("")
  const [formSemester, setFormSemester] = useState<number>(1)
  const [startTime, setStartTime] = useState("08:00")
  const [endTime, setEndTime] = useState("08:45")

  const reload = useCallback(async () => {
    if (!selectedClass) {
      setSchedule([])
      setLoading(false)
      return
    }
    setLoading(true)
    const [scheduleData, classesData, teachersData] = await Promise.all([
      fetchScheduleByClass(selectedClass, selectedSemester),
      fetchClasses(),
      fetchTeachers(),
    ])
    setSchedule(scheduleData)
    setClasses(classesData)
    setTeachers(teachersData)
    setLoading(false)
  }, [selectedClass, selectedSemester])

  useEffect(() => {
    void reload()
  }, [reload])

  useEffect(() => {
    async function loadInitial() {
      const classesData = await fetchClasses()
      setClasses(classesData)
      if (classesData.length > 0 && !selectedClass) {
        setSelectedClass(classesData[0].id)
      }
    }
    void loadInitial()
  }, [])

  const getScheduleItem = (dayId: number, periodNumber: number) => {
    return schedule.find(
      (item) => item.dayOfWeek === dayId && item.periodNumber === periodNumber && item.semester === selectedSemester
    )
  }

  const getTeacherName = (teacherId: string | null) => {
    if (!teacherId) return null
    const teacher = teachers.find((t) => t.id === teacherId)
    return teacher?.name || null
  }

  const resetForm = () => {
    setSelectedDay(0)
    setSelectedPeriod(1)
    setSelectedSubject("")
    setCustomSubject("")
    setSelectedTeacher("")
    setFormSemester(1)
    const period = DEFAULT_PERIODS.find((p) => p.number === 1)
    setStartTime(period?.start || "08:00")
    setEndTime(period?.end || "08:45")
  }

  const handlePeriodChange = (periodNum: number) => {
    setSelectedPeriod(periodNum)
    const period = DEFAULT_PERIODS.find((p) => p.number === periodNum)
    if (period) {
      setStartTime(period.start)
      setEndTime(period.end)
    }
  }

  const handleAddScheduleItem = async () => {
    if (!selectedClass) {
      toast.error("يرجى اختيار الصف أولاً")
      return
    }
    if (!selectedSubject && !customSubject.trim()) {
      toast.error("يرجى اختيار المادة")
      return
    }

    const subject = selectedSubject === "custom" ? customSubject.trim() : selectedSubject
    const teacherId = selectedTeacher === "none" ? null : selectedTeacher || null

    const existing = getScheduleItem(selectedDay, selectedPeriod)
    if (existing) {
      toast.error("هناك حصة مسجلة في هذا الوقت بالفعل")
      return
    }

    const created = await createScheduleItem(
      selectedClass,
      formSemester,
      selectedDay,
      selectedPeriod,
      subject,
      teacherId,
      startTime,
      endTime
    )

    if (!created) {
      toast.error("حدث خطأ أثناء إضافة الحصة")
      return
    }

    resetForm()
    setAddOpen(false)
    void reload()
    toast.success("تمت إضافة الحصة بنجاح")
  }

  const handleEditClick = (item: ScheduleItem) => {
    setEditingItem(item)
    setSelectedDay(item.dayOfWeek)
    setSelectedPeriod(item.periodNumber)
    setFormSemester(item.semester)

    const isCommon = COMMON_SUBJECTS.includes(item.subject)
    if (isCommon) {
      setSelectedSubject(item.subject)
      setCustomSubject("")
    } else {
      setSelectedSubject("custom")
      setCustomSubject(item.subject)
    }

    setSelectedTeacher(item.teacherId || "none")
    setStartTime(item.startTime)
    setEndTime(item.endTime)
    setEditOpen(true)
  }

  const handleUpdateScheduleItem = async () => {
    if (!editingItem) return

    const subject = selectedSubject === "custom" ? customSubject.trim() : selectedSubject
    if (!subject) {
      toast.error("يرجى إدخال اسم المادة")
      return
    }

    const teacherId = selectedTeacher === "none" ? null : selectedTeacher || null

    const updated = await updateScheduleItem(editingItem.id, {
      subject,
      teacherId,
      startTime,
      endTime,
      semester: formSemester,
    })

    if (!updated) {
      toast.error("حدث خطأ أثناء تحديث الحصة")
      return
    }

    setEditOpen(false)
    setEditingItem(null)
    resetForm()
    void reload()
    toast.success("تم تحديث الحصة بنجاح")
  }

  const handleDeleteScheduleItem = async (id: string) => {
    await deleteScheduleItem(id)
    void reload()
    toast.success("تم حذف الحصة بنجاح")
  }

  const stats = {
    totalLessons: schedule.length,
    uniqueSubjects: new Set(schedule.map((s) => s.subject)).size,
    lessonsWithTeachers: schedule.filter((s) => s.teacherId).length,
  }

  const renderScheduleForm = (isEditing: boolean) => (
    <div className="flex flex-col gap-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-slate-700 font-bold text-xs">الفصل الدراسي</Label>
          <Select value={formSemester.toString()} onValueChange={(v) => setFormSemester(parseInt(v))}>
            <SelectTrigger className="bg-slate-50/50 border-slate-200 rounded-xl h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">الفصل الأول</SelectItem>
              <SelectItem value="2">الفصل الثاني</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-700 font-bold text-xs">اليوم</Label>
          <Select value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v))}>
            <SelectTrigger className="bg-slate-50/50 border-slate-200 rounded-xl h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAYS.map((day) => (
                <SelectItem key={day.id} value={day.id.toString()}>{day.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-slate-700 font-bold text-xs">الحصة</Label>
        <Select value={selectedPeriod.toString()} onValueChange={(v) => handlePeriodChange(parseInt(v))}>
          <SelectTrigger className="bg-slate-50/50 border-slate-200 rounded-xl h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_PERIODS.map((period) => (
              <SelectItem key={period.number} value={period.number.toString()}>
                الحصة {period.number} ({period.start} - {period.end})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-slate-700 font-bold text-xs">المادة</Label>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="bg-slate-50/50 border-slate-200 rounded-xl h-10">
            <SelectValue placeholder="اختر المادة" />
          </SelectTrigger>
          <SelectContent>
            {COMMON_SUBJECTS.map((subject) => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
            <SelectItem value="custom">مادة أخرى...</SelectItem>
          </SelectContent>
        </Select>
        {selectedSubject === "custom" && (
          <Input
            placeholder="أدخل اسم المادة"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            className="mt-2 bg-slate-50/50 border-slate-200 rounded-xl h-10"
          />
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-slate-700 font-bold text-xs">المعلم (اختياري)</Label>
        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
          <SelectTrigger className="bg-slate-50/50 border-slate-200 rounded-xl h-10">
            <SelectValue placeholder="اختر المعلم" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">بدون معلم</SelectItem>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name} {teacher.subject ? `- ${teacher.subject}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-slate-700 font-bold text-xs">وقت البدء</Label>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-slate-50/50 border-slate-200 rounded-xl h-10" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-700 font-bold text-xs">وقت الانتهاء</Label>
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-slate-50/50 border-slate-200 rounded-xl h-10" />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button
          variant="outline"
          className="border-slate-200 rounded-xl h-10"
          onClick={() => {
            if (isEditing) { setEditOpen(false); setEditingItem(null) } else { setAddOpen(false) }
            resetForm()
          }}
        >
          إلغاء
        </Button>
        <Button
          onClick={isEditing ? handleUpdateScheduleItem : handleAddScheduleItem}
          className="bg-gradient-to-r from-indigo-550 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl h-10 px-5 border-0 font-bold gap-2"
        >
          {isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isEditing ? "حفظ التغييرات" : "إضافة الحصة"}
        </Button>
      </div>
    </div>
  )

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6 text-right"
      dir="rtl"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 border border-slate-100 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">الجدول الدراسي الأسبوعي</h1>
            <p className="text-xs sm:text-sm text-slate-400">تنظيم الحصص وتوزيع المواد على أيام الأسبوع للصفوف الدراسية</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Select value={selectedSemester.toString()} onValueChange={(v) => setSelectedSemester(parseInt(v))}>
            <SelectTrigger className="w-36 border-slate-200 rounded-xl h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">الفصل الأول</SelectItem>
              <SelectItem value="2">الفصل الثاني</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-44 border-slate-200 rounded-xl h-9 text-xs">
              <SelectValue placeholder="اختر الصف" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="h-9 bg-gradient-to-r from-indigo-550 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/10 border-0 flex items-center gap-1.5 text-xs" disabled={!selectedClass}>
                <Plus className="h-4 w-4" />
                <span>إضافة حصة</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="text-right bg-white border-slate-100 rounded-2xl max-w-md">
              <DialogHeader>
                <DialogTitle className="text-slate-900 font-extrabold text-lg flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  إضافة حصة جديدة
                </DialogTitle>
              </DialogHeader>
              {renderScheduleForm(false)}
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
        <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <BookOpen className="h-5.5 w-5.5" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-850">{stats.totalLessons}</p>
              <p className="text-[11px] font-semibold text-slate-400">إجمالي الحصص الأسبوعية</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Calendar className="h-5.5 w-5.5" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-850">{stats.uniqueSubjects}</p>
              <p className="text-[11px] font-semibold text-slate-400">المواد الدراسية</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <User className="h-5.5 w-5.5" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-850">{stats.lessonsWithTeachers}</p>
              <p className="text-[11px] font-semibold text-slate-400">حصص مع معلمين مسندين</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="text-right bg-white border-slate-100 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-extrabold text-lg flex items-center gap-2">
              <Edit3 className="h-4.5 w-4.5 text-indigo-500" />
              تعديل الحصة الدراسية
            </DialogTitle>
          </DialogHeader>
          {renderScheduleForm(true)}
        </DialogContent>
      </Dialog>

      {/* Schedule Grid */}
      <motion.div variants={itemVariants}>
        <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              <div>
                <h3 className="font-bold text-slate-800">شبكة الجدول الأسبوعي</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedClass ? classes.find((c) => c.id === selectedClass)?.name || "الصف المختار" : "اختر صفاً لعرض جدوله"}
                </p>
              </div>
            </div>
            <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 rounded-lg py-1 px-3 font-bold text-xs w-fit">
              {selectedSemester === 1 ? "الفصل الأول" : "الفصل الثاني"}
            </Badge>
          </div>

          <CardContent className="p-5">
            {!selectedClass ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <GraduationCap className="mb-4 h-12 w-12 text-slate-300" />
                <p className="text-sm font-bold text-slate-600">اختر الصف الدراسي لعرض الجدول</p>
                <p className="mt-1 text-xs text-slate-400">اختر الصف والفصل من القوائم بالأعلى</p>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative h-12 w-12 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                </div>
                <p className="text-xs text-slate-400">جاري تحميل الجدول...</p>
              </div>
            ) : (
              <>
                {/* Desktop Grid */}
                <div className="hidden lg:block overflow-x-auto">
                  <div className="min-w-[900px]">
                    <div className="grid grid-cols-9 gap-1.5 mb-1.5">
                      <div className="p-2.5 text-center font-bold text-slate-500 bg-slate-50 rounded-xl text-xs">
                        اليوم / الحصة
                      </div>
                      {DEFAULT_PERIODS.map((period) => (
                        <div key={period.number} className="p-2.5 text-center font-bold text-slate-700 bg-slate-50 rounded-xl">
                          <div className="text-xs">الحصة {period.number}</div>
                          <div className="text-[9px] text-slate-400 mt-0.5 font-mono">{period.start}-{period.end}</div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      {DAYS.map((day) => (
                        <div key={day.id} className="grid grid-cols-9 gap-1.5">
                          <div className="p-2.5 bg-slate-50/60 rounded-xl flex items-center justify-center text-xs font-bold text-slate-600">
                            {day.name}
                          </div>

                          {DEFAULT_PERIODS.map((period) => {
                            const item = getScheduleItem(day.id, period.number)
                            const colors = item ? getSubjectColor(item.subject) : null

                            return (
                              <div
                                key={`${day.id}-${period.number}`}
                                className={cn(
                                  "p-2 rounded-xl border min-h-[72px] transition-all",
                                  item
                                    ? `${colors?.bg} ${colors?.border} ${colors?.text}`
                                    : "border-dashed border-slate-200 bg-slate-50/20 hover:bg-slate-50/40"
                                )}
                              >
                                {item ? (
                                  <div className="h-full flex flex-col">
                                    <div className="font-bold text-[11px] mb-0.5">{item.subject}</div>
                                    <div className="text-[9px] opacity-80 mt-auto">
                                      {getTeacherName(item.teacherId) && (
                                        <div className="flex items-center gap-0.5">
                                          <User className="h-2 w-2" />
                                          <span className="truncate">{getTeacherName(item.teacherId)}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-center gap-1 mt-1">
                                      <button onClick={() => handleEditClick(item)} className="p-1 rounded-md hover:bg-black/5 transition-colors" title="تعديل">
                                        <Edit3 className="h-3 w-3" />
                                      </button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <button className="p-1 rounded-md hover:bg-red-100 hover:text-red-600 transition-colors" title="حذف">
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="text-right bg-white rounded-2xl border-slate-100">
                                          <AlertDialogHeader>
                                            <AlertDialogTitle className="text-slate-900 font-extrabold">حذف الحصة</AlertDialogTitle>
                                            <AlertDialogDescription className="text-slate-500">
                                              هل أنت متأكد من حذف حصة &quot;{item.subject}&quot; يوم {DAYS.find((d) => d.id === item.dayOfWeek)?.name}؟
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter className="flex gap-2">
                                            <AlertDialogCancel className="border-slate-200 rounded-xl">إلغاء</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteScheduleItem(item.id)} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl border-0">حذف</AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setSelectedDay(day.id)
                                      handlePeriodChange(period.number)
                                      setFormSemester(selectedSemester)
                                      setAddOpen(true)
                                    }}
                                    className="w-full h-full flex items-center justify-center text-slate-300 hover:text-slate-500 transition-colors"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {DAYS.map((day) => {
                    const dayItems = schedule.filter((item) => item.dayOfWeek === day.id && item.semester === selectedSemester)
                    return (
                      <div key={day.id} className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-sm">{day.name}</span>
                          <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 rounded-lg text-[10px] py-0.5 px-2">{dayItems.length} حصة</Badge>
                        </div>
                        <div className="p-3 space-y-2">
                          {DEFAULT_PERIODS.map((period) => {
                            const item = getScheduleItem(day.id, period.number)
                            const colors = item ? getSubjectColor(item.subject) : null

                            return (
                              <div
                                key={`mobile-${day.id}-${period.number}`}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-xl border transition-all",
                                  item
                                    ? `${colors?.bg} ${colors?.border} ${colors?.text}`
                                    : "border-dashed border-slate-200 bg-slate-50/20 hover:bg-slate-50/30"
                                )}
                              >
                                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/60 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-100">
                                  {period.number}
                                </div>

                                <div className="flex-1 min-w-0">
                                  {item ? (
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="min-w-0">
                                        <div className="font-bold text-sm truncate">{item.subject}</div>
                                        <div className="text-[10px] opacity-80 flex items-center gap-2 mt-0.5">
                                          <span className="font-mono">{period.start}-{period.end}</span>
                                          {getTeacherName(item.teacherId) && (
                                            <span className="flex items-center gap-1">
                                              <User className="h-3 w-3" />
                                              {getTeacherName(item.teacherId)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        <button onClick={() => handleEditClick(item)} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
                                          <Edit3 className="h-4 w-4" />
                                        </button>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <button className="p-2 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors">
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent className="text-right bg-white rounded-2xl border-slate-100">
                                            <AlertDialogHeader>
                                              <AlertDialogTitle className="text-slate-900 font-extrabold">حذف الحصة</AlertDialogTitle>
                                              <AlertDialogDescription className="text-slate-500">
                                                هل أنت متأكد من حذف حصة &quot;{item.subject}&quot; يوم {DAYS.find((d) => d.id === item.dayOfWeek)?.name}؟
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter className="flex gap-2">
                                              <AlertDialogCancel className="border-slate-200 rounded-xl">إلغاء</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleDeleteScheduleItem(item.id)} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl border-0">حذف</AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setSelectedDay(day.id)
                                        handlePeriodChange(period.number)
                                        setFormSemester(selectedSemester)
                                        setAddOpen(true)
                                      }}
                                      className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 transition-colors py-1"
                                    >
                                      <Plus className="h-4 w-4" />
                                      <span className="text-xs">إضافة حصة</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Legend */}
      {selectedClass && schedule.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-700">دليل المواد الدراسية المستخدمة</h3>
            </div>
            <CardContent className="p-5">
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(schedule.map((s) => s.subject))).map((subject) => {
                  const colors = getSubjectColor(subject)
                  return (
                    <Badge
                      key={subject}
                      variant="outline"
                      className={cn("px-3 py-1.5 font-bold rounded-lg text-xs", colors.bg, colors.border, colors.text)}
                    >
                      {subject}
                    </Badge>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
