import React, { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, BookOpen, Layers, Library } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { browseKnowledge } from '../api/knowledge'
import type { BrowseResponse } from '../types/search'
import PageHeader from '../components/ui/PageHeader'

export default function BrowsePage() {
  const [params] = useSearchParams(); const [data, setData] = useState<BrowseResponse | null>(null)
  useEffect(() => { void browseKnowledge({ dept: params.get('dept') || undefined }).then(setData).catch(console.error) }, [params])
  const departmentCounts = useMemo(() => data ? data.articles.reduce<Record<string, number>>((counts, article) => { const departments = article.departments?.map(item => item.name) || [article.dept]; departments.forEach(department => { counts[department] = (counts[department] || 0) + 1 }); return counts }, {}) : {}, [data])
  if (!data) return <div className="mx-auto max-w-6xl p-8 text-muted-foreground">Loading knowledge library…</div>

  return (
    <div className="page-shell page-stack">
      <PageHeader eyebrow="Knowledge library" title="Browse the workspace" description="Explore synchronized knowledge by department, topic, and source." icon={Library} actions={<div className="flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground"><span className="h-2 w-2 rounded-full bg-success" /> {data.articles.length} documents</div>} />
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(departmentCounts).map(([dept, count]) => <Link key={dept} to={`/browse?dept=${encodeURIComponent(dept)}`} className="glass-panel interactive-lift group rounded-2xl border border-border p-5"><div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-info/10 text-info"><Layers size={18} /></span><ArrowUpRight size={16} className="text-muted group-hover:text-primary" /></div><h2 className="mt-5 font-display text-lg font-bold text-foreground">{dept}</h2><p className="mt-1 text-sm text-muted-foreground">{count} document{count === 1 ? '' : 's'} in this stream</p></Link>)}
      </section>
      <section className="space-y-4">
        <div className="flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">Indexed knowledge</p><h2 className="mt-1 font-display text-xl font-bold text-foreground">Latest documents</h2></div><span className="text-xs text-muted-foreground">{params.get('dept') || 'All departments'}</span></div>
        <div className="grid gap-3 md:grid-cols-2">
          {data.articles.map(article => <Link key={article.id} to={`/articles/${article.id}`} className="glass-panel interactive-lift group rounded-2xl border border-border p-5"><div className="flex items-center justify-between gap-3"><div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[.1em] text-primary">{(article.departments?.map(item => item.name) || [article.dept]).map(department => <span key={department} className="rounded-full bg-primary/10 px-2 py-1">{department}</span>)}{article.tags?.slice(0, 2).map(tag => <span key={tag} className="rounded-full bg-surface-muted px-2 py-1 text-muted">#{tag}</span>)}</div><ArrowUpRight size={16} className="shrink-0 text-muted group-hover:text-primary" /></div><h3 className="mt-4 font-display font-bold text-foreground">{article.title}</h3><div className="mt-3 flex items-center gap-2 text-xs text-muted"><BookOpen size={13} /> {article.owner || 'Unassigned'} · v{article.version}</div></Link>)}
        </div>
      </section>
    </div>
  )
}
