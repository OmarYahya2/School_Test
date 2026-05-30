"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  User, Mail, MapPin, Shield, Key, Smartphone,
  Bell, Activity, Users, UserCheck, BookOpen,
  BarChart3, TrendingUp, CheckCircle, Award,
  Edit, Camera, Lock, Monitor, AlertTriangle,
  School, Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { useLanguage } from "@/lib/i18n/context"
import { useSchoolName } from "@/lib/school-settings-context"
import { client } from "@/lib/api/client"
import { useAdminAuthUser, useAdminAnalytics, useAdminStudents } from "@/lib/hooks/use-admin-data"
import { SkeletonProfile } from "@/components/skeletons"

interface AuthUser { id: string; name: string; email: string; role?: string; createdAt?: string }

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } } }

export default function ProfilePage() {
  const { isRTL, language } = useLanguage()
  const { schoolName } = useSchoolName()
  const { data: user, isLoading: userLoading } = useAdminAuthUser()
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics()
  const { data: allStudents = [] } = useAdminStudents()
  const loading = userLoading || analyticsLoading

  const recentStudents = useMemo(() => {
    return [...allStudents]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [allStudents])

  const [twoFA, setTwoFA] = useState(false)
  const [loginAlerts, setLoginAlerts] = useState(true)
  const [securityAlerts, setSecurityAlerts] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [saving, setSaving] = useState(false)

  function openEdit() {
    setEditName(user?.name ?? "")
    setEditEmail(user?.email ?? "")
    setEditMode(true)
  }

  function cancelEdit() {
    setEditMode(false)
    setEditName("")
    setEditEmail("")
  }

  async function saveProfile() {
    if (!editName.trim()) {
      toast.error(isRTL ? "الاسم لا يمكن أن يكون فارغاً" : "Name cannot be empty")
      return
    }
    setSaving(true)
    try {
      await client.put("/auth/me", { name: editName.trim(), email: editEmail.trim() })
      setEditMode(false)
      toast.success(isRTL ? "تم تحديث الملف الشخصي" : "Profile updated successfully")
    } catch {
      toast.error(isRTL ? "فشل التحديث. حاول مرة أخرى" : "Update failed. Please try again")
    } finally {
      setSaving(false)
    }
  }

  const initials = user?.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() ?? "AD"

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(language === "ar" ? "ar-PS" : "en-US", { year: "numeric", month: "long" })
    : "—"

  const attendanceDisplay = analytics?.attendance.ratePct != null
    ? `${analytics.attendance.ratePct}%`
    : "—"

  const gradesCount = analytics?.grades.totalRecords ?? 0
  const totalStudents = analytics?.totals.students ?? 0
  const totalTeachers = analytics?.totals.teachers ?? 0
  const totalClasses = analytics?.totals.classes ?? 0

  if (loading) {
    return <SkeletonProfile />
  }

  const quickStats = [
    { label: isRTL ? "إجمالي الطلاب" : "Total Students",   value: totalStudents,       icon: Users,      bg: "bg-sky-50 dark:bg-sky-950/30",     iconBg: "bg-sky-100 dark:bg-sky-900/50",     iconColor: "text-sky-600 dark:text-sky-400"     },
    { label: isRTL ? "المعلمون" : "Teachers",               value: totalTeachers,       icon: UserCheck,  bg: "bg-emerald-50 dark:bg-emerald-950/30", iconBg: "bg-emerald-100 dark:bg-emerald-900/50", iconColor: "text-emerald-600 dark:text-emerald-400" },
    { label: isRTL ? "الصفوف النشطة" : "Active Classes",    value: totalClasses,        icon: BookOpen,   bg: "bg-blue-50 dark:bg-blue-950/30",     iconBg: "bg-blue-100 dark:bg-blue-900/50",     iconColor: "text-blue-600 dark:text-blue-400"   },
    { label: isRTL ? "نسبة الحضور" : "Attendance Rate",    value: attendanceDisplay,   icon: TrendingUp, bg: "bg-violet-50 dark:bg-violet-950/30", iconBg: "bg-violet-100 dark:bg-violet-900/50", iconColor: "text-violet-600 dark:text-violet-400" },
    { label: isRTL ? "سجلات الدرجات" : "Grade Records",    value: gradesCount,         icon: BarChart3,  bg: "bg-amber-50 dark:bg-amber-950/30",   iconBg: "bg-amber-100 dark:bg-amber-900/50",   iconColor: "text-amber-600 dark:text-amber-400" },
    { label: isRTL ? "نسبة النجاح" : "Pass Rate",          value: analytics?.grades.passRatePct != null ? `${analytics.grades.passRatePct}%` : "—", icon: Activity, bg: "bg-rose-50 dark:bg-rose-950/30", iconBg: "bg-rose-100 dark:bg-rose-900/50", iconColor: "text-rose-600 dark:text-rose-400" },
  ]

  const activityItems = recentStudents.map(s => ({
    action: isRTL ? `تم تسجيل الطالب: ${s.name}` : `Student registered: ${s.name}`,
    time: new Date(s.createdAt).toLocaleDateString(language === "ar" ? "ar-PS" : "en-US", { month: "short", day: "numeric" }),
    icon: Users,
    iconBg: "bg-sky-100 dark:bg-sky-900/40",
    color: "text-sky-600 dark:text-sky-400",
    dot: "bg-sky-500",
  }))

  const permissions = [
    isRTL ? "إدارة الطلاب" : "Student Management",
    isRTL ? "إدارة المعلمين" : "Teacher Management",
    isRTL ? "إدارة الصفوف" : "Class Management",
    isRTL ? "التقارير والتحليلات" : "Reports & Analytics",
    isRTL ? "الإعدادات" : "Settings",
    isRTL ? "إدارة الملفات" : "File Management",
    isRTL ? "الجدول الدراسي" : "Schedule",
    isRTL ? "رموز QR" : "QR Codes",
  ]

  const securityToggles = [
    { label: isRTL ? "التحقق بخطوتين (2FA)" : "Two-Factor Authentication", desc: isRTL ? "طبقة حماية إضافية" : "Extra security layer", icon: Smartphone, iconBg: "bg-emerald-100 dark:bg-emerald-900/40", iconColor: "text-emerald-600 dark:text-emerald-400", value: twoFA, onChange: setTwoFA },
    { label: isRTL ? "تنبيهات تسجيل الدخول" : "Login Alerts", desc: isRTL ? "إشعار عند كل تسجيل دخول" : "Notify on every login", icon: Bell, iconBg: "bg-blue-100 dark:bg-blue-900/40", iconColor: "text-blue-600 dark:text-blue-400", value: loginAlerts, onChange: setLoginAlerts },
    { label: isRTL ? "تنبيهات الأمان" : "Security Alerts", desc: isRTL ? "تنبيه عند نشاط مشبوه" : "Alert on suspicious activity", icon: AlertTriangle, iconBg: "bg-amber-100 dark:bg-amber-900/40", iconColor: "text-amber-600 dark:text-amber-400", value: securityAlerts, onChange: setSecurityAlerts },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-8">

      {/* ── PROFILE HERO ── */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-3xl border border-border/60 shadow-sm">
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, color-mix(in oklch, var(--theme-grad-from) 20%, transparent), color-mix(in oklch, var(--theme-grad-via) 12%, transparent))" }} />
          <div className="absolute top-0 end-0 h-56 w-56 rounded-full -translate-y-16 translate-x-16 opacity-[0.06]" style={{ background: "radial-gradient(circle, var(--theme-grad-from), transparent 70%)" }} />
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative flex-shrink-0">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-lg ring-4 ring-background"
                  style={{ background: "linear-gradient(135deg, var(--theme-grad-from), var(--theme-grad-to))" }}>
                  {initials}
                </div>
                <button className="absolute -bottom-1.5 -end-1.5 h-7 w-7 rounded-xl bg-card border-2 border-background flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shadow-md">
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                {!editMode ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                      <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{user?.name ?? "—"}</h1>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border"
                        style={{ background: "color-mix(in oklch, var(--primary) 12%, transparent)", color: "var(--primary)", borderColor: "color-mix(in oklch, var(--primary) 25%, transparent)" }}>
                        <Shield className="h-3 w-3" />
                        {isRTL ? "مدير النظام" : "System Admin"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{user?.email ?? "—"}</p>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{isRTL ? "متصل الآن" : "Online"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <School className="h-3.5 w-3.5" />
                        <span>{schoolName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{isRTL ? `عضو منذ ${memberSince}` : `Member since ${memberSince}`}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3 w-full max-w-sm">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-foreground/70">{isRTL ? "الاسم الكامل" : "Full Name"}</Label>
                      <div className="relative">
                        <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="ps-9 rounded-xl bg-background/80 border-border/60 focus:border-primary/50"
                          placeholder={isRTL ? "أدخل الاسم الكامل" : "Enter full name"}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-foreground/70">{isRTL ? "البريد الإلكتروني" : "Email"}</Label>
                      <div className="relative">
                        <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          value={editEmail}
                          onChange={e => setEditEmail(e.target.value)}
                          className="ps-9 rounded-xl bg-background/80 border-border/60 focus:border-primary/50"
                          placeholder={isRTL ? "أدخل البريد الإلكتروني" : "Enter email"}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {!editMode ? (
                <Button onClick={openEdit} variant="outline" size="sm" className="flex-shrink-0 gap-2 rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/8 hover:text-primary transition-all">
                  <Edit className="h-3.5 w-3.5" />
                  {isRTL ? "تعديل الملف" : "Edit Profile"}
                </Button>
              ) : (
                <div className="flex gap-2 flex-shrink-0">
                  <Button onClick={cancelEdit} variant="outline" size="sm" className="rounded-xl border-border/60">
                    {isRTL ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button onClick={saveProfile} disabled={saving} size="sm" className="rounded-xl gap-1.5 text-white" style={{ background: "linear-gradient(135deg, var(--theme-grad-from), var(--theme-grad-to))" }}>
                    {saving ? <div className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                    {isRTL ? "حفظ" : "Save"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── QUICK STATS ── */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickStats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.05, type: "spring", stiffness: 110, damping: 15 }}>
              <div className={`relative overflow-hidden rounded-2xl border border-border/40 p-4 ${stat.bg} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center mb-3 ${stat.iconBg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
                <p className="text-xl font-bold text-foreground leading-none">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── TWO COLUMNS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* LEFT (2/5) */}
        <div className="lg:col-span-2 space-y-4">

          {/* Admin Info */}
          <motion.div variants={item}>
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                  {isRTL ? "معلومات المدير" : "Admin Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-0.5">
                {[
                  { label: isRTL ? "الاسم الكامل" : "Full Name", value: user?.name ?? "—", icon: User },
                  { label: isRTL ? "البريد الإلكتروني" : "Email", value: user?.email ?? "—", icon: Mail },
                  { label: isRTL ? "الدور الوظيفي" : "Role", value: isRTL ? "مدير النظام" : "System Administrator", icon: Shield },
                  { label: isRTL ? "المعرّف" : "User ID", value: `#${(user?.id ?? "").substring(0, 10)}...`, icon: Award },
                  { label: isRTL ? "المدرسة" : "School", value: schoolName, icon: School },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0">
                    <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
                      <p className="text-xs font-semibold text-foreground truncate mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={item}>
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
                    <Mail className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                  </div>
                  {isRTL ? "معلومات الاتصال" : "Contact Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-0.5">
                {[
                  { label: isRTL ? "البريد الإلكتروني" : "Email", value: user?.email ?? "—", icon: Mail, color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-950/30" },
                  { label: isRTL ? "الموقع" : "Location", value: isRTL ? "كفر عقب، القدس" : "Kafr Aqab, Jerusalem", icon: MapPin, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30" },
                  { label: isRTL ? "المنطقة الزمنية" : "Timezone", value: "Asia/Jerusalem (GMT+3)", icon: Clock, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
                      <p className="text-xs font-semibold text-foreground truncate mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Permissions */}
          <motion.div variants={item}>
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  {isRTL ? "الأدوار والصلاحيات" : "Roles & Permissions"}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-[10px] text-muted-foreground mb-3 font-medium">
                  {isRTL ? "صلاحيات وصول مدير النظام الكاملة" : "Full system administrator access"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {permissions.map((perm) => (
                    <span key={perm} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg border"
                      style={{ background: "color-mix(in oklch, var(--primary) 8%, transparent)", color: "var(--primary)", borderColor: "color-mix(in oklch, var(--primary) 18%, transparent)" }}>
                      <CheckCircle className="h-2.5 w-2.5" />
                      {perm}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* RIGHT (3/5) */}
        <div className="lg:col-span-3 space-y-4">

          {/* Recent Activity */}
          <motion.div variants={item}>
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                      <Activity className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                    </div>
                    {isRTL ? "النشاط الأخير" : "Recent Activity"}
                  </CardTitle>
                  <button className="text-[10px] text-primary font-semibold hover:opacity-75 transition-opacity">
                    {isRTL ? "عرض الكل" : "View All"}
                  </button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {activityItems.map((act, i) => (
                  <div key={i} className="flex items-start gap-3 py-3 border-b border-border/30 last:border-0">
                    <div className="relative flex-shrink-0 mt-0.5">
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${act.iconBg}`}>
                        <act.icon className={`h-3.5 w-3.5 ${act.color}`} />
                      </div>
                      {i < activityItems.length - 1 && (
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-3 bg-border/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-xs font-semibold text-foreground">{act.action}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{act.time}</p>
                    </div>
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 mt-2 ${act.dot}`} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Security Overview */}
          <motion.div variants={item}>
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                      <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    {isRTL ? "الأمان والحماية" : "Security & Protection"}
                  </CardTitle>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="h-3 w-3" />
                    {isRTL ? "آمن" : "Secure"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {securityToggles.map(({ label, desc, icon: Icon, iconBg, iconColor, value, onChange }) => (
                  <div key={label} className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/30 hover:bg-muted/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${iconBg}`}>
                        <Icon className={`h-4 w-4 ${iconColor}`} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{label}</p>
                        <p className="text-[10px] text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                    <Switch checked={value} onCheckedChange={onChange} />
                  </div>
                ))}

                <div className="pt-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
                    {isRTL ? "الجلسات النشطة" : "Active Sessions"}
                  </p>
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border/40 bg-muted/20">
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-muted">
                      <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {isRTL ? "الجلسة الحالية" : "Current Session"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {isRTL ? "تتبع الجلسات غير مفعّل بعد في الخادم" : "Session tracking not yet enabled on the server"}
                      </p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full gap-2 rounded-xl border-border/60 hover:border-primary/30 hover:bg-primary/8 hover:text-primary transition-all" size="sm">
                  <Key className="h-3.5 w-3.5" />
                  {isRTL ? "تغيير كلمة المرور" : "Change Password"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
