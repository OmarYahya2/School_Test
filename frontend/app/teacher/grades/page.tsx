"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Award, Plus, Pencil, Trash2, X, Search, GraduationCap, User } from "lucide-react"
import { useTeacherTheme } from "@/lib/teacher-theme-context"
import { useTeacherClass } from "@/lib/teacher-class-context"
import ClassSwitcher from "@/components/class-switcher"
import { useTeacherGrades, useTeacherStudents, useTeacherProfile, useCreateTeacherGrade, useUpdateTeacherGrade, useDeleteTeacherGrade } from "@/lib/hooks/use-teacher-data"
import type { TeacherGrade } from "@/lib/api/teacher.api"
import { toast } from "sonner"
import { useTeacherLanguage } from "@/lib/teacher-language-context"

interface StudentWithGrades {
  id: string
  name: string
  className: string
  grades: TeacherGrade[]
  latestGrade: TeacherGrade | null
}

export default function TeacherGradesPage() {
  const { config } = useTeacherTheme()
  const { t } = useTeacherLanguage()
  const { selectedClassId } = useTeacherClass()
  const { data: profile } = useTeacherProfile()
  const { data: grades = [], isLoading: gradesLoading } = useTeacherGrades()
  const { data: students = [], isLoading: studentsLoading } = useTeacherStudents()
  const createGrade = useCreateTeacherGrade()
  const updateGrade = useUpdateTeacherGrade()
  const deleteGrade = useDeleteTeacherGrade()
  const loading = gradesLoading || studentsLoading
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewAllOpen, setViewAllOpen] = useState(false)
  const [viewAllStudent, setViewAllStudent] = useState<StudentWithGrades | null>(null)
  const [gradesSort, setGradesSort] = useState<"newest" | "oldest">("newest")
  const [editing, setEditing] = useState<TeacherGrade | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [form, setForm] = useState({ studentId: "", subject: "", grade: "", maxGrade: "100", semester: "first", examType: "exam", notes: "" })

  const teacherSubject = profile?.assignedSubjects?.[0] || profile?.teacherAssignments?.[0]?.subject || profile?.subject || ""

  const tc = {
    ocean:   { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200/50", gradient: "from-blue-400/20 to-sky-300/10" },
    violet:  { bg: "bg-violet-500", text: "text-violet-600", light: "bg-violet-50", border: "border-violet-200/50", gradient: "from-violet-400/20 to-fuchsia-300/10" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200/50", gradient: "from-emerald-400/20 to-teal-300/10" },
    rose:    { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-200/50", gradient: "from-rose-400/20 to-pink-300/10" },
    amber:   { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-200/50", gradient: "from-amber-400/20 to-orange-300/10" },
  }[config.color] || { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200/50", gradient: "from-blue-400/20 to-sky-300/10" }

  // Build students with their grades
  const studentsWithGrades: StudentWithGrades[] = students
    .filter((s) => !selectedClassId || s.class.id === selectedClassId)
    .map((s) => {
      const studentGrades = grades.filter((g) => g.student.id === s.id)
      return {
        id: s.id,
        name: s.name,
        className: s.class.name,
        grades: studentGrades,
        latestGrade: studentGrades.length > 0 ? studentGrades[0] : null,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name, "ar"))

  const filteredStudents = studentsWithGrades.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalGrades = grades.filter((g) =>
    !selectedClassId || g.student.class.id === selectedClassId
  ).length

  const openCreateForStudent = (studentId: string) => {
    setEditing(null)
    setSelectedStudentId(studentId)
    setForm({ studentId, subject: teacherSubject, grade: "", maxGrade: "100", semester: "first", examType: "exam", notes: "" })
    setDialogOpen(true)
  }

  const openViewAll = (student: StudentWithGrades) => {
    setViewAllStudent(student)
    setGradesSort("newest")
    setViewAllOpen(true)
  }

  const sortedViewAllGrades = viewAllStudent
    ? gradesSort === "newest"
      ? viewAllStudent.grades
      : [...viewAllStudent.grades].reverse()
    : []

  const openEdit = (grade: TeacherGrade) => {
    setEditing(grade)
    setSelectedStudentId(grade.student.id)
    setForm({ studentId: grade.student.id, subject: grade.subject, grade: String(grade.grade), maxGrade: String(grade.maxGrade), semester: grade.semester, examType: grade.examType, notes: "" })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form, grade: parseFloat(form.grade), maxGrade: parseFloat(form.maxGrade) }
    if (editing) {
      updateGrade.mutate(
        { id: editing.id, data: payload as any },
        {
          onSuccess: () => {
            setDialogOpen(false)
            setEditing(null)
            toast.success("تم تحديث الدرجة")
          },
          onError: (err: any) => {
            toast.error(err?.message || "حدث خطأ")
          },
        }
      )
    } else {
      createGrade.mutate(payload as any, {
        onSuccess: () => {
          setDialogOpen(false)
          setSelectedStudentId(null)
          toast.success("تم إضافة الدرجة")
        },
        onError: (err: any) => {
          toast.error(err?.message || "حدث خطأ")
        },
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الدرجة؟")) return
    deleteGrade.mutate(id, {
      onSuccess: () => {
        toast.success("تم حذف الدرجة")
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tc.light} ${tc.text} shadow-sm`}>
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">{t.teacher.studentGrades}</h1>
              <p className="text-xs text-slate-500">
                {filteredStudents.length} {t.teacher.teacher} — {totalGrades} {t.teacher.gradesRecorded}
                {teacherSubject && <span className="mr-1">— {t.teacher.subject}: {teacherSubject}</span>}
              </p>
            </div>
          </div>
          <ClassSwitcher />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={t.teacher.searchByStudent}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/30 bg-white/60 backdrop-blur-sm py-2.5 pr-10 pl-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
        />
      </div>

      {/* Students List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100/70 backdrop-blur-sm" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((student, i) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
            >
              <div className={`absolute top-0 left-0 w-24 h-24 bg-gradient-to-br ${tc.gradient} rounded-full blur-2xl opacity-20 -z-10`} />
              {/* Student Header */}
              <div className="flex items-center gap-4 p-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full ${tc.light} ${tc.text} shadow-sm`}>
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-900">{student.name}</h3>
                  <p className="text-xs text-slate-400">{student.className}</p>
                </div>

                {/* Latest grade — prominent */}
                <div className="flex-shrink-0 text-center">
                  {student.latestGrade ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`text-2xl font-black ${tc.text} leading-none tracking-tight`}>
                        {student.latestGrade.grade}
                        <span className="text-sm font-normal text-slate-400">/{student.latestGrade.maxGrade}</span>
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 bg-white/60 px-2 py-0.5 rounded-full border border-white/30 backdrop-blur-sm">
                        {student.latestGrade.examType === "exam" ? "امتحان" : "وظيفة"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-300 font-medium">—</span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {student.grades.length > 1 && (
                    <button
                      onClick={() => openViewAll(student)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold border border-white/30 bg-white/60 text-slate-600 hover:bg-white/80 transition-colors backdrop-blur-sm"
                    >
                      <Award className="h-3 w-3" />
                      الكل ({student.grades.length})
                    </button>
                  )}
                  {student.latestGrade && (
                    <>
                      <button
                        onClick={() => openEdit(student.latestGrade!)}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold border border-white/30 bg-white/60 text-slate-600 hover:bg-white/80 transition-colors backdrop-blur-sm"
                      >
                        <Pencil className="h-3 w-3" />
                        تعديل
                      </button>
                      {student.grades.length === 1 && (
                        <button
                          onClick={() => { if (confirm("هل أنت متأكد من حذف هذه الدرجة؟")) handleDelete(student.latestGrade!.id) }}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold border border-rose-200/50 text-rose-600 hover:bg-rose-50/60 transition-colors backdrop-blur-sm"
                          title="حذف"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </>
                  )}
                  <button
                    onClick={() => openCreateForStudent(student.id)}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white ${tc.bg} hover:opacity-90 transition-opacity shadow-sm`}
                  >
                    <Plus className="h-3 w-3" />
                    إضافة
                  </button>
                </div>
              </div>

              {student.grades.length === 0 && (
                <div className="border-t border-white/20 px-4 py-2">
                  <p className="text-xs text-slate-400">لا توجد درجات مسجلة لهذا الطالب</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {!loading && students.length === 0 && (
        <div className="text-center py-16 rounded-2xl bg-white/50 backdrop-blur-sm border border-dashed border-white/20 text-slate-400">
          <User className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">لا يوجد طلاب مسجلين في صفوفك</p>
          <p className="text-xs mt-1">تأكد من تعيينك لمادة في صفحة إدارة المعلمين</p>
        </div>
      )}
      {!loading && students.length > 0 && filteredStudents.length === 0 && (
        <div className="text-center py-16 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 text-slate-400">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">لا يوجد طلاب مطابقين للبحث</p>
        </div>
      )}

      {/* View All Grades Modal */}
      <AnimatePresence>
        {viewAllOpen && viewAllStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative overflow-hidden w-full max-w-lg rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
              <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${tc.gradient} rounded-full blur-3xl opacity-30 -z-10`} />
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">درجات {viewAllStudent.name}</h2>
                  <p className="text-xs text-slate-500">{viewAllStudent.className} — {viewAllStudent.grades.length} درجة</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGradesSort(prev => prev === "newest" ? "oldest" : "newest")}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-colors backdrop-blur-sm ${
                      gradesSort === "oldest"
                        ? `${tc.light} ${tc.text} ${tc.border}`
                        : "border-white/30 bg-white/60 text-slate-500 hover:bg-white/80"
                    }`}
                  >
                    {gradesSort === "newest" ? "الأحدث أولاً" : "من الأول"}
                  </button>
                  <button onClick={() => setViewAllOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-white/60">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {sortedViewAllGrades.map((grade) => (
                  <div key={grade.id} className="flex items-center gap-3 rounded-xl bg-white/50 border border-white/20 px-3 py-2.5 backdrop-blur-sm">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{grade.examType === "exam" ? "امتحان" : "وظيفة / كويز"}</p>
                      <p className="text-[10px] text-slate-400">
                        {grade.semester === "first" ? "الفصل الأول" : "الفصل الثاني"}
                      </p>
                    </div>
                    <div className="text-left flex-shrink-0">
                      <span className={`text-base font-black ${tc.text}`}>{grade.grade}</span>
                      <span className="text-xs text-slate-400">/{grade.maxGrade}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => { setViewAllOpen(false); openEdit(grade); }} className="rounded-md p-1.5 text-slate-400 hover:bg-white/60 hover:text-slate-600">
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button onClick={() => { if (confirm("هل أنت متأكد؟")) handleDelete(grade.id); }} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50/60 hover:text-rose-600">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Dialog */}
      <AnimatePresence>
        {dialogOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative overflow-hidden w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl p-6">
              <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${tc.gradient} rounded-full blur-3xl opacity-30 -z-10`} />
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">{editing ? "تعديل درجة" : "إضافة درجة"}</h2>
                <button onClick={() => setDialogOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-white/60">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الطالب</label>
                  <input readOnly value={students.find((s) => s.id === form.studentId)?.name || ""} className="w-full rounded-lg border border-white/30 bg-white/60 backdrop-blur-sm px-3 py-2 text-sm text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">نوع التقييم</label>
                  <select
                    value={form.examType}
                    onChange={(e) => setForm({ ...form, examType: e.target.value })}
                    className="w-full rounded-lg border border-white/30 bg-white/60 backdrop-blur-sm px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-white/40"
                  >
                    <option value="exam">امتحان</option>
                    <option value="quiz">وظيفة / كويز</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">الدرجة</label>
                    <input required type="number" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="w-full rounded-lg border border-white/30 bg-white/60 backdrop-blur-sm px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-white/40" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">الحد الأقصى</label>
                    <input required type="number" value={form.maxGrade} onChange={(e) => setForm({ ...form, maxGrade: e.target.value })} className="w-full rounded-lg border border-white/30 bg-white/60 backdrop-blur-sm px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-white/40" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setDialogOpen(false)} className="rounded-lg border border-white/30 bg-white/60 backdrop-blur-sm px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white/80">إلغاء</button>
                  <button type="submit" className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${tc.bg} hover:opacity-90 shadow-sm`}>{editing ? "حفظ" : "إضافة"}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
