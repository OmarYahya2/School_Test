"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Search, Phone, Plus, Pencil, Trash2, X, Eye, CalendarCheck } from "lucide-react"
import Link from "next/link"
import { useTeacherTheme } from "@/lib/teacher-theme-context"
import { useTeacherClass } from "@/lib/teacher-class-context"
import ClassSwitcher from "@/components/class-switcher"
import { 
  useTeacherStudents, 
  useCreateTeacherStudentMutation, 
  useUpdateTeacherStudentMutation, 
  useDeleteTeacherStudentMutation,
  useTeacherAttendance,
  useSaveTeacherAttendanceMutation
} from "@/lib/hooks/use-teacher-data"
import type { TeacherStudent } from "@/lib/api/teacher.api"
import { toast } from "sonner"
import { useTeacherLanguage } from "@/lib/teacher-language-context"

export default function TeacherStudentsPage() {
  const { config } = useTeacherTheme()
  const { t } = useTeacherLanguage()
  const { selectedClassId } = useTeacherClass()
  const { data: students = [], isLoading: loading } = useTeacherStudents()
  const createStudent = useCreateTeacherStudentMutation()
  const updateStudent = useUpdateTeacherStudentMutation()
  const deleteStudent = useDeleteTeacherStudentMutation()
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false)
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0])
  const [attendanceState, setAttendanceState] = useState<Record<string, boolean>>({})

  const { data: attendanceRecords } = useTeacherAttendance(selectedClassId || undefined)
  const saveAttendance = useSaveTeacherAttendanceMutation()

  const [editing, setEditing] = useState<TeacherStudent | null>(null)
  const [form, setForm] = useState({ name: "", age: "", parentPhone: "", notes: "" })

  const tc = {
    ocean:   { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200/50", gradient: "from-blue-400/20 to-sky-300/10" },
    violet:  { bg: "bg-violet-500", text: "text-violet-600", light: "bg-violet-50", border: "border-violet-200/50", gradient: "from-violet-400/20 to-fuchsia-300/10" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200/50", gradient: "from-emerald-400/20 to-teal-300/10" },
    rose:    { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-200/50", gradient: "from-rose-400/20 to-pink-300/10" },
    amber:   { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-200/50", gradient: "from-amber-400/20 to-orange-300/10" },
  }[config.color] || { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200/50", gradient: "from-blue-400/20 to-sky-300/10" }

  // Filter students by selected class
  const classStudents = useMemo(() => {
    return selectedClassId
      ? students.filter((s) => s.class.id === selectedClassId)
      : students
  }, [students, selectedClassId])

  const filtered = useMemo(() => {
    return classStudents.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [classStudents, search])

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

  // Initialize attendance state when dialog opens or date changes
  useEffect(() => {
    if (attendanceDialogOpen) {
      const record = attendanceRecords?.find(r => r.date.split('T')[0] === attendanceDate)
      const newState: Record<string, boolean> = {}
      
      // Default all to true (Present)
      classStudents.forEach(s => {
        newState[s.id] = true
      })
      
      // Override with existing record if available
      if (record) {
        record.records.forEach((r: any) => {
          newState[r.studentId] = r.present
        })
      }
      
      setAttendanceState(newState)
    }
  }, [attendanceDialogOpen, attendanceDate, attendanceRecords, classStudents])

  const handleSaveAttendance = async () => {
    if (!selectedClassId) {
      toast.error("الرجاء اختيار الصف أولاً")
      return
    }

    const records = classStudents.map(student => ({
      studentId: student.id,
      present: attendanceState[student.id] ?? true
    }))

    saveAttendance.mutate(
      { classId: selectedClassId, date: new Date(attendanceDate).toISOString(), records },
      {
        onSuccess: () => {
          setAttendanceDialogOpen(false)
          toast.success("تم حفظ الحضور بنجاح")
        },
        onError: (err: any) => {
          toast.error(err?.message || "حدث خطأ أثناء حفظ الحضور")
        }
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form, age: parseInt(form.age, 10) }
    if (editing) {
      updateStudent.mutate(
        { id: editing.id, data: payload as any },
        {
          onSuccess: () => {
            setDialogOpen(false)
            toast.success("تم تحديث الطالب")
          },
          onError: (err: any) => {
            toast.error(err?.message || "حدث خطأ")
          },
        }
      )
    } else {
      createStudent.mutate(payload as any, {
        onSuccess: () => {
          setDialogOpen(false)
          toast.success("تم إضافة الطالب")
        },
        onError: (err: any) => {
          toast.error(err?.message || "حدث خطأ")
        },
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطالب؟")) return
    deleteStudent.mutate(id, {
      onSuccess: () => {
        toast.success("تم حذف الطالب")
      },
      onError: (err: any) => {
        toast.error(err?.message || "حدث خطأ")
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-6">
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${tc.gradient} rounded-full blur-3xl -z-10 opacity-60`} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900">{t.teacher.myStudents}</h1>
            <ClassSwitcher />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setAttendanceDialogOpen(true)} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold ${tc.light} ${tc.text} hover:opacity-90 transition-opacity border ${tc.border} backdrop-blur-sm`}>
              <CalendarCheck className="h-4 w-4" />
              {t.teacher.takeAttendance}
            </button>
            <button onClick={openCreate} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-white ${tc.bg} hover:opacity-90 shadow-sm`}>
              <Plus className="h-4 w-4" />
              {t.teacher.addStudent}
            </button>
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${tc.light} ${tc.text} border ${tc.border} backdrop-blur-sm`}>
              <Users className="h-4 w-4" />
              {classStudents.length} {t.teacher.teacher}
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={t.teacher.searchStudent}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/30 bg-white/60 backdrop-blur-sm py-2.5 pr-10 pl-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
        />
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100/70 backdrop-blur-sm" />
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
              className="group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className={`absolute top-0 left-0 w-24 h-24 bg-gradient-to-br ${tc.gradient} rounded-full blur-2xl opacity-20 -z-10`} />
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tc.light} ${tc.text} text-lg font-bold shadow-sm`}>
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{student.name}</h3>
                  <p className="text-xs text-slate-500">{student.class.name}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/teacher/student/${student.id}`}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-white/60 hover:text-blue-600 transition-colors"
                    title={t.teacher.studentProfile}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                  <button onClick={() => openEdit(student)} className="rounded-md p-1.5 text-slate-400 hover:bg-white/60 hover:text-slate-600 transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(student.id)} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50/60 hover:text-rose-600 transition-colors">
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
        <div className="text-center py-16 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 text-slate-400">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">
            {classStudents.length === 0 ? t.teacher.noStudents : t.teacher.noSearchResults}
          </p>
        </div>
      )}

      <AnimatePresence>
        {attendanceDialogOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl p-6">
              <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${tc.gradient} rounded-full blur-3xl opacity-30 -z-10`} />
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">{t.teacher.attendanceTitle}</h2>
                <button onClick={() => setAttendanceDialogOpen(false)} className="rounded-md p-1.5 text-slate-400 hover:bg-white/60 hover:text-slate-600 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6 flex items-center gap-4">
                <label className="text-sm font-semibold text-slate-700">{t.teacher.date}:</label>
                <input 
                  type="date" 
                  value={attendanceDate} 
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="rounded-lg border border-white/30 bg-white/60 backdrop-blur-sm px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-white/40"
                />
              </div>

              {classStudents.length === 0 ? (
                <div className="py-12 text-center text-slate-400">{t.teacher.noStudents}</div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-2">
                  {classStudents.map(student => (
                    <div key={student.id} className="flex items-center justify-between rounded-xl border border-white/20 bg-white/50 backdrop-blur-sm p-3 hover:bg-white/70 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${tc.light} ${tc.text} text-sm font-bold shadow-sm`}>
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900">{student.name}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/60 p-1 rounded-lg backdrop-blur-sm">
                        <button
                          onClick={() => setAttendanceState(prev => ({ ...prev, [student.id]: true }))}
                          className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                            attendanceState[student.id] 
                              ? 'bg-emerald-500 text-white shadow-sm' 
                              : 'text-slate-500 hover:bg-white/80'
                          }`}
                        >
                          {t.teacher.present}
                        </button>
                        <button
                          onClick={() => setAttendanceState(prev => ({ ...prev, [student.id]: false }))}
                          className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                            !attendanceState[student.id] 
                              ? 'bg-rose-500 text-white shadow-sm' 
                              : 'text-slate-500 hover:bg-white/80'
                          }`}
                        >
                          {t.teacher.absent}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-white/20">
                <button 
                  type="button" 
                  onClick={() => setAttendanceDialogOpen(false)} 
                  className="rounded-xl border border-white/30 bg-white/60 backdrop-blur-sm px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-white/80 transition-colors"
                >
                  {t.teacher.cancel}
                </button>
                <button
                  onClick={handleSaveAttendance}
                  disabled={saveAttendance.isPending || classStudents.length === 0}
                  className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity ${tc.bg} hover:opacity-90 disabled:opacity-50`}
                >
                  {saveAttendance.isPending ? "..." : t.teacher.saveAttendance}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {dialogOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative overflow-hidden w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl p-6">
              <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${tc.gradient} rounded-full blur-3xl opacity-30 -z-10`} />
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">{editing ? t.teacher.editStudent : t.teacher.addStudentTitle}</h2>
                <button onClick={() => setDialogOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-white/60">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.teacher.name}</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-white/30 bg-white/60 backdrop-blur-sm px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-white/40" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.teacher.age}</label>
                  <input required type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="w-full rounded-lg border border-white/30 bg-white/60 backdrop-blur-sm px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-white/40" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.teacher.parentPhone}</label>
                  <input value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} className="w-full rounded-lg border border-white/30 bg-white/60 backdrop-blur-sm px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-white/40" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setDialogOpen(false)} className="rounded-lg border border-white/30 bg-white/60 backdrop-blur-sm px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white/80">{t.teacher.cancel}</button>
                  <button type="submit" className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${tc.bg} hover:opacity-90 shadow-sm`}>{editing ? t.teacher.save : t.teacher.add}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
