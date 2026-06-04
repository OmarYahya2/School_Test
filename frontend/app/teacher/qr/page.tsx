"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { QRCodeSVG } from "qrcode.react"
import { QrCode, Download, Share2, X, ShieldCheck, GraduationCap, Users, Loader2 } from "lucide-react"
import { useTeacherTheme } from "@/lib/teacher-theme-context"
import { generateQRToken } from "@/lib/api/qr.api"
import { useTeacherProfile } from "@/lib/hooks/use-teacher-data"
import { toast } from "sonner"
import { useTeacherLanguage } from "@/lib/teacher-language-context"

const gradesList = [
  { id: 1, name: "الصف الأول", color: "from-sky-400 to-blue-500", icon: "🎨", desc: "بداية الرحلة" },
  { id: 2, name: "الصف الثاني", color: "from-blue-400 to-indigo-500", icon: "🚀", desc: "اكتشاف جديد" },
  { id: 3, name: "الصف الثالث", color: "from-indigo-400 to-violet-500", icon: "⭐", desc: "تطور مستمر" },
  { id: 4, name: "الصف الرابع", color: "from-violet-400 to-purple-500", icon: "📚", desc: "خطوات واثقة" },
  { id: 5, name: "الصف الخامس", color: "from-purple-400 to-fuchsia-500", icon: "💡", desc: "إبداع وتميز" },
  { id: 6, name: "الصف السادس", color: "from-fuchsia-400 to-pink-500", icon: "🧠", desc: "تحدي الأفكار" },
  { id: 7, name: "الصف السابع", color: "from-pink-400 to-rose-500", icon: "🏆", desc: "نحو القمة" },
  { id: 8, name: "الصف الثامن", color: "from-rose-400 to-orange-500", icon: "🌟", desc: "تألق دائم" },
  { id: 9, name: "الصف التاسع", color: "from-orange-400 to-amber-500", icon: "🎯", desc: "إنجازات عظيمة" },
]

export default function TeacherQRPage() {
  const { config } = useTeacherTheme()
  const { t } = useTeacherLanguage()
  const { data: profile, isLoading: profileLoading } = useTeacherProfile()
  const [selectedGrade, setSelectedGrade] = useState<typeof gradesList[0] | null>(null)
  const [qrOpen, setQrOpen] = useState(false)
  const [signedUrl, setSignedUrl] = useState<string>("")
  const [tokenLoading, setTokenLoading] = useState(false)

  const tc = {
    ocean:   { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200/50", gradient: "from-blue-400/20 to-sky-300/10" },
    violet:  { bg: "bg-violet-500", text: "text-violet-600", light: "bg-violet-50", border: "border-violet-200/50", gradient: "from-violet-400/20 to-fuchsia-300/10" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200/50", gradient: "from-emerald-400/20 to-teal-300/10" },
    rose:    { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-200/50", gradient: "from-rose-400/20 to-pink-300/10" },
    amber:   { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-200/50", gradient: "from-amber-400/20 to-orange-300/10" },
  }[config.color] || { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200/50", gradient: "from-blue-400/20 to-sky-300/10" }

  // Unique gradeIds from teacherAssignments
  const assignedGradeIds = new Set(profile?.teacherAssignments.map((a) => a.gradeId) || [])
  const myGrades = gradesList.filter((g) => assignedGradeIds.has(g.id))

  const handleSelect = useCallback(async (grade: typeof gradesList[0]) => {
    setSelectedGrade(grade)
    setQrOpen(true)
    setTokenLoading(true)
    setSignedUrl("")
    try {
      const result = await generateQRToken(grade.id)
      if (result?.token) {
        setSignedUrl(`${typeof window !== "undefined" ? window.location.origin : ""}/?token=${result.token}`)
      } else {
        toast.error("فشل في إنشاء رمز QR")
      }
    } finally {
      setTokenLoading(false)
    }
  }, [])

  const getUrl = () => signedUrl

  const downloadQR = () => {
    if (!selectedGrade) return
    const svg = document.getElementById("qr-code-svg")
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      const png = canvas.toDataURL("image/png")
      const a = document.createElement("a")
      a.download = `qr-${selectedGrade.name}.png`
      a.href = png
      a.click()
    }
    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  if (profileLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-6">
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${tc.gradient} rounded-full blur-3xl -z-10 opacity-60`} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{t.teacher.qrForClass}</h1>
            <p className="text-sm text-slate-500 mt-1">{t.teacher.qrDesc}</p>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${tc.light} ${tc.text} border ${tc.border} backdrop-blur-sm`}>
            <QrCode className="h-4 w-4" />
            {myGrades.length}
          </div>
        </div>
      </div>

      {/* Grades Grid */}
      {myGrades.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 text-slate-400">
          <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">{t.teacher.noAssignedClasses}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {myGrades.map((grade, idx) => (
            <motion.div
              key={grade.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              onClick={() => handleSelect(grade)}
              className="group cursor-pointer relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br ${grade.color} rounded-full blur-3xl opacity-20 -z-10`} />
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${grade.color} text-white text-2xl shadow-md`}>
                  {grade.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{grade.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{grade.desc}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60 shadow-sm group-hover:bg-white/80 transition-colors">
                  <QrCode className="h-5 w-5 text-slate-500" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* QR Dialog */}
      <AnimatePresence>
        {qrOpen && selectedGrade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setQrOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative overflow-hidden w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl p-6"
            >
              <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${tc.gradient} rounded-full blur-3xl opacity-30 -z-10`} />
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <QrCode className={`h-5 w-5 ${tc.text}`} />
                  {t.teacher.qrForClass} — {selectedGrade.name}
                </h2>
                <button
                  onClick={() => setQrOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-white/60 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50/70 border border-emerald-200/50 rounded-lg px-3 py-2 mb-4 backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                <span>{t.teacher.scanInfo}</span>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="p-6 bg-white/60 rounded-2xl border border-white/30 shadow-sm min-h-[224px] flex items-center justify-center backdrop-blur-sm">
                  {tokenLoading ? (
                    <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
                  ) : signedUrl ? (
                    <QRCodeSVG
                      id="qr-code-svg"
                      value={getUrl()}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  ) : (
                    <p className="text-xs text-rose-500">{t.teacher.failedGenerate}</p>
                  )}
                </div>
                <p className="text-sm text-slate-500 text-center">
                  {t.teacher.scanToBrowse} — {selectedGrade.name}
                </p>
              </div>

              <div className="bg-white/50 p-3 rounded-lg mt-4 border border-white/20 backdrop-blur-sm">
                <p className="text-xs text-slate-500 mb-1">{t.teacher.linkLabel}:</p>
                <code className="text-xs text-slate-800 break-all block">
                  {tokenLoading ? t.teacher.generating : getUrl()}
                </code>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={downloadQR}
                  disabled={tokenLoading || !signedUrl}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white ${tc.bg} hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
                >
                  <Download className="h-4 w-4" />
                  {t.teacher.download}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getUrl())
                    toast.success(t.teacher.copyLink)
                  }}
                  disabled={tokenLoading || !signedUrl}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 border border-white/30 bg-white/60 hover:bg-white/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                >
                  <Share2 className="h-4 w-4" />
                  {t.teacher.copy}
                </button>
              </div>
              <button
                onClick={() => window.open(getUrl(), "_blank")}
                disabled={tokenLoading || !signedUrl}
                className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 bg-white/50 hover:bg-white/70 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 backdrop-blur-sm"
              >
                <Users className="h-4 w-4" />
                {t.teacher.openPage}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

