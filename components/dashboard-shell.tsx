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
  School,
  Award,
  QrCode,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentUser, setCurrentUser } from "@/lib/store"
import type { User } from "@/lib/store"
import { supabaseSignOut } from "@/lib/auth"

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
    label: "العلامات", 
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
]

export default function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Professional Design */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-slate-50 shadow-xl shadow-slate-200/50 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-700 shadow-md">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-base text-slate-800">مدرسة كفر عقب</span>
              <p className="text-xs text-slate-600 font-medium tracking-wide">نظام إدارة مدرسي</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors md:hidden"
            aria-label="إغلاق القائمة"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <nav className="flex flex-col gap-1 px-4">
            {/* نظرة عامة - Overview Section */}
            {(() => {
              const item = overviewItem
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all duration-200 mb-2 ${
                    isActive
                      ? "bg-slate-700 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-200 hover:text-slate-800"
                  }`}
                >
                  <item.icon className={`h-5 w-5 transition-colors ${
                    isActive ? "text-white" : "text-slate-600 group-hover:text-slate-700"
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                  </div>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-slate-900" />
                  )}
                </Link>
              )
            })()}
            
            {/* الأكاديمي - Academic Section */}
            <div className="mt-4 mb-3 px-2">
              <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em] flex items-center gap-2">
                <span className="h-px flex-1 bg-slate-300"></span>
                أكاديمي
                <span className="h-px flex-1 bg-slate-300"></span>
              </h3>
            </div>
            {academicItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-slate-200 text-slate-800 shadow-sm"
                      : "text-slate-700 hover:bg-slate-200 hover:text-slate-800"
                  }`}
                >
                  <item.icon className={`h-[18px] w-[18px] transition-colors ${
                    isActive ? "text-slate-700" : "text-slate-600 group-hover:text-slate-700"
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                  </div>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-slate-700" />
                  )}
                </Link>
              )
            })}
            
            {/* التعليمي - Educational Section */}
            <div className="mt-6 mb-3 px-2">
              <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em] flex items-center gap-2">
                <span className="h-px flex-1 bg-slate-300"></span>
                تعليمي
                <span className="h-px flex-1 bg-slate-300"></span>
              </h3>
            </div>
            {educationalItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-slate-200 text-slate-800 shadow-sm"
                      : "text-slate-700 hover:bg-slate-200 hover:text-slate-800"
                  }`}
                >
                  <item.icon className={`h-[18px] w-[18px] transition-colors ${
                    isActive ? "text-slate-700" : "text-slate-600 group-hover:text-slate-700"
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                  </div>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-slate-700" />
                  )}
                </Link>
              )
            })}
            
            </nav>
        </div>

        <div className="border-t border-slate-200 bg-slate-100/50 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-white p-3 border border-slate-200 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200">
              <Users className="h-4 w-4 text-slate-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-800 truncate">{user.name}</div>
              <div className="text-xs text-slate-600">مدير النظام</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-white hover:text-slate-800 transition-colors border border-slate-200"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white/80 backdrop-blur-sm px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-400 hover:text-slate-600 transition-colors md:hidden p-1 rounded-md hover:bg-slate-100"
              aria-label="فتح القائمة"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-base font-semibold text-slate-800">
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
              <p className="text-xs text-slate-500">
                {(() => {
                  const allItems = [overviewItem, ...academicItems, ...educationalItems]
                  const found = allItems.find((n) => pathname === n.href)
                  return found?.description || "إدارة المدرسة"
                })()}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
    </div>
  )
}
