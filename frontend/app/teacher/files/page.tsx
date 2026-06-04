"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FolderOpen, FileText, ExternalLink, Plus, X, Pencil, Trash2, Link as LinkIcon, FileImage } from "lucide-react"
import { useTeacherTheme } from "@/lib/teacher-theme-context"
import { useTeacherClass } from "@/lib/teacher-class-context"
import ClassSwitcher from "@/components/class-switcher"
import { useTeacherFiles, useCreateTeacherFileMutation, useUpdateTeacherFileMutation, useDeleteTeacherFileMutation, useTeacherProfile } from "@/lib/hooks/use-teacher-data"
import type { TeacherFile } from "@/lib/api/teacher.api"
import { uploadSubjectFileAsset } from "@/lib/api/files.api"
import { toast } from "sonner"
import { useTeacherLanguage } from "@/lib/teacher-language-context"

export default function TeacherFilesPage() {
  const { config } = useTeacherTheme()
  const { t } = useTeacherLanguage()
  const { data: files = [], isLoading: loading } = useTeacherFiles()
  const { data: profile } = useTeacherProfile()
  const createFile = useCreateTeacherFileMutation()
  const updateFile = useUpdateTeacherFileMutation()
  const deleteFile = useDeleteTeacherFileMutation()
  const { selectedClassId } = useTeacherClass()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFile, setEditingFile] = useState<TeacherFile | null>(null)
  const [form, setForm] = useState({ title: "", type: "pdf", url: "", description: "" })
  const [selectedUpload, setSelectedUpload] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const tc = {
    ocean:   { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200/50", gradient: "from-blue-400/20 to-sky-300/10" },
    violet:  { bg: "bg-violet-500", text: "text-violet-600", light: "bg-violet-50", border: "border-violet-200/50", gradient: "from-violet-400/20 to-fuchsia-300/10" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200/50", gradient: "from-emerald-400/20 to-teal-300/10" },
    rose:    { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-200/50", gradient: "from-rose-400/20 to-pink-300/10" },
    amber:   { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-200/50", gradient: "from-amber-400/20 to-orange-300/10" },
  }[config.color] || { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200/50", gradient: "from-blue-400/20 to-sky-300/10" }

  const getGradeFromClassName = (name: string): number => {
    const keywords: Record<string, number> = {
      "أول": 1, "ثاني": 2, "ثالث": 3, "رابع": 4, "خامس": 5,
      "سادس": 6, "سابع": 7, "ثامن": 8, "تاسع": 9,
      "first": 1, "second": 2, "third": 3, "fourth": 4, "fifth": 5,
      "sixth": 6, "seventh": 7, "eighth": 8, "ninth": 9,
    }
    for (const [word, num] of Object.entries(keywords)) {
      if (name.includes(word)) return num
    }
    return 1
  }

  // Derive class/subject data from teacher's selected class implicitly
  const selectedClassDetails = profile?.classes?.find(c => c.id === selectedClassId) || profile?.classes?.[0]
  const teacherSubject = profile?.assignedSubjects?.[0] || profile?.teacherAssignments?.[0]?.subject || profile?.subject || ""
  
  const currentGradeId = selectedClassDetails ? getGradeFromClassName(selectedClassDetails.name).toString() : "1"
  
  const filteredFiles = files.filter(f => !selectedClassDetails || f.gradeId === getGradeFromClassName(selectedClassDetails.name))

  const openCreate = () => {
    setEditingFile(null)
    setForm({ title: "", type: "pdf", url: "", description: "" })
    setSelectedUpload(null)
    setDialogOpen(true)
  }

  const openEdit = (e: React.MouseEvent, file: TeacherFile) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingFile(file)
    setForm({ 
      title: file.title || "", 
      type: file.type || "pdf", 
      url: file.url || "", 
      description: file.description || "" 
    })
    setSelectedUpload(null)
    setDialogOpen(true)
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm("هل أنت متأكد من حذف هذا الملف؟")) return
    deleteFile.mutate(id, {
      onSuccess: () => toast.success("تم حذف الملف بنجاح"),
      onError: (err: any) => toast.error(err?.message || "حدث خطأ"),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    let finalUrl = form.url
    if (selectedUpload && form.type !== "link") {
      const uploadUrl = await uploadSubjectFileAsset(selectedUpload, "teacher_files")
      if (uploadUrl) {
        finalUrl = uploadUrl
      } else {
        toast.error("فشل رفع الملف. الرجاء المحاولة مرة أخرى.")
        setIsUploading(false)
        return
      }
    }

    if (editingFile) {
      updateFile.mutate({ id: editingFile.id, data: { ...form, url: finalUrl } as any }, {
        onSuccess: () => {
          toast.success("تم تحديث الملف")
          setDialogOpen(false)
          setIsUploading(false)
        },
        onError: (err: any) => {
          toast.error(err?.message || "حدث خطأ")
          setIsUploading(false)
        },
      })
    } else {
      createFile.mutate({ 
        ...form, 
        url: finalUrl,
        subject: teacherSubject, 
        semester: "first", 
        gradeId: parseInt(currentGradeId) 
      } as any, {
        onSuccess: () => {
          toast.success("تم إضافة الملف")
          setDialogOpen(false)
          setIsUploading(false)
        },
        onError: (err: any) => {
          toast.error(err?.message || "حدث خطأ")
          setIsUploading(false)
        },
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-6">
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${tc.gradient} rounded-full blur-3xl -z-10 opacity-60`} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900">{t.teacher.myFiles}</h1>
            <ClassSwitcher />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openCreate} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-white ${tc.bg} hover:opacity-90 transition-opacity shadow-sm`}>
              <Plus className="h-4 w-4" />
              {t.teacher.addFile}
            </button>
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${tc.light} ${tc.text} border ${tc.border} backdrop-blur-sm`}>
              <FolderOpen className="h-4 w-4" />
              {filteredFiles.length}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100/70 backdrop-blur-sm" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file, i) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group relative overflow-hidden flex flex-col rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className={`absolute top-0 left-0 w-24 h-24 bg-gradient-to-br ${tc.gradient} rounded-full blur-2xl opacity-20 -z-10`} />
              <div className="absolute top-4 left-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => openEdit(e, file)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white/60 rounded-lg transition-colors"
                  title={t.teacher.edit}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => handleDelete(e, file.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50/60 rounded-lg transition-colors"
                  title={t.teacher.delete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tc.light} ${tc.text} shadow-sm`}>
                    {file.type === "pdf" && <FileText className="h-5 w-5" />}
                    {file.type === "image" && <FileImage className="h-5 w-5" />}
                    {file.type === "link" && <LinkIcon className="h-5 w-5" />}
                    {(!file.type || file.type === "document") && <FileText className="h-5 w-5" />}
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors mr-16" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-2">{file.title}</h3>
                <p className="text-xs text-slate-500 mb-2">{file.subject} — {file.semester === "first" ? t.teacher.firstSemester : t.teacher.secondSemester}</p>
                <p className="text-xs text-slate-400 line-clamp-2">{file.description || "—"}</p>
              </a>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && files.length === 0 && (
        <div className="text-center py-16 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 text-slate-400">
          <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">{t.teacher.noFiles}</p>
        </div>
      )}

      <AnimatePresence>
        {dialogOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative overflow-hidden w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl p-6">
              <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${tc.gradient} rounded-full blur-3xl opacity-30 -z-10`} />
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">{editingFile ? t.teacher.update : t.teacher.addFile}</h2>
                <button onClick={() => setDialogOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-white/60">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.teacher.fileTitle}</label>
                  <input required value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-white/30 bg-white/60 backdrop-blur-sm px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-white/40" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.teacher.fileType}</label>
                  <select value={form.type || "pdf"} onChange={(e) => {
                    setForm({ ...form, type: e.target.value })
                    if (e.target.value === "link") setSelectedUpload(null)
                  }} className="w-full rounded-lg border border-white/30 bg-white/60 backdrop-blur-sm px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-white/40">
                    <option value="pdf">{t.teacher.pdf}</option>
                    <option value="image">{t.teacher.image}</option>
                    <option value="document">{t.teacher.document}</option>
                    <option value="link">{t.teacher.link}</option>
                  </select>
                </div>
                {form.type === "link" ? (
                  <div key="link-input">
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.teacher.url}</label>
                    <input required type="url" value={form.url || ""} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full rounded-lg border border-white/30 bg-white/60 backdrop-blur-sm px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-white/40" />
                  </div>
                ) : (
                  <div key="file-input">
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.teacher.uploadFile}</label>
                    <input 
                      type="file" 
                      required={!editingFile || (!form.url && !selectedUpload)}
                      accept={form.type === "pdf" ? ".pdf" : form.type === "image" ? "image/*" : ".doc,.docx,.xls,.xlsx,.ppt,.pptx"}
                      onChange={(e) => setSelectedUpload(e.target.files?.[0] || null)} 
                      className="w-full rounded-lg border border-white/30 bg-white/60 backdrop-blur-sm px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-white/40 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-white/80 file:text-slate-700 hover:file:bg-white" 
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.teacher.description}</label>
                  <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-white/30 bg-white/60 backdrop-blur-sm px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-white/40" rows={3} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setDialogOpen(false)} disabled={isUploading} className="rounded-lg border border-white/30 bg-white/60 backdrop-blur-sm px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white/80 disabled:opacity-50">{t.teacher.cancel}</button>
                  <button type="submit" disabled={isUploading} className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${tc.bg} hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm`}>
                    {isUploading && <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />}
                    {editingFile ? t.teacher.update : t.teacher.add}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
