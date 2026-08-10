import React from 'react'
import type { LucideIcon } from 'lucide-react'

type PageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
  actions?: React.ReactNode
  accent?: 'primary' | 'info' | 'success' | 'warning'
}

const accentClasses = {
  primary: 'bg-primary/12 text-primary border-primary/20',
  info: 'bg-info/12 text-info border-info/20',
  success: 'bg-success/12 text-success border-success/20',
  warning: 'bg-warning/12 text-warning border-warning/20',
}

export default function PageHeader({ eyebrow, title, description, icon: Icon, actions, accent = 'primary' }: PageHeaderProps) {
  return (
    <header className="page-hero glass-panel soft-grid signal-line relative overflow-hidden rounded-panel border border-border px-4 py-5 sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary/12 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-10 h-px w-40 bg-gradient-to-r from-transparent via-info/50 to-transparent" />
      <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-muted">
            <span className={`grid h-8 w-8 place-items-center rounded-xl border ${accentClasses[accent]}`}><Icon size={16} /></span>
            <span>{eyebrow}</span>
            <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/10 px-2 py-1 text-[9px] tracking-[.12em] text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Live</span>
          </div>
          <h1 className="font-display mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-muted-foreground">{description}</p>
        </div>
        {actions && <div className="relative flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
