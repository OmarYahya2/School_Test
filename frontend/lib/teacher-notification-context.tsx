"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useAdminAuthUser } from "@/lib/hooks/use-admin-data"

export interface Notification {
  id: string
  title: string
  message?: string
  time: string
  read: boolean
  type?: "info" | "success" | "warning" | "error"
}

interface TeacherNotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  addNotification: (n: Omit<Notification, "id" | "read">) => void
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  markAllRead: () => void
}

const TeacherNotificationContext = createContext<TeacherNotificationContextValue | null>(null)

function getStorageKey(userId: string | undefined) {
  return userId ? `teacher_notifications_${userId}` : "teacher_notifications"
}

function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function TeacherNotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: user } = useAdminAuthUser()
  const userId = user?.id
  const storageKey = getStorageKey(userId)

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Notification[]
        setNotifications(parsed)
      } catch {
        /* ignore */
      }
    }
  }, [storageKey])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem(storageKey, JSON.stringify(notifications))
  }, [notifications, mounted, storageKey])

  const addNotification = useCallback((n: Omit<Notification, "id" | "read">) => {
    setNotifications((prev) => [
      { ...n, id: generateId(), read: false },
      ...prev,
    ])
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <TeacherNotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, removeNotification, markAsRead, markAllRead }}
    >
      {children}
    </TeacherNotificationContext.Provider>
  )
}

export function useTeacherNotifications(): TeacherNotificationContextValue {
  const ctx = useContext(TeacherNotificationContext)
  if (!ctx) throw new Error("useTeacherNotifications must be inside TeacherNotificationProvider")
  return ctx
}
