"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Award, Plus, Pencil, Trash2, X } from "lucide-react"
import { useAppTheme } from "@/lib/theme-context"
import { useTeacherClass } from "@/lib/teacher-class-context"
import ClassSwitcher from "@/components/class-switcher"
import { useTeacherGrades, useTeacherStudents } from "@/lib/hooks/use-teacher-data"
import { createTeacherGrade, updateTeacherGrade, deleteTeacherGrade, type TeacherGrade } from "@/lib/api/teacher.api"
import { toast } from "sonner"

export default function TeacherGradesPage() {
  const { config } = useAppTheme()
  const { selectedClassId } = useTeacherClass()
  const { data: grades = [], isLoading: gradesLoading, refetch: refetchGrades } = useTeacherGrades()
  const { data: students = [], isLoading: studentsLoading } = useTeacherStudents()
  const loading = gradesLoading || studentsLoading
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TeacherGrade | null>(null)
  const [form, setForm] = useState({ studentId: "", subject: "", grade: "", maxGrade: "100", semester: "first", examType: "exam", notes: "" })

  const tc = {
    ocean:   { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200" },
    violet:  { bg: "bg-violet-500", text: "text-violet-600", light: "bg-violet-50", border: "border-violet-200" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200" },
    rose:    { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-200" },
    amber:   { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-200" },
  }[config.color] || { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200" }

  // Filter by selected class
  const classGrades = selectedClassId
    ? grades.filter((g) => g.student.class.id === selectedClassId)
    : grades

  const classStudents = selectedClassId
    ? students.filter((s) => s.class.id === selectedClassId)
    : students

  const openCreate = () => {
    setEditing(null)
    setForm({ studentId: "", subject: "", grade: "", maxGrade: "100", semester: "first", examType: "exam", notes: "" })
    setDialogOpen(true)
  }

  const openEdit = (grade: TeacherGrade) => {
    setEditing(grade)
    setForm({ studentId: grade.student.id, subject: grade.subject, grade: String(grade.grade), maxGrade: String(grade.maxGrade), semester: grade.semester, examType: grade.examType, notes: "" })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = { ...form, grade: parseFloat(form.grade), maxGrade: parseFloat(form.maxGrade) }
      if (editing) {
        await updateTeacherGrade(editing.id, payload as any)
        toast.success("تم تحديث الدرجة")
      } else {
        await createTeacherGrade(payload as any)
        toast.success("تم إضافة الدرجة")
      }
      setDialogOpen(false)
      refetchGrades()
    } catch (err: any) {
      toast.error(err?.message || "حدث خطأ")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الدرجة؟")) return
    try {
      await deleteTeacherGrade(id)
      toast.success("تم حذف الدرجة")
      refetchGrades()
    } catch (err: any) {
      toast.error(err?.message || "حدث خطأ")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-slate-900">الدرجات</h1>
          <ClassSwitcher />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openCreate} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white ${tc.bg} hover:opacity-90`}>
            <Plus className="h-4 w-4" />
            إضافة درجة
          </button>
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${tc.light} ${tc.text} border ${tc.border}`}>
            <BookOpen className="h-4 w-4" />
            {classGrades.length} درجة مسجلة
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {classGrades.map((grade, i) => (
            <motion.div
              key={grade.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tc.light} ${tc.text}`}>
                <Award className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900">{grade.student.name}</h3>
                <p className="text-xs text-slate-500">{grade.student.class.name} — {grade.subject}</p>
              </div>
              <div className="text-left">
                <span className={`text-lg font-black ${tc.text}`}>{grade.grade}</span>
                <span className="text-xs text-slate-400"> / {grade.maxGrade}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(grade)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(grade.id)} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && classGrades.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">لا توجد درجات مسجلة لهذا الصف</p>
        </div>
      )}

      <AnimatePresence>
        {dialogOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">{editing ? "تعديل درجة" : "إضافة درجة"}</h2>
                <button onClick={() => setDialogOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الطالب</label>
                  <select required value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100">
                    <option value="">اختر طالب</option>
                    {classStudents.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">المادة</label>
                  <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">الدرجة</label>
                    <input required type="number" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">الحد الأقصى</label>
                    <input required type="number" value={form.maxGrade} onChange={(e) => setForm({ ...form, maxGrade: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setDialogOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">إلغاء</button>
                  <button type="submit" className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${tc.bg} hover:opacity-90`}>{editing ? "حفظ" : "إضافة"}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
