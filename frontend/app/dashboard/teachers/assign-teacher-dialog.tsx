"use client"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Teacher, SchoolClass } from "@/lib/store"
import { useLanguage } from "@/lib/i18n/context"

export const subjectsList = [
  "اللغة العربية",
  "اللغة الإنجليزية",
  "الرياضيات",
  "العلوم والحياة",
  "التربية الدينية",
  "الدراسات الاجتماعية",
  "التكنولوجيا",
]

interface AssignTeacherDialogProps {
  teachers: Teacher[]
  classes: SchoolClass[]
  assignTeacherId: string
  setAssignTeacherId: (id: string) => void
  assignClassId: string
  setAssignClassId: (id: string) => void
  assignSemester: string
  setAssignSemester: (s: string) => void
  assignSubject: string
  setAssignSubject: (s: string) => void
  onConfirm: () => void
}

export default function AssignTeacherDialog({
  teachers,
  classes,
  assignTeacherId,
  setAssignTeacherId,
  assignClassId,
  setAssignClassId,
  assignSemester,
  setAssignSemester,
  assignSubject,
  setAssignSubject,
  onConfirm,
}: AssignTeacherDialogProps) {
  const { t, language } = useLanguage()
  const tp = t.teachersPage

  return (
    <DialogContent
      dir={language === "ar" ? "rtl" : "ltr"}
      className={`${language === "ar" ? "text-right" : "text-left"} bg-card border-border rounded-2xl max-w-md`}
    >
      <DialogHeader>
        <DialogTitle className="text-foreground font-extrabold text-lg flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          {tp.assignTeacher}
        </DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-4 pt-2">
        {/* Teacher */}
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs sm:text-sm">{t.forms.selectTeacher}</Label>
          <Select value={assignTeacherId} onValueChange={setAssignTeacherId}>
            <SelectTrigger className="bg-background border-border rounded-xl h-10">
              <SelectValue placeholder={t.forms.selectTeacher} />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((tc) => (
                <SelectItem key={tc.id} value={tc.id}>
                  {tc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Class + Semester */}
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

        {/* Subject */}
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

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-2">
          <DialogClose asChild>
            <Button variant="outline" className="border-border rounded-xl">
              {t.actions.cancel}
            </Button>
          </DialogClose>
          <Button
            onClick={onConfirm}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 font-bold h-10 border-0"
          >
            {t.actions.confirm}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}
