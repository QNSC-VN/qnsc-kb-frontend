import React, { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowRight, BookOpen, CheckCircle2, Clock3, FileCheck2, FolderTree, Plus, Search, ShieldCheck, UploadCloud } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getHomeSummary } from '../api/knowledge'
import type { HomeSummary } from '../types/governance'
import { usePermission } from '../hooks/usePermission'

function Metric({ label, value, detail, Icon, tone }: { label: string; value: number | string; detail: string; Icon: React.ElementType; tone: 'primary' | 'warning' | 'info' | 'success' }) {
  const tones = {
    primary: 'bg-primary/10 text-primary ring-primary/20',
    warning: 'bg-warning/10 text-warning ring-warning/20',
    info: 'bg-info/10 text-info ring-info/20',
    success: 'bg-success/10 text-success ring-success/20',
  }
  return <article className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-[0_10px_26px_rgb(var(--shadow)/.10)] transition hover:-translate-y-0.5 hover:bg-surface-elevated">
    <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-full bg-foreground/[.025] blur-2xl" />
    <div className="relative flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</p></div><span className={`grid h-9 w-9 place-items-center rounded-lg ring-1 ${tones[tone]}`}><Icon size={17} /></span></div>
    <p className="relative mt-3 text-xs text-muted-foreground">{detail}</p>
  </article>
}

export default function HomePage() {
  const [summary, setSummary] = useState<HomeSummary | null>(null)
  const { has } = usePermission()
  useEffect(() => { void getHomeSummary().then(setSummary).catch(console.error) }, [])
  const ownerCoverage = useMemo(() => summary ? Math.max(0, Math.min(100, summary.with_owner_percent)) : 0, [summary])

  if (!summary) return <div className="grid min-h-[65vh] place-items-center"><div className="flex items-center gap-3 text-sm text-muted-foreground"><Activity size={17} className="animate-pulse text-info" />Loading the control room…</div></div>

  return <div className="mx-auto max-w-[1440px] space-y-6 pb-8">
    <header className="relative overflow-hidden rounded-2xl border border-border bg-surface-elevated px-5 py-6 shadow-[0_18px_45px_rgb(var(--shadow)/.14)] md:px-7 md:py-7">
      <div className="pointer-events-none absolute right-0 top-0 h-64 w-[42%] rounded-full bg-info/10 blur-3xl" />
      <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div><div className="mb-3 inline-flex items-center gap-2 rounded-md border border-info/20 bg-info/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.15em] text-info"><span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_10px_rgb(var(--success)/.65)]" /> Knowledge operations live</div><h1 className="text-3xl font-semibold tracking-[-.04em] text-foreground md:text-4xl">Control room</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">One clear view of what needs attention, what is trusted, and where your teams need knowledge next.</p></div>
        {has('article.create') && <div className="flex flex-wrap gap-2"><Link to="/sources" className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-xs font-bold text-foreground transition hover:bg-surface-soft"><UploadCloud size={15} className="text-info" /> Upload source</Link><Link to="/articles/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2.5 text-xs font-bold text-primary-foreground shadow-[0_7px_18px_rgb(var(--shadow)/.18)] transition hover:bg-primary/90"><Plus size={15} /> New article</Link></div>}
      </div>
    </header>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Knowledge library" value={summary.total_articles} detail="Published, trusted documents" Icon={BookOpen} tone="primary" />
      <Metric label="Approval inbox" value={summary.pending_drafts} detail="Drafts waiting for a decision" Icon={FileCheck2} tone="warning" />
      <Metric label="Open gaps" value={summary.open_gaps} detail="Questions with no trusted answer" Icon={Search} tone="info" />
      <Metric label="Departments" value={summary.departments} detail="Teams contributing knowledge" Icon={FolderTree} tone="success" />
    </section>

    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.8fr)]">
      <article className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_12px_28px_rgb(var(--shadow)/.10)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-4"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-muted-foreground">Latest activity</p><h2 className="mt-1 text-base font-semibold text-foreground">Recently reviewed knowledge</h2></div><Link to="/articles" className="inline-flex items-center gap-1 text-xs font-bold text-primary transition hover:text-info">Open library <ArrowRight size={14} /></Link></div>
        <div className="divide-y divide-border">{summary.recent.length ? summary.recent.map((article, index) => <Link key={article.id} to={`/articles/${article.id}`} className="group flex items-center gap-3 px-5 py-4 transition hover:bg-surface-soft"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><BookOpen size={16} /></div><div className="min-w-0 flex-1"><div className="flex min-w-0 items-center gap-2"><h3 className="truncate text-sm font-semibold text-foreground group-hover:text-info">{article.title}</h3>{article.needs_update && <span className="hidden rounded-full border border-warning/20 bg-warning/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-warning sm:inline">Update due</span>}</div><p className="mt-1 truncate text-xs text-muted-foreground">{article.dept || 'Unassigned department'} · {article.owner || 'No owner'}</p></div><div className="hidden text-right sm:block"><p className="text-[10px] font-semibold text-success">Verified</p><p className="mt-1 text-[10px] text-muted">#{String(index + 1).padStart(2, '0')}</p></div><ArrowRight size={15} className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-info" /></Link>) : <div className="px-5 py-12 text-center text-sm text-muted-foreground">Your recently reviewed documents will appear here.</div>}</div>
      </article>

      <div className="space-y-5">
        <article className="rounded-xl border border-border bg-surface-elevated p-5 shadow-[0_12px_28px_rgb(var(--shadow)/.12)]"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-muted-foreground">Governance pulse</p><h2 className="mt-1 text-base font-semibold text-foreground">Knowledge health</h2></div><span className="grid h-9 w-9 place-items-center rounded-lg bg-success/10 text-success"><ShieldCheck size={17} /></span></div><div className="mt-6 flex items-end gap-4"><div className="text-4xl font-semibold tracking-tight text-foreground">{ownerCoverage}<span className="text-lg text-muted-foreground">%</span></div><p className="mb-1 text-xs text-muted-foreground">of articles have a clear owner</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-gradient-to-r from-info to-success transition-all" style={{ width: `${ownerCoverage}%` }} /></div><div className="mt-5 border-t border-border pt-4"><p className="text-xl font-semibold text-warning">{summary.needs_review}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-muted">Need review</p></div><Link to="/governance/health" className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-info hover:text-foreground">View health report <ArrowRight size={14} /></Link></article>
        <article className="rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-warning/10 text-warning"><Clock3 size={17} /></span><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-muted-foreground">Next action</p><h2 className="mt-0.5 text-sm font-semibold text-foreground">Keep work moving</h2></div></div><p className="mt-4 text-sm leading-6 text-muted-foreground">{summary.pending_drafts ? `${summary.pending_drafts} submitted document${summary.pending_drafts === 1 ? ' is' : 's are'} waiting in the review queue.` : 'The approval queue is clear. New submissions will appear here.'}</p>{has('governance.read') && <Link to="/governance/pending-drafts" className="mt-4 flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-xs font-bold text-foreground transition hover:bg-surface-soft"><span>Open approval inbox</span><ArrowRight size={15} className="text-warning" /></Link>}</article>
      </div>
    </section>

    <footer className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-border bg-surface px-4 py-3 text-xs text-muted"><span className="inline-flex items-center gap-2"><CheckCircle2 size={14} className="text-success" /> Source storage secured</span><span className="inline-flex items-center gap-2"><ShieldCheck size={14} className="text-primary" /> Department-aware access active</span><span className="inline-flex items-center gap-2"><Activity size={14} className="text-info" /> Workflow monitoring enabled</span></footer>
  </div>
}
