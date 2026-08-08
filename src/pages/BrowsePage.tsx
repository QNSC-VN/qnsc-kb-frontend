import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { browseKnowledge } from '../api/knowledge'
import type { BrowseResponse } from '../types/search'

export default function BrowsePage() {
  const [params] = useSearchParams(); const [data, setData] = useState<BrowseResponse | null>(null)
  useEffect(() => { void browseKnowledge({ dept: params.get('dept') || undefined }).then(setData).catch(console.error) }, [params])
  const departmentCounts = useMemo(() => data ? data.articles.reduce<Record<string, number>>((counts, article) => {
    const departments = article.departments?.map(item => item.name) || [article.dept]
    departments.forEach(department => { counts[department] = (counts[department] || 0) + 1 })
    return counts
  }, {}) : {}, [data])
  if (!data) return <div className="p-8 text-slate-400">Loading knowledge library…</div>
  return <div className="mx-auto max-w-6xl space-y-6"><div><h1 className="text-3xl font-extrabold text-white">Knowledge library</h1><p className="mt-1 text-slate-400">Browse synchronized knowledge by department.</p></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{Object.entries(departmentCounts).map(([dept, count]) => <Link key={dept} to={`/browse?dept=${encodeURIComponent(dept)}`} className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 transition hover:border-brand-500/50"><h2 className="font-bold text-white">{dept}</h2><p className="mt-2 text-sm text-slate-400">{count} document{count === 1 ? '' : 's'}</p></Link>)}</div><section className="space-y-3"><h2 className="text-lg font-bold text-white">{data.articles.length} documents</h2>{data.articles.map(article => <Link key={article.id} to={`/articles/${article.id}`} className="block rounded-xl border border-slate-800 bg-slate-900/20 p-4 hover:border-brand-500/50"><div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase text-brand-400">{(article.departments?.map(item => item.name) || [article.dept]).map(department => <span key={department}>{department}</span>)}{article.tags?.map(tag => <span key={tag} className="text-slate-400">#{tag}</span>)}</div><h3 className="mt-1 font-semibold text-white">{article.title}</h3><p className="mt-1 text-xs text-slate-500">{article.owner || 'Unassigned'} · v{article.version}</p></Link>)}</section></div>
}
