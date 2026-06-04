import DashboardShell from "@/components/dashboard-shell"
import { AdminNotificationProvider } from "@/lib/admin-notification-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminNotificationProvider>
      <DashboardShell>{children}</DashboardShell>
    </AdminNotificationProvider>
  )
}

