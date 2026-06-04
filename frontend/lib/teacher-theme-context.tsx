"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useAdminAuthUser } from "@/lib/hooks/use-admin-data"

export type TeacherColorTheme = "violet" | "ocean" | "emerald" | "rose" | "amber"
export type TeacherDarkMode = "light" | "dark" | "system"

export interface TeacherThemeConfig {
  color: TeacherColorTheme
  mode: TeacherDarkMode
}

interface TeacherThemeContextValue {
  config: TeacherThemeConfig
  setColor: (color: TeacherColorTheme) => void
  setMode: (mode: TeacherDarkMode) => void
  isDark: boolean
}

const TeacherThemeContext = createContext<TeacherThemeContextValue | null>(null)

const defaultConfig: TeacherThemeConfig = { color: "violet", mode: "light" }

function getStorageKey(userId: string | undefined) {
  return userId ? `teacher_theme_config_${userId}` : "teacher_theme_config"
}

export function TeacherThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: user } = useAdminAuthUser()
  const userId = user?.id
  const storageKey = getStorageKey(userId)

  const [config, setConfig] = useState<TeacherThemeConfig>(defaultConfig)
  const [systemDark, setSystemDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as TeacherThemeConfig
        setConfig(parsed)
      } catch {
        /* ignore */
      }
    }
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    setSystemDark(mq.matches)
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [storageKey])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem(storageKey, JSON.stringify(config))
  }, [config, mounted, storageKey])

  const isDark =
    config.mode === "dark" || (config.mode === "system" && systemDark)

  return (
    <TeacherThemeContext.Provider
      value={{
        config,
        setColor: (color) => setConfig((c) => ({ ...c, color })),
        setMode: (mode) => setConfig((c) => ({ ...c, mode })),
        isDark,
      }}
    >
      {children}
    </TeacherThemeContext.Provider>
  )
}

export function useTeacherTheme(): TeacherThemeContextValue {
  const ctx = useContext(TeacherThemeContext)
  if (!ctx) throw new Error("useTeacherTheme must be inside TeacherThemeProvider")
  return ctx
}
