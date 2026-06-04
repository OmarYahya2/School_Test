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
import { useTeacherTheme } from "@/lib/teacher-theme-context"
import { supabaseSignOut } from "@/lib/auth"
import { useQueryClient } from "@tanstack/react-query"
import { useTeacherLanguage } from "@/lib/teacher-language-context"

const navItems = [
  { href: "/teacher", labelKey: "overview", icon: LayoutDashboard },
  { href: "/teacher/students", labelKey: "students", icon: Users },
  { href: "/teacher/grades", labelKey: "grades", icon: BookOpen },
  { href: "/teacher/schedule", labelKey: "schedule", icon: CalendarDays },
  { href: "/teacher/attendance", labelKey: "attendance", icon: CalendarCheck },
  { href: "/teacher/files", labelKey: "files", icon: FolderOpen },
  { href: "/teacher/qr", labelKey: "qrcode", icon: QrCode },
  { href: "/teacher/analytics", labelKey: "analytics", icon: BarChart3 },
]

export default function TeacherSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { config } = useTeacherTheme()
  const queryClient = useQueryClient()
  const { t, isRTL } = useTeacherLanguage()

  const tc = {
    ocean:   { bg: "bg-blue-500", text: "text-blue-600", border: "border-blue-200/50", hover: "hover:bg-blue-50/50", active: "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100" },
    violet:  { bg: "bg-violet-500", text: "text-violet-600", border: "border-violet-200/50", hover: "hover:bg-violet-50/50", active: "bg-violet-50 text-violet-700 shadow-sm shadow-violet-100" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-200/50", hover: "hover:bg-emerald-50/50", active: "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100" },
    rose:    { bg: "bg-rose-500", text: "text-rose-600", border: "border-rose-200/50", hover: "hover:bg-rose-50/50", active: "bg-rose-50 text-rose-700 shadow-sm shadow-rose-100" },
    amber:   { bg: "bg-amber-500", text: "text-amber-600", border: "border-amber-200/50", hover: "hover:bg-amber-50/50", active: "bg-amber-50 text-amber-700 shadow-sm shadow-amber-100" },
  }[config.color] || { bg: "bg-blue-500", text: "text-blue-600", border: "border-blue-200/50", hover: "hover:bg-blue-50/50", active: "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100" }

  return (
    <aside className={`fixed inset-y-0 z-40 hidden w-[260px] flex-col bg-white ${isRTL ? "right-0 border-l" : "left-0 border-r"} border-slate-200 lg:flex shadow-sm`}>
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-100 to-transparent rounded-full blur-2xl -z-10 opacity-60" />
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tc.bg} text-white shadow-lg shadow-black/5`}>
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <span className="block text-base font-extrabold text-slate-900 leading-tight">{isRTL ? "لوحة المعلم" : "Teacher Dashboard"}</span>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Dashboard</span>
        </div>
      </div>

      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-hide">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          const label = t.teacherNav[item.labelKey as keyof typeof t.teacherNav]
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onMouseEnter={() => router.prefetch(item.href)}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold transition-all duration-300",
                isActive
                  ? `${tc.active} border ${tc.border} scale-[1.02]`
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:scale-[1.01]"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300",
                isActive ? "bg-white shadow-sm" : "bg-slate-100 group-hover:bg-white group-hover:shadow-sm"
              )}>
                <Icon className={cn("h-[18px] w-[18px]", isActive ? tc.text : "text-slate-400 group-hover:text-slate-600")} />
              </div>
              <span className="flex-1">{label}</span>
              {isActive && (
                <div
                  className={`absolute ${isRTL ? "left-2" : "right-2"} h-1.5 w-1.5 rounded-full bg-current`}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 bg-gradient-to-t from-slate-50/50 to-transparent">
        <button
          onClick={async () => {
            queryClient.clear()
            await supabaseSignOut()
            router.push("/login")
          }}
          className="group flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold text-slate-500 transition-all duration-300 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
            <LogOut className="h-[18px] w-[18px] group-hover:text-rose-500 transition-colors" />
          </div>
          <span>{t.user.logout}</span>
          {isRTL ? (
            <ChevronRight className="mr-auto h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          ) : (
            <ChevronRight className="ml-auto h-4 w-4 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 rotate-180" />
          )}
        </button>
      </div>
    </aside>
  )
}
