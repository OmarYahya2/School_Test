"use client"

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react"
import { useTeacherProfile } from "@/lib/hooks/use-teacher-data"
import type { TeacherProfile } from "@/lib/api/teacher.api"

interface TeacherClassContextValue {
  classes: { id: string; name: string }[]
  selectedClassId: string
  setSelectedClassId: (id: string) => void
  profile: TeacherProfile | null
  loading: boolean
}

const TeacherClassContext = createContext<TeacherClassContextValue | null>(null)

export function TeacherClassProvider({ children }: { children: ReactNode }) {
  const { data: profile, isLoading } = useTeacherProfile()
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const loading = isLoading

  const classes = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>()
    profile?.teacherAssignments?.forEach((a) => {
      if (a.class) map.set(a.class.id, a.class)
    })
    profile?.classes?.forEach((c) => map.set(c.id, c))
    return Array.from(map.values())
  }, [profile])

  // Initialize selection from localStorage or first class
  useEffect(() => {
    if (!classes.length || selectedClassId) return
    const saved = localStorage.getItem("teacher_selected_class")
    if (saved && classes.some((c) => c.id === saved)) {
      setSelectedClassId(saved)
    } else {
      setSelectedClassId(classes[0]?.id || "")
    }
  }, [classes, selectedClassId])

  // Persist selection to localStorage
  useEffect(() => {
    if (selectedClassId) {
      localStorage.setItem("teacher_selected_class", selectedClassId)
    }
  }, [selectedClassId])

  return (
    <TeacherClassContext.Provider
      value={{ classes, selectedClassId, setSelectedClassId, profile: profile ?? null, loading }}
    >
      {children}
    </TeacherClassContext.Provider>
  )
}

export function useTeacherClass() {
  const ctx = useContext(TeacherClassContext)
  if (!ctx) throw new Error("useTeacherClass must be used within TeacherClassProvider")
  return ctx
}
