"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GraduationCap, Eye, EyeOff, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { setCurrentUser } from "@/lib/store"
import { supabaseSignIn } from "@/lib/auth"
import { motion } from "framer-motion"

export default function LoginPage() {
  const router = useRouter()
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
      setCurrentUser(user)
      toast.success(`مرحباً ${user.name}`)
      router.push("/dashboard")
    } else {
      toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة")
    }
    setLoading(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-[120px] bg-gradient-to-br from-indigo-600 to-purple-600" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[450px] h-[450px] rounded-full opacity-15 blur-[100px] bg-gradient-to-tr from-pink-500 to-indigo-700" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Top Navigation / Logo */}
        <div className="mb-6 flex justify-between items-center px-1">
          <Link href="/" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            <ArrowRight className="h-4 w-4" />
            <span>الرجوع للرئيسية</span>
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 15 }}
          className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-slate-950/50"
        >
          <div className="mb-6 text-center">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md mb-4">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">نظام إدارة المدرسة</h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-400">أدخل بيانات الاعتماد الخاصة بك للوصول إلى لوحة التحكم</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-300 text-xs sm:text-sm">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-950/60 border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-left placeholder:text-slate-600 rounded-xl h-10 text-slate-200"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-300 text-xs sm:text-sm">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-950/60 border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-left placeholder:text-slate-600 rounded-xl h-10 text-slate-200 pe-10"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl h-10 font-bold shadow-lg shadow-indigo-500/20 border-0 transition-all duration-300 mt-2 active:scale-98"
            >
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        </motion.div>

        <p className="mt-5 text-center text-xs sm:text-sm text-slate-500">
          ليس لديك حساب إدارة؟{" "}
          <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </main>
  )
}
