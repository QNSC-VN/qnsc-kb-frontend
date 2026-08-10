import React, { useEffect, useState } from 'react'
import { ExternalLink, FileText, FolderOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getSources } from '../api/knowledge'
import type { SourceRecord } from '../types/knowledge'
import PageHeader from '../components/ui/PageHeader'

export default function SourcesPage() {
  const [sources, setSources] = useState<SourceRecord[] | null>(null)
  useEffect(() => { void getSources().then(setSources).catch(console.error) }, [])
  if (!sources) return <div className="mx-auto max-w-6xl p-8 text-muted-foreground">Loading source registry…</div>

  return (
    <div className="page-shell page-stack">
      <PageHeader eyebrow="Traceability" title="Sources & files" description="Every article stays connected to the originating document, system, and source record." icon={FolderOpen} actions={<span className="rounded-full border border-border bg-surface/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground">{sources.length} sources</span>} />
      <div className="grid gap-3">
        {sources.length === 0 ? <div className="glass-panel rounded-2xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">No source records have been indexed yet.</div> : sources.map(source => <div key={source.id} className="glass-panel interactive-lift flex flex-col justify-between gap-4 rounded-2xl border border-border p-4 sm:flex-row sm:items-center"><div className="flex min-w-0 items-center gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-info/10 text-info"><FileText size={18} /></div><div className="min-w-0"><div className="truncate text-sm font-bold text-foreground">{source.filename || source.source_ref}</div><div className="mt-1 text-xs text-muted">{source.source_system} · {source.mime_type || 'unknown type'}</div></div></div><Link to={`/articles/${source.article_id}`} className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-primary hover:text-info">{source.article_title} <ExternalLink size={13} /></Link></div>)}
      </div>
    </div>
  )
}
