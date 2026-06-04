"use client"

import React from "react"
import { type Notification } from "@/lib/teacher-notification-context"
import { type T } from "@/lib/i18n/context"

interface TeacherNotificationsDropdownProps {
  isOpen: boolean
  isRTL: boolean
  t: T
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllRead: () => void
}

export default function TeacherNotificationsDropdown({
  isOpen,
  isRTL,
  t,
  notifications,
  unreadCount,
  markAsRead,
  markAllRead,
}: TeacherNotificationsDropdownProps) {
  return (
    <div
      className={`absolute ${isRTL ? "left-0" : "right-0"} top-full mt-2 w-80 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-xl p-2 z-50 transition-all duration-150 origin-top-right ${
        isOpen
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-between px-2.5 pb-2 border-b border-white/20 dark:border-slate-700/50 mb-1">
        <span className="text-xs font-bold text-slate-900">{t.header.notifications}</span>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
          >
            {t.header.markAllRead}
          </button>
        )}
      </div>
      <div className="space-y-0.5 max-h-60 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-2.5 py-6 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.header.noNotifications}</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`flex items-start gap-3 px-2.5 py-2.5 hover:bg-white/60 rounded-xl transition-colors cursor-pointer group ${n.read ? "opacity-60" : ""}`}
            >
              <div className={`h-2 w-2 mt-1.5 flex-shrink-0 rounded-full ${n.read ? "bg-slate-300" : "bg-blue-500"}`} />
              <div className="flex-1 min-w-0 text-right">
                <p className="text-xs text-slate-800 font-semibold leading-snug">{n.title}</p>
                {n.message && <p className="text-[10px] text-slate-500 leading-snug">{n.message}</p>}
                <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
