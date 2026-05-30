"use client"

import { motion } from "framer-motion"

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
      <div className="h-8 w-16 animate-pulse rounded bg-slate-100" />
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
      <div className="h-5 w-32 animate-pulse rounded bg-slate-100 mb-4" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-8 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export function SkeletonSchedule() {
  return (
    <div className="border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="p-5 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  )
}

export function SkeletonProfile() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" />
        <div className="space-y-2">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 animate-pulse rounded-full bg-slate-100" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </div>
      <SkeletonStats />
      <SkeletonTable rows={4} cols={6} />
    </div>
  )
}
