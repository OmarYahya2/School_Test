"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GraduationCap, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { setCurrentUser } from "@/lib/store"
import { supabaseSignUp } from "@/lib/auth"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (!name || !email || !password || !confirmPassword) {
      toast.error("يرجى ملء جميع الحقول")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين")
      setLoading(false)
      return
    }

    const user = await supabaseSignUp(name, email, password)
    if (user) {
      setCurrentUser(user)
      toast.success("تم إنشاء الحساب بنجاح!")
      router.push("/dashboard")
    } else {
      toast.error("تعذر إنشاء الحساب، تحقق من البريد الإلكتروني أو حاول لاحقاً")
    }
    setLoading(false)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">نظام إدارة المدرسة</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">إنشاء حساب جديد</h1>
          <p className="mt-2 text-sm text-muted-foreground">أنشئ حسابك للبدء في إدارة مدرستك</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-card-foreground">الاسم الكامل</Label>
              <Input
                id="name"
                type="text"
                placeholder="أحمد محمد"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-card-foreground">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-right"
                dir="ltr"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-card-foreground">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="6 أحرف على الأقل"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pe-10 text-right"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-password" className="text-card-foreground">تأكيد كلمة المرور</Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="أعد كتابة كلمة المرور"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="text-right"
                dir="ltr"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
            </Button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </main>
  )
}
