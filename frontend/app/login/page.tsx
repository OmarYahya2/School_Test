"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GraduationCap, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { supabaseSignIn } from "@/lib/auth"
import { motion } from "framer-motion"
import { useSchoolName } from "@/lib/school-settings-context"
import { useAppTheme } from "@/lib/theme-context"

export default function LoginPage() {
  const router = useRouter()
  const { schoolName } = useSchoolName()
  const { config } = useAppTheme()

  const tc = {
    ocean:   { from: "from-blue-500",   via: "via-sky-500",   to: "to-cyan-500",    btn: "bg-blue-600",   btnHover: "hover:bg-blue-700",   text: "text-blue-400",   textHover: "hover:text-blue-300",   shadow: "shadow-blue-600/25",   ring: "focus:border-blue-500 focus:ring-blue-500/50",   dot: "bg-blue-500",   glow1: "bg-blue-600/20",   glow2: "bg-sky-600/12" },
    violet:  { from: "from-violet-500", via: "via-purple-500", to: "to-fuchsia-500", btn: "bg-violet-600", btnHover: "hover:bg-violet-700", text: "text-violet-400", textHover: "hover:text-violet-300", shadow: "shadow-violet-600/25", ring: "focus:border-violet-500 focus:ring-violet-500/50", dot: "bg-violet-500", glow1: "bg-violet-600/20", glow2: "bg-fuchsia-600/12" },
    emerald: { from: "from-emerald-500", via: "via-teal-500", to: "to-cyan-500",    btn: "bg-emerald-600", btnHover: "hover:bg-emerald-700", text: "text-emerald-400", textHover: "hover:text-emerald-300", shadow: "shadow-emerald-600/25", ring: "focus:border-emerald-500 focus:ring-emerald-500/50", dot: "bg-emerald-500", glow1: "bg-emerald-600/20", glow2: "bg-teal-600/12" },
    rose:    { from: "from-rose-500",   via: "via-pink-500",  to: "to-fuchsia-500", btn: "bg-rose-600",   btnHover: "hover:bg-rose-700",   text: "text-rose-400",   textHover: "hover:text-rose-300",   shadow: "shadow-rose-600/25",   ring: "focus:border-rose-500 focus:ring-rose-500/50",   dot: "bg-rose-500",   glow1: "bg-rose-600/20",   glow2: "bg-pink-600/12" },
    amber:   { from: "from-amber-500",  via: "via-orange-500", to: "to-yellow-500", btn: "bg-amber-600",  btnHover: "hover:bg-amber-700",  text: "text-amber-400",  textHover: "hover:text-amber-300",  shadow: "shadow-amber-600/25",  ring: "focus:border-amber-500 focus:ring-amber-500/50",  dot: "bg-amber-500",  glow1: "bg-amber-600/20",  glow2: "bg-orange-600/12" },
  }[config.color] || { from: "from-violet-500", via: "via-purple-500", to: "to-fuchsia-500", btn: "bg-violet-600", btnHover: "hover:bg-violet-700", text: "text-violet-400", textHover: "hover:text-violet-300", shadow: "shadow-violet-600/25", ring: "focus:border-violet-500 focus:ring-violet-500/50", dot: "bg-violet-500", glow1: "bg-violet-600/20", glow2: "bg-fuchsia-600/12" }
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (!email || !password) {
      toast.error("يرجى ملء جميع الحقول")
      setLoading(false)
      return
    }

    const user = await supabaseSignIn(email, password)
    if (user) {
      toast.success(`مرحباً ${user.name}`)
      if (user.role === "teacher") {
        router.push("/teacher")
      } else {
        router.push("/dashboard")
      }
    } else {
      toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة")
    }
    setLoading(false)
  }

  return (
    <main className="flex min-h-screen bg-slate-950 relative overflow-hidden" dir="rtl">
      {/* Background layers */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        {/* Orbs */}
        <div className={`absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full ${tc.glow1} blur-[120px]`} />
        <div className={`absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full ${tc.glow2} blur-[100px]`} />
      </div>

      {/* Left branding panel (desktop only) */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 border-l border-slate-800/50 bg-slate-900/30 p-10 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tc.from} ${tc.via.replace("via-", "to-")} shadow-md ${tc.shadow.replace("600/25", "500/25")}`}>
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-white leading-tight">{schoolName}</p>
              <p className={`text-[10px] ${tc.text}`}>نظام الإدارة الذكي</p>
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-white leading-snug mb-3">
            إدارة مدرستك<br />بكفاءة عالية
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
            منصة متكاملة لإدارة الطلاب، المعلمين، الجداول الدراسية، والدرجات في مكان واحد.
          </p>

          <div className="mt-8 space-y-3">
            {[
              "إدارة الطلاب وسجلاتهم الكاملة",
              "جداول دراسية أسبوعية منظمة",
              "تقارير وتحليلات إدارية دقيقة",
              "واجهة سهلة الاستخدام بالكامل",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-slate-400">
                <div className={`h-1.5 w-1.5 rounded-full ${tc.dot} flex-shrink-0`} />
                {feature}
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-slate-600">© {new Date().getFullYear()} {schoolName}. جميع الحقوق محفوظة.</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-10 relative z-10">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tc.from} ${tc.via.replace("via-", "to-")} shadow-md ${tc.shadow.replace("600/25", "500/25")}`}>
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-white leading-tight">{schoolName}</p>
              <p className={`text-[10px] ${tc.text}`}>نظام الإدارة الذكي</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, type: "spring", stiffness: 100, damping: 18 }}
          >
            <div className="mb-7 text-right">
              <h1 className="text-xl font-extrabold text-white mb-1">تسجيل الدخول</h1>
              <p className="text-sm text-slate-400">أدخل بيانات حسابك للوصول إلى لوحة التحكم</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-300 text-xs font-semibold">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`bg-slate-900/60 border-slate-700/60 focus:border-${tc.ring.split(" ")[0].replace("focus:border-", "")} focus:ring-1 focus:ring-${tc.ring.split(" ")[1].replace("focus:ring-", "")} text-left placeholder:text-slate-600 rounded-xl h-11 text-slate-200 transition-colors`}
                  dir="ltr"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-300 text-xs font-semibold">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`bg-slate-900/60 border-slate-700/60 focus:border-${tc.ring.split(" ")[0].replace("focus:border-", "")} focus:ring-1 focus:ring-${tc.ring.split(" ")[1].replace("focus:ring-", "")} text-left placeholder:text-slate-600 rounded-xl h-11 text-slate-200 pl-10 transition-colors`}
                    dir="ltr"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                    aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={`w-full ${tc.btn} ${tc.btnHover} text-white rounded-xl h-11 font-bold shadow-lg ${tc.shadow} border-0 transition-all duration-200 mt-2 disabled:opacity-60`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    جاري التحقق...
                  </span>
                ) : "تسجيل الدخول"}
              </Button>
            </form>

            <p className="mt-5 text-center text-xs text-slate-500">
              ليس لديك حساب إدارة؟{" "}
              <Link href="/register" className={`font-semibold ${tc.text} ${tc.textHover} transition-colors`}>
                إنشاء حساب جديد
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  )
}

