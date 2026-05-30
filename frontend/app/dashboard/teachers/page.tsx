"use client"

import { useState, useCallback } from "react"
import { Trash2, UserCheck, BookOpen, GraduationCap, Phone, Pencil, ArrowUpRight, Users } from "lucide-react"
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
import type { Teacher, TeacherAssignment, SchoolClass } from "@/lib/store"
import {
  createTeacher,
  deleteTeacherById,
  createTeacherAssignment,
  deleteTeacherAssignmentById,
} from "@/lib/supabase-teachers"
import { useAdminTeachers, useAdminClasses, useAdminTeacherAssignments } from "@/lib/hooks/use-admin-data"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"

function getGradeFromClassName(name: string): number {
  const keywords: Record<string, number> = {
    "أول": 1, "ثاني": 2, "ثالث": 3, "رابع": 4, "خامس": 5,
    "سادس": 6, "سابع": 7, "ثامن": 8, "تاسع": 9,
    "1": 1, "2": 2, "3": 3, "4": 4, "5": 5,
    "6": 6, "7": 7, "8": 8, "9": 9,
  }
  for (const [keyword, grade] of Object.entries(keywords)) {
    if (name.includes(keyword)) return grade
  }
  return 1
}

const subjectsList = [
  "اللغة العربية",
  "اللغة الإنجليزية",
  "الرياضيات",
  "العلوم والحياة",
  "التربية الدينية",
  "الدراسات الاجتماعية",
  "التكنولوجيا",
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
}

export default function TeachersPage() {
  const { t, language } = useLanguage()
  const tp = t.teachersPage
  const { data: teachers = [], isLoading: teachersLoading, refetch: refetchTeachers } = useAdminTeachers()
  const { data: assignments = [] } = useAdminTeacherAssignments()
  const { data: classes = [] } = useAdminClasses()
  const loading = teachersLoading
  const [assignOpen, setAssignOpen] = useState(false)

  // Assignment form
  const [assignTeacherId, setAssignTeacherId] = useState("")
  const [assignClassId, setAssignClassId] = useState("")
  const [assignSemester, setAssignSemester] = useState("first")
  const [assignSubject, setAssignSubject] = useState(subjectsList[0])

  const reload = useCallback(() => {
    refetchTeachers()
  }, [refetchTeachers])

  async function handleDelete(id: string) {
    await deleteTeacherById(id)
    void reload()
    toast.success(tp.deleteSuccess)
  }

  async function handleAssign() {
    if (!assignTeacherId) {
      toast.error(t.forms.selectTeacher)
      return
    }
    if (!assignClassId) {
      toast.error("يرجى اختيار صف")
      return
    }
    const selectedClass = classes.find((c) => c.id === assignClassId)
    if (!selectedClass) {
      toast.error("الصف غير موجود")
      return
    }
    const gradeId = getGradeFromClassName(selectedClass.name)
    const created = await createTeacherAssignment(
      assignTeacherId,
      gradeId,
      assignSemester,
      assignSubject,
      assignClassId
    )
    if (!created) {
      toast.error(tp.assignTeacher)
      return
    }
    setAssignOpen(false)
    setAssignClassId("")
    void reload()
    toast.success(tp.addSuccess)
  }

  async function handleRemoveAssignment(id: string) {
    await deleteTeacherAssignmentById(id)
    void reload()
    toast.success(t.actions.delete)
  }

  function getTeacherName(id: string): string {
    return teachers.find((tc) => tc.id === id)?.name || tp.noSubject
  }

  function getTeacherAssignmentsList(teacherId: string): TeacherAssignment[] {
    return assignments.filter((a) => a.teacherId === teacherId)
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className={`space-y-6 ${language === "ar" ? "text-right" : "text-left"}`}
    >
      {/* Header section with add options */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-5 border border-border/50 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-foreground">{tp.title}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{tp.noTeachersDesc}</p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-10 border-border gap-2 rounded-xl text-xs sm:text-sm font-bold flex-1 sm:flex-none">
                <BookOpen className="h-4 w-4" />
                <span>{tp.assignTeacher}</span>
              </Button>
            </DialogTrigger>
            <DialogContent dir={language === "ar" ? "rtl" : "ltr"} className={`${language === "ar" ? "text-right" : "text-left"} bg-card border-border rounded-2xl max-w-md`}>
              <DialogHeader>
                <DialogTitle className="text-foreground font-extrabold text-lg flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {tp.assignTeacher}
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs sm:text-sm">{t.forms.selectTeacher}</Label>
                  <Select value={assignTeacherId} onValueChange={setAssignTeacherId}>
                    <SelectTrigger className="bg-background border-border rounded-xl h-10">
                      <SelectValue placeholder={t.forms.selectTeacher} />
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
                    <Label className="text-muted-foreground text-xs sm:text-sm">{t.forms.selectClass}</Label>
                    <Select value={assignClassId} onValueChange={setAssignClassId}>
                      <SelectTrigger className="bg-background border-border rounded-xl h-10">
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
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs sm:text-sm">{tp.semester}</Label>
                    <Select value={assignSemester} onValueChange={setAssignSemester}>
                      <SelectTrigger className="bg-background border-border rounded-xl h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first">{tp.firstSemester}</SelectItem>
                        <SelectItem value="second">{tp.secondSemester}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs sm:text-sm">{tp.subject}</Label>
                  <Select value={assignSubject} onValueChange={setAssignSubject}>
                    <SelectTrigger className="bg-background border-border rounded-xl h-10">
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
                    <Button variant="outline" className="border-border rounded-xl">{t.actions.cancel}</Button>
                  </DialogClose>
                  <Button onClick={handleAssign} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 font-bold h-10 border-0">
                    {t.actions.confirm}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </motion.div>

      {/* Teachers Grid */}
      <motion.div variants={itemVariants}>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full skeleton flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-28 skeleton" />
                    <div className="h-2.5 w-20 skeleton" />
                  </div>
                </div>
                <div className="h-6 w-32 skeleton rounded-lg" />
                <div className="border-t border-border/30 pt-3 space-y-2">
                  <div className="h-2.5 w-20 skeleton" />
                  <div className="flex gap-1.5">
                    <div className="h-5 w-24 skeleton rounded-md" />
                    <div className="h-5 w-20 skeleton rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : teachers.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-12 text-center">
            <div className="h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3.5">
              <UserCheck className="h-7 w-7 text-muted-foreground/30" />
            </div>
            <p className="text-sm sm:text-base font-bold text-foreground">{tp.noTeachers}</p>
            <p className="text-xs text-muted-foreground mt-1">{tp.noTeachersDesc}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => {
              const teacherAssigns = getTeacherAssignmentsList(teacher.id)
              return (
                <Card
                  key={teacher.id}
                  className="border-border/50 bg-card shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group rounded-2xl"
                >
                  <CardContent className="p-5 flex flex-col justify-between h-full min-h-[175px]">
                    <div>
                      {/* Top Header Card row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-border shadow-sm">
                            <AvatarFallback className="bg-primary/10 text-primary font-extrabold text-xs">
                              {teacher.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className={language === "ar" ? "text-right" : "text-left"}>
                            <h3 className="font-bold text-foreground text-xs sm:text-sm truncate max-w-[140px]">{teacher.name}</h3>
                            {teacher.phone && (
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold mt-0.5" dir="ltr">
                                <Phone className="h-3 w-3" />
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
                              className="h-7 w-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className={`bg-card border-border rounded-2xl ${language === "ar" ? "text-right" : "text-left"} max-w-md`}>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-foreground font-extrabold">{t.actions.delete}</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                {t.studentsPage.deleteConfirm} &quot;{teacher.name}&quot;
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex gap-2 justify-end mt-2">
                              <AlertDialogCancel className="border-border rounded-xl">{t.actions.cancel}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(teacher.id)}
                                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl border-0"
                              >
                                {t.actions.delete}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      {/* Primary Subject specialty */}
                      {teacher.subject && (
                        <div className="mb-3.5 flex justify-start">
                          <Badge variant="secondary" className="bg-primary/10 border border-primary/20 text-primary rounded-lg text-[10px] font-bold">
                            <BookOpen className="me-1 h-3 w-3" />
                            <span>{tp.subject}: {teacher.subject}</span>
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Classes assigned list */}
                    <div className="border-t border-border/30 pt-3 mt-auto">
                      <p className="text-[10px] text-muted-foreground font-bold mb-1.5">{tp.assignments}:</p>
                      {teacherAssigns.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground font-medium">{tp.noAssignments}</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 justify-start">
                          {teacherAssigns.slice(0, 3).map((a) => {
                            const cls = classes.find((c) => {
                              const g = getGradeFromClassName(c.name)
                              return g === a.gradeId
                            })
                            return (
                              <Badge
                                key={a.id}
                                variant="outline"
                                className="bg-muted border-border text-muted-foreground rounded-md text-[9px] font-bold flex items-center gap-1 group/badge"
                              >
                                <span>{a.subject} ({cls?.name || `الصف ${a.gradeId}`})</span>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    void handleRemoveAssignment(a.id);
                                  }}
                                  className="text-muted-foreground hover:text-rose-500 rounded p-[1px] hover:bg-rose-50 dark:hover:bg-rose-950/30 flex-shrink-0"
                                >
                                  <Trash2 className="h-2 w-2" />
                                </button>
                              </Badge>
                            )
                          })}
                          {teacherAssigns.length > 3 && (
                            <Badge variant="secondary" className="bg-muted text-muted-foreground text-[9px] rounded-md font-bold">
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
      </motion.div>
    </motion.div>
  )
}

