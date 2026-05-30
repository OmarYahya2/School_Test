"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type ColorTheme = "violet" | "ocean" | "emerald" | "rose" | "amber"
export type DarkMode = "light" | "dark" | "system"

export interface ThemeConfig {
  color: ColorTheme
  mode: DarkMode
}

interface ThemeContextValue {
  config: ThemeConfig
  setColor: (color: ColorTheme) => void
  setMode: (mode: DarkMode) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const defaultConfig: ThemeConfig = { color: "violet", mode: "light" }

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ThemeConfig>(defaultConfig)
  const [systemDark, setSystemDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("school_theme_config")
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ThemeConfig
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
  }, [])

  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    const isDark =
      config.mode === "dark" || (config.mode === "system" && systemDark)

    // Apply dark class
    root.classList.toggle("dark", isDark)

    // Apply color theme attribute
    root.setAttribute("data-color-theme", config.color)

    // Persist
    localStorage.setItem("school_theme_config", JSON.stringify(config))
  }, [config, systemDark, mounted])

  const isDark =
    config.mode === "dark" || (config.mode === "system" && systemDark)

  return (
    <ThemeContext.Provider
      value={{
        config,
        setColor: (color) => setConfig((c) => ({ ...c, color })),
        setMode: (mode) => setConfig((c) => ({ ...c, mode })),
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useAppTheme must be inside AppThemeProvider")
  return ctx
}
