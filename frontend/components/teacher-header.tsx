"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Globe, Sun, Moon, Monitor, Palette, X, Menu, LayoutDashboard, Users, BookOpen, CalendarDays, CalendarCheck, FolderOpen, QrCode, BarChart3, GraduationCap } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTeacherLanguage } from "@/lib/teacher-language-context"
import { useTeacherTheme, type TeacherColorTheme, type TeacherDarkMode } from "@/lib/teacher-theme-context"
import { useTeacherNotifications } from "@/lib/teacher-notification-context"
import dynamic from "next/dynamic"

const TeacherNotificationsDropdown = dynamic(() => import("./teacher/notifications-dropdown"), { ssr: false })

const colorThemes: { id: TeacherColorTheme; swatch: string; labelAr: string; labelEn: string }[] = [
  { id: "violet",  swatch: "bg-violet-500",  labelAr: "بنفسجي", labelEn: "Violet" },
  { id: "ocean",   swatch: "bg-blue-500",    labelAr: "أزرق",  labelEn: "Ocean" },
  { id: "emerald", swatch: "bg-emerald-500", labelAr: "زمردي", labelEn: "Emerald" },
  { id: "rose",    swatch: "bg-rose-500",    labelAr: "وردي",  labelEn: "Rose" },
  { id: "amber",   swatch: "bg-amber-500",   labelAr: "عنبري", labelEn: "Amber" },
]

const mobileNavItems = [
  { href: "/teacher", labelKey: "overview", icon: LayoutDashboard },
  { href: "/teacher/students", labelKey: "students", icon: Users },
  { href: "/teacher/grades", labelKey: "grades", icon: BookOpen },
  { href: "/teacher/schedule", labelKey: "schedule", icon: CalendarDays },
  { href: "/teacher/attendance", labelKey: "attendance", icon: CalendarCheck },
  { href: "/teacher/files", labelKey: "files", icon: FolderOpen },
  { href: "/teacher/qr", labelKey: "qrcode", icon: QrCode },
  { href: "/teacher/analytics", labelKey: "analytics", icon: BarChart3 },
]

export default function TeacherHeader() {
  const { language, setLanguage, t, isRTL } = useTeacherLanguage()
  const { config, setColor, setMode, isDark } = useTeacherTheme()
  const { notifications, unreadCount, markAsRead, markAllRead } = useTeacherNotifications()
  const pathname = usePathname()

  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const langRef = useRef<HTMLDivElement>(null)
  const themeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangMenuOpen(false)
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setThemeMenuOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <>
      <header className="sticky top-0 z-30">
        <div className="flex items-center justify-between bg-white/60 backdrop-blur-xl border-b border-white/20 px-4 py-2 shadow-[0_2px_16px_rgba(0,0,0,0.03)]">
          {/* Mobile hamburger + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-white/60 transition-colors"
              aria-label="menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 truncate leading-tight">
                {isRTL ? "لوحة المعلم" : "Teacher Dashboard"}
              </h2>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-1.5">
            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => { setLangMenuOpen(!langMenuOpen); setThemeMenuOpen(false); setNotificationsOpen(false) }}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-white/60 border border-transparent hover:border-white/30 transition-all duration-200 text-xs font-semibold"
                aria-label="language"
              >
                <Globe className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{language === "ar" ? "ع" : "EN"}</span>
              </button>

              <div
                className={`absolute ${isRTL ? "left-0" : "right-0"} top-full mt-2 w-44 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl p-1.5 z-50 transition-all duration-150 origin-top-right ${
                  langMenuOpen
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
              >
                <p className="px-2.5 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t.language.label}</p>
                {[
                  { id: "ar" as const, label: t.language.arabic, flag: "🇵🇸" },
                  { id: "en" as const, label: t.language.english, flag: "🇺🇸" },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => { setLanguage(lang.id); setLangMenuOpen(false) }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      language === lang.id
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span className="flex-1 text-start">{lang.label}</span>
                    {language === lang.id && (
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Switcher */}
            <div className="relative" ref={themeRef}>
              <button
                onClick={() => { setThemeMenuOpen(!themeMenuOpen); setLangMenuOpen(false); setNotificationsOpen(false) }}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/50 border border-transparent hover:border-white/30 dark:hover:border-slate-600/50 transition-all duration-200"
                aria-label="theme"
              >
                {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              </button>

              <div
                className={`absolute ${isRTL ? "left-0" : "right-0"} top-full mt-2 w-56 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-xl p-2 z-50 transition-all duration-150 origin-top-right ${
                  themeMenuOpen
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
              >
                <p className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t.theme.label}</p>
                <div className="flex gap-1 p-1 bg-slate-100/50 dark:bg-slate-700/50 rounded-xl mb-3">
                  {([
                    { id: "light" as TeacherDarkMode, icon: Sun,     label: t.theme.light  },
                    { id: "dark"  as TeacherDarkMode, icon: Moon,    label: t.theme.dark   },
                    { id: "system"as TeacherDarkMode, icon: Monitor, label: t.theme.system },
                  ] as const).map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setMode(id)}
                      className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-lg text-[9px] font-bold transition-all duration-150 ${
                        config.mode === id
                          ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
                <p className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Palette className="h-2.5 w-2.5" />
                  {isRTL ? "لون التطبيق" : "App Color"}
                </p>
                <div className="grid grid-cols-5 gap-1.5 px-1 pb-1">
                  {colorThemes.map(({ id, swatch }) => (
                    <button
                      key={id}
                      onClick={() => setColor(id)}
                      className={`relative h-7 w-full rounded-lg ${swatch} transition-all duration-150 hover:scale-110 ${
                        config.color === id
                          ? "ring-2 ring-offset-2 ring-slate-300 dark:ring-slate-500 scale-110"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      {config.color === id && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="h-2 w-2 rounded-full bg-white shadow-sm" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotificationsOpen(!notificationsOpen); setThemeMenuOpen(false); setLangMenuOpen(false) }}
                className="relative flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/50 border border-transparent hover:border-white/30 dark:hover:border-slate-600/50 transition-all duration-200"
                aria-label="notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-700" />
                )}
              </button>

              <TeacherNotificationsDropdown
                isOpen={notificationsOpen}
                isRTL={isRTL}
                t={t}
                notifications={notifications}
                unreadCount={unreadCount}
                markAsRead={markAsRead}
                markAllRead={markAllRead}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile overlay & panel */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <div
        className={`fixed inset-y-0 z-50 w-[260px] bg-white/90 backdrop-blur-xl shadow-2xl lg:hidden transition-transform duration-300 ${
          isRTL ? "right-0" : "left-0"
        } ${
          mobileMenuOpen ? "translate-x-0" : (isRTL ? "translate-x-full" : "-translate-x-full")
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold text-slate-900">
              {isRTL ? "لوحة المعلم" : "Teacher"}
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon
            const label = (t as any).teacherNav[item.labelKey as any]
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
