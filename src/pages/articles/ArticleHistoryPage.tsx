import React from 'react'
import { ArrowLeft, Clock, History, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader'

export default function ArticleHistoryPage() {
  return (
    <div className="page-shell page-stack">
      <PageHeader eyebrow="Document governance" title="Article history" description="Version snapshots and review events will appear here as this document changes." icon={History} actions={<Link to="/articles" className="mm-secondary flex items-center gap-2 px-3 py-2 text-xs font-semibold"><ArrowLeft size={15} /> Back to library</Link>} />
      <div className="glass-panel rounded-2xl border border-dashed border-border px-6 py-16 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Clock size={24} /></div>
        <h2 className="mt-4 font-display text-lg font-bold text-foreground">No version events to display</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">When edits, approvals, or published revisions are recorded, this timeline will keep the story of the document easy to audit.</p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted"><LockKeyhole size={13} /> History is append-only</div>
      </div>
    </div>
  )
}
