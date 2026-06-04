"use client"

import React from "react"
import { type Language } from "@/lib/i18n/translations"
import { type T } from "@/lib/i18n/context"

interface LanguageDropdownProps {
  isOpen: boolean
  isRTL: boolean
  t: T
  language: Language
  setLanguage: (lang: Language) => void
  closeMenu: () => void
}

export default function LanguageDropdown({
  isOpen,
  isRTL,
  t,
  language,
  setLanguage,
  closeMenu,
}: LanguageDropdownProps) {
  return (
    <div
      className={`absolute ${isRTL ? "left-0" : "right-0"} top-full mt-2 w-44 rounded-2xl bg-popover border border-border shadow-xl shadow-foreground/10 p-1.5 z-50 transition-all duration-150 origin-top-right ${
        isOpen
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
      }`}
    >
      <p className="px-2.5 py-1.5 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider">{t.language.label}</p>
      {[
        { id: "ar" as const, label: t.language.arabic,  flag: "🇵🇸" },
        { id: "en" as const, label: t.language.english, flag: "🇺🇸" },
      ].map((lang) => (
        <button
          key={lang.id}
          onClick={() => { setLanguage(lang.id); closeMenu() }}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
            language === lang.id
              ? "bg-primary/10 text-primary"
              : "text-foreground hover:bg-accent"
          }`}
        >
          <span className="text-base">{lang.flag}</span>
          <span className="flex-1 text-start">{lang.label}</span>
          {language === lang.id && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          )}
        </button>
      ))}
    </div>
  )
}
