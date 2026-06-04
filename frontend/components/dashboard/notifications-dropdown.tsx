"use client"

import React from "react"
import { type Notification } from "@/lib/admin-notification-context"
import { type T } from "@/lib/i18n/context"

interface NotificationsDropdownProps {
  isOpen: boolean
  isRTL: boolean
  t: T
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllRead: () => void
}

export default function NotificationsDropdown({
  isOpen,
  isRTL,
  t,
  notifications,
  unreadCount,
  markAsRead,
  markAllRead,
}: NotificationsDropdownProps) {
  return (
    <div
      className={`absolute ${isRTL ? "left-0" : "right-0"} top-full mt-2 w-80 rounded-2xl bg-popover border border-border shadow-xl shadow-foreground/10 p-2 z-50 transition-all duration-150 origin-top-right ${
        isOpen
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-between px-2.5 pb-2 border-b border-border mb-1">
        <span className="text-xs font-bold text-foreground">{t.header.notifications}</span>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-[10px] text-primary font-semibold cursor-pointer hover:opacity-80 transition-opacity"
          >
            {t.header.markAllRead}
          </button>
        )}
      </div>
      <div className="space-y-0.5 max-h-60 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-2.5 py-6 text-center">
            <p className="text-xs text-muted-foreground">{t.header.noNotifications}</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`flex items-start gap-3 px-2.5 py-2.5 hover:bg-accent rounded-xl transition-colors cursor-pointer group ${n.read ? "opacity-60" : ""}`}
            >
              <div className={`h-2 w-2 mt-1.5 flex-shrink-0 rounded-full ${n.read ? "bg-muted-foreground/30" : "bg-primary"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground font-semibold leading-snug">{n.title}</p>
                {n.message && <p className="text-[10px] text-muted-foreground leading-snug">{n.message}</p>}
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{n.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
