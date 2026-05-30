"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import {
  Plus, Trash2, Pencil, Power, KeyRound, Users, Mail, BookOpen, Phone,
  CheckCircle2, XCircle, Search, GraduationCap, Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { client } from "@/lib/api/client"
import { useAdminTeacherAccounts } from "@/lib/hooks/use-admin-data"
import { useAppTheme } from "@/lib/theme-context"

interface TeacherAccount {
  id: string
  name: string
  email: string | null
  phone: string
  subject: string
  isActive: boolean
  assignedSubjects: string[]
  user?: { id: string; email: string; role: string }
  classes: { id: string; name: string }[]
  teacherAssignments: Array<{ id: string; gradeId: number; semester: string; subject: string }>
}

export default function TeachersManagementPage() {
  const { config } = useAppTheme()
  const queryClient = useQueryClient()
  const { data: accounts = [], isLoading: loading } = useAdminTeacherAccounts()
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)
  const [resetTargetId, setResetTargetId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    assignedSubjects: [] as string[],
    isHomeroom: false,
    classId: "",
  })

  const tc = {
    ocean:   { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200", btn: "bg-blue-600 hover:bg-blue-700" },
    violet:  { bg: "bg-violet-500", text: "text-violet-600", light: "bg-violet-50", border: "border-violet-200", btn: "bg-violet-600 hover:bg-violet-700" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200", btn: "bg-emerald-600 hover:bg-emerald-700" },
    rose:    { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-200", btn: "bg-rose-600 hover:bg-rose-700" },
    amber:   { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-200", btn: "bg-amber-600 hover:bg-amber-700" },
  }[config.color] || { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200", btn: "bg-blue-600 hover:bg-blue-700" }

  const reload = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "teacherAccounts"] })
  }

  const filtered = accounts.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.email && a.email.toLowerCase().includes(search.toLowerCase()))
  )

  async function handleSave() {
    try {
      if (editingId) {
        await client.put(`/teachers/accounts/${editingId}`, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          assignedSubjects: form.assignedSubjects,
          isHomeroom: form.isHomeroom,
          classId: form.classId || undefined,
        })
        toast.success("تم تحديث الحساب")
      } else {
        if (!form.name || !form.email || !form.password) {
          toast.error("الاسم والبريد وكلمة المرور مطلوبة")
          return
        }
        await client.post("/teachers/accounts", {
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          assignedSubjects: form.assignedSubjects,
          isHomeroom: form.isHomeroom,
          classId: form.classId || undefined,
        })
        toast.success("تم إنشاء الحساب")
      }
      setDialogOpen(false)
      resetForm()
      reload()
    } catch (err: any) {
      console.error("saveTeacher error:", err)
      toast.error(err?.message || "حدث خطأ")
    }
  }

  async function handleToggleStatus(id: string) {
    try {
      await client.patch(`/teachers/accounts/${id}/status`, {})
      toast.success("تم تحديث الحالة")
      reload()
    } catch (err: any) {
      console.error("toggleStatus error:", err)
      toast.error(err?.message || "فشل تحديث الحالة")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا الحساب؟")) return
    try {
      await client.delete(`/teachers/accounts/${id}`)
      toast.success("تم حذف الحساب")
      reload()
    } catch (err: any) {
      console.error("deleteTeacher error:", err)
      toast.error(err?.message || "فشل الحذف")
    }
  }

  async function handleResetPassword() {
    if (!resetTargetId || !newPassword) return
    try {
      await client.patch(`/teachers/accounts/${resetTargetId}/reset-password`, { password: newPassword })
      toast.success("تم إعادة تعيين كلمة المرور")
      setResetPasswordOpen(false)
      setNewPassword("")
      setResetTargetId(null)
    } catch (err: any) {
      console.error("resetPassword error:", err)
      toast.error(err?.message || "فشل إعادة التعيين")
    }
  }

  function openCreate() {
    setEditingId(null)
    resetForm()
    setDialogOpen(true)
  }

  function openEdit(account: TeacherAccount) {
    setEditingId(account.id)
    setForm({
      name: account.name,
      email: account.email || "",
      password: "",
      phone: account.phone,
      assignedSubjects: account.assignedSubjects || [],
      isHomeroom: account.classes.length > 0,
      classId: account.classes[0]?.id || "",
    })
    setDialogOpen(true)
  }

  function resetForm() {
    setForm({ name: "", email: "", password: "", phone: "", assignedSubjects: [], isHomeroom: false, classId: "" })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tc.light} ${tc.text}`}>
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">إدارة حسابات المعلمين</h1>
            <p className="text-xs text-muted-foreground">إنشاء وتعديل وحذف حسابات المعلمين</p>
          </div>
        </div>
        <Button onClick={openCreate} className={`${tc.btn} text-white rounded-xl font-bold border-0 gap-2`}>
          <Plus className="h-4 w-4" />
          معلم جديد
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="بحث باسم أو بريد المعلم..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card py-2.5 pr-10 pl-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((account, i) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tc.light} ${tc.text} text-sm font-bold`}>
                  {account.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-foreground truncate">{account.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {account.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {account.email}
                      </span>
                    )}
                  </div>
                  {account.teacherAssignments.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {account.teacherAssignments.map((a: any) => (
                        <span key={a.id} className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 border border-amber-200">
                          <BookOpen className="h-2.5 w-2.5" />
                          {a.subject} — الصف {a.gradeId}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {account.isActive ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" /> نشط
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground border border-border">
                    <XCircle className="h-3 w-3" /> معطل
                  </span>
                )}
                {account.classes.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 border border-blue-200">
                    <Users className="h-3 w-3" /> {account.classes[0].name}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(account)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="تعديل"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { setResetTargetId(account.id); setResetPasswordOpen(true) }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  title="إعادة تعيين كلمة المرور"
                >
                  <KeyRound className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleToggleStatus(account.id)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${account.isActive ? "text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                  title={account.isActive ? "تعطيل" : "تفعيل"}
                >
                  <Power className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(account.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="حذف"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">لا يوجد معلمين مطابقين للبحث</p>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir="rtl" className="bg-card border-border rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground font-extrabold text-lg">
              {editingId ? "تعديل حساب معلم" : "إنشاء حساب معلم"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-foreground text-xs font-bold">الاسم الكامل</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl h-10" placeholder="محمد أحمد" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground text-xs font-bold">البريد الإلكتروني</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl h-10" dir="ltr" placeholder="teacher@school.com" />
            </div>
            {!editingId && (
              <div className="space-y-1.5">
                <Label className="text-foreground text-xs font-bold">كلمة المرور</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-xl h-10" dir="ltr" placeholder="********" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-foreground text-xs font-bold">الهاتف</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl h-10" dir="ltr" placeholder="0599123456" />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl border-border">إلغاء</Button>
              <Button onClick={handleSave} className={`${tc.btn} text-white rounded-xl font-bold border-0`}>
                {editingId ? "حفظ التعديلات" : "إنشاء الحساب"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent dir="rtl" className="bg-card border-border rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground font-extrabold text-lg flex items-center gap-2">
              <Lock className="h-5 w-5" />
              إعادة تعيين كلمة المرور
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-foreground text-xs font-bold">كلمة المرور الجديدة</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="rounded-xl h-10" dir="ltr" placeholder="********" />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setResetPasswordOpen(false)} className="rounded-xl border-border">إلغاء</Button>
              <Button onClick={handleResetPassword} className={`${tc.btn} text-white rounded-xl font-bold border-0`}>
                تعيين
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
