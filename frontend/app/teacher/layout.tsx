"use client"

import { useEffect } from "react"
import TeacherSidebar from "@/components/teacher-sidebar"
import TeacherHeader from "@/components/teacher-header"
import { TeacherClassProvider } from "@/lib/teacher-class-context"
import { useAdminAuthUser } from "@/lib/hooks/use-admin-data"
import { TeacherLanguageProvider, useTeacherLanguage } from "@/lib/teacher-language-context"
import { TeacherThemeProvider, useTeacherTheme } from "@/lib/teacher-theme-context"
import { TeacherNotificationProvider } from "@/lib/teacher-notification-context"

function TeacherLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useAdminAuthUser()
  const { dir, isRTL } = useTeacherLanguage()
  const { isDark, config } = useTeacherTheme()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      window.location.href = "/login"
      return
    }
    if (user.role === "admin") {
      window.location.href = "/dashboard"
    }
  }, [user, isLoading])

  return (
    <TeacherClassProvider>
      <div
        className={`min-h-screen ${isDark ? "dark bg-[#0F172A]" : "bg-slate-100"}`}
        dir={dir}
        data-color-theme={config.color}
      >
        <TeacherSidebar />
        <main className={`min-h-screen relative ${isRTL ? "lg:mr-[260px]" : "lg:ml-[260px]"}`}>
          <TeacherHeader />
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 pt-4">
            {children}
          </div>
        </main>
      </div>
    </TeacherClassProvider>
  )
}

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <TeacherThemeProvider>
      <TeacherLanguageProvider>
        <TeacherNotificationProvider>
          <TeacherLayoutInner>{children}</TeacherLayoutInner>
        </TeacherNotificationProvider>
      </TeacherLanguageProvider>
    </TeacherThemeProvider>
  )
}
