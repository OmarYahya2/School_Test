"use client"

import React from "react"
import Link from "next/link"
import { User, Settings, LogOut } from "lucide-react"
import { type T } from "@/lib/i18n/context"

interface UserDropdownProps {
  isOpen: boolean
  isRTL: boolean
  t: T
  user: { id: string; name: string; email: string; role?: string }
  userInitials: string
  handleLogout: () => Promise<void>
  closeMenu: () => void
}

export default function UserDropdown({
  isOpen,
  isRTL,
  t,
  user,
  userInitials,
  handleLogout,
  closeMenu,
}: UserDropdownProps) {
  return (
    <div
      className={`absolute ${isRTL ? "left-0" : "right-0"} top-full mt-2 w-52 rounded-2xl bg-popover border border-border shadow-xl shadow-foreground/10 p-1.5 z-50 transition-all duration-150 origin-top-right ${
        isOpen
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
      }`}
    >
      {/* User info */}
      <div className="px-3 py-2.5 border-b border-border mb-1">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white font-bold text-xs shadow-sm"
            style={{ background: "linear-gradient(135deg, var(--theme-grad-from), var(--theme-grad-to))" }}
          >
            {userInitials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
            <p className="text-[10px] text-primary font-semibold">{t.user.role}</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <Link
        href="/dashboard/profile"
        onClick={closeMenu}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground/70 hover:bg-accent hover:text-foreground transition-all"
      >
        <User className="h-3.5 w-3.5" />
        {isRTL ? "الملف الشخصي" : "Profile"}
      </Link>
      <Link
        href="/dashboard/settings"
        onClick={closeMenu}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground/70 hover:bg-accent hover:text-foreground transition-all"
      >
        <Settings className="h-3.5 w-3.5" />
        {isRTL ? "الإعدادات" : "Settings"}
      </Link>

      <div className="border-t border-border my-1" />
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
      >
        <LogOut className="h-3.5 w-3.5" />
        {t.user.logout}
      </button>
    </div>
  )
}
