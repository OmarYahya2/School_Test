"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"
import {
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  ImageIcon,
  FileIcon,
  LinkIcon,
  FolderOpen,
  User,
  FileStack,
  Filter,
  X,
  Download,
  Upload,
  FileType,
  ChevronRight,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { SubjectFile, Teacher } from "@/lib/store"
import {
  createSubjectFile,
  deleteSubjectFileById,
  uploadSubjectFileAsset,
} from "@/lib/supabase-files"
import { useAdminAllFiles, useAdminTeachers } from "@/lib/hooks/use-admin-data"

const grades = [
  { id: 1, name: "الصف الأول" },
  { id: 2, name: "الصف الثاني" },
  { id: 3, name: "الصف الثالث" },
  { id: 4, name: "الصف الرابع" },
  { id: 5, name: "الصف الخامس" },
  { id: 6, name: "الصف السادس" },
  { id: 7, name: "الصف السابع" },
  { id: 8, name: "الصف الثامن" },
  { id: 9, name: "الصف التاسع" },
]

const subjectsList = [
  "اللغة العربية",
  "اللغة الإنجليزية",
  "الرياضيات",
  "العلوم والحياة",
  "التربية الدينية",
  "الدراسات الاجتماعية",
  "التكنولوجيا",
]

const fileTypes: { value: SubjectFile["type"]; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "image", label: "صورة" },
  { value: "link", label: "رابط" },
  { value: "document", label: "مستند" },
]

function FileTypeIcon({ type }: { type: SubjectFile["type"] }) {
  switch (type) {
    case "pdf":
      return <FileText className="h-5 w-5 text-rose-500" />
    case "image":
      return <ImageIcon className="h-5 w-5 text-violet-500" />
    case "link":
      return <LinkIcon className="h-5 w-5 text-blue-500" />
    default:
      return <FileIcon className="h-5 w-5 text-amber-500" />
  }
}

export default function SubjectFilesPage() {
  const { t, language } = useLanguage()
  const fp = t.filesPage
  const { data: files = [], isLoading: filesLoading, refetch: refetchFiles } = useAdminAllFiles()
  const { data: teachers = [] } = useAdminTeachers()
  const [showForm, setShowForm] = useState(false)

  // Filters
  const [filterGrade, setFilterGrade] = useState<number | "">("")
  const [filterSemester, setFilterSemester] = useState<string>("")
  const [filterSubject, setFilterSubject] = useState<string>("")
  const [filterTeacher, setFilterTeacher] = useState<string>("")

  // Check if all filters are selected
  const areFiltersSelected = filterGrade !== "" && filterSemester !== "" && filterSubject !== "" && filterTeacher !== ""

  // Form fields
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formType, setFormType] = useState<SubjectFile["type"]>("pdf")
  const [formUrl, setFormUrl] = useState("")
  const [formFile, setFormFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const filesLoadingState = filesLoading

  const filteredFiles = files.filter((f) => {
    if (!areFiltersSelected) return false
    if (f.gradeId !== filterGrade) return false
    if (f.semester !== filterSemester) return false
    if (f.subject !== filterSubject) return false
    if (f.teacherId !== filterTeacher) return false
    return true
  })

  const teacherMap = new Map(teachers.map((t) => [t.id, t]))

  async function handleAdd() {
    if (!areFiltersSelected) {
      toast.error(t.forms.required)
      return
    }
    if (!formTitle.trim()) {
      toast.error(fp.fileName)
      return
    }
    
    setIsSubmitting(true)
    try {
      let finalUrl = formUrl.trim()

      if (formType !== "link") {
        if (!formFile) {
          if (!finalUrl) {
            toast.error(fp.uploadFile)
            setIsSubmitting(false)
            return
          }
        } else {
          const folder = `${filterGrade}/${filterSemester}/${filterSubject}`
          const uploadedUrl = await uploadSubjectFileAsset(formFile, folder)
          if (!uploadedUrl) {
            toast.error(t.dashboard.loadingError)
            setIsSubmitting(false)
            return
          }
          finalUrl = uploadedUrl
        }
      } else {
        if (!finalUrl) {
          toast.error(fp.viewFile)
          setIsSubmitting(false)
          return
        }
      }

      const created = await createSubjectFile(
        filterGrade as number,
        filterSemester,
        filterSubject,
        filterTeacher,
        formTitle.trim(),
        formDescription.trim(),
        formType,
        finalUrl
      )

      if (!created) {
        toast.error(t.dashboard.loadingError)
        setIsSubmitting(false)
        return
      }

      setFormTitle("")
      setFormDescription("")
      setFormUrl("")
      setFormFile(null)
      setShowForm(false)
      void refetchFiles()
      toast.success(fp.uploadSuccess)
    } catch (error) {
      console.error(error)
      toast.error(t.dashboard.loadingError)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t.actions.delete)) return
    try {
      await deleteSubjectFileById(id)
      void refetchFiles()
      toast.success(fp.deleteSuccess)
    } catch (error) {
      console.error(error)
      toast.error(t.dashboard.loadingError)
    }
  }

  return (
    <div className={`space-y-8 pb-12 ${language === "ar" ? "text-right" : "text-left"}`} dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 px-2.5 py-1 rounded-full">
              {fp.title}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            {fp.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {fp.noFilesDesc}
          </p>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          disabled={!areFiltersSelected}
          className={`h-11 shadow-sm gap-2 px-6 rounded-xl transition-all duration-300 font-medium ${
            showForm 
              ? "bg-rose-500 hover:bg-rose-600 text-white" 
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          }`}
        >
          {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          {showForm ? t.actions.cancel : fp.uploadFile}
        </Button>
      </div>

      {/* Filter Selector Panel */}
      <Card className="border-0 shadow-sm bg-card rounded-2xl overflow-hidden border border-border/50">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-border/30 pb-3">
              <Filter className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">{fp.subject} / {fp.class}</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Teacher */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-medium">{t.schedulePage.teacher}</Label>
                <select
                  value={filterTeacher}
                  onChange={(e) => setFilterTeacher(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none transition-all cursor-pointer"
                >
                  <option value="">{t.forms.selectTeacher}</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grade */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-medium">{fp.class}</Label>
                <select
                  value={filterGrade}
                  onChange={(e) =>
                    setFilterGrade(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none transition-all cursor-pointer"
                >
                  <option value="">{t.forms.selectClass}</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-medium">{t.forms.semester}</Label>
                <select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none transition-all cursor-pointer"
                >
                  <option value="">{t.forms.semester}</option>
                  <option value="first">{t.teachersPage.firstSemester}</option>
                  <option value="second">{t.teachersPage.secondSemester}</option>
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-medium">{fp.subject}</Label>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none transition-all cursor-pointer"
                >
                  <option value="">{t.forms.selectSubject}</option>
                  {subjectsList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {/* Form Container */}
        {showForm && areFiltersSelected && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-0 shadow-md bg-card rounded-2xl border border-primary/20 overflow-hidden">
              <CardHeader className="bg-muted/40 border-b border-border/30 pb-4">
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  {fp.uploadFile}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">{fp.fileName}</Label>
                    <Input
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder={fp.fileName}
                      className="bg-background border-border focus:border-primary rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">{fp.subject}</Label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as SubjectFile["type"])}
                      className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none transition-all cursor-pointer"
                    >
                      {fileTypes.map((ft) => (
                        <option key={ft.value} value={ft.value}>
                          {ft.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm font-semibold text-foreground">
                      {formType === "link" ? fp.viewFile : fp.uploadFile}
                    </Label>
                    {formType === "link" ? (
                      <Input
                        key="link-input"
                        value={formUrl}
                        onChange={(e) => setFormUrl(e.target.value)}
                        placeholder="https://example.com/document"
                        dir="ltr"
                        className="bg-background border-border focus:border-primary rounded-xl h-11"
                      />
                    ) : (
                      <div className="relative group">
                        <Input
                          key="file-input"
                          type="file"
                          accept={
                            formType === "pdf"
                              ? "application/pdf"
                              : formType === "image"
                                ? "image/*"
                                : ".pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                          }
                          onChange={(e) =>
                            setFormFile(
                              e.target.files && e.target.files[0]
                                ? e.target.files[0]
                                : null
                            )
                          }
                          className="bg-background border-border focus:border-primary rounded-xl h-11 file:bg-primary/10 file:text-primary file:border-0 file:rounded-lg file:px-3 file:py-1 file:ml-3 file:cursor-pointer cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm font-semibold text-foreground">{t.forms.notes} ({t.forms.optional})</Label>
                    <Input
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder={t.forms.notes}
                      className="bg-background border-border focus:border-primary rounded-xl h-11"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex items-center gap-3">
                  <Button
                    onClick={handleAdd}
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 h-11 gap-2 shadow-md transition-all duration-200"
                  >
                    {isSubmitting ? "..." : fp.uploadFile}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowForm(false)} 
                    className="border-border rounded-xl h-11 px-6 transition-all"
                  >
                    {t.actions.cancel}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Files Display */}
      {!areFiltersSelected ? (
        <Card className="border-0 shadow-sm bg-card rounded-2xl border border-border/50">
          <CardContent className="p-16 text-center">
            <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-sm">
              <Filter className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{fp.noFiles}</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm leading-relaxed">
              {fp.noFilesDesc}
            </p>
            <div className="flex flex-wrap justify-center gap-2.5 max-w-lg mx-auto">
              <Badge className="bg-card text-primary border border-primary/20 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
                {t.schedulePage.teacher}
              </Badge>
              <Badge className="bg-card text-primary border border-primary/20 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
                {fp.class}
              </Badge>
              <Badge className="bg-card text-primary border border-primary/20 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
                {t.forms.semester}
              </Badge>
              <Badge className="bg-card text-primary border border-primary/20 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
                {fp.subject}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : filteredFiles.length === 0 ? (
        <Card className="border-0 shadow-sm bg-card rounded-2xl border border-border/50">
          <CardContent className="p-16 text-center">
            <div className="h-20 w-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-5 border border-border/50">
              <FolderOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">{fp.noFiles}</h3>
            <p className="text-muted-foreground mb-6 text-sm max-w-sm mx-auto">
              {fp.noFilesDesc}
            </p>
            <Button 
              onClick={() => setShowForm(true)} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 h-10 gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              {fp.uploadFile}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              <span>{fp.title}</span>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                {filteredFiles.length}
              </span>
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFiles.map((file, idx) => {
              const gradeName = grades.find((g) => g.id === file.gradeId)?.name || ""
              const teacher = teacherMap.get(file.teacherId)
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(idx * 0.05, 0.4) }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-md bg-card rounded-2xl border border-border/50 overflow-hidden group transition-all duration-300 flex flex-col h-full">
                    <CardContent className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Type Icon and Title */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center border border-border/50 shrink-0 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                            <FileTypeIcon type={file.type} />
                          </div>
                          
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg"
                              asChild
                            >
                              <a href={file.url} target="_blank" rel="noopener noreferrer">
                                {file.type === "link" ? (
                                  <ExternalLink className="h-4 w-4" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(file.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Title and details */}
                        <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1 mb-1.5">
                          {file.title}
                        </h4>
                        
                        {file.description ? (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                            {file.description}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground/60 italic mb-4">
                            {t.table.noData}
                          </p>
                        )}
                      </div>

                      {/* Footer Badge Row */}
                      <div className="pt-3 border-t border-border/30 mt-auto flex flex-col gap-2">
                        {teacher && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="h-3.5 w-3.5 text-muted-foreground/60" />
                            <span className="font-medium truncate">{teacher.name}</span>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            {gradeName}
                          </span>
                          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                            {file.semester === "first" ? t.teachersPage.firstSemester : t.teachersPage.secondSemester}
                          </span>
                          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                            {file.subject}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

