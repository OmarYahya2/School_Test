"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FolderOpen, FileText, ExternalLink, Plus, X } from "lucide-react"
import { useAppTheme } from "@/lib/theme-context"
import { useTeacherClass } from "@/lib/teacher-class-context"
import ClassSwitcher from "@/components/class-switcher"
import { useTeacherFiles } from "@/lib/hooks/use-teacher-data"
import { createTeacherFile, type TeacherFile } from "@/lib/api/teacher.api"
import { toast } from "sonner"

export default function TeacherFilesPage() {
  const { config } = useAppTheme()
  const { data: files = [], isLoading: loading, refetch } = useTeacherFiles()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ title: "", subject: "", semester: "first", gradeId: "1", type: "pdf", url: "", description: "" })

  const tc = {
    ocean:   { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200" },
    violet:  { bg: "bg-violet-500", text: "text-violet-600", light: "bg-violet-50", border: "border-violet-200" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200" },
    rose:    { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-200" },
    amber:   { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-200" },
  }[config.color] || { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200" }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTeacherFile(form as any)
      toast.success("تم إضافة الملف")
      setDialogOpen(false)
      setForm({ title: "", subject: "", semester: "first", gradeId: "1", type: "pdf", url: "", description: "" })
      refetch()
    } catch (err: any) {
      toast.error(err?.message || "حدث خطأ")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-slate-900">ملفاتي</h1>
          <ClassSwitcher />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDialogOpen(true)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white ${tc.bg} hover:opacity-90`}>
            <Plus className="h-4 w-4" />
            إضافة ملف
          </button>
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${tc.light} ${tc.text} border ${tc.border}`}>
            <FolderOpen className="h-4 w-4" />
            {files.length} ملف
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file, i) => (
            <motion.a
              key={file.id}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tc.light} ${tc.text}`}>
                  <FileText className="h-5 w-5" />
                </div>
                <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-2">{file.title}</h3>
              <p className="text-xs text-slate-500 mb-2">{file.subject} — {file.semester}</p>
              <p className="text-xs text-slate-400 line-clamp-2">{file.description || "—"}</p>
            </motion.a>
          ))}
        </div>
      )}

      {!loading && files.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">لا توجد ملفات مرفوعة</p>
        </div>
      )}

      <AnimatePresence>
        {dialogOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">إضافة ملف</h2>
                <button onClick={() => setDialogOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">العنوان</label>
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">المادة</label>
                  <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الرابط</label>
                  <input required type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الوصف</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100" rows={3} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setDialogOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">إلغاء</button>
                  <button type="submit" className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${tc.bg} hover:opacity-90`}>إضافة</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
