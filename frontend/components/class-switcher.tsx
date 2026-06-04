"use client"

import { useTeacherClass } from "@/lib/teacher-class-context"
import { ChevronDown, GraduationCap } from "lucide-react"

export default function ClassSwitcher() {
  const { classes, selectedClassId, setSelectedClassId } = useTeacherClass()

  if (classes.length <= 1) {
    const name = classes.find((c) => c.id === selectedClassId)?.name || classes[0]?.name || "—"
    return (
      <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-md px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm shadow-slate-100/50">
        <GraduationCap className="h-4 w-4 text-violet-500" />
        {name}
      </span>
    )
  }

  return (
    <div className="relative inline-block">
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <GraduationCap className="h-4 w-4 text-violet-500" />
      </div>
      <select
        value={selectedClassId}
        onChange={(e) => setSelectedClassId(e.target.value)}
        className="appearance-none rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-md pl-10 pr-10 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-200 shadow-sm shadow-slate-100/50 cursor-pointer transition-all hover:bg-white"
      >
        {classes.map((cls) => (
          <option key={cls.id} value={cls.id}>
            {cls.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
    </div>
  )
}
