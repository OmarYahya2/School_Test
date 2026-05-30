"use client"

import TeacherSidebar from "@/components/teacher-sidebar"
import { TeacherClassProvider } from "@/lib/teacher-class-context"

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <TeacherClassProvider>
      <div className="min-h-screen bg-slate-50" dir="rtl">
        <TeacherSidebar />
        <main className="lg:mr-64 min-h-screen">
          <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </TeacherClassProvider>
  )
}
