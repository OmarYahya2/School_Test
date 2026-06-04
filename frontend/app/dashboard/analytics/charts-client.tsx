"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import { Users, BookOpen } from "lucide-react"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

interface GrowthData {
  month: string
  students: number
  teachers: number
}

interface DistributionData {
  name: string
  value: number
}

interface ClassBreakdownData {
  name: string
  students: number
}

interface ChartsClientProps {
  monthlyData: GrowthData[]
  subjectData: DistributionData[]
  ageDistribution: Array<{ range: string; count: number }>
  classBreakdown: ClassBreakdownData[]
  ap: any
  language: string
}

export function OverviewGrowthChart({ monthlyData, ap }: { monthlyData: GrowthData[], ap: any }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={monthlyData}>
        <defs>
          <linearGradient id="studentsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="teachersGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)", fontSize: 12 }}
        />
        <Area type="monotone" dataKey="students" stroke="var(--primary)" strokeWidth={2} fill="url(#studentsGrad)" name={ap.totalStudents} />
        <Area type="monotone" dataKey="teachers" stroke="#10b981" strokeWidth={2} fill="url(#teachersGrad)" name={ap.totalTeachers} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function OverviewAgePieChart({ ageDistribution, ap }: { ageDistribution: Array<{ range: string; count: number }>, ap: any }) {
  const filteredData = ageDistribution.filter(d => d.count > 0)
  if (filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
        <Users className="h-10 w-10 text-muted-foreground/20 mb-2" />
        <p className="text-xs font-semibold">{ap.noData}</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="count"
        >
          {filteredData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)", fontSize: 12 }}
          formatter={(value, name, props: any) => [`${value}`, `${props.payload.range}`]}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function StudentsClassBarChart({ classBreakdown, ap }: { classBreakdown: ClassBreakdownData[], ap: any }) {
  if (classBreakdown.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-52 text-muted-foreground">
        <BookOpen className="h-10 w-10 text-muted-foreground/20 mb-2" />
        <p className="text-xs font-semibold">{ap.noData}</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={classBreakdown} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={80} />
        <Tooltip
          contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)", fontSize: 12 }}
          formatter={(v) => [`${v}`, ap.totalStudents]}
        />
        <Bar dataKey="students" fill="var(--primary)" radius={[0, 6, 6, 0]} name={ap.totalStudents} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TeachersSubjectBarChart({ subjectData, ap }: { subjectData: DistributionData[], ap: any }) {
  if (subjectData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-52 text-muted-foreground">
        <BookOpen className="h-10 w-10 text-muted-foreground/20 mb-2" />
        <p className="text-xs font-semibold">{ap.noData}</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={subjectData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)", fontSize: 12 }}
          formatter={(v) => [`${v}`, ap.totalTeachers]}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} name={ap.totalTeachers}>
          {subjectData.map((_, index) => (
            <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
