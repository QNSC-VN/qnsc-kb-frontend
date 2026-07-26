import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { browseKnowledge } from '../api/knowledge'
import type { BrowseResponse } from '../types/search'

export default function BrowsePage() {
  const [params] = useSearchParams(); const [data, setData] = useState<BrowseResponse | null>(null)
  useEffect(() => { void browseKnowledge({ dept: params.get('dept') || undefined, domain: params.get('domain') || undefined }).then(setData).catch(console.error) }, [params])
  if (!data) return <div className="p-8 text-slate-400">Loading knowledge library…</div>
  return <div className="mx-auto max-w-6xl space-y-6"><div><h1 className="text-3xl font-extrabold text-white">Knowledge library</h1><p className="mt-1 text-slate-400">Browse by department and domain.</p></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{Object.entries(data.taxonomy).map(([dept, domains]) => <div key={dept} className="rounded-xl border border-slate-800 bg-slate-900/30 p-5"><h2 className="font-bold text-white">{dept}</h2><div className="mt-4 space-y-2">{Object.entries(domains).map(([domain, count]) => <Link key={domain} to={`/browse?dept=${encodeURIComponent(dept)}&domain=${encodeURIComponent(domain)}`} className="flex items-center justify-between rounded-lg bg-slate-950/50 px-3 py-2 text-sm text-slate-300 hover:text-white"><span>{domain}</span><span className="text-xs text-slate-500">{count}</span></Link>)}</div></div>)}</div><section className="space-y-3"><h2 className="text-lg font-bold text-white">{data.articles.length} documents</h2>{data.articles.map(article => <Link key={article.id} to={`/articles/${article.id}`} className="block rounded-xl border border-slate-800 bg-slate-900/20 p-4 hover:border-brand-500/50"><div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase text-brand-400"><span>{article.type}</span><span>{article.sensitivity}</span><span>{article.dept}</span></div><h3 className="mt-1 font-semibold text-white">{article.title}</h3><p className="mt-1 text-xs text-slate-500">{article.domain} · {article.owner || 'Unassigned'} · v{article.version}</p></Link>)}</section></div>
}
