"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import ar from "@/lib/i18n/locales/ar"
import { useAdminAuthUser } from "@/lib/hooks/use-admin-data"
import type { T } from "@/lib/i18n/context"

type Language = "ar" | "en"

interface TeacherLanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  isRTL: boolean
  dir: "rtl" | "ltr"
  t: T
}

const TeacherLanguageContext = createContext<TeacherLanguageContextValue | null>(null)

function getStorageKey(userId: string | undefined) {
  return userId ? `teacher_language_${userId}` : "teacher_language"
}

export function TeacherLanguageProvider({ children }: { children: React.ReactNode }) {
  const { data: user } = useAdminAuthUser()
  const userId = user?.id
  const storageKey = getStorageKey(userId)

  const [language, setLanguageState] = useState<Language>("ar")
  const [t, setT] = useState<T>(ar as unknown as T)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(storageKey)
    if (saved === "ar" || saved === "en") {
      setLanguageState(saved)
      if (saved === "en") {
        import("@/lib/i18n/locales/en").then((mod) => {
          setT(mod.default as unknown as T)
        })
      }
    }
  }, [storageKey])

  const setLanguage = (lang: Language) => {
    if (lang === "ar") {
      setT(ar as unknown as T)
      setLanguageState(lang)
    } else {
      import("@/lib/i18n/locales/en").then((mod) => {
        setT(mod.default as unknown as T)
        setLanguageState(lang)
      })
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, lang)
    }
  }

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem(storageKey, language)
  }, [language, mounted, storageKey])

  const isRTL = language === "ar"
  const dir = isRTL ? "rtl" : "ltr"

  return (
    <TeacherLanguageContext.Provider value={{ language, setLanguage, isRTL, dir, t }}>
      {children}
    </TeacherLanguageContext.Provider>
  )
}

export function useTeacherLanguage(): TeacherLanguageContextValue {
  const ctx = useContext(TeacherLanguageContext)
  if (!ctx) throw new Error("useTeacherLanguage must be inside TeacherLanguageProvider")
  return ctx
}
