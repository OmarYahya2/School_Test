"use client"

import { useTeacherClass } from "@/lib/teacher-class-context"
import { ChevronDown } from "lucide-react"

export default function ClassSwitcher() {
  const { classes, selectedClassId, setSelectedClassId } = useTeacherClass()

  if (classes.length <= 1) {
    const name = classes.find((c) => c.id === selectedClassId)?.name || classes[0]?.name || "—"
    return (
      <span className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
        {name}
      </span>
    )
  }

  return (
    <div className="relative inline-block">
      <select
        value={selectedClassId}
        onChange={(e) => setSelectedClassId(e.target.value)}
        className="appearance-none rounded-xl border border-slate-200 bg-white pl-8 pr-4 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
      >
        {classes.map((cls) => (
          <option key={cls.id} value={cls.id}>
            {cls.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
    </div>
  )
}
