"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { getTeacherProfile, type TeacherProfile } from "@/lib/api/teacher.api"

interface TeacherClassContextValue {
  classes: { id: string; name: string }[]
  selectedClassId: string
  setSelectedClassId: (id: string) => void
  profile: TeacherProfile | null
  loading: boolean
  refresh: () => Promise<void>
}

const TeacherClassContext = createContext<TeacherClassContextValue | null>(null)

export function TeacherClassProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const p = await getTeacherProfile()
    setProfile(p)
    if (p) {
      // Build unique class list from assignments + direct classes
      const map = new Map<string, { id: string; name: string }>()
      p.teacherAssignments?.forEach((a) => {
        if (a.class) map.set(a.class.id, a.class)
      })
      p.classes?.forEach((c) => map.set(c.id, c))
      const list = Array.from(map.values())
      // If nothing selected yet, pick first
      setSelectedClassId((prev) => {
        if (prev && list.some((c) => c.id === prev)) return prev
        return list[0]?.id || ""
      })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Persist selection to localStorage
  useEffect(() => {
    if (selectedClassId) {
      localStorage.setItem("teacher_selected_class", selectedClassId)
    }
  }, [selectedClassId])

  const classes = (() => {
    const map = new Map<string, { id: string; name: string }>()
    profile?.teacherAssignments?.forEach((a) => {
      if (a.class) map.set(a.class.id, a.class)
    })
    profile?.classes?.forEach((c) => map.set(c.id, c))
    return Array.from(map.values())
  })()

  return (
    <TeacherClassContext.Provider
      value={{ classes, selectedClassId, setSelectedClassId, profile, loading, refresh }}
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
