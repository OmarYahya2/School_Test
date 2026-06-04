"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, Palette, Bell, Shield, Globe, Server, Sun, Moon, Monitor, ChevronRight, Save, Check, School, Mail, Clock, Eye, EyeOff, Key, Smartphone, AlertTriangle, Database, HardDrive, Info, Zap, CheckCircle, BookOpen, Users, Activity, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/lib/i18n/context"
import { useAppTheme, type ColorTheme, type DarkMode } from "@/lib/theme-context"
import { useAdminAuthUser, useAdminAnalytics } from "@/lib/hooks/use-admin-data"
import { useSchoolName } from "@/lib/school-settings-context"
import { toast } from "sonner"

interface AuthUser { id: string; name: string; email: string; createdAt?: string }

type SettingsTab = "general" | "appearance" | "notifications" | "security" | "language" | "system"

interface TabConfig {
  id: SettingsTab
  labelAr: string
  labelEn: string
  descAr: string
  descEn: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
}

const TABS: TabConfig[] = [
  { id: "general",       labelAr: "عام",             labelEn: "General",           descAr: "المعلومات الأساسية",    descEn: "Basic information",        icon: Settings,   iconBg: "bg-violet-100 dark:bg-violet-900/40", iconColor: "text-violet-600 dark:text-violet-400" },
  { id: "appearance",    labelAr: "المظهر",           labelEn: "Appearance",         descAr: "الثيم والألوان",         descEn: "Theme & colors",           icon: Palette,    iconBg: "bg-sky-100 dark:bg-sky-900/40",     iconColor: "text-sky-600 dark:text-sky-400"     },
  { id: "notifications", labelAr: "الإشعارات",        labelEn: "Notifications",      descAr: "إعدادات التنبيهات",     descEn: "Alert settings",           icon: Bell,       iconBg: "bg-amber-100 dark:bg-amber-900/40", iconColor: "text-amber-600 dark:text-amber-400" },
  { id: "security",      labelAr: "الأمان",           labelEn: "Security",           descAr: "الحماية والمصادقة",     descEn: "Protection & auth",        icon: Shield,     iconBg: "bg-emerald-100 dark:bg-emerald-900/40", iconColor: "text-emerald-600 dark:text-emerald-400" },
  { id: "language",      labelAr: "اللغة والمنطقة",   labelEn: "Language & Region",  descAr: "تفضيلات اللغة",         descEn: "Language preferences",     icon: Globe,      iconBg: "bg-blue-100 dark:bg-blue-900/40",   iconColor: "text-blue-600 dark:text-blue-400"   },
  { id: "system",        labelAr: "النظام",           labelEn: "System",             descAr: "معلومات النظام",        descEn: "System info",              icon: Server,     iconBg: "bg-rose-100 dark:bg-rose-900/40",   iconColor: "text-rose-600 dark:text-rose-400"   },
]

const COLOR_OPTIONS: { id: ColorTheme; labelAr: string; labelEn: string; swatch: string; ring: string }[] = [
  { id: "violet",  labelAr: "بنفسجي", labelEn: "Violet",  swatch: "bg-violet-500",  ring: "ring-violet-400"  },
  { id: "ocean",   labelAr: "أزرق",   labelEn: "Ocean",   swatch: "bg-blue-600",    ring: "ring-blue-400"    },
  { id: "emerald", labelAr: "زمردي",  labelEn: "Emerald", swatch: "bg-emerald-500", ring: "ring-emerald-400" },
  { id: "rose",    labelAr: "وردي",   labelEn: "Rose",    swatch: "bg-rose-500",    ring: "ring-rose-400"    },
  { id: "amber",   labelAr: "عنبري",  labelEn: "Amber",   swatch: "bg-amber-500",   ring: "ring-amber-400"   },
]

const contentAnim = {
  hidden: { opacity: 0, x: 10 },
  show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 100, damping: 18 } },
  exit:  { opacity: 0, x: -6, transition: { duration: 0.1 } },
}

function ToggleRow({ label, desc, icon: Icon, iconBg, iconColor, value, onChange }: {
  label: string; desc: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string; iconColor: string
  value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
        </div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  )
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-border/40 my-1" />
}

export default function SettingsPage() {
  const { isRTL, language, setLanguage } = useLanguage()
  const { config, setColor, setMode } = useAppTheme()

  const { schoolName, setSchoolName: setGlobalSchoolName } = useSchoolName()
  const [activeTab, setActiveTab] = useState<SettingsTab>("general")
  const [saved, setSaved] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { data: authUser } = useAdminAuthUser()
  const { data: analytics } = useAdminAnalytics()

  useEffect(() => {
    if (authUser?.email) setContactEmail(authUser.email)
  }, [authUser])

  // General — draft for the input; on Save it is pushed to global context
  const [schoolNameDraft, setSchoolNameDraft] = useState(schoolName)
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState(() => {
    if (typeof window === "undefined") return ""
    return localStorage.getItem("settings_contactPhone") ?? ""
  })
  const [academicYear, setAcademicYear] = useState(() => {
    if (typeof window === "undefined") return "2024-2025"
    return localStorage.getItem("settings_academicYear") ?? "2024-2025"
  })

  // Notifications
  const [emailNotifs,          setEmailNotifs]          = useState(true)
  const [pushNotifs,           setPushNotifs]           = useState(true)
  const [attendanceAlerts,     setAttendanceAlerts]     = useState(true)
  const [studentActivity,      setStudentActivity]      = useState(false)
  const [systemAnnouncements,  setSystemAnnouncements]  = useState(true)
  const [gradeAlerts,          setGradeAlerts]          = useState(false)

  // Security
  const [twoFA,            setTwoFA]            = useState(false)
  const [loginAlerts,      setLoginAlerts]      = useState(true)
  const [securityAlerts,   setSecurityAlerts]   = useState(true)
  const [deviceMgmt,       setDeviceMgmt]       = useState(true)
  const [currentPass,      setCurrentPass]      = useState("")
  const [newPass,          setNewPass]          = useState("")
  const [confirmPass,      setConfirmPass]      = useState("")

  // Appearance extras
  const [compactMode,   setCompactMode]   = useState(false)
  const [animations,    setAnimations]    = useState(true)

  function handleSave() {
    setGlobalSchoolName(schoolNameDraft)
    if (typeof window !== "undefined") {
      localStorage.setItem("settings_academicYear", academicYear)
      localStorage.setItem("settings_contactPhone", contactPhone)
    }
    setSaved(true)
    toast.success(isRTL ? "تم حفظ الإعدادات بنجاح" : "Settings saved successfully", {
      description: isRTL ? "سيتم تطبيق التغييرات فوراً" : "Changes applied immediately",
    })
    setTimeout(() => setSaved(false), 2500)
  }

  const activeCfg = TABS.find(t => t.id === activeTab)!

  return (
    <div className="pb-8">

      {/* PAGE HEADER */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{isRTL ? "الإعدادات" : "Settings"}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isRTL ? "تخصيص وإدارة إعدادات النظام" : "Customize and manage system settings"}
            </p>
          </div>
          <Button
            onClick={handleSave}
            size="sm"
            className="gap-2 rounded-xl shadow-sm text-white"
            style={{ background: "linear-gradient(135deg, var(--theme-grad-from), var(--theme-grad-to))" }}
          >
            {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? (isRTL ? "تم الحفظ!" : "Saved!") : (isRTL ? "حفظ التغييرات" : "Save Changes")}
          </Button>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-5">

        {/* SIDEBAR */}
        <motion.div initial={{ opacity: 0, x: isRTL ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:w-60 flex-shrink-0">

          {/* Mobile: horizontal scroll */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5 flex-shrink-0" />
                {isRTL ? tab.labelAr : tab.labelEn}
              </button>
            ))}
          </div>

          {/* Desktop: vertical nav */}
          <Card className="hidden lg:block border-border/50 shadow-sm">
            <CardContent className="p-2">
              <nav className="space-y-0.5">
                {TABS.map(tab => {
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                        isActive ? "bg-primary/8 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isActive ? tab.iconBg : "bg-muted group-hover:bg-accent"}`}>
                        <tab.icon className={`h-3.5 w-3.5 ${isActive ? tab.iconColor : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 text-start min-w-0">
                        <p className={`leading-tight ${isActive ? "font-bold" : ""}`}>{isRTL ? tab.labelAr : tab.labelEn}</p>
                        <p className={`text-[10px] mt-0.5 ${isActive ? "text-primary/70" : "text-muted-foreground/70"}`}>{isRTL ? tab.descAr : tab.descEn}</p>
                      </div>
                      {isActive && <ChevronRight className={`h-3.5 w-3.5 flex-shrink-0 ${isRTL ? "rotate-180" : ""}`} />}
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </motion.div>

        {/* CONTENT */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} variants={contentAnim} initial="hidden" animate="show" exit="exit">

              {/* ── GENERAL ── */}
              {activeTab === "general" && (
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-4 pt-5 px-5">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${activeCfg.iconBg}`}>
                        <Settings className={`h-4 w-4 ${activeCfg.iconColor}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold">{isRTL ? "الإعدادات العامة" : "General Settings"}</CardTitle>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{isRTL ? "معلومات المدرسة والنظام الأساسية" : "Basic school and system information"}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 space-y-5">
                    <div>
                      <SectionHeader title={isRTL ? "معلومات المدرسة" : "School Information"} desc={isRTL ? "البيانات الأساسية للمؤسسة التعليمية" : "Basic educational institution data"} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2 space-y-1.5">
                          <Label className="text-xs font-semibold text-muted-foreground">{isRTL ? "اسم المدرسة" : "School Name"}</Label>
                          <div className="relative">
                            <School className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input value={schoolNameDraft} onChange={e => setSchoolNameDraft(e.target.value)} className="rounded-xl border-border/60 focus:border-primary/50 ps-9" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-muted-foreground">{isRTL ? "السنة الدراسية" : "Academic Year"}</Label>
                          <Input value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="rounded-xl border-border/60 focus:border-primary/50" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-muted-foreground">{isRTL ? "المنطقة الزمنية" : "Timezone"}</Label>
                          <Input value="Asia/Jerusalem (GMT+3)" readOnly className="rounded-xl border-border/60 bg-muted/40 text-muted-foreground cursor-not-allowed" />
                        </div>
                      </div>
                    </div>

                    <Divider />

                    <div>
                      <SectionHeader title={isRTL ? "معلومات الاتصال" : "Contact Information"} desc={isRTL ? "بيانات التواصل الرسمية" : "Official contact details"} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-muted-foreground">{isRTL ? "البريد الإلكتروني" : "Email"}</Label>
                          <div className="relative">
                            <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="rounded-xl border-border/60 focus:border-primary/50 ps-9" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-muted-foreground">{isRTL ? "رقم الهاتف" : "Phone Number"}</Label>
                          <Input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="rounded-xl border-border/60 focus:border-primary/50" />
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                          <Label className="text-xs font-semibold text-muted-foreground">{isRTL ? "عنوان المدرسة" : "Address"}</Label>
                          <div className="relative">
                            <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input defaultValue={isRTL ? "كفر عقب، القدس، فلسطين" : "Kafr Aqab, Jerusalem, Palestine"} className="rounded-xl border-border/60 focus:border-primary/50 ps-9" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ── APPEARANCE ── */}
              {activeTab === "appearance" && (
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-4 pt-5 px-5">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${activeCfg.iconBg}`}>
                        <Palette className={`h-4 w-4 ${activeCfg.iconColor}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold">{isRTL ? "إعدادات المظهر" : "Appearance Settings"}</CardTitle>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{isRTL ? "تخصيص واجهة النظام البصرية" : "Customize the visual system interface"}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 space-y-5">

                    {/* Mode */}
                    <div>
                      <SectionHeader title={isRTL ? "وضع الإضاءة" : "Display Mode"} desc={isRTL ? "اختر وضع الإضاءة المناسب لبيئة عملك" : "Choose the display mode that suits your work environment"} />
                      <div className="grid grid-cols-3 gap-3">
                        {([
                          { id: "light"  as DarkMode, icon: Sun,     labelAr: "فاتح",   labelEn: "Light",  descAr: "وضع النهار",  descEn: "Day mode"    },
                          { id: "dark"   as DarkMode, icon: Moon,    labelAr: "داكن",   labelEn: "Dark",   descAr: "وضع الليل",  descEn: "Night mode"  },
                          { id: "system" as DarkMode, icon: Monitor, labelAr: "تلقائي", labelEn: "System", descAr: "حسب الجهاز", descEn: "Device-based" },
                        ]).map(({ id, icon: Icon, labelAr, labelEn, descAr, descEn }) => (
                          <button
                            key={id}
                            onClick={() => setMode(id)}
                            className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all duration-200 ${
                              config.mode === id
                                ? "border-primary bg-primary/8 text-primary shadow-sm"
                                : "border-border/50 text-muted-foreground hover:border-border hover:bg-accent"
                            }`}
                          >
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${config.mode === id ? "bg-primary/10" : "bg-muted"}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-bold">{isRTL ? labelAr : labelEn}</p>
                              <p className="text-[10px] opacity-70 mt-0.5">{isRTL ? descAr : descEn}</p>
                            </div>
                            {config.mode === id && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Divider />

                    {/* Color Theme */}
                    <div>
                      <SectionHeader title={isRTL ? "لون التطبيق" : "App Color Theme"} desc={isRTL ? "اختر لون التطبيق المفضل" : "Choose your preferred app accent color"} />
                      <div className="grid grid-cols-5 gap-3">
                        {COLOR_OPTIONS.map(({ id, labelAr, labelEn, swatch, ring }) => (
                          <button
                            key={id}
                            onClick={() => setColor(id)}
                            className={`flex flex-col items-center gap-2.5 p-3 rounded-2xl border-2 transition-all duration-200 ${
                              config.color === id
                                ? "border-foreground/25 bg-muted/50 shadow-sm scale-105"
                                : "border-border/40 hover:border-border hover:bg-accent"
                            }`}
                          >
                            <div className={`h-8 w-8 rounded-xl ${swatch} shadow-sm ${config.color === id ? `ring-2 ring-offset-2 ring-offset-background ${ring}` : ""}`} />
                            <p className="text-[10px] font-bold text-foreground">{isRTL ? labelAr : labelEn}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <Divider />

                    {/* UI Prefs */}
                    <div>
                      <SectionHeader title={isRTL ? "تفضيلات الواجهة" : "Interface Preferences"} desc={isRTL ? "خيارات إضافية لتخصيص تجربة الاستخدام" : "Additional experience customization options"} />
                      <div className="space-y-3">
                        <ToggleRow
                          label={isRTL ? "الوضع المضغوط" : "Compact Mode"}
                          desc={isRTL ? "تقليل المسافات لعرض أكثر محتوى" : "Reduce spacing to show more content"}
                          icon={Settings}
                          iconBg="bg-blue-100 dark:bg-blue-900/40"
                          iconColor="text-blue-600 dark:text-blue-400"
                          value={compactMode}
                          onChange={setCompactMode}
                        />
                        <ToggleRow
                          label={isRTL ? "الحركات والانتقالات" : "Animations & Transitions"}
                          desc={isRTL ? "تفعيل تأثيرات الحركة في الواجهة" : "Enable motion effects in the interface"}
                          icon={Zap}
                          iconBg="bg-amber-100 dark:bg-amber-900/40"
                          iconColor="text-amber-600 dark:text-amber-400"
                          value={animations}
                          onChange={setAnimations}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeTab === "notifications" && (
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-4 pt-5 px-5">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${activeCfg.iconBg}`}>
                        <Bell className={`h-4 w-4 ${activeCfg.iconColor}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold">{isRTL ? "إعدادات الإشعارات" : "Notification Settings"}</CardTitle>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{isRTL ? "تحكم في أنواع الإشعارات التي تصلك" : "Control which notifications you receive"}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 space-y-5">
                    <div>
                      <SectionHeader title={isRTL ? "قنوات الإشعارات" : "Notification Channels"} desc={isRTL ? "اختر كيفية استلام الإشعارات" : "Choose how you receive notifications"} />
                      <div className="space-y-3">
                        <ToggleRow label={isRTL ? "إشعارات البريد الإلكتروني" : "Email Notifications"} desc={isRTL ? "استلام الإشعارات عبر البريد" : "Receive notifications via email"} icon={Mail} iconBg="bg-sky-100 dark:bg-sky-900/40" iconColor="text-sky-600 dark:text-sky-400" value={emailNotifs} onChange={setEmailNotifs} />
                        <ToggleRow label={isRTL ? "الإشعارات الفورية" : "Push Notifications"} desc={isRTL ? "إشعارات فورية على المتصفح" : "Instant browser notifications"} icon={Bell} iconBg="bg-violet-100 dark:bg-violet-900/40" iconColor="text-violet-600 dark:text-violet-400" value={pushNotifs} onChange={setPushNotifs} />
                      </div>
                    </div>

                    <Divider />

                    <div>
                      <SectionHeader title={isRTL ? "أنواع الإشعارات" : "Notification Types"} desc={isRTL ? "خصص أنواع الإشعارات لكل فئة" : "Customize notification types per category"} />
                      <div className="space-y-3">
                        <ToggleRow label={isRTL ? "تنبيهات الحضور" : "Attendance Alerts"} desc={isRTL ? "تنبيه عند غياب الطلاب" : "Alert when students are absent"} icon={Users} iconBg="bg-rose-100 dark:bg-rose-900/40" iconColor="text-rose-600 dark:text-rose-400" value={attendanceAlerts} onChange={setAttendanceAlerts} />
                        <ToggleRow label={isRTL ? "نشاط الطلاب" : "Student Activity"} desc={isRTL ? "تحديثات عن أنشطة الطلاب" : "Updates on student activities"} icon={BookOpen} iconBg="bg-emerald-100 dark:bg-emerald-900/40" iconColor="text-emerald-600 dark:text-emerald-400" value={studentActivity} onChange={setStudentActivity} />
                        <ToggleRow label={isRTL ? "إعلانات النظام" : "System Announcements"} desc={isRTL ? "التحديثات والإعلانات المهمة" : "Important updates and announcements"} icon={Info} iconBg="bg-blue-100 dark:bg-blue-900/40" iconColor="text-blue-600 dark:text-blue-400" value={systemAnnouncements} onChange={setSystemAnnouncements} />
                        <ToggleRow label={isRTL ? "تنبيهات الدرجات" : "Grade Alerts"} desc={isRTL ? "تنبيه عند تسجيل درجات جديدة" : "Alert when new grades are recorded"} icon={Activity} iconBg="bg-amber-100 dark:bg-amber-900/40" iconColor="text-amber-600 dark:text-amber-400" value={gradeAlerts} onChange={setGradeAlerts} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ── SECURITY ── */}
              {activeTab === "security" && (
                <div className="space-y-4">
                  <Card className="border-border/50 shadow-sm">
                    <CardHeader className="pb-4 pt-5 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${activeCfg.iconBg}`}>
                          <Shield className={`h-4 w-4 ${activeCfg.iconColor}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold">{isRTL ? "إعدادات الأمان" : "Security Settings"}</CardTitle>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{isRTL ? "حماية حسابك والنظام" : "Protect your account and system"}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 space-y-5">
                      <div>
                        <SectionHeader title={isRTL ? "تغيير كلمة المرور" : "Change Password"} desc={isRTL ? "حافظ على أمان حسابك بكلمة مرور قوية" : "Keep your account secure with a strong password"} />
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">{isRTL ? "كلمة المرور الحالية" : "Current Password"}</Label>
                            <div className="relative">
                              <Input type={showPass ? "text" : "password"} value={currentPass} onChange={e => setCurrentPass(e.target.value)} className="rounded-xl border-border/60 focus:border-primary/50 pe-10" placeholder="••••••••" />
                              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 end-3 flex items-center text-muted-foreground hover:text-foreground transition-colors">
                                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-muted-foreground">{isRTL ? "كلمة المرور الجديدة" : "New Password"}</Label>
                              <Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="rounded-xl border-border/60 focus:border-primary/50" placeholder="••••••••" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-muted-foreground">{isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}</Label>
                              <Input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="rounded-xl border-border/60 focus:border-primary/50" placeholder="••••••••" />
                            </div>
                          </div>
                          <Button size="sm" className="gap-2 rounded-xl text-white" style={{ background: "linear-gradient(135deg, var(--theme-grad-from), var(--theme-grad-to))" }}>
                            <Key className="h-3.5 w-3.5" />
                            {isRTL ? "تحديث كلمة المرور" : "Update Password"}
                          </Button>
                        </div>
                      </div>

                      <Divider />

                      <div>
                        <SectionHeader title={isRTL ? "خيارات الحماية" : "Protection Options"} desc={isRTL ? "طبقات أمان إضافية لحسابك" : "Additional security layers for your account"} />
                        <div className="space-y-3">
                          <ToggleRow label={isRTL ? "التحقق بخطوتين (2FA)" : "Two-Factor Authentication"} desc={isRTL ? "حماية إضافية عند تسجيل الدخول" : "Extra protection when logging in"} icon={Smartphone} iconBg="bg-emerald-100 dark:bg-emerald-900/40" iconColor="text-emerald-600 dark:text-emerald-400" value={twoFA} onChange={setTwoFA} />
                          <ToggleRow label={isRTL ? "تنبيهات الدخول" : "Login Notifications"} desc={isRTL ? "إشعار عند كل تسجيل دخول" : "Notify on every login event"} icon={Bell} iconBg="bg-blue-100 dark:bg-blue-900/40" iconColor="text-blue-600 dark:text-blue-400" value={loginAlerts} onChange={setLoginAlerts} />
                          <ToggleRow label={isRTL ? "تنبيهات الأمان" : "Security Alerts"} desc={isRTL ? "تنبيه عند أي نشاط مشبوه" : "Alert on any suspicious activity"} icon={AlertTriangle} iconBg="bg-amber-100 dark:bg-amber-900/40" iconColor="text-amber-600 dark:text-amber-400" value={securityAlerts} onChange={setSecurityAlerts} />
                          <ToggleRow label={isRTL ? "إدارة الأجهزة" : "Device Management"} desc={isRTL ? "التحكم بالأجهزة المتصلة" : "Control connected devices"} icon={Monitor} iconBg="bg-violet-100 dark:bg-violet-900/40" iconColor="text-violet-600 dark:text-violet-400" value={deviceMgmt} onChange={setDeviceMgmt} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sessions */}
                  <Card className="border-border/50 shadow-sm">
                    <CardHeader className="pb-3 pt-4 px-5">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                          <Monitor className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                        </div>
                        {isRTL ? "الجلسات النشطة" : "Active Sessions"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 space-y-2">
                      <div className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-muted/20">
                        <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/40">
                          <Monitor className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground">
                            {isRTL ? "الجلسة الحالية نشطة" : "Current session active"}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {authUser?.email ?? "—"} · {isRTL ? "الآن" : "Now"}
                          </p>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                          {isRTL ? "الحالية" : "Current"}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground px-1">
                        {isRTL ? "* تتبع الجلسات المتعددة يتطلب تفعيل واجهة برمجية إضافية في الخادم." : "* Multi-session tracking requires additional server-side API support."}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ── LANGUAGE ── */}
              {activeTab === "language" && (
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-4 pt-5 px-5">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${activeCfg.iconBg}`}>
                        <Globe className={`h-4 w-4 ${activeCfg.iconColor}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold">{isRTL ? "اللغة والمنطقة" : "Language & Region"}</CardTitle>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{isRTL ? "تفضيلات اللغة والتنسيق الإقليمي" : "Language and regional formatting preferences"}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 space-y-5">
                    <div>
                      <SectionHeader title={isRTL ? "لغة واجهة المستخدم" : "Interface Language"} desc={isRTL ? "اختر اللغة المعروضة في النظام" : "Choose the display language for the system"} />
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: "ar" as const, flag: "🇵🇸", native: "العربية", desc: "Arabic (RTL)" },
                          { id: "en" as const, flag: "🇺🇸", native: "English", desc: "English (LTR)" },
                        ].map(({ id, flag, native, desc }) => (
                          <button
                            key={id}
                            onClick={() => setLanguage(id)}
                            className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 ${
                              language === id
                                ? "border-primary bg-primary/8 text-primary shadow-sm"
                                : "border-border/50 text-muted-foreground hover:border-border hover:bg-accent"
                            }`}
                          >
                            <span className="text-2xl">{flag}</span>
                            <div className="text-start">
                              <p className="text-sm font-bold">{native}</p>
                              <p className="text-[10px] opacity-70">{desc}</p>
                            </div>
                            {language === id && <CheckCircle className="h-4 w-4 ms-auto" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Divider />

                    {/* Direction Preview */}
                    <div>
                      <SectionHeader title={isRTL ? "معاينة اتجاه النص" : "Text Direction Preview"} desc={isRTL ? "الاتجاه الحالي المطبّق على النظام" : "Current text direction applied to the system"} />
                      <div className="p-4 rounded-2xl border border-border/50 bg-muted/30 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${language === "ar" ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground border border-border/50"}`}>
                            {language === "ar" ? "← RTL" : "LTR →"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{language === "ar" ? "يمين إلى يسار" : "Left to Right"}</span>
                        </div>
                        <p dir={language === "ar" ? "rtl" : "ltr"} className="text-sm text-foreground bg-card rounded-xl p-3 border border-border/40 font-medium leading-relaxed">
                          {language === "ar"
                            ? `مرحباً بكم في نظام إدارة ${schoolName}.`
                            : `Welcome to the ${schoolName} Management System.`}
                        </p>
                      </div>
                    </div>

                    <Divider />

                    {/* Date & Time */}
                    <div>
                      <SectionHeader title={isRTL ? "تنسيق التاريخ والوقت" : "Date & Time Format"} desc={isRTL ? "معاينة التنسيق الحالي للتاريخ والوقت" : "Preview the current date and time format"} />
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          {
                            label: isRTL ? "التاريخ الحالي" : "Current Date",
                            value: new Date().toLocaleDateString(language === "ar" ? "ar-PS" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
                            icon: Clock,
                          },
                          {
                            label: isRTL ? "الوقت الحالي" : "Current Time",
                            value: new Date().toLocaleTimeString(language === "ar" ? "ar-PS" : "en-US", { hour: "2-digit", minute: "2-digit" }),
                            icon: Activity,
                          },
                        ].map(({ label, value, icon: Icon }) => (
                          <div key={label} className="p-4 rounded-xl bg-muted/30 border border-border/40">
                            <Icon className="h-4 w-4 text-muted-foreground mb-2" />
                            <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
                            <p className="text-sm font-bold text-foreground mt-1">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ── SYSTEM ── */}
              {activeTab === "system" && (
                <div className="space-y-4">
                  <Card className="border-border/50 shadow-sm">
                    <CardHeader className="pb-4 pt-5 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${activeCfg.iconBg}`}>
                          <Server className={`h-4 w-4 ${activeCfg.iconColor}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold">{isRTL ? "معلومات النظام" : "System Information"}</CardTitle>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{isRTL ? "حالة النظام والمكونات" : "System and component status"}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 space-y-5">

                      {/* Version Info */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { label: isRTL ? "إجمالي الطلاب" : "Total Students",   value: analytics?.totals.students ?? "—",   icon: Users,       color: "text-sky-600 dark:text-sky-400",            bg: "bg-sky-50 dark:bg-sky-950/30"                },
                          { label: isRTL ? "إجمالي المعلمين" : "Total Teachers",  value: analytics?.totals.teachers ?? "—",   icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400",   bg: "bg-emerald-50 dark:bg-emerald-950/30"        },
                          { label: isRTL ? "إجمالي الصفوف" : "Total Classes",    value: analytics?.totals.classes ?? "—",    icon: BookOpen,    color: "text-primary",                              bg: "bg-primary/8"                               },
                        ].map(({ label, value, icon: Icon, color, bg }) => (
                          <div key={label} className={`p-4 rounded-xl ${bg} border border-border/30`}>
                            <Icon className={`h-4 w-4 ${color} mb-2`} />
                            <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
                            <p className="text-sm font-bold text-foreground mt-1">{value}</p>
                          </div>
                        ))}
                      </div>

                      <Divider />

                      {/* Storage */}
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-semibold text-foreground">{isRTL ? "سجلات الدرجات" : "Grade Records"}</span>
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">{analytics?.grades.totalRecords ?? 0} {isRTL ? "سجل" : "records"}</span>
                        </div>
                        <Progress value={analytics?.grades.passRatePct ?? 0} className="h-2.5 rounded-full" />
                        <p className="text-[10px] text-muted-foreground mt-1.5">
                          {isRTL
                            ? `نسبة النجاح: ${analytics?.grades.passRatePct != null ? `${analytics.grades.passRatePct}%` : "—"}`
                            : `Pass rate: ${analytics?.grades.passRatePct != null ? `${analytics.grades.passRatePct}%` : "—"}`}
                        </p>
                      </div>

                      <Divider />

                      {/* Health */}
                      <div>
                        <p className="text-xs font-bold text-muted-foreground mb-3">{isRTL ? "صحة مكونات النظام" : "System Component Health"}</p>
                        <div className="space-y-2.5">
                          {[
                            { label: isRTL ? "قاعدة البيانات" : "Database",       status: analytics ? (isRTL ? "متصل — يعمل" : "Connected — operational") : (isRTL ? "جارٍ التحقق..." : "Checking..."), health: analytics ? 100 : 0, icon: Database, color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
                            { label: isRTL ? "خادم API" : "API Server",           status: analytics ? (isRTL ? "متصل — يعمل" : "Connected — operational") : (isRTL ? "جارٍ التحقق..." : "Checking..."), health: analytics ? 100 : 0, icon: Zap,      color: "text-violet-600 dark:text-violet-400", dot: "bg-violet-500"  },
                            { label: isRTL ? "سجلات الدرجات" : "Grade Records",   status: `${analytics?.grades.totalRecords ?? 0} ${isRTL ? "سجل" : "records"}`, health: Math.min((analytics?.grades.totalRecords ?? 0), 100), icon: HardDrive, color: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
                            { label: isRTL ? "نسبة الحضور" : "Attendance Rate",   status: analytics?.attendance.ratePct != null ? `${analytics.attendance.ratePct}%` : (isRTL ? "لا توجد بيانات" : "No data"), health: analytics?.attendance.ratePct ?? 0, icon: Activity, color: "text-sky-600 dark:text-sky-400", dot: "bg-sky-500" },
                          ].map(({ label, status, health, icon: Icon, color, dot }) => (
                            <div key={label} className="flex items-center gap-3 p-3.5 rounded-xl border border-border/40 bg-muted/20">
                              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-muted flex-shrink-0">
                                <Icon className={`h-4 w-4 ${color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1.5">
                                  <p className="text-xs font-semibold text-foreground">{label}</p>
                                  <span className="text-[10px] text-muted-foreground font-medium">{health}%</span>
                                </div>
                                <Progress value={health} className="h-1.5 rounded-full" />
                                <p className="text-[10px] text-muted-foreground mt-1">{status}</p>
                              </div>
                              <span className={`h-2 w-2 rounded-full flex-shrink-0 ${dot} ${health > 90 ? "animate-pulse" : ""}`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Backup */}
                  <Card className="border-border/50 shadow-sm">
                    <CardHeader className="pb-3 pt-4 px-5">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                          <Database className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        {isRTL ? "النسخ الاحتياطي والاسترداد" : "Backup & Recovery"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 space-y-3">
                      <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
                        <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                            {isRTL ? "النسخ الاحتياطي — ميزة مخططة" : "Backup — Planned Feature"}
                          </p>
                          <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                            {isRTL ? "واجهة برمجة النسخ الاحتياطي التلقائي لم تُفعّل بعد في الخادم." : "Automated backup API is not yet enabled on the server."}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: isRTL ? "إجمالي الطلاب" : "Total Students", value: analytics?.totals.students ?? "—" },
                          { label: isRTL ? "سجلات الدرجات" : "Grade Records",  value: analytics?.grades.totalRecords ?? "—" },
                          { label: isRTL ? "نسبة الحضور" : "Attendance Rate",  value: analytics?.attendance.ratePct != null ? `${analytics.attendance.ratePct}%` : "—" },
                        ].map(({ label, value }) => (
                          <div key={label} className="p-3 rounded-xl bg-muted/30 border border-border/40 text-center">
                            <p className="text-sm font-bold text-foreground">{value}</p>
                            <p className="text-[9px] text-muted-foreground mt-1">{label}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
