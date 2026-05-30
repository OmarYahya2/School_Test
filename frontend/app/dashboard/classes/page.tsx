"use client"

import { useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { Plus, Pencil, Trash2, BookOpen, Users, GraduationCap, Search, Filter, ArrowUpRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import {
  createClass,
  updateClassById,
  deleteClassById,
} from "@/lib/supabase-school"
import { useAdminClasses, useAdminTeachers, useAdminStudents } from "@/lib/hooks/use-admin-data"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"

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

export default function ClassesPage() {
  const { t, language } = useLanguage()
  const cp = t.classesPage
  const { data: classes = [], isLoading: classesLoading, refetch: refetchClasses } = useAdminClasses()
  const { data: teachers = [] } = useAdminTeachers()
  const { data: allStudents = [] } = useAdminStudents()
  const loading = classesLoading
  const [newClassName, setNewClassName] = useState("")
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null)
  const [editName, setEditName] = useState("")
  const [newClassTeacherId, setNewClassTeacherId] = useState("")
  const [editTeacherId, setEditTeacherId] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const studentCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allStudents.forEach((s) => {
      counts[s.classId] = (counts[s.classId] || 0) + 1
    })
    return counts
  }, [allStudents])

  const reload = useCallback(() => {
    refetchClasses()
  }, [refetchClasses])

  async function handleAdd() {
    if (!newClassName.trim()) {
      toast.error(cp.className)
      return
    }
    const created = await createClass(newClassName.trim(), newClassTeacherId || null)
    if (!created) {
      toast.error(cp.addClass)
      return
    }
    setNewClassName("")
    setNewClassTeacherId("")
    setAddOpen(false)
    void reload()
    toast.success(cp.addSuccess)
  }

  async function handleEdit() {
    if (!editingClass || !editName.trim()) return
    const updated = await updateClassById(editingClass.id, {
      name: editName.trim(),
      teacherId: editTeacherId === "none" ? null : editTeacherId,
    })
    if (!updated) {
      toast.error(cp.editClass)
      return
    }
    setEditingClass(null)
    setEditName("")
    setEditTeacherId("")
    setEditOpen(false)
    void reload()
    toast.success(cp.addSuccess)
  }

  async function handleDelete(id: string) {
    await deleteClassById(id)
    void reload()
    toast.success(cp.deleteSuccess)
  }

  function getTeacherName(teacherId: string | null): string {
    if (!teacherId) return t.teachersPage.noSubject
    const found = teachers.find((tc) => tc.id === teacherId)
    return found ? found.name : t.teachersPage.noSubject
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className={`space-y-6 ${language === "ar" ? "text-right" : "text-left"}`}
    >
      {/* Header card with action controls */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-5 border border-border/50 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-foreground">{cp.title}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{cp.noClassesDesc}</p>
          </div>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold border-0 flex items-center gap-1.5 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span>{cp.addClass}</span>
            </Button>
          </DialogTrigger>
          <DialogContent dir={language === "ar" ? "rtl" : "ltr"} className={`${language === "ar" ? "text-right" : "text-left"} bg-card border-border rounded-2xl max-w-md`}>
            <DialogHeader>
              <DialogTitle className="text-foreground font-extrabold text-lg flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {cp.addClassTitle}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground font-bold text-xs sm:text-sm">{cp.className}</Label>
                <Input
                  placeholder={cp.className}
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="bg-background border-border rounded-xl h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground font-bold text-xs sm:text-sm">{t.forms.selectTeacher}</Label>
                <Select value={newClassTeacherId} onValueChange={setNewClassTeacherId}>
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
              <div className="flex gap-2 justify-end pt-2">
                <DialogClose asChild>
                  <Button variant="outline" className="border-border rounded-xl">{t.actions.cancel}</Button>
                </DialogClose>
                <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 font-bold h-10 border-0">
                  {cp.addClass}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Classes Grid */}
      <motion.div variants={itemVariants}>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
                <div className="space-y-2">
                  <div className="h-4 w-36 skeleton" />
                  <div className="h-3 w-24 skeleton" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 w-full skeleton rounded-full" />
                  <div className="flex justify-between">
                    <div className="h-2.5 w-16 skeleton" />
                    <div className="h-2.5 w-12 skeleton" />
                  </div>
                </div>
                <div className="h-9 w-full skeleton rounded-xl" />
              </div>
            ))}
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-12 text-center">
            <div className="h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3.5">
              <BookOpen className="h-7 w-7 text-muted-foreground/30" />
            </div>
            <p className="text-sm sm:text-base font-bold text-foreground">{cp.noClasses}</p>
            <p className="text-xs text-muted-foreground mt-1">{cp.noClassesDesc}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => {
              const count = studentCounts[cls.id] || 0
              const capacityPercent = Math.min((count / 30) * 100, 100)
              return (
                <Card
                  key={cls.id}
                  className="border-border/50 bg-card shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group rounded-2xl"
                >
                  <CardContent className="p-5 flex flex-col justify-between h-full min-h-[175px]">
                    <div>
                      {/* Top Header details */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className={language === "ar" ? "text-right" : "text-left"}>
                          <h3 className="font-bold text-foreground text-xs sm:text-sm">{cls.name}</h3>
                          <span className="text-[10px] text-muted-foreground font-semibold block mt-0.5">
                            {t.forms.selectTeacher}: {getTeacherName(cls.teacherId)}
                          </span>
                        </div>

                        {/* Quick edit triggers */}
                        <div className="flex gap-1">
                          <Dialog open={editOpen && editingClass?.id === cls.id} onOpenChange={(v) => {
                            if (v) {
                              setEditingClass(cls)
                              setEditName(cls.name)
                              setEditTeacherId(cls.teacherId || "none")
                            }
                            setEditOpen(v)
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent dir={language === "ar" ? "rtl" : "ltr"} className={`${language === "ar" ? "text-right" : "text-left"} bg-card border-border rounded-2xl max-w-md`}>
                              <DialogHeader>
                                <DialogTitle className="text-foreground font-extrabold text-lg flex items-center gap-2">
                                  <Pencil className="h-4 w-4 text-primary" />
                                  {cp.editClass}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="flex flex-col gap-4 pt-2">
                                <div className="space-y-1.5">
                                  <Label className="text-muted-foreground font-bold text-xs sm:text-sm">{cp.className}</Label>
                                  <Input
                                    placeholder={cp.className}
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="bg-background border-border rounded-xl h-10"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-muted-foreground font-bold text-xs sm:text-sm">{t.forms.selectTeacher}</Label>
                                  <Select value={editTeacherId} onValueChange={setEditTeacherId}>
                                    <SelectTrigger className="bg-background border-border rounded-xl h-10">
                                      <SelectValue placeholder={t.forms.selectTeacher} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">{t.teachersPage.noSubject}</SelectItem>
                                      {teachers.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                          {t.name} {t.subject ? `(${t.subject})` : ""}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex gap-2 justify-end pt-2">
                                  <DialogClose asChild>
                                    <Button variant="outline" className="border-border rounded-xl">{t.actions.cancel}</Button>
                                  </DialogClose>
                                  <Button onClick={handleEdit} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 font-bold h-10 border-0">
                                    {t.actions.save}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

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
                            <AlertDialogContent className={`bg-card border-border rounded-2xl ${language === "ar" ? "text-right" : "text-left"} max-w-md`}>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-foreground font-extrabold">{cp.deleteClass}</AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                  {cp.deleteClass} &quot;{cls.name}&quot;?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex gap-2 justify-end mt-2">
                                <AlertDialogCancel className="border-border rounded-xl">{t.actions.cancel}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(cls.id)}
                                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl border-0"
                                >
                                  {t.actions.delete}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {/* Student Capacity Progress indicator */}
                      <div className="space-y-1.5 mb-4 mt-2">
                        <div className="flex justify-between items-center text-[10px] font-semibold">
                          <span className="text-muted-foreground">{count} / 30 {cp.students}</span>
                          <span className={`font-bold ${
                            capacityPercent >= 90 ? "text-rose-500" :
                            capacityPercent >= 70 ? "text-amber-500" :
                            "text-emerald-600"
                          }`}>{Math.round(capacityPercent)}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              capacityPercent >= 90 ? "bg-rose-400" :
                              capacityPercent >= 70 ? "bg-amber-400" :
                              "bg-emerald-500"
                            }`}
                            style={{ width: `${capacityPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Link buttons */}
                    <div className="border-t border-border/30 pt-3 mt-auto">
                      <Button asChild variant="outline" size="sm" className="w-full border-border text-foreground/70 hover:bg-accent rounded-xl font-bold text-xs h-9 flex items-center justify-between group/btn">
                        <Link href={`/dashboard/class/${cls.id}`} className="w-full flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{cp.viewDetails}</span>
                          </span>
                          <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover/btn:-translate-x-0.5 transition-transform" />
                        </Link>
                      </Button>
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

