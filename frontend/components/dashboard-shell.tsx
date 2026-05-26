"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  GraduationCap,
  BookOpen,
  Users,
  LogOut,
  Menu,
  X,
  FileText,
  BarChart3,
  Calendar,
  Settings,
  Home,
  UserCheck,
  Award,
  QrCode,
  Bell,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentUser, setCurrentUser } from "@/lib/store"
import type { User } from "@/lib/store"
import { supabaseSignOut } from "@/lib/auth"
import { motion, AnimatePresence } from "framer-motion"

const overviewItem = { 
  href: "/dashboard", 
  label: "نظرة عامة", 
  icon: Home,
  description: "الرئيسية والإحصائيات"
}

const academicItems = [
  { 
    href: "/dashboard/students", 
    label: "الطلاب", 
    icon: Users,
    description: "سجل الطلاب"
  },
  { 
    href: "/dashboard/classes", 
    label: "الصفوف الدراسية", 
    icon: BookOpen,
    description: "إدارة الصفوف"
  },
  { 
    href: "/dashboard/teachers", 
    label: "المعلمون", 
    icon: UserCheck,
    description: "إدارة المعلمين"
  },
  { 
    href: "/dashboard/grades", 
    label: "العلامات والدرجات", 
    icon: Award,
    description: "سجل العلامات"
  },
]

const educationalItems = [
  { 
    href: "/dashboard/schedule", 
    label: "الجدول الدراسي", 
    icon: Calendar,
    description: "جداول الحصص"
  },
  { 
    href: "/dashboard/files", 
    label: "ملفات المواد", 
    icon: FileText,
    description: "المواد التعليمية"
  },
  { 
    href: "/dashboard/qrcode", 
    label: "رموز QR", 
    icon: QrCode,
    description: "رموز الصفوف"
  },
  { 
    href: "/dashboard/analytics", 
    label: "التحليلات والتقارير", 
    icon: BarChart3,
    description: "أداء المدرسة"
  },
]

export default function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/login")
    } else {
      setUser(currentUser)
    }
  }, [router])

  async function handleLogout() {
    await supabaseSignOut()
    setCurrentUser(null)
    router.push("/")
  }

  if (!mounted || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-indigo-500" />
          <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-indigo-500/10" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50 text-slate-800 font-sans">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Layout */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-white border-l border-slate-100 shadow-xl shadow-slate-200/40 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo Brand area */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-white safe-area-top">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-md shadow-indigo-500/10">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">مدرسة كفر عقب</span>
              <p className="text-[10px] text-indigo-500 font-semibold tracking-wide">نظام إدارة المدرسة الذكي</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-slate-400 hover:text-slate-655 transition-colors md:hidden p-1 rounded-lg hover:bg-slate-50 touch-target-sm"
            aria-label="إغلاق القائمة"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto py-5 px-4 space-y-4">
          <nav className="flex flex-col gap-1">
            {/* Overview / Home Page link */}
            {(() => {
              const item = overviewItem
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center gap-3 rounded-xl px-4.5 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <item.icon className={`h-4.5 w-4.5 transition-colors ${
                    isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-600"
                  }`} />
                  <div className="flex-1 font-bold">{item.label}</div>
                  {isActive && (
                    <motion.div 
                      layoutId="activeSideBorder"
                      className="absolute right-0 top-1/4 h-1/2 w-1 rounded-l-full bg-indigo-500" 
                    />
                  )}
                </Link>
              )
            })()}
            
            {/* Academic section heading */}
            <div className="mt-5 mb-2 px-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">الأكاديمي</span>
            </div>
            {academicItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center gap-3 rounded-xl px-4.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <item.icon className={`h-4.5 w-4.5 transition-colors ${
                    isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-600"
                  }`} />
                  <div className="flex-1 font-bold">{item.label}</div>
                  {isActive && (
                    <motion.div 
                      layoutId="activeSideBorder"
                      className="absolute right-0 top-1/4 h-1/2 w-1 rounded-l-full bg-indigo-500" 
                    />
                  )}
                </Link>
              )
            })}
            
            {/* Educational section heading */}
            <div className="mt-5 mb-2 px-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">التعليمي والتقارير</span>
            </div>
            {educationalItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center gap-3 rounded-xl px-4.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <item.icon className={`h-4.5 w-4.5 transition-colors ${
                    isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-600"
                  }`} />
                  <div className="flex-1 font-bold">{item.label}</div>
                  {isActive && (
                    <motion.div 
                      layoutId="activeSideBorder"
                      className="absolute right-0 top-1/4 h-1/2 w-1 rounded-l-full bg-indigo-500" 
                    />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Profile and Logout area at the bottom */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/50 safe-area-bottom">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white p-3 border border-slate-100 shadow-sm shadow-slate-100/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-sm">
              {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">{user.name}</div>
              <div className="text-[10px] font-semibold text-indigo-500">مدير النظام</div>
            </div>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex w-full items-center justify-center gap-2 rounded-xl py-5 font-bold text-xs sm:text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-600 border border-slate-200/80 hover:border-rose-100 transition-colors duration-200"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* Main content body container */}
      <div className="flex flex-1 flex-col min-w-0">
        
        {/* Top header bar */}
        <header className="flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md px-4 py-3 sm:px-6 safe-area-top sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-400 hover:text-slate-600 transition-colors md:hidden p-1.5 rounded-lg hover:bg-slate-50 touch-target-sm"
              aria-label="فتح القائمة"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                {(() => {
                  const allItems = [overviewItem, ...academicItems, ...educationalItems]
                  const found = allItems.find((n) => pathname === n.href)
                  return found?.label ||
                    (pathname.includes("/class/")
                      ? "تفاصيل الصف"
                      : pathname.includes("/student/")
                        ? "ملف الطالب"
                        : "لوحة التحكم")
                })()}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                {(() => {
                  const allItems = [overviewItem, ...academicItems, ...educationalItems]
                  const found = allItems.find((n) => pathname === n.href)
                  return found?.description || "إدارة المدرسة"
                })()}
              </p>
            </div>
          </div>

          {/* Top Actions: Notification, System Status */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="h-9 w-9 rounded-lg hover:bg-slate-50 text-slate-500 relative"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
              </Button>

              {/* Quick Notifications Dropdown */}
              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 mt-2 w-72 rounded-xl bg-white border border-slate-100 shadow-xl p-3 z-50 text-right"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                        <span className="text-xs font-bold text-slate-800">التنبيهات الأخيرة</span>
                        <span className="text-[10px] text-indigo-500 font-semibold cursor-pointer">تحديد كمقروء</span>
                      </div>
                      <div className="space-y-1.5 max-h-60 overflow-y-auto">
                        <div className="p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                          <p className="text-xs text-slate-800 font-semibold mb-0.5">تم تحديث جدول الحصص</p>
                          <span className="text-[9px] text-slate-400">قبل 10 دقائق</span>
                        </div>
                        <div className="p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                          <p className="text-xs text-slate-800 font-semibold mb-0.5">رفع ملف مادة العلوم للصف الخامس</p>
                          <span className="text-[9px] text-slate-400">قبل ساعة</span>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden sm:flex items-center gap-1 bg-emerald-50 text-emerald-600 rounded-lg px-2 py-1 text-[10px] font-bold border border-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>الخادم متصل</span>
            </div>
          </div>
        </header>

        {/* Child Pages Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
