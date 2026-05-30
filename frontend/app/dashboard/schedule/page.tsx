"use client"

import { useState, useEffect } from "react"
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
  createScheduleItem,
  updateScheduleItem,
  deleteScheduleItem,
} from "@/lib/supabase-school"
import { useAdminScheduleByClass, useAdminClasses, useAdminTeachers } from "@/lib/hooks/use-admin-data"
import { motion, type Variants } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"

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
  "رياضيات": { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700" },
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
}

export default function SchedulePage() {
  const { t, language } = useLanguage()
  const sp = t.schedulePage
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedSemester, setSelectedSemester] = useState<number>(1)

  const { data: schedule = [], isLoading: scheduleLoading, refetch: refetchSchedule } = useAdminScheduleByClass(selectedClass, selectedSemester)
  const { data: classes = [], isLoading: classesLoading } = useAdminClasses()
  const { data: teachers = [] } = useAdminTeachers()
  const loading = scheduleLoading || classesLoading

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

  // Set initial selected class when classes load
  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].id)
    }
  }, [classes, selectedClass])

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
      toast.error(t.forms.selectClass)
      return
    }
    if (!selectedSubject && !customSubject.trim()) {
      toast.error(t.forms.selectSubject)
      return
    }

    const subject = selectedSubject === "custom" ? customSubject.trim() : selectedSubject
    const teacherId = selectedTeacher === "none" ? null : selectedTeacher || null

    const existing = getScheduleItem(selectedDay, selectedPeriod)
    if (existing) {
      toast.error(sp.addSuccess)
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
      toast.error(t.dashboard.loadingError)
      return
    }

    resetForm()
    setAddOpen(false)
    void refetchSchedule()
    toast.success(sp.addSuccess)
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
      toast.error(t.forms.selectSubject)
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
      toast.error(t.dashboard.loadingError)
      return
    }

    setEditOpen(false)
    setEditingItem(null)
    resetForm()
    void refetchSchedule()
    toast.success(sp.addSuccess)
  }

  const handleDeleteScheduleItem = async (id: string) => {
    await deleteScheduleItem(id)
    void refetchSchedule()
    toast.success(sp.deleteSuccess)
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
          <Label className="text-muted-foreground font-bold text-xs">{sp.period}</Label>
          <Select value={formSemester.toString()} onValueChange={(v) => setFormSemester(parseInt(v))}>
            <SelectTrigger className="bg-background border-border rounded-xl h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">{t.teachersPage.firstSemester}</SelectItem>
              <SelectItem value="2">{t.teachersPage.secondSemester}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-muted-foreground font-bold text-xs">{sp.day}</Label>
          <Select value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v))}>
            <SelectTrigger className="bg-background border-border rounded-xl h-10">
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
        <Label className="text-muted-foreground font-bold text-xs">{sp.period}</Label>
        <Select value={selectedPeriod.toString()} onValueChange={(v) => handlePeriodChange(parseInt(v))}>
          <SelectTrigger className="bg-background border-border rounded-xl h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_PERIODS.map((period) => (
              <SelectItem key={period.number} value={period.number.toString()}>
                {sp.periodNumber} {period.number} ({period.start} - {period.end})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-muted-foreground font-bold text-xs">{sp.subject}</Label>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="bg-background border-border rounded-xl h-10">
            <SelectValue placeholder={t.forms.selectSubject} />
          </SelectTrigger>
          <SelectContent>
            {COMMON_SUBJECTS.map((subject) => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
            <SelectItem value="custom">{t.forms.optional}</SelectItem>
          </SelectContent>
        </Select>
        {selectedSubject === "custom" && (
          <Input
            placeholder={sp.subject}
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            className="mt-2 bg-background border-border rounded-xl h-10"
          />
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-muted-foreground font-bold text-xs">{sp.teacher} ({t.forms.optional})</Label>
        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
          <SelectTrigger className="bg-background border-border rounded-xl h-10">
            <SelectValue placeholder={t.forms.selectTeacher} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t.studentsPage.noPhone}</SelectItem>
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
          <Label className="text-muted-foreground font-bold text-xs">{sp.from}</Label>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-background border-border rounded-xl h-10" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-muted-foreground font-bold text-xs">{sp.to}</Label>
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-background border-border rounded-xl h-10" />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button
          variant="outline"
          className="border-border rounded-xl h-10"
          onClick={() => {
            if (isEditing) { setEditOpen(false); setEditingItem(null) } else { setAddOpen(false) }
            resetForm()
          }}
        >
          {t.actions.cancel}
        </Button>
        <Button
          onClick={isEditing ? handleUpdateScheduleItem : handleAddScheduleItem}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10 px-5 border-0 font-bold gap-2"
        >
          {isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isEditing ? t.actions.save : sp.addPeriod}
        </Button>
      </div>
    </div>
  )

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className={`space-y-6 ${language === "ar" ? "text-right" : "text-left"}`}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-5 border border-border/50 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-foreground">{sp.title}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{sp.noPeriodsDesc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Select value={selectedSemester.toString()} onValueChange={(v) => setSelectedSemester(parseInt(v))}>
            <SelectTrigger className="w-36 border-border rounded-xl h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">{t.teachersPage.firstSemester}</SelectItem>
              <SelectItem value="2">{t.teachersPage.secondSemester}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-44 border-border rounded-xl h-9 text-xs">
              <SelectValue placeholder={t.forms.selectClass} />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold border-0 flex items-center gap-1.5 text-xs" disabled={!selectedClass}>
                <Plus className="h-4 w-4" />
                <span>{sp.addPeriod}</span>
              </Button>
            </DialogTrigger>
            <DialogContent dir={language === "ar" ? "rtl" : "ltr"} className={`${language === "ar" ? "text-right" : "text-left"} bg-card border-border rounded-2xl max-w-md`}>
              <DialogHeader>
                <DialogTitle className="text-foreground font-extrabold text-lg flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {sp.addPeriod}
                </DialogTitle>
              </DialogHeader>
              {renderScheduleForm(false)}
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid gap-3 sm:grid-cols-3">
        {[
          { value: stats.totalLessons, label: sp.addPeriod, icon: <BookOpen className="h-4 w-4" />, iconBg: "bg-primary/10 text-primary" },
          { value: stats.uniqueSubjects, label: sp.subject, icon: <Calendar className="h-4 w-4" />, iconBg: "bg-purple-500/10 text-purple-600" },
          { value: stats.lessonsWithTeachers, label: sp.teacher, icon: <User className="h-4 w-4" />, iconBg: "bg-amber-500/10 text-amber-600" },
        ].map((card, i) => (
          <Card key={i} className="border border-border/50 bg-card shadow-sm rounded-2xl">
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

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent dir={language === "ar" ? "rtl" : "ltr"} className={`${language === "ar" ? "text-right" : "text-left"} bg-card border-border rounded-2xl max-w-md`}>
          <DialogHeader>
            <DialogTitle className="text-foreground font-extrabold text-lg flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-primary" />
              {t.actions.edit} {sp.period}
            </DialogTitle>
          </DialogHeader>
          {renderScheduleForm(true)}
        </DialogContent>
      </Dialog>

      {/* Schedule Grid */}
      <motion.div variants={itemVariants}>
        <Card className="border border-border/50 bg-card shadow-sm rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-bold text-foreground">{sp.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedClass ? classes.find((c) => c.id === selectedClass)?.name || sp.class : sp.noPeriodsDesc}
                </p>
              </div>
            </div>
            <Badge className="bg-primary/10 text-primary rounded-lg py-1 px-3 font-bold text-xs w-fit">
              {selectedSemester === 1 ? t.teachersPage.firstSemester : t.teachersPage.secondSemester}
            </Badge>
          </div>

          <CardContent className="p-5">
            {!selectedClass ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground/20" />
                <p className="text-sm font-bold text-foreground">{sp.noPeriods}</p>
                <p className="mt-1 text-xs text-muted-foreground">{sp.noPeriodsDesc}</p>
              </div>
            ) : loading ? (
              <div className="hidden lg:block overflow-x-auto">
                <div className="min-w-[900px] space-y-1.5">
                  <div className="grid grid-cols-9 gap-1.5">
                    <div className="h-12 skeleton rounded-xl" />
                    {DEFAULT_PERIODS.map((_, i) => (
                      <div key={i} className="h-12 skeleton rounded-xl" />
                    ))}
                  </div>
                  {Array.from({ length: 5 }).map((_, r) => (
                    <div key={r} className="grid grid-cols-9 gap-1.5">
                      <div className="h-[72px] skeleton rounded-xl" />
                      {DEFAULT_PERIODS.map((_, c) => (
                        <div key={c} className="h-[72px] skeleton rounded-xl opacity-50" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Grid */}
                <div className="hidden lg:block overflow-x-auto">
                  <div className="min-w-[900px]">
                    <div className="grid grid-cols-9 gap-1.5 mb-1.5">
                      <div className="p-2.5 text-center font-bold text-muted-foreground bg-muted/60 rounded-xl text-xs">
                        {sp.day} / {sp.period}
                      </div>
                      {DEFAULT_PERIODS.map((period) => (
                        <div key={period.number} className="p-2.5 text-center font-bold text-foreground bg-muted/60 rounded-xl">
                          <div className="text-xs">{sp.periodNumber} {period.number}</div>
                          <div className="text-[9px] text-muted-foreground mt-0.5 font-mono">{period.start}-{period.end}</div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      {DAYS.map((day) => (
                        <div key={day.id} className="grid grid-cols-9 gap-1.5">
                          <div className="p-2.5 bg-muted/40 rounded-xl flex items-center justify-center text-xs font-bold text-foreground">
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
                                    : "border-dashed border-border/50 bg-muted/10 hover:bg-muted/20"
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
                                        <AlertDialogContent className={`${language === "ar" ? "text-right" : "text-left"} bg-card rounded-2xl border-border`}>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle className="text-foreground font-extrabold">{t.actions.delete} {sp.period}</AlertDialogTitle>
                                            <AlertDialogDescription className="text-muted-foreground">
                                              {item.subject} - {DAYS.find((d) => d.id === item.dayOfWeek)?.name}
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter className="flex gap-2">
                                            <AlertDialogCancel className="border-border rounded-xl">{t.actions.cancel}</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteScheduleItem(item.id)} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl border-0">{t.actions.delete}</AlertDialogAction>
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
                                    className="w-full h-full flex items-center justify-center text-muted-foreground/30 hover:text-muted-foreground transition-colors"
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
                      <div key={day.id} className="border border-border/50 rounded-xl overflow-hidden bg-card">
                        <div className="bg-muted/40 px-4 py-3 border-b border-border/30 flex items-center justify-between">
                          <span className="font-bold text-foreground text-sm">{day.name}</span>
                          <Badge className="bg-primary/10 text-primary rounded-lg text-[10px] py-0.5 px-2">{dayItems.length}</Badge>
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
                                    : "border-dashed border-border/50 bg-muted/10 hover:bg-muted/20"
                                )}
                              >
                                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-background/60 flex items-center justify-center text-xs font-bold text-muted-foreground border border-border/50">
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
                                          <AlertDialogContent className={`${language === "ar" ? "text-right" : "text-left"} bg-card rounded-2xl border-border`}>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle className="text-foreground font-extrabold">{t.actions.delete} {sp.period}</AlertDialogTitle>
                                              <AlertDialogDescription className="text-muted-foreground">
                                                {item.subject} - {DAYS.find((d) => d.id === item.dayOfWeek)?.name}
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter className="flex gap-2">
                                              <AlertDialogCancel className="border-border rounded-xl">{t.actions.cancel}</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleDeleteScheduleItem(item.id)} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl border-0">{t.actions.delete}</AlertDialogAction>
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
                                      className="w-full flex items-center justify-center gap-2 text-muted-foreground/40 hover:text-muted-foreground transition-colors py-1"
                                    >
                                      <Plus className="h-4 w-4" />
                                      <span className="text-xs">{sp.addPeriod}</span>
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
          <Card className="border border-border/50 bg-card shadow-sm rounded-2xl">
            <div className="p-5 border-b border-border/30">
              <h3 className="text-xs font-bold text-muted-foreground">{sp.subject}</h3>
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

