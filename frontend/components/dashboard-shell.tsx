"use client"

import { useEffect, useState, useRef, type ReactNode } from "react"
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
  Home,
  UserCheck,
  Award,
  QrCode,
  Bell,
  Sun,
  Moon,
  Monitor,
  Globe,
  ChevronDown,
  Palette,
  Settings,
  User,
} from "lucide-react"
import { client } from "@/lib/api/client"
import { supabaseSignOut } from "@/lib/auth"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"
import { useAppTheme, type ColorTheme, type DarkMode } from "@/lib/theme-context"
import { useSchoolName } from "@/lib/school-settings-context"

interface SessionUser { id: string; name: string; email: string; role?: string }

type NavItem = {
  href: string
  labelKey: keyof ReturnType<typeof useLanguage>["t"]["nav"]
  descKey: keyof ReturnType<typeof useLanguage>["t"]["nav"]
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const overviewItem: NavItem = {
  href: "/dashboard",
  labelKey: "overview",
  descKey: "overviewDesc",
  icon: Home,
  color: "violet",
}

const academicItems: NavItem[] = [
  { href: "/dashboard/students",  labelKey: "students",  descKey: "studentsDesc",  icon: Users,     color: "sky"     },
  { href: "/dashboard/classes",   labelKey: "classes",   descKey: "classesDesc",   icon: BookOpen,  color: "blue"    },
  { href: "/dashboard/teachers",  labelKey: "teachers",  descKey: "teachersDesc",  icon: UserCheck, color: "emerald" },
  { href: "/dashboard/teachers-management", labelKey: "teacherManagement", descKey: "teacherManagementDesc", icon: GraduationCap, color: "violet" },
  { href: "/dashboard/grades",    labelKey: "grades",    descKey: "gradesDesc",    icon: Award,     color: "amber"   },
]

const educationalItems: NavItem[] = [
  { href: "/dashboard/schedule",  labelKey: "schedule",  descKey: "scheduleDesc",  icon: Calendar,  color: "orange"  },
  { href: "/dashboard/files",     labelKey: "files",     descKey: "filesDesc",     icon: FileText,  color: "rose"    },
  { href: "/dashboard/qrcode",    labelKey: "qrcode",    descKey: "qrcodeDesc",    icon: QrCode,    color: "fuchsia" },
  { href: "/dashboard/analytics", labelKey: "analytics", descKey: "analyticsDesc", icon: BarChart3, color: "cyan"    },
]

const navColors: Record<string, {
  activeBg: string; activeIconBg: string; activeText: string
  activeIconText: string; activeDot: string; activeBar: string
}> = {
  violet:  { activeBg: "bg-primary/8 dark:bg-primary/15",          activeIconBg: "bg-primary/12 dark:bg-primary/20",            activeText: "text-primary",                              activeIconText: "text-primary",                              activeDot: "bg-primary",         activeBar: "bg-primary"         },
  sky:     { activeBg: "bg-sky-50 dark:bg-sky-950/40",             activeIconBg: "bg-sky-100 dark:bg-sky-900/40",              activeText: "text-sky-700 dark:text-sky-400",            activeIconText: "text-sky-600 dark:text-sky-400",            activeDot: "bg-sky-500",         activeBar: "bg-sky-500"         },
  blue:    { activeBg: "bg-blue-50 dark:bg-blue-950/40",           activeIconBg: "bg-blue-100 dark:bg-blue-900/40",            activeText: "text-blue-700 dark:text-blue-400",          activeIconText: "text-blue-600 dark:text-blue-400",          activeDot: "bg-blue-500",        activeBar: "bg-blue-500"        },
  emerald: { activeBg: "bg-emerald-50 dark:bg-emerald-950/40",     activeIconBg: "bg-emerald-100 dark:bg-emerald-900/40",      activeText: "text-emerald-700 dark:text-emerald-400",    activeIconText: "text-emerald-600 dark:text-emerald-400",    activeDot: "bg-emerald-500",     activeBar: "bg-emerald-500"     },
  amber:   { activeBg: "bg-amber-50 dark:bg-amber-950/40",         activeIconBg: "bg-amber-100 dark:bg-amber-900/40",          activeText: "text-amber-700 dark:text-amber-400",        activeIconText: "text-amber-600 dark:text-amber-400",        activeDot: "bg-amber-500",       activeBar: "bg-amber-500"       },
  orange:  { activeBg: "bg-orange-50 dark:bg-orange-950/40",       activeIconBg: "bg-orange-100 dark:bg-orange-900/40",        activeText: "text-orange-700 dark:text-orange-400",      activeIconText: "text-orange-600 dark:text-orange-400",      activeDot: "bg-orange-500",      activeBar: "bg-orange-500"      },
  rose:    { activeBg: "bg-rose-50 dark:bg-rose-950/40",           activeIconBg: "bg-rose-100 dark:bg-rose-900/40",            activeText: "text-rose-700 dark:text-rose-400",          activeIconText: "text-rose-600 dark:text-rose-400",          activeDot: "bg-rose-500",        activeBar: "bg-rose-500"        },
  fuchsia: { activeBg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",     activeIconBg: "bg-fuchsia-100 dark:bg-fuchsia-900/40",      activeText: "text-fuchsia-700 dark:text-fuchsia-400",    activeIconText: "text-fuchsia-600 dark:text-fuchsia-400",    activeDot: "bg-fuchsia-500",     activeBar: "bg-fuchsia-500"     },
  cyan:    { activeBg: "bg-cyan-50 dark:bg-cyan-950/40",           activeIconBg: "bg-cyan-100 dark:bg-cyan-900/40",            activeText: "text-cyan-700 dark:text-cyan-400",          activeIconText: "text-cyan-600 dark:text-cyan-400",          activeDot: "bg-cyan-500",        activeBar: "bg-cyan-500"        },
}

const colorThemes: { id: ColorTheme; swatch: string }[] = [
  { id: "violet",  swatch: "bg-violet-500"  },
  { id: "ocean",   swatch: "bg-blue-600"    },
  { id: "emerald", swatch: "bg-emerald-600" },
  { id: "rose",    swatch: "bg-rose-500"    },
  { id: "amber",   swatch: "bg-amber-500"   },
]

export default function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { t, language, setLanguage, isRTL } = useLanguage()
  const { config, setColor, setMode, isDark } = useAppTheme()
  const { schoolName } = useSchoolName()

  const [user, setUser] = useState<SessionUser | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const themeRef = useRef<HTMLDivElement>(null)
  const langRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    client.get<SessionUser>("/auth/me")
      .then(setUser)
      .catch(() => { window.location.href = "/login" })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setThemeMenuOpen(false)
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangMenuOpen(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function handleLogout() {
    await supabaseSignOut()
    router.push("/")
  }

  if (!mounted || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-primary/10" />
        </div>
      </div>
    )
  }

  const allNavItems = [overviewItem, ...academicItems, ...educationalItems]
  const currentPage = allNavItems.find((n) => pathname === n.href)
  const pageLabel = currentPage ? t.nav[currentPage.labelKey] :
    (pathname.includes("/class/") ? t.pages.classDetail :
      pathname.includes("/student/") ? t.pages.studentDetail : t.pages.dashboard)
  const pageDescription = currentPage ? t.nav[currentPage.descKey] : t.pages.management

  const userInitials = user.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href
    const colors = navColors[item.color] ?? navColors.violet
    const label = t.nav[item.labelKey]

    return (
      <Link
        href={item.href}
        prefetch
        onMouseEnter={() => router.prefetch(item.href)}
        onClick={() => setSidebarOpen(false)}
        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
          isActive
            ? `${colors.activeBg} ${colors.activeText} font-bold`
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        {isActive && (
          <span className={`absolute ${isRTL ? "right-0" : "left-0"} top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full ${colors.activeBar}`} />
        )}
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0 transition-all duration-200 ${
          isActive
            ? `${colors.activeIconBg} ${colors.activeIconText}`
            : "text-muted-foreground/60 group-hover:text-muted-foreground"
        }`}>
          <item.icon className="h-4 w-4" />
        </div>
        <span className="flex-1 text-xs">{label}</span>
        {isActive && (
          <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${colors.activeDot}`} />
        )}
      </Link>
    )
  }

  const dropdownVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15, ease: "easeOut" as const } },
    exit: { opacity: 0, y: -8, scale: 0.95, transition: { duration: 0.1 } },
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ════════════════════════════════
          SIDEBAR
      ════════════════════════════════ */}
      <aside
        className={`fixed inset-y-0 ${isRTL ? "right-0" : "left-0"} z-50 flex w-[264px] flex-col bg-sidebar border-${isRTL ? "l" : "r"} border-sidebar-border shadow-xl shadow-foreground/5 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : (isRTL ? "translate-x-full" : "-translate-x-full") + " md:translate-x-0"
        }`}
      >
        {/* Top accent gradient line */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] rounded-t-sm"
          style={{ background: "linear-gradient(to right, var(--theme-grad-from), var(--theme-grad-via), var(--theme-grad-to))" }}
        />

        {/* Brand header */}
        <div className="flex items-center justify-between px-4 border-b border-sidebar-border safe-area-top" style={{ minHeight: "58px", paddingTop: "2px" }}>
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl shadow-md"
              style={{ background: "linear-gradient(135deg, var(--theme-grad-from), var(--theme-grad-to))" }}
            >
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-sidebar-foreground leading-tight truncate">{schoolName}</p>
              <p className="text-[10px] text-primary font-semibold mt-0.5">{t.brand.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors flex-shrink-0"
            aria-label="close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          <nav className="flex flex-col gap-0.5">
            <NavLink item={overviewItem} />
          </nav>

          <div>
            <p className="mb-2 px-3 text-[9px] font-bold text-sidebar-foreground/25 uppercase tracking-[0.14em]">
              {t.nav.academic}
            </p>
            <nav className="flex flex-col gap-0.5">
              {academicItems.map((item) => <NavLink key={item.href} item={item} />)}
            </nav>
          </div>

          <div>
            <p className="mb-2 px-3 text-[9px] font-bold text-sidebar-foreground/25 uppercase tracking-[0.14em]">
              {t.nav.educational}
            </p>
            <nav className="flex flex-col gap-0.5">
              {educationalItems.map((item) => <NavLink key={item.href} item={item} />)}
            </nav>
          </div>
        </div>

        {/* Bottom user card + logout */}
        <div className="border-t border-sidebar-border p-3 space-y-2 safe-area-bottom">
          <div className="flex items-center gap-3 rounded-xl p-2.5 bg-sidebar-accent/50 border border-sidebar-border">
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white font-bold text-xs shadow-sm"
              style={{ background: "linear-gradient(135deg, var(--theme-grad-from), var(--theme-grad-to))" }}
            >
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-sidebar-foreground truncate leading-tight">{user.name}</p>
              <p className="text-[10px] text-primary font-semibold">{t.user.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold text-sidebar-foreground/50 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 border border-sidebar-border hover:border-rose-200 dark:hover:border-rose-800 transition-all duration-200"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t.user.logout}
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════
          MAIN CONTENT AREA
      ════════════════════════════════ */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* ── Premium Header ── */}
        <header className="sticky top-0 z-30 safe-area-top">
          {/* Top accent bar */}
          <div
            className="h-[2px] w-full"
            style={{ background: "linear-gradient(to right, var(--theme-grad-from), var(--theme-grad-via), var(--theme-grad-to))" }}
          />

          <div className="flex items-center justify-between bg-card/95 backdrop-blur-md border-b border-border/60 px-4 py-0 sm:px-5 shadow-sm shadow-foreground/[0.04]" style={{ minHeight: "56px" }}>

            {/* Left side — hamburger + breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 touch-target-sm"
                aria-label="menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Page breadcrumb */}
              <div className="min-w-0 flex items-center gap-2">
                <div
                  className="hidden sm:flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ background: "linear-gradient(135deg, var(--theme-grad-from)/15, var(--theme-grad-to)/15)" }}
                >
                  {currentPage ? (
                    <currentPage.icon className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <GraduationCap className="h-3.5 w-3.5 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-foreground truncate leading-tight">{pageLabel}</h2>
                  <p className="text-[10px] text-muted-foreground truncate hidden sm:block">{pageDescription}</p>
                </div>
              </div>
            </div>

            {/* Right side — controls */}
            <div className="flex items-center gap-1.5">

              {/* ── Language Switcher ── */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => { setLangMenuOpen(!langMenuOpen); setThemeMenuOpen(false); setNotificationsOpen(false); setUserMenuOpen(false) }}
                  className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border/50 transition-all duration-200 text-xs font-semibold"
                  aria-label="language"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{language === "ar" ? "ع" : "EN"}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </button>

                <AnimatePresence>
                  {langMenuOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden" animate="visible" exit="exit"
                      className={`absolute ${isRTL ? "left-0" : "right-0"} top-full mt-2 w-44 rounded-2xl bg-popover border border-border shadow-xl shadow-foreground/10 p-1.5 z-50`}
                    >
                      <p className="px-2.5 py-1.5 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider">{t.language.label}</p>
                      {[
                        { id: "ar" as const, label: t.language.arabic,  flag: "🇵🇸" },
                        { id: "en" as const, label: t.language.english, flag: "🇺🇸" },
                      ].map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => { setLanguage(lang.id); setLangMenuOpen(false) }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                            language === lang.id
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-accent"
                          }`}
                        >
                          <span className="text-base">{lang.flag}</span>
                          <span className="flex-1 text-start">{lang.label}</span>
                          {language === lang.id && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Theme Switcher ── */}
              <div className="relative" ref={themeRef}>
                <button
                  onClick={() => { setThemeMenuOpen(!themeMenuOpen); setLangMenuOpen(false); setNotificationsOpen(false); setUserMenuOpen(false) }}
                  className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border/50 transition-all duration-200"
                  aria-label="theme"
                >
                  {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </button>

                <AnimatePresence>
                  {themeMenuOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden" animate="visible" exit="exit"
                      className={`absolute ${isRTL ? "left-0" : "right-0"} top-full mt-2 w-56 rounded-2xl bg-popover border border-border shadow-xl shadow-foreground/10 p-2 z-50`}
                    >
                      {/* Mode row */}
                      <p className="px-2 py-1 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider">{t.theme.label}</p>
                      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl mb-3">
                        {([
                          { id: "light" as DarkMode, icon: Sun,     label: t.theme.light  },
                          { id: "dark"  as DarkMode, icon: Moon,    label: t.theme.dark   },
                          { id: "system"as DarkMode, icon: Monitor, label: t.theme.system },
                        ] as const).map(({ id, icon: Icon, label }) => (
                          <button
                            key={id}
                            onClick={() => setMode(id)}
                            className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-lg text-[9px] font-bold transition-all duration-150 ${
                              config.mode === id
                                ? "bg-background text-primary shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* Color swatches */}
                      <p className="px-2 py-1 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                        <Palette className="h-2.5 w-2.5 inline-block me-1" />
                        {isRTL ? "لون التطبيق" : "App Color"}
                      </p>
                      <div className="grid grid-cols-5 gap-1.5 px-1 pb-1">
                        {colorThemes.map(({ id, swatch }) => (
                          <button
                            key={id}
                            onClick={() => setColor(id)}
                            title={t.theme[id]}
                            className={`relative h-7 w-full rounded-lg ${swatch} transition-all duration-150 hover:scale-110 ${
                              config.color === id
                                ? "ring-2 ring-offset-2 ring-foreground/30 scale-110"
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
                      <div className="flex justify-between px-1 mt-0.5">
                        {colorThemes.map(({ id }) => (
                          <span key={id} className="text-[8px] text-muted-foreground/50 text-center flex-1 font-medium">
                            {t.theme[id]}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Notifications ── */}
              <div className="relative">
                <button
                  onClick={() => { setNotificationsOpen(!notificationsOpen); setThemeMenuOpen(false); setLangMenuOpen(false); setUserMenuOpen(false) }}
                  className="relative flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border/50 transition-all duration-200"
                  aria-label="notifications"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
                </button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden" animate="visible" exit="exit"
                        className={`absolute ${isRTL ? "left-0" : "right-0"} top-full mt-2 w-80 rounded-2xl bg-popover border border-border shadow-xl shadow-foreground/10 p-2 z-50`}
                      >
                        <div className="flex items-center justify-between px-2.5 pb-2 border-b border-border mb-1">
                          <span className="text-xs font-bold text-foreground">{t.header.notifications}</span>
                          <span className="text-[10px] text-primary font-semibold cursor-pointer hover:opacity-80 transition-opacity">
                            {t.header.markAllRead}
                          </span>
                        </div>
                        <div className="space-y-0.5 max-h-60 overflow-y-auto">
                          {[
                            { title: t.header.notif1, time: t.header.notif1Time },
                            { title: t.header.notif2, time: t.header.notif2Time },
                          ].map((n, i) => (
                            <div key={i} className="flex items-start gap-3 px-2.5 py-2.5 hover:bg-accent rounded-xl transition-colors cursor-pointer group">
                              <div className="h-2 w-2 mt-1.5 flex-shrink-0 rounded-full bg-primary" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-foreground font-semibold leading-snug">{n.title}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* ── User Menu ── */}
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => { setUserMenuOpen(!userMenuOpen); setNotificationsOpen(false); setThemeMenuOpen(false); setLangMenuOpen(false) }}
                  className="flex items-center gap-2 h-8 ps-1 pe-2 rounded-xl hover:bg-accent border border-transparent hover:border-border/50 transition-all duration-200"
                >
                  <div
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-white font-bold text-[9px] shadow-sm"
                    style={{ background: "linear-gradient(135deg, var(--theme-grad-from), var(--theme-grad-to))" }}
                  >
                    {userInitials}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-foreground truncate max-w-[80px]">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground/50" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden" animate="visible" exit="exit"
                      className={`absolute ${isRTL ? "left-0" : "right-0"} top-full mt-2 w-52 rounded-2xl bg-popover border border-border shadow-xl shadow-foreground/10 p-1.5 z-50`}
                    >
                      {/* User info */}
                      <div className="px-3 py-2.5 border-b border-border mb-1">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white font-bold text-xs shadow-sm"
                            style={{ background: "linear-gradient(135deg, var(--theme-grad-from), var(--theme-grad-to))" }}
                          >
                            {userInitials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                            <p className="text-[10px] text-primary font-semibold">{t.user.role}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground/70 hover:bg-accent hover:text-foreground transition-all"
                      >
                        <User className="h-3.5 w-3.5" />
                        {isRTL ? "الملف الشخصي" : "Profile"}
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground/70 hover:bg-accent hover:text-foreground transition-all"
                      >
                        <Settings className="h-3.5 w-3.5" />
                        {isRTL ? "الإعدادات" : "Settings"}
                      </Link>

                      <div className="border-t border-border my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        {t.user.logout}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
