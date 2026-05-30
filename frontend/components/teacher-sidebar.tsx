"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  CalendarCheck,
  FolderOpen,
  QrCode,
  BarChart3,
  LogOut,
  GraduationCap,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppTheme } from "@/lib/theme-context"
import { motion } from "framer-motion"

const navItems = [
  { href: "/teacher", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/teacher/students", label: "الطلاب", icon: Users },
  { href: "/teacher/grades", label: "الدرجات", icon: BookOpen },
  { href: "/teacher/schedule", label: "الجدول", icon: CalendarDays },
  { href: "/teacher/attendance", label: "الحضور", icon: CalendarCheck },
  { href: "/teacher/files", label: "الملفات", icon: FolderOpen },
  { href: "/teacher/qr", label: "QR", icon: QrCode },
  { href: "/teacher/analytics", label: "التقارير", icon: BarChart3 },
]

export default function TeacherSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { config } = useAppTheme()

  const tc = {
    ocean:   { bg: "bg-blue-500", text: "text-blue-600", ring: "ring-blue-500", hover: "hover:bg-blue-50", active: "bg-blue-50 text-blue-700" },
    violet:  { bg: "bg-violet-500", text: "text-violet-600", ring: "ring-violet-500", hover: "hover:bg-violet-50", active: "bg-violet-50 text-violet-700" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-600", ring: "ring-emerald-500", hover: "hover:bg-emerald-50", active: "bg-emerald-50 text-emerald-700" },
    rose:    { bg: "bg-rose-500", text: "text-rose-600", ring: "ring-rose-500", hover: "hover:bg-rose-50", active: "bg-rose-50 text-rose-700" },
    amber:   { bg: "bg-amber-500", text: "text-amber-600", ring: "ring-amber-500", hover: "hover:bg-amber-50", active: "bg-amber-50 text-amber-700" },
  }[config.color] || { bg: "bg-blue-500", text: "text-blue-600", ring: "ring-blue-500", hover: "hover:bg-blue-50", active: "bg-blue-50 text-blue-700" }

  return (
    <aside className="fixed inset-y-0 right-0 z-40 hidden w-64 flex-col border-l border-slate-200 bg-white lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-6">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tc.bg} text-white shadow-md`}>
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <span className="block text-sm font-bold text-slate-900 leading-tight">لوحة المعلم</span>
          <span className="text-[10px] text-slate-500">Teacher Dashboard</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onMouseEnter={() => router.prefetch(item.href)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? `${tc.active} ${tc.ring} ring-1`
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", isActive ? tc.text : "text-slate-400")} />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="teacher-active-pill"
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "currentColor" }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 p-3">
        <Link
          href="/login"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-700"
        >
          <LogOut className="h-[18px] w-[18px]" />
          <span>تسجيل الخروج</span>
          <ChevronRight className="mr-auto h-4 w-4" />
        </Link>
      </div>
    </aside>
  )
}
