"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { BookOpen, ChevronLeft, Download, Share2, X, QrCode, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { SchoolClass } from "@/lib/store"
import { fetchClasses } from "@/lib/supabase-school"

const grades = [
  { id: 1, name: "الصف الأول", color: "from-sky-400 to-blue-500", icon: "🎨", desc: "بداية الرحلة" },
  { id: 2, name: "الصف الثاني", color: "from-blue-400 to-indigo-500", icon: "🚀", desc: "اكتشاف جديد" },
  { id: 3, name: "الصف الثالث", color: "from-indigo-400 to-violet-500", icon: "⭐", desc: "تطور مستمر" },
  { id: 4, name: "الصف الرابع", color: "from-violet-400 to-purple-500", icon: "🔬", desc: "علوم ممتعة" },
  { id: 5, name: "الصف الخامس", color: "from-purple-400 to-fuchsia-500", icon: "📚", desc: "معرفة أعمق" },
  { id: 6, name: "الصف السادس", color: "from-fuchsia-400 to-pink-500", icon: "🎯", desc: "تحضير منهجي" },
  { id: 7, name: "الصف السابع", color: "from-rose-400 to-red-500", icon: "💡", desc: "مرحلة جديدة" },
  { id: 8, name: "الصف الثامن", color: "from-orange-400 to-amber-500", icon: "⚡", desc: "تقدم ملحوظ" },
  { id: 9, name: "الصف التاسع", color: "from-emerald-400 to-teal-500", icon: "🏆", desc: "الإنجاز النهائي" },
]

export default function QRCodePage() {
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [selectedGrade, setSelectedGrade] = useState<typeof grades[0] | null>(null)
  const [qrOpen, setQrOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const cls = await fetchClasses()
      setClasses(cls)
      setLoading(false)
    }
    loadData()
  }, [])

  const handleGradeClick = (grade: typeof grades[0]) => {
    setSelectedGrade(grade)
    setQrOpen(true)
  }

  // Generate URL for the grade
  const getGradeUrl = (gradeId: number) => {
    // URL that links to the landing page with pre-selected grade
    return `${window.location.origin}/?grade=${gradeId}`
  }

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
      const pngFile = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.download = `qr-${selectedGrade.name}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">رموز QR للصفوف</h1>
          <p className="text-slate-500 mt-1">اختر الصف لعرض رمز QR أو الدخول المباشر</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
          <QrCode className="h-5 w-5 text-slate-600" />
          <span className="text-sm font-medium text-slate-600">{classes.length} صف مسجل</span>
        </div>
      </div>

      {/* Grades Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {grades.map((grade) => {
          const hasClass = classes.some(c => 
            c.name.includes(grade.id.toString()) ||
            c.name.toLowerCase().includes(grade.name.replace("الصف ", "").toLowerCase())
          )
          
          return (
            <Card 
              key={grade.id}
              className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 ${
                hasClass ? "border-slate-200 hover:border-slate-300" : "border-slate-100 opacity-60"
              }`}
              onClick={() => handleGradeClick(grade)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${grade.color} text-white text-2xl shadow-md`}>
                    {grade.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-slate-800">{grade.name}</CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">{grade.desc}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors">
                    <QrCode className="h-5 w-5 text-slate-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      hasClass 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {hasClass ? "✓ مسجل في النظام" : "غير مسجل"}
                    </span>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* QR Code Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <QrCode className="h-6 w-6 text-primary" />
              رمز QR - {selectedGrade?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedGrade && (
            <div className="space-y-6 py-4">
              {/* QR Code Display */}
              <div className="flex flex-col items-center gap-4">
                <div className="p-6 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={getGradeUrl(selectedGrade.id)}
                    size={200}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: "/icon-light-32x32.png",
                      x: undefined,
                      y: undefined,
                      height: 24,
                      width: 24,
                      excavate: true,
                    }}
                  />
                </div>
                <p className="text-sm text-slate-500 text-center">
                  امسح الرمز للانتقال مباشرة إلى {selectedGrade.name}
                </p>
              </div>

              {/* URL Display */}
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">الرابط:</p>
                <code className="text-xs text-slate-700 break-all block">
                  {getGradeUrl(selectedGrade.id)}
                </code>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={downloadQR}
                  className="flex-1 gap-2"
                  variant="default"
                >
                  <Download className="h-4 w-4" />
                  تحميل QR
                </Button>
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(getGradeUrl(selectedGrade.id))
                  }}
                  className="flex-1 gap-2"
                  variant="outline"
                >
                  <Share2 className="h-4 w-4" />
                  نسخ الرابط
                </Button>
              </div>

              {/* Direct Entry Button */}
              <Button 
                onClick={() => {
                  window.open(getGradeUrl(selectedGrade.id), '_blank')
                }}
                className="w-full gap-2"
                variant="secondary"
              >
                <Users className="h-4 w-4" />
                دخول مباشر للصف
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
