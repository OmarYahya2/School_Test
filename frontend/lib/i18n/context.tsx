"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { type Language, translations } from "./translations"

export type T = {
  nav: Record<string, string>
  brand: Record<string, string>
  header: Record<string, string>
  user: Record<string, string>
  theme: Record<string, string>
  language: Record<string, string>
  pages: Record<string, string>
  actions: Record<string, string>
  stats: Record<string, string>
  empty: Record<string, string>
  forms: Record<string, string>
  dashboard: Record<string, string>
  days: Record<string, string>
  studentsPage: Record<string, string>
  classesPage: Record<string, string>
  teachersPage: Record<string, string>
  gradesPage: Record<string, string>
  schedulePage: Record<string, string>
  filesPage: Record<string, string>
  qrcodePage: Record<string, string>
  analyticsPage: Record<string, string>
  table: Record<string, string>
}

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: T
  dir: "rtl" | "ltr"
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("school_language") as Language | null
    if (saved && (saved === "ar" || saved === "en")) {
      setLanguageState(saved)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    const dir = language === "ar" ? "rtl" : "ltr"
    document.documentElement.dir = dir
    document.documentElement.lang = language
    localStorage.setItem("school_language", language)
  }, [language, mounted])

  function setLanguage(lang: Language) {
    setLanguageState(lang)
  }

  const value: LanguageContextValue = {
    language,
    setLanguage,
    t: translations[language] as unknown as T,
    dir: language === "ar" ? "rtl" : "ltr",
    isRTL: language === "ar",
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

const defaultLangValue: LanguageContextValue = {
  language: "ar",
  setLanguage: () => {},
  t: translations.ar as unknown as T,
  dir: "rtl",
  isRTL: true,
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  return ctx ?? defaultLangValue
}
