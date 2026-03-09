"use client"

import { useState, useEffect, useCallback } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { SubjectFile, Teacher } from "@/lib/store"
import {
  fetchSubjectFiles,
  createSubjectFile,
  deleteSubjectFileById,
  uploadSubjectFileAsset,
} from "@/lib/supabase-files"
import { fetchTeachers } from "@/lib/supabase-teachers"

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
      return <FileText className="h-4 w-4 text-destructive" />
    case "image":
      return <ImageIcon className="h-4 w-4 text-primary" />
    case "link":
      return <LinkIcon className="h-4 w-4 text-accent-foreground" />
    default:
      return <FileIcon className="h-4 w-4 text-muted-foreground" />
  }
}

export default function SubjectFilesPage() {
  const [files, setFiles] = useState<SubjectFile[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [showForm, setShowForm] = useState(false)

  // Filters - must select specific values
  const [filterGrade, setFilterGrade] = useState<number | "">("")
  const [filterSemester, setFilterSemester] = useState<string>("")
  const [filterSubject, setFilterSubject] = useState<string>("")
  const [filterTeacher, setFilterTeacher] = useState<string>("")

  // Check if all filters are selected
  const areFiltersSelected = filterGrade !== "" && filterSemester !== "" && filterSubject !== "" && filterTeacher !== ""

  // Form - simplified, only file-related fields
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formType, setFormType] = useState<SubjectFile["type"]>("pdf")
  const [formUrl, setFormUrl] = useState("")
  const [formFile, setFormFile] = useState<File | null>(null)

  const loadData = useCallback(async () => {
    const [allFiles, t] = await Promise.all([fetchSubjectFiles(), fetchTeachers()])
    setFiles(allFiles)
    setTeachers(t)
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const filteredFiles = files.filter((f) => {
    if (!areFiltersSelected) return false
    if (f.gradeId !== filterGrade) return false
    if (f.semester !== filterSemester) return false
    if (f.subject !== filterSubject) return false
    if (f.teacherId !== filterTeacher) return false
    return true
  })

  // Group files by teacher for display
  const teacherMap = new Map(teachers.map((t) => [t.id, t]))

  async function handleAdd() {
    if (!areFiltersSelected) {
      toast.error("يرجى اختيار جميع الفلاتر أولاً")
      return
    }
    if (!formTitle.trim()) {
      toast.error("يرجى إدخال عنوان الملف")
      return
    }
    let finalUrl = formUrl.trim()

    // في حالة الملفات (PDF / صورة / مستند) نرفع ملف فعلياً إن وُجد
    if (formType !== "link") {
      if (!formFile) {
        if (!finalUrl) {
          toast.error("يرجى اختيار ملف أو إدخال رابط")
          return
        }
      } else {
        const folder = `${filterGrade}/${filterSemester}/${filterSubject}`
        const uploadedUrl = await uploadSubjectFileAsset(formFile, folder)
        if (!uploadedUrl) {
          toast.error("فشل رفع الملف، تحقق من إعدادات Supabase Storage (bucket subject-files والسياسات)")
          return
        }
        finalUrl = uploadedUrl
      }
    } else {
      // نوع رابط فقط
      if (!finalUrl) {
        toast.error("يرجى إدخال الرابط")
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
      toast.error("حدث خطأ أثناء إضافة الملف")
      return
    }
    setFormTitle("")
    setFormDescription("")
    setFormUrl("")
    setFormFile(null)
    setShowForm(false)
    void loadData()
    toast.success("تم إضافة الملف بنجاح")
  }

  async function handleDelete(id: string) {
    await deleteSubjectFileById(id)
    void loadData()
    toast.success("تم حذف الملف")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
            <FileStack className="ml-1 h-3 w-3" />
            الملفات
          </Badge>
        </div>
      </div>

      {/* Page Title */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 via-white to-slate-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-14 w-14 bg-gradient-to-br from-gray-100 to-slate-100 rounded-xl flex items-center justify-center border-2 border-gray-200 shadow-md">
                <FolderOpen className="h-7 w-7 text-gray-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-gray-500 to-slate-500 border-2 border-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent">ملفات المواد الدراسية</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                إدارة الملفات والموارد لكل معلم ومادة • {filteredFiles.length} ملف
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Form - Simplified: only title, type, file, description */}
      {showForm && (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 via-white to-slate-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-600">
              <div className="h-4 w-4 rounded-full bg-gradient-to-r from-gray-500 to-slate-500" />
              إضافة ملف جديد
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!areFiltersSelected ? (
              <div className="rounded-lg bg-amber-50 p-4 text-center border border-amber-200">
                <p className="text-sm font-medium text-amber-700">
                  يجب اختيار جميع الفلاتر أولاً (المعلم، الصف، الفصل، المادة) قبل إضافة ملف
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-gray-700">عنوان الملف *</Label>
                    <Input
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="مثال: ورقة عمل الوحدة الأولى"
                      className="bg-white border-gray-200 focus:border-gray-500"
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">نوع الملف *</Label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as SubjectFile["type"])}
                      className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:border-gray-500 focus:outline-none"
                    >
                      {fileTypes.map((ft) => (
                        <option key={ft.value} value={ft.value}>
                          {ft.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-gray-700">
                      {formType === "link" ? "الرابط / URL *" : "رفع ملف من الجهاز *"}
                    </Label>
                    {formType === "link" ? (
                      <Input
                        key="link-input"
                        value={formUrl}
                        onChange={(e) => setFormUrl(e.target.value)}
                        placeholder="https://..."
                        dir="ltr"
                        className="bg-white border-cyan-200 focus:border-cyan-500 text-right"
                      />
                    ) : (
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
                        className="bg-white border-gray-200 focus:border-gray-500"
                      />
                    )}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-gray-700">وصف (اختياري)</Label>
                    <Input
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="وصف مختصر للملف..."
                      className="bg-white border-gray-200 focus:border-gray-500"
                      dir="rtl"
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={handleAdd}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    <Upload className="ml-2 h-4 w-4" />
                    إضافة
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)} className="bg-white border-gray-200">
                    إلغاء
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters & Add Button */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 via-white to-gray-50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Label */}
            <div className="flex items-center gap-2 text-gray-500 bg-white px-3 py-1.5 rounded-md border border-gray-200">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">تصفية</span>
            </div>

            {/* Teacher Filter */}
            <select
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all"
            >
              <option value="">اختر المعلم</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Grade Filter */}
            <select
              value={filterGrade}
              onChange={(e) =>
                setFilterGrade(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all"
            >
              <option value="">اختر الصف</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            {/* Semester Filter */}
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all"
            >
              <option value="">اختر الفصل</option>
              <option value="first">الفصل الأول</option>
              <option value="second">الفصل الثاني</option>
            </select>

            {/* Subject Filter */}
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all"
            >
              <option value="">اختر المادة</option>
              {subjectsList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <div className="flex-1" />

            {/* Add File Button */}
            <Button
              onClick={() => setShowForm(!showForm)}
              className="h-10 bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white shadow-md gap-2 px-6 rounded-lg"
            >
              {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {showForm ? "إلغاء" : "إضافة ملف"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Files List - Show message if filters not selected */}
      {!areFiltersSelected ? (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 via-white to-orange-50 border-y-4 border-amber-400">
          <CardContent className="p-12 text-center">
            <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-amber-200">
              <Filter className="h-10 w-10 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">يجب اختيار الفلاتر أولاً</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              لعرض الملفات وإضافة ملفات جديدة، يجب عليك اختيار جميع الفلاتر التالية من الأعلى:
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Badge variant="secondary" className="bg-white text-amber-700 border-amber-300 px-3 py-1">
                المعلم
              </Badge>
              <Badge variant="secondary" className="bg-white text-amber-700 border-amber-300 px-3 py-1">
                الصف
              </Badge>
              <Badge variant="secondary" className="bg-white text-amber-700 border-amber-300 px-3 py-1">
                الفصل الدراسي
              </Badge>
              <Badge variant="secondary" className="bg-white text-amber-700 border-amber-300 px-3 py-1">
                المادة
              </Badge>
            </div>
            <p className="text-sm text-amber-600 font-medium">
              اختر الفلاتر من قائمة "تصفية" أعلاه
            </p>
          </CardContent>
        </Card>
      ) : filteredFiles.length === 0 ? (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 via-white to-slate-50">
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-600 mb-1">لا توجد ملفات</p>
            <p className="text-sm text-gray-500 mb-4">
              لا توجد ملفات لهذه الفلاتر المحددة
            </p>
            <Button onClick={() => setShowForm(true)} className="bg-gray-600 hover:bg-gray-700">
              <Plus className="ml-2 h-4 w-4" />
              إضافة ملف
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFiles.map((file) => {
            const gradeName = grades.find((g) => g.id === file.gradeId)?.name || ""
            const teacher = teacherMap.get(file.teacherId)
            return (
              <Card
                key={file.id}
                className="border-0 shadow-sm bg-gradient-to-br from-gray-50 via-white to-slate-50 hover:shadow-md transition-all duration-200 group"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-gray-100 to-slate-100 rounded-lg flex items-center justify-center border border-gray-200 shrink-0">
                      <FileTypeIcon type={file.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-gray-900 truncate">
                        {file.title}
                      </h4>
                      {file.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">{file.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {teacher && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200 text-xs">
                        <User className="ml-1 h-2.5 w-2.5" />
                        {teacher.name}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-slate-100 text-slate-900 border-slate-200 text-xs font-bold">
                      {gradeName}
                    </Badge>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
                      {file.semester === "first" ? "الفصل الأول" : "الفصل الثاني"}
                    </Badge>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200 text-xs">
                      {file.subject}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-white text-gray-600 border-gray-200 text-xs gap-1">
                      <FileType className="ml-1 h-3 w-3" />
                      {fileTypes.find((ft) => ft.value === file.type)?.label}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-50"
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
                        className="h-8 w-8 p-0 text-gray-600 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
