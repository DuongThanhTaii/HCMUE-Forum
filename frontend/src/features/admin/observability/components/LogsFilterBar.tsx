import type { ReactNode } from 'react'

interface LogsFilterBarProps {
  children: ReactNode
}

export function LogsFilterBar({ children }: LogsFilterBarProps) {
  return <section className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:grid-cols-4">{children}</section>
}
