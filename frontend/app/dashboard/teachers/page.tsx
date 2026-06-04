"use client"

import { useState } from "react"
import { Trash2, UserCheck, BookOpen, GraduationCap, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogTrigger,
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
import { toast } from "sonner"
import type { Teacher, TeacherAssignment, SchoolClass } from "@/lib/store"
import { useAdminTeachers, useAdminClasses, useAdminTeacherAssignments, useDeleteTeacherMutation, useCreateTeacherAssignmentMutation, useDeleteTeacherAssignmentMutation } from "@/lib/hooks/use-admin-data"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"
import dynamic from "next/dynamic"
import { subjectsList } from "./assign-teacher-dialog"

const AssignTeacherDialog = dynamic(() => import("./assign-teacher-dialog"), { ssr: false })

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
  const { data: teachers = [], isLoading: teachersLoading } = useAdminTeachers()
  const { data: assignments = [] } = useAdminTeacherAssignments()
  const { data: classes = [] } = useAdminClasses()
  const deleteTeacher = useDeleteTeacherMutation()
  const createAssignment = useCreateTeacherAssignmentMutation()
  const deleteAssignment = useDeleteTeacherAssignmentMutation()
  const loading = teachersLoading
  const [assignOpen, setAssignOpen] = useState(false)

  // Assignment form
  const [assignTeacherId, setAssignTeacherId] = useState("")
  const [assignClassId, setAssignClassId] = useState("")
  const [assignSemester, setAssignSemester] = useState("first")
  const [assignSubject, setAssignSubject] = useState(subjectsList[0])

  async function handleDelete(id: string) {
    deleteTeacher.mutate(id, {
      onSuccess: () => {
        toast.success(tp.deleteSuccess)
      },
      onError: () => {
        toast.error(tp.deleteTeacher)
      },
    })
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
    createAssignment.mutate(
      {
        teacherId: assignTeacherId,
        gradeId,
        semester: assignSemester,
        subject: assignSubject,
        classId: assignClassId,
      },
      {
        onSuccess: () => {
          setAssignOpen(false)
          setAssignClassId("")
          toast.success(tp.addSuccess)
        },
        onError: () => {
          toast.error(tp.assignTeacher)
        },
      }
    )
  }

  async function handleRemoveAssignment(id: string) {
    deleteAssignment.mutate(id, {
      onSuccess: () => {
        toast.success(t.actions.delete)
      },
      onError: () => {
        toast.error(t.actions.delete)
      },
    })
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
            {assignOpen && (
              <AssignTeacherDialog
                teachers={teachers}
                classes={classes}
                assignTeacherId={assignTeacherId}
                setAssignTeacherId={setAssignTeacherId}
                assignClassId={assignClassId}
                setAssignClassId={setAssignClassId}
                assignSemester={assignSemester}
                setAssignSemester={setAssignSemester}
                assignSubject={assignSubject}
                setAssignSubject={setAssignSubject}
                onConfirm={handleAssign}
              />
            )}
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
                  className="border-border/40 bg-card shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative overflow-hidden group rounded-2xl"
                >
                  {/* Top accent bar */}
                  <div className="h-1.5 bg-gradient-to-l from-primary/80 to-primary/30 w-full" />

                  <CardContent className="p-5 flex flex-col justify-between h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-primary font-black text-[11px] leading-none">
                            {teacher.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className={language === "ar" ? "text-right" : "text-left"}>
                          <h3 className="font-extrabold text-foreground text-sm leading-tight truncate">{teacher.name}</h3>
                          {teacher.phone && (
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium mt-0.5" dir="ltr">
                              <Phone className="h-2.5 w-2.5 opacity-60" />
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
                            className="h-7 w-7 -mt-0.5 text-muted-foreground/60 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
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

                    {/* Assignments list */}
                    <div className="border-t border-border/30 pt-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="h-5 w-5 rounded-md bg-muted flex items-center justify-center">
                          <GraduationCap className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold">{tp.assignments}</p>
                      </div>
                      {teacherAssigns.length === 0 ? (
                        <div className="flex items-center gap-2 py-3 px-2 bg-muted/30 rounded-xl">
                          <div className="h-5 w-5 rounded bg-muted flex items-center justify-center">
                            <BookOpen className="h-2.5 w-2.5 text-muted-foreground/40" />
                          </div>
                          <p className="text-[10px] text-muted-foreground/60 font-medium">{tp.noAssignments}</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {teacherAssigns.map((a) => {
                            const cls = classes.find((c) => {
                              const g = getGradeFromClassName(c.name)
                              return g === a.gradeId
                            })
                            return (
                              <div
                                key={a.id}
                                className="flex items-center justify-between gap-2 bg-muted/30 hover:bg-muted/60 border border-border/40 rounded-xl px-3 py-2 transition-all group/row"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="h-3.5 w-3.5" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-foreground truncate leading-tight">
                                      {a.subject}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground font-medium truncate leading-tight">
                                      {cls?.name || `الصف ${a.gradeId}`}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                                    a.semester === "first"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  }`}>
                                    {a.semester === "first" ? "الأول" : "الثاني"}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      void handleRemoveAssignment(a.id)
                                    }}
                                    className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover/row:opacity-100 focus:opacity-100"
                                    title="إزالة التعيين"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            )
                          })}
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

