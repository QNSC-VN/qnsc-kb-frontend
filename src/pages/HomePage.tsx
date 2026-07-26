import React, { useEffect, useState } from 'react'
import { Activity, ArrowRight, BookOpen, FolderTree, Search, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getHomeSummary } from '../api/knowledge'
import type { HomeSummary } from '../types/governance'

export default function HomePage() {
  const [summary, setSummary] = useState<HomeSummary | null>(null)
  useEffect(() => { void getHomeSummary().then(setSummary).catch(console.error) }, [])
  if (!summary) return <div className="p-8 text-slate-400">Loading knowledge dashboard…</div>
  const metrics = [['Documents', summary.total_articles, BookOpen], ['Departments', summary.departments, FolderTree], ['Needs review', summary.needs_review, Activity], ['Open gaps', summary.open_gaps, Search]] as const
  return <div className="mx-auto max-w-6xl space-y-8">
    <div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-400">QNSC Knowledge Base</p><h1 className="mt-2 text-3xl font-extrabold text-white">The company’s trusted memory</h1><p className="mt-2 max-w-2xl text-slate-400">Curated knowledge for decisions, procedures, engineering, and everyday work—grounded in source documents.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(([label, value, Icon]) => <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5"><Icon size={18} className="text-brand-400"/><div className="mt-4 text-3xl font-bold text-white">{value}</div><div className="mt-1 text-xs uppercase tracking-wider text-slate-500">{label}</div></div>)}</div>
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="rounded-xl border border-slate-800 bg-slate-900/30 p-6"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-white">Recently reviewed</h2><Link to="/articles" className="text-xs font-semibold text-brand-400">All articles <ArrowRight size={13} className="inline"/></Link></div><div className="space-y-3">{summary.recent.map(article => <Link key={article.id} to={`/articles/${article.id}`} className="block rounded-lg border border-slate-800/70 p-4 transition hover:border-brand-500/50"><div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold text-brand-400">{article.type} · {article.dept}</span>{article.needs_update && <span className="text-[10px] font-bold uppercase text-amber-400">Needs review</span>}</div><h3 className="mt-1 font-semibold text-white">{article.title}</h3><p className="mt-1 text-xs text-slate-500">{article.domain} · {article.owner || 'Unassigned'}</p></Link>)}</div></section>
      <section className="rounded-xl border border-slate-800 bg-slate-900/30 p-6"><h2 className="font-bold text-white">Governance pulse</h2><div className="mt-5 space-y-4"><div className="flex items-center gap-3"><ShieldCheck className="text-emerald-400" size={18}/><div><div className="text-sm text-white">{summary.with_owner_percent}% owner coverage</div><div className="text-xs text-slate-500">Every authoritative article should have an owner.</div></div></div><div className="border-t border-slate-800 pt-4 text-sm text-slate-300">{summary.pending_drafts} pending drafts awaiting review</div><div className="text-sm text-slate-300">{summary.domains} active knowledge domains</div><Link to="/governance/health" className="inline-block pt-2 text-xs font-semibold text-brand-400">Open KB Health →</Link></div></section>
    </div>
  </div>
}
