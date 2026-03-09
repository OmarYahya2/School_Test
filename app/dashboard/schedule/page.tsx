"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Plus,
  Trash2,
  Clock,
  Calendar,
  BookOpen,
  User,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Edit3,
  X,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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

// Days of the week (Arabic school week: Sunday-Thursday)
const DAYS = [
  { id: 0, name: "الأحد", short: "أحد" },
  { id: 1, name: "الإثنين", short: "إثن" },
  { id: 2, name: "الثلاثاء", short: "ثل" },
  { id: 3, name: "الأربعاء", short: "أرب" },
  { id: 4, name: "الخميس", short: "خم" },
]

// Default time periods (8 periods)
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

// Subject colors for visual distinction
const SUBJECT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "رياضيات": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  "علوم": { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
  "لغة عربية": { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  "لغة إنجليزية": { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  "تربية إسلامية": { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  "تربية وطنية": { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
  "تاريخ": { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  "جغرافيا": { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700" },
  "فيزياء": { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
  "كيمياء": { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700" },
  "أحياء": { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700" },
  "حاسوب": { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700" },
  "فن": { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700" },
  "رياضة": { bg: "bg-lime-50", border: "border-lime-200", text: "text-lime-700" },
}

const COMMON_SUBJECTS = Object.keys(SUBJECT_COLORS)

function getSubjectColor(subject: string) {
  return SUBJECT_COLORS[subject] || { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700" }
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedSemester, setSelectedSemester] = useState<number>(1)
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null)

  // Form states
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

  // Load classes on mount
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
      toast.error("يرجى اختياد المادة")
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
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-foreground">الفصل الدراسي</Label>
          <Select
            value={formSemester.toString()}
            onValueChange={(v) => setFormSemester(parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">الفصل الأول</SelectItem>
              <SelectItem value="2">الفصل الثاني</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-foreground">اليوم</Label>
          <Select
            value={selectedDay.toString()}
            onValueChange={(v) => setSelectedDay(parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAYS.map((day) => (
                <SelectItem key={day.id} value={day.id.toString()}>
                  {day.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-foreground">الحصة</Label>
        <Select
          value={selectedPeriod.toString()}
          onValueChange={(v) => handlePeriodChange(parseInt(v))}
        >
          <SelectTrigger>
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

      <div className="flex flex-col gap-2">
        <Label className="text-foreground">المادة</Label>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger>
            <SelectValue placeholder="اختر المادة" />
          </SelectTrigger>
          <SelectContent>
            {COMMON_SUBJECTS.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
            <SelectItem value="custom">مادة أخرى...</SelectItem>
          </SelectContent>
        </Select>
        {selectedSubject === "custom" && (
          <Input
            placeholder="أدخل اسم المادة"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            className="mt-2"
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-foreground">المعلم (اختياري)</Label>
        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
          <SelectTrigger>
            <SelectValue placeholder="اختر المعلم" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">بدون معلم</SelectItem>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name} - {teacher.subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-foreground">وقت البدء</Label>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-foreground">وقت الانتهاء</Label>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button
          variant="outline"
          onClick={() => {
            if (isEditing) {
              setEditOpen(false)
              setEditingItem(null)
            } else {
              setAddOpen(false)
            }
            resetForm()
          }}
        >
          إلغاء
        </Button>
        <Button
          onClick={isEditing ? handleUpdateScheduleItem : handleAddScheduleItem}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          {isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isEditing ? "حفظ التغييرات" : "إضافة الحصة"}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الجدول الدراسي</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إدارة وعرض الجداول الدراسية للصفوف
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedSemester.toString()} onValueChange={(v) => setSelectedSemester(parseInt(v))}>
            <SelectTrigger className="w-[160px]">
              <School className="h-4 w-4 ml-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">الفصل الأول</SelectItem>
              <SelectItem value="2">الفصل الثاني</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[200px]">
              <GraduationCap className="h-4 w-4 ml-2" />
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

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                disabled={!selectedClass}
              >
                <Plus className="h-4 w-4" />
                إضافة حصة
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl" className="text-right max-w-md">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  إضافة حصة جديدة
                </DialogTitle>
              </DialogHeader>
              {renderScheduleForm(false)}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الحصص</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLessons}</div>
            <p className="text-xs text-muted-foreground">حصة أسبوعياً</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المواد الدراسية</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueSubjects}</div>
            <p className="text-xs text-muted-foreground">مادة مختلفة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحصص مع معلمين</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lessonsWithTeachers}</div>
            <p className="text-xs text-muted-foreground">من إجمالي {stats.totalLessons} حصة</p>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent dir="rtl" className="text-right max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              تعديل الحصة
            </DialogTitle>
          </DialogHeader>
          {renderScheduleForm(true)}
        </DialogContent>
      </Dialog>

      {/* Schedule Table - Mobile Optimized */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                الجدول الأسبوعي
              </CardTitle>
              <CardDescription className="mt-1">
                {selectedClass
                  ? classes.find((c) => c.id === selectedClass)?.name || "الصف المختار"
                  : "اختر صفاً لعرض جدوله"}
              </CardDescription>
            </div>
            <Badge variant="outline" className="px-3 py-1 w-fit">
              {selectedSemester === 1 ? "الفصل الأول" : "الفصل الثاني"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedClass ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <GraduationCap className="mb-4 h-12 w-12 opacity-50" />
              <p className="text-lg font-medium">اختر صفاً لعرض الجدول</p>
              <p className="mt-1 text-sm">اختر الصف من القائمة أعلاه</p>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-sm">جاري تحميل الجدول...</p>
            </div>
          ) : (
            <>
              {/* Desktop Grid View */}
              <div className="hidden lg:block overflow-x-auto">
                <div className="min-w-[900px]">
                  {/* Header Row - Periods */}
                  <div className="grid grid-cols-9 gap-2 mb-2">
                    <div className="p-3 text-center font-medium text-muted-foreground bg-muted rounded-lg">
                      اليوم / الحصة
                    </div>
                    {DEFAULT_PERIODS.map((period) => (
                      <div
                        key={period.number}
                        className="p-3 text-center font-medium text-foreground bg-muted rounded-lg"
                      >
                        <div>الحصة {period.number}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {period.start} - {period.end}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Day Rows */}
                  <div className="space-y-2">
                    {DAYS.map((day) => (
                      <div key={day.id} className="grid grid-cols-9 gap-2">
                        {/* Day Column */}
                        <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-center text-sm font-medium text-foreground">
                          {day.name}
                        </div>

                        {/* Period Columns */}
                        {DEFAULT_PERIODS.map((period) => {
                          const item = getScheduleItem(day.id, period.number)
                          const colors = item ? getSubjectColor(item.subject) : null

                          return (
                            <div
                              key={`${day.id}-${period.number}`}
                              className={cn(
                                "p-2 rounded-lg border-2 min-h-[70px] transition-all",
                                item
                                  ? `${colors?.bg} ${colors?.border} ${colors?.text}`
                                  : "border-dashed border-muted bg-muted/30 hover:bg-muted/50"
                              )}
                            >
                              {item ? (
                                <div className="h-full flex flex-col">
                                  <div className="font-semibold text-xs mb-1">{item.subject}</div>
                                  <div className="text-[10px] opacity-80 mt-auto">
                                    {getTeacherName(item.teacherId) && (
                                      <div className="flex items-center gap-1">
                                        <User className="h-2 w-2" />
                                        {getTeacherName(item.teacherId)}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-center gap-1 mt-1">
                                    <button
                                      onClick={() => handleEditClick(item)}
                                      className="p-1 rounded hover:bg-black/5 transition-colors touch-target-sm"
                                      title="تعديل"
                                    >
                                      <Edit3 className="h-3 w-3" />
                                    </button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <button
                                          className="p-1 rounded hover:bg-red-100 hover:text-red-600 transition-colors touch-target-sm"
                                          title="حذف"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="text-foreground">
                                            حذف الحصة
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            هل أنت متأكد من حذف حصة &quot;{item.subject}&quot; يوم{" "}
                                            {DAYS.find((d) => d.id === item.dayOfWeek)?.name}؟
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="flex gap-2">
                                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteScheduleItem(item.id)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          >
                                            حذف
                                          </AlertDialogAction>
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
                                  className="w-full h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors touch-target-sm"
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
                  const dayItems = schedule.filter(item => item.dayOfWeek === day.id && item.semester === selectedSemester)
                  return (
                    <div key={day.id} className="border rounded-xl overflow-hidden bg-card">
                      {/* Day Header */}
                      <div className="bg-muted/50 px-4 py-3 border-b flex items-center justify-between">
                        <div className="font-semibold text-foreground">{day.name}</div>
                        <Badge variant="outline" className="text-xs">
                          {dayItems.length} حصة
                        </Badge>
                      </div>
                      {/* Day Schedule */}
                      <div className="p-3 space-y-2">
                        {DEFAULT_PERIODS.map((period) => {
                          const item = getScheduleItem(day.id, period.number)
                          const colors = item ? getSubjectColor(item.subject) : null

                          return (
                            <div
                              key={`mobile-${day.id}-${period.number}`}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border-2 transition-all touch-target-sm",
                                item
                                  ? `${colors?.bg} ${colors?.border} ${colors?.text}`
                                  : "border-dashed border-muted bg-muted/20 hover:bg-muted/30"
                              )}
                            >
                              {/* Period Number */}
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                                {period.number}
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                {item ? (
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <div className="font-semibold text-sm truncate">{item.subject}</div>
                                      <div className="text-xs opacity-80 flex items-center gap-2 mt-0.5">
                                        <span>{period.start} - {period.end}</span>
                                        {getTeacherName(item.teacherId) && (
                                          <span className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {getTeacherName(item.teacherId)}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <button
                                        onClick={() => handleEditClick(item)}
                                        className="p-2 rounded-lg hover:bg-black/5 transition-colors touch-target-sm"
                                        title="تعديل"
                                      >
                                        <Edit3 className="h-4 w-4" />
                                      </button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <button
                                            className="p-2 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors touch-target-sm"
                                            title="حذف"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle className="text-foreground">
                                              حذف الحصة
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                              هل أنت متأكد من حذف حصة &quot;{item.subject}&quot; يوم{" "}
                                              {DAYS.find((d) => d.id === item.dayOfWeek)?.name}؟
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter className="flex gap-2">
                                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() => handleDeleteScheduleItem(item.id)}
                                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                              حذف
                                            </AlertDialogAction>
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
                                    className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-2"
                                  >
                                    <Plus className="h-4 w-4" />
                                    <span className="text-sm">إضافة حصة</span>
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

      {/* Legend */}
      {selectedClass && schedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">المواد الدراسية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(schedule.map((s) => s.subject))).map((subject) => {
                const colors = getSubjectColor(subject)
                return (
                  <Badge
                    key={subject}
                    variant="outline"
                    className={cn(
                      "px-3 py-1",
                      colors.bg,
                      colors.border,
                      colors.text
                    )}
                  >
                    {subject}
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
