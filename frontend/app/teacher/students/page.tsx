"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Search, Phone, Plus, Pencil, Trash2, X, Eye } from "lucide-react"
import Link from "next/link"
import { useAppTheme } from "@/lib/theme-context"
import { useTeacherClass } from "@/lib/teacher-class-context"
import ClassSwitcher from "@/components/class-switcher"
import { useTeacherStudents } from "@/lib/hooks/use-teacher-data"
import { createTeacherStudent, updateTeacherStudent, deleteTeacherStudent, type TeacherStudent } from "@/lib/api/teacher.api"
import { toast } from "sonner"

export default function TeacherStudentsPage() {
  const { config } = useAppTheme()
  const { selectedClassId } = useTeacherClass()
  const { data: students = [], isLoading: loading, refetch } = useTeacherStudents()
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TeacherStudent | null>(null)
  const [form, setForm] = useState({ name: "", age: "", parentPhone: "", notes: "" })

  const tc = {
    ocean:   { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200" },
    violet:  { bg: "bg-violet-500", text: "text-violet-600", light: "bg-violet-50", border: "border-violet-200" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200" },
    rose:    { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-200" },
    amber:   { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-200" },
  }[config.color] || { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200" }

  // Filter students by selected class
  const classStudents = selectedClassId
    ? students.filter((s) => s.class.id === selectedClassId)
    : students

  const filtered = classStudents.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditing(null)
    setForm({ name: "", age: "", parentPhone: "", notes: "" })
    setDialogOpen(true)
  }

  const openEdit = (student: TeacherStudent) => {
    setEditing(student)
    setForm({ name: student.name, age: String(student.age), parentPhone: student.parentPhone || "", notes: "" })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = { ...form, age: parseInt(form.age, 10) }
      if (editing) {
        await updateTeacherStudent(editing.id, payload as any)
        toast.success("تم تحديث الطالب")
      } else {
        await createTeacherStudent(payload as any)
        toast.success("تم إضافة الطالب")
      }
      setDialogOpen(false)
      refetch()
    } catch (err: any) {
      toast.error(err?.message || "حدث خطأ")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطالب؟")) return
    try {
      await deleteTeacherStudent(id)
      toast.success("تم حذف الطالب")
      refetch()
    } catch (err: any) {
      toast.error(err?.message || "حدث خطأ")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-slate-900">طلابي</h1>
          <ClassSwitcher />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openCreate} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white ${tc.bg} hover:opacity-90`}>
            <Plus className="h-4 w-4" />
            إضافة طالب
          </button>
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${tc.light} ${tc.text} border ${tc.border}`}>
            <Users className="h-4 w-4" />
            {classStudents.length} طالب
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="بحث عن طالب..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
        />
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((student, i) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tc.light} ${tc.text} text-lg font-bold`}>
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{student.name}</h3>
                  <p className="text-xs text-slate-500">{student.class.name}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/teacher/student/${student.id}`}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                    title="عرض الملف"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                  <button onClick={() => openEdit(student)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(student.id)} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <Phone className="h-3.5 w-3.5" />
                <span dir="ltr">{student.parentPhone || "—"}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">
            {classStudents.length === 0 ? "لا يوجد طلاب في هذا الصف" : "لا يوجد طلاب مطابقين للبحث"}
          </p>
        </div>
      )}

      <AnimatePresence>
        {dialogOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">{editing ? "تعديل طالب" : "إضافة طالب"}</h2>
                <button onClick={() => setDialogOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الاسم</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">العمر</label>
                  <input required type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">هاتف ولي الأمر</label>
                  <input value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100" />
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
