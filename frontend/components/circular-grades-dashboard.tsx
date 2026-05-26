import { useState } from "react"
import { motion } from "framer-motion"
import { BookOpen } from "lucide-react"

type GradeId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

interface GradeConfig {
  id: GradeId
  title: string
  subtitle: string
  color: string
  gradient: string
  description: string
  highlights: string[]
}

const GRADES: GradeConfig[] = [
  {
    id: 1,
    title: "الصف الأول",
    subtitle: "البدايات المشرقة",
    color: "bg-emerald-500",
    gradient: "from-emerald-500 via-emerald-400 to-teal-400",
    description: "أساسيات القراءة والكتابة والمهارات الحسابية الأولى.",
    highlights: ["اللغة العربية الأساسية", "مبادئ العد والجمع", "تنمية المهارات الحركية"],
  },
  {
    id: 2,
    title: "الصف الثاني",
    subtitle: "تعميق الأساسيات",
    color: "bg-cyan-500",
    gradient: "from-cyan-500 via-sky-500 to-blue-500",
    description: "تثبيت المهارات الأساسية وتوسيع المفردات والمعرفة.",
    highlights: ["قراءة نصوص مبسطة", "الجمع والطرح حتى 99", "العلوم المبسطة"],
  },
  {
    id: 3,
    title: "الصف الثالث",
    subtitle: "اكتشاف العالم",
    color: "bg-blue-500",
    gradient: "from-blue-500 via-indigo-500 to-sky-500",
    description: "الانتقال إلى نصوص أطول ومفاهيم علمية أوسع.",
    highlights: ["الفقرة الكاملة", "الضرب والقسمة الأساسية", "مفاهيم في العلوم والحياة"],
  },
  {
    id: 4,
    title: "الصف الرابع",
    subtitle: "تنمية التفكير",
    color: "bg-violet-500",
    gradient: "from-violet-500 via-fuchsia-500 to-purple-500",
    description: "تنمية مهارات التحليل وحل المشكلات.",
    highlights: ["القراءة التحليلية", "الكسور والأعداد العشرية", "مشاريع بحثية بسيطة"],
  },
  {
    id: 5,
    title: "الصف الخامس",
    subtitle: "الاستعداد المتوسط",
    color: "bg-fuchsia-500",
    gradient: "from-fuchsia-500 via-pink-500 to-rose-500",
    description: "تهيئة الطالب للمرحلة المتوسطة بمفاهيم أعمق.",
    highlights: ["نصوص أدبية قصيرة", "عمليات على الكسور", "مفاهيم بيئية وجغرافية"],
  },
  {
    id: 6,
    title: "الصف السادس",
    subtitle: "توسّع المعرفة",
    color: "bg-rose-500",
    gradient: "from-rose-500 via-orange-500 to-amber-500",
    description: "توسيع قاعدة المعرفة وبناء قدرات البحث الذاتي.",
    highlights: ["قواعد لغوية متقدمة", "النسب والتناسب", "تجارب علمية مبسطة"],
  },
  {
    id: 7,
    title: "الصف السابع",
    subtitle: "بداية الإعدادي",
    color: "bg-orange-500",
    gradient: "from-orange-500 via-amber-500 to-yellow-400",
    description: "الانتقال إلى المرحلة الإعدادية ومهارات التفكير المجرد.",
    highlights: ["نصوص تحليلية", "جبر بسيط", "علوم عامة أوسع"],
  },
  {
    id: 8,
    title: "الصف الثامن",
    subtitle: "تعميق الإعدادي",
    color: "bg-amber-500",
    gradient: "from-amber-500 via-lime-500 to-green-500",
    description: "تعميق المفاهيم الرياضية والعلمية واللغوية.",
    highlights: ["تحليل نصوص متقدمة", "معادلات جبرية", "مفاهيم في الفيزياء والأحياء"],
  },
  {
    id: 9,
    title: "الصف التاسع",
    subtitle: "الاستعداد للثانوي",
    color: "bg-emerald-600",
    gradient: "from-emerald-600 via-teal-500 to-cyan-500",
    description: "تهيئة قوية للمرحلة الثانوية والاختبارات الوطنية.",
    highlights: ["كتابة التقارير", "جبر وهندسة أعمق", "مشاريع علمية متقدمة"],
  },
]

const RADIUS_PERCENT = 40

interface CircularGradesDashboardProps {
  onOpenGrade?: (gradeId: GradeId, gradeName: string) => void
}

export function CircularGradesDashboard({ onOpenGrade }: CircularGradesDashboardProps) {
  const [activeId, setActiveId] = useState<GradeId | null>(null)

  const handleSelect = (id: GradeId) => {
    setActiveId(id)
    if (onOpenGrade) {
      const grade = GRADES.find((g) => g.id === id)
      if (grade) {
        onOpenGrade(grade.id, grade.title)
      }
    }
  }

  return (
    <section className="w-full rounded-3xl bg-slate-50/80 px-3 py-10 shadow-md ring-1 ring-slate-100 sm:px-6 sm:py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center">
        <div className="w-full max-w-3xl text-center mb-6 sm:mb-8">
          <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
            اختر الصف من العجلة لفتح مواد الصف والخطة الدراسية
          </h3>
        </div>

        {/* Circular wheel */}
        <div className="flex w-full items-center justify-center">
          <div className="relative aspect-square w-full max-w-lg sm:max-w-xl">
            {/* Outer soft background ring */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-sky-50 via-white to-indigo-50 shadow-[0_18px_45px_rgba(15,23,42,0.14)]" />

            {/* Book segments */}
            {GRADES.map((grade, index) => {
              const angle = (index / GRADES.length) * Math.PI * 2 - Math.PI / 2
              const x = 50 + RADIUS_PERCENT * Math.cos(angle)
              const y = 50 + RADIUS_PERCENT * Math.sin(angle)
              const isActive = activeId === grade.id

              return (
                <motion.button
                  key={grade.id}
                  type="button"
                  onClick={() => handleSelect(grade.id)}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.97 }}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 focus-visible:outline-none"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.18 : 1.05,
                      boxShadow: isActive
                        ? "0 16px 40px rgba(15,23,42,0.30)"
                        : "0 6px 18px rgba(15,23,42,0.16)",
                    }}
                    transition={{ type: "spring", stiffness: 210, damping: 17 }}
                    className={`relative flex min-w-[130px] max-w-[165px] flex-col items-center rounded-3xl border border-white/70 bg-white/90 px-4 py-3 text-center shadow-md backdrop-blur-sm ring-1 ring-slate-200/60 group-hover:ring-2 group-hover:ring-sky-300 ${
                      isActive ? "ring-2 ring-sky-400" : ""
                    }`}
                  >
                    <div className={`absolute inset-y-2 left-1.5 w-1.5 rounded-full ${grade.color} shadow-sm`} />

                    {/* book logo with grade name inside */}
                    <div
                      className={`mb-2 flex min-h-[64px] w-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${grade.gradient} px-3 py-2 text-white shadow`}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/15 mb-1">
                        <BookOpen className="h-4 w-4" />
                      </span>
                      <span className="text-[11px] font-semibold leading-snug">{grade.title}</span>
                    </div>

                    <p className="line-clamp-2 text-[10px] text-slate-600">{grade.subtitle}</p>

                    <div
                      className={`pointer-events-none absolute inset-0 rounded-3xl opacity-0 blur-md transition group-hover:opacity-60 ${
                        isActive ? "bg-sky-300/60 opacity-70" : "bg-sky-200/40"
                      }`}
                    />
                  </motion.div>
                </motion.button>
              )
            })}

            {/* Center circle */}
            <motion.div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_14px_32px_rgba(15,23,42,0.18)] sm:h-36 sm:w-36 md:h-40 md:w-40">
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-indigo-500 to-cyan-400 text-white shadow-lg">
                  <BookOpen className="h-8 w-8" />
                </div>
                <p className="text-xs font-semibold text-sky-700 sm:text-sm">قسم المراحل الدراسية</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

