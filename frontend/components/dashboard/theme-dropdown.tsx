"use client"

import React from "react"
import { Sun, Moon, Monitor, Palette } from "lucide-react"
import { type ColorTheme, type DarkMode } from "@/lib/theme-context"
import { type T } from "@/lib/i18n/context"

interface ThemeDropdownProps {
  isOpen: boolean
  isRTL: boolean
  t: T
  config: { mode: DarkMode; color: ColorTheme }
  setMode: (mode: DarkMode) => void
  setColor: (color: ColorTheme) => void
  colorThemes: { id: ColorTheme; swatch: string }[]
}

export default function ThemeDropdown({
  isOpen,
  isRTL,
  t,
  config,
  setMode,
  setColor,
  colorThemes,
}: ThemeDropdownProps) {
  return (
    <div
      className={`absolute ${isRTL ? "left-0" : "right-0"} top-full mt-2 w-56 rounded-2xl bg-popover border border-border shadow-xl shadow-foreground/10 p-2 z-50 transition-all duration-150 origin-top-right ${
        isOpen
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
      }`}
    >
      {/* Mode row */}
      <p className="px-2 py-1 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider">{t.theme.label}</p>
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl mb-3">
        {([
          { id: "light" as DarkMode, icon: Sun,     label: t.theme.light  },
          { id: "dark"  as DarkMode, icon: Moon,    label: t.theme.dark   },
          { id: "system"as DarkMode, icon: Monitor, label: t.theme.system },
        ] as const).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-lg text-[9px] font-bold transition-all duration-150 ${
              config.mode === id
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Color swatches */}
      <p className="px-2 py-1 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider">
        <Palette className="h-2.5 w-2.5 inline-block me-1" />
        {isRTL ? "لون التطبيق" : "App Color"}
      </p>
      <div className="grid grid-cols-5 gap-1.5 px-1 pb-1">
        {colorThemes.map(({ id, swatch }) => (
          <button
            key={id}
            onClick={() => setColor(id)}
            title={t.theme[id]}
            className={`relative h-7 w-full rounded-lg ${swatch} transition-all duration-150 hover:scale-110 ${
              config.color === id
                ? "ring-2 ring-offset-2 ring-foreground/30 scale-110"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            {config.color === id && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-white shadow-sm" />
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="flex justify-between px-1 mt-0.5">
        {colorThemes.map(({ id }) => (
          <span key={id} className="text-[8px] text-muted-foreground/50 text-center flex-1 font-medium">
            {t.theme[id]}
          </span>
        ))}
      </div>
    </div>
  )
}
