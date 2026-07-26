import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, ArrowLeftRight, Check, ChevronRight, Clock3, Eye,
  FileCheck2, FileText, RefreshCw, Search, Sparkles, X,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  approveDraft, getDraftComparison, getPendingDrafts, rejectDraft, restructureDraft,
} from '../../api/governance'
import { useDialog } from '../../components/ui/DialogProvider'

const similarityStyles: Record<string, string> = {
  very_high: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  partial: 'border-cyan/30 bg-cyan/10 text-cyan',
  exact: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
}

type Draft = {
  id: string
  title: string
  source_ref: string
  summary?: string
  restructured_body_md?: string
  restructure_status?: string
  restructure_model?: string
  restructure_error?: string
  created_at: string
  similarity_level?: string
  similarity_matches?: { article_id: string; title: string; score: number; lifecycle_status?: string }[]
  requires_update_confirmation?: boolean
}

type ComparedArticle = {
  id: string
  title: string
  body_md: string
  version: number
  status: string
  lifecycle_status: string
}

export default function PendingDraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [actingDraftId, setActingDraftId] = useState<string | null>(null)
  const [restructuringDraftId, setRestructuringDraftId] = useState<string | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null)
  const [comparedArticle, setComparedArticle] = useState<ComparedArticle | null>(null)
  const [compareArticleId, setCompareArticleId] = useState('')
  const [compareLoading, setCompareLoading] = useState(false)
  const [reviewTab, setReviewTab] = useState<'structured' | 'original'>('structured')
  const [docType, setDocType] = useState('SOP')
  const [docDept, setDocDept] = useState('Engineering')
  const [updateArticleId, setUpdateArticleId] = useState('')
  const [treatAsNew, setTreatAsNew] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const dialog = useDialog()

  const fetchDrafts = async () => {
    setLoading(true)
    try { setDrafts(await getPendingDrafts('pending')) } catch { setError('Could not load the review queue.') } finally { setLoading(false) }
  }

  useEffect(() => { void fetchDrafts() }, [])

  const filteredDrafts = useMemo(() => drafts.filter((draft) => {
    const haystack = `${draft.title} ${draft.source_ref} ${draft.summary || ''}`.toLowerCase()
    return !query.trim() || haystack.includes(query.toLowerCase())
  }), [drafts, query])
  const updateCount = drafts.filter(draft => draft.requires_update_confirmation).length
  const relatedCount = drafts.filter(draft => draft.similarity_level === 'partial').length
  const matches = selectedDraft?.similarity_matches || []
  const decisionReady = !selectedDraft?.requires_update_confirmation || Boolean(updateArticleId || treatAsNew)
  const hasReadingView = (draft: Draft | null | undefined) => Boolean(draft?.restructured_body_md)

  const loadComparison = async (draftId: string, articleId: string) => {
    setCompareArticleId(articleId)
    setCompareLoading(true)
    try {
      setComparedArticle(await getDraftComparison(draftId, articleId))
    } catch {
      setComparedArticle(null)
      setError('The similar article could not be loaded for comparison.')
    } finally { setCompareLoading(false) }
  }

  const openReview = (draft: Draft) => {
    setSelectedDraft(draft)
    setReviewOpen(true)
    setReviewTab('structured')
    setUpdateArticleId('')
    setTreatAsNew(false)
    setComparedArticle(null)
    const firstMatch = draft.similarity_matches?.[0]
    if (firstMatch) void loadComparison(draft.id, firstMatch.article_id)
  }

  const closeReview = () => {
    if (actingDraftId) return
    setReviewOpen(false)
    setSelectedDraft(null)
    setComparedArticle(null)
  }

  const handleConfirmApprove = async () => {
    if (!selectedDraft || !decisionReady) return
    setActingDraftId(selectedDraft.id)
    try {
      await approveDraft(selectedDraft.id, docType, docDept, updateArticleId || undefined, treatAsNew)
      setDrafts(current => current.filter(draft => draft.id !== selectedDraft.id))
      setMessage(`Published ${selectedDraft.title}.`)
      closeReview()
    } catch {
      await dialog.alert('The draft could not be approved. Check the update decision and try again.', { title: 'Approval failed' })
    } finally { setActingDraftId(null) }
  }

  const handleReject = async (draftId: string) => {
    if (!(await dialog.confirm('This removes the draft from the active review queue. The original upload remains stored.', { title: 'Reject draft', confirmLabel: 'Reject draft', tone: 'danger' }))) return
    setActingDraftId(draftId)
    try {
      await rejectDraft(draftId)
      setDrafts(current => current.filter(draft => draft.id !== draftId))
      setMessage('Draft rejected. The original source remains stored.')
      closeReview()
    } catch { await dialog.alert('The draft could not be rejected.', { title: 'Rejection failed' }) } finally { setActingDraftId(null) }
  }

  const handleRestructure = async (draft: Draft) => {
    setRestructuringDraftId(draft.id)
    try {
      const updated = await restructureDraft(draft.id)
      setDrafts(current => current.map(item => item.id === draft.id ? { ...item, ...updated } : item))
      setSelectedDraft(current => current && current.id === draft.id ? { ...current, ...updated } : current)
    } catch {
      await dialog.alert('The reading view could not be generated. The original source is still available and unchanged.', { title: 'Restructuring failed' })
    } finally { setRestructuringDraftId(null) }
  }

  const renderMarkdown = (content: string) => (
    <div className="prose prose-invert max-w-none text-sm leading-6 text-[#c4ceda] prose-headings:text-[#f1f5f9] prose-headings:font-semibold prose-a:text-cyan prose-blockquote:border-cyan/50 prose-blockquote:text-steel prose-code:text-cyan prose-strong:text-[#f1f5f9]">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )

  return (
    <main className="mx-auto max-w-6xl space-y-7 p-6 text-ink lg:p-8">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone"><FileCheck2 size={14} className="text-cyan" /> Content operations</div>
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">Pending drafts</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-steel">Open a focused review workspace to read the full upload, compare it with similar active articles, and make the version decision with confidence.</p>
        </div>
        <button onClick={() => void fetchDrafts()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-hairline bg-surface px-3 py-2 text-xs font-semibold text-steel transition hover:bg-surface-soft hover:text-ink"><RefreshCw size={14} /> Refresh queue</button>
      </header>

      {(message || error) && <div className={`rounded-lg border px-4 py-3 text-sm ${error ? 'border-rose-400/25 bg-rose-500/10 text-rose-200' : 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200'}`}>{error || message}</div>}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-hairline bg-surface p-4"><div className="flex items-center justify-between text-stone"><span className="text-xs font-medium">Awaiting review</span><Clock3 size={16} /></div><p className="mt-2 text-2xl font-semibold text-ink">{drafts.length}</p><p className="mt-1 text-[11px] text-stone">New source submissions</p></div>
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4"><div className="flex items-center justify-between text-amber-300"><span className="text-xs font-medium">Update decisions</span><AlertTriangle size={16} /></div><p className="mt-2 text-2xl font-semibold text-ink">{updateCount}</p><p className="mt-1 text-[11px] text-stone">High similarity documents</p></div>
        <div className="rounded-xl border border-cyan/20 bg-cyan/[0.06] p-4"><div className="flex items-center justify-between text-cyan"><span className="text-xs font-medium">Related sources</span><Sparkles size={16} /></div><p className="mt-2 text-2xl font-semibold text-ink">{relatedCount}</p><p className="mt-1 text-[11px] text-stone">Partial content overlap</p></div>
      </section>

      <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search drafts, filenames, or extracted text…" className="field pl-9" /></div>

      {loading ? <div className="grid min-h-56 place-items-center rounded-xl border border-hairline bg-surface text-sm text-steel"><RefreshCw size={16} className="mr-2 animate-spin" /> Loading review queue…</div> : filteredDrafts.length === 0 ? <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-hairline bg-surface/50 p-8 text-center"><div><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300"><Check size={24} /></div><h2 className="mt-4 text-base font-semibold">{drafts.length ? 'No drafts match your search' : 'Review queue is clear'}</h2><p className="mt-2 text-sm text-steel">{drafts.length ? 'Try a different title or filename.' : 'New uploads will appear here when they are ready for review.'}</p></div></div> : <div className="space-y-3">{filteredDrafts.map(draft => {
        const similarity = draft.similarity_level && draft.similarity_level !== 'none' ? draft.similarity_level : null
        const firstMatch = draft.similarity_matches?.[0]
        return <article key={draft.id} className="rounded-xl border border-[#344354] bg-[#17212b] p-5 shadow-sm transition hover:border-cyan/40 hover:bg-[#1b2733] hover:shadow-lg hover:shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex min-w-0 items-center gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-soft text-cyan"><FileText size={18} /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-sm font-semibold text-ink">{draft.title}</h2>{similarity && <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${similarityStyles[similarity] || similarityStyles.partial}`}>{similarity === 'very_high' ? 'Possible update' : 'Related content'}</span>}</div><p className="mt-1 truncate text-xs text-stone">{draft.source_ref} · {new Date(draft.created_at).toLocaleDateString()}</p></div></div><div className="flex flex-wrap justify-end gap-2"><button onClick={() => openReview(draft)} className="inline-flex items-center gap-1.5 rounded-lg bg-cyan px-3 py-2 text-xs font-semibold text-[#07131a] transition hover:bg-cyan/80"><Eye size={14} /> Open full review</button>{draft.restructure_status !== 'llm' && <button onClick={() => void handleRestructure(draft)} disabled={restructuringDraftId === draft.id} className="inline-flex items-center gap-1.5 rounded-lg border border-cyan/30 px-3 py-2 text-xs font-semibold text-cyan transition hover:bg-cyan/10 disabled:opacity-50"><Sparkles size={14} />{restructuringDraftId === draft.id ? 'Formatting…' : 'Retry AI format'}</button>}<button onClick={() => void handleReject(draft.id)} disabled={actingDraftId === draft.id} className="rounded-lg border border-hairline px-3 py-2 text-xs font-semibold text-steel transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-300 disabled:opacity-50">Reject</button></div></div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-steel">{firstMatch ? <><ArrowLeftRight size={13} className="text-amber-300" /><span>{Math.round(firstMatch.score * 100)}% similar to <strong className="font-medium text-amber-200">{firstMatch.title}</strong></span></> : <span>No significant overlap detected</span>}<span className="text-stone">·</span><span className={draft.restructure_status === 'llm' ? 'text-emerald-300' : hasReadingView(draft) ? 'text-cyan' : 'text-amber-300'}>{draft.restructure_status === 'llm' ? 'AI reading view ready' : hasReadingView(draft) ? 'Lossless reading view ready' : 'Original text retained'}</span></div>
          {draft.restructure_error && <p className="mt-2 line-clamp-2 text-xs text-amber-200/80">{draft.restructure_error}</p>}
        </article>
      })}</div>}

      {reviewOpen && selectedDraft && <div className="fixed inset-0 z-50 bg-black/75 p-2 backdrop-blur-sm sm:p-4"><section className="mx-auto flex h-[calc(100vh-1rem)] max-w-7xl flex-col overflow-hidden rounded-2xl border border-hairline bg-canvas shadow-2xl sm:h-[calc(100vh-2rem)]">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-hairline bg-surface px-4 py-3 sm:px-6"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-cyan/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-cyan">Review workspace</span>{selectedDraft.similarity_level === 'very_high' && <span className="rounded-full bg-amber-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-300">Possible update</span>}</div><h2 className="mt-2 truncate text-base font-semibold text-ink sm:text-lg">{selectedDraft.title}</h2><p className="mt-1 text-xs text-stone">{selectedDraft.source_ref} · Original upload remains unchanged</p></div><button onClick={closeReview} className="rounded-lg p-2 text-stone hover:bg-surface-soft hover:text-ink" title="Close review"><X size={18} /></button></header>
        {matches.length > 0 && <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-hairline bg-surface-soft px-4 py-2.5 sm:px-6"><span className="mr-1 text-[10px] font-semibold uppercase tracking-widest text-stone">Compare with</span>{matches.map(match => <button key={match.article_id} onClick={() => void loadComparison(selectedDraft.id, match.article_id)} className={`rounded-lg border px-2.5 py-1.5 text-left text-xs transition ${compareArticleId === match.article_id ? 'border-amber-300/40 bg-amber-400/10 text-amber-200' : 'border-hairline bg-canvas text-steel hover:border-amber-300/30 hover:text-ink'}`}><span className="font-semibold">{Math.round(match.score * 100)}%</span> · {match.title}</button>)}</div>}
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
          <section className="flex min-h-0 flex-col border-b border-hairline lg:border-b-0 lg:border-r"><div className="flex shrink-0 items-center justify-between border-b border-hairline px-4 py-2.5 sm:px-6"><div><p className="text-[10px] font-semibold uppercase tracking-widest text-cyan">Incoming document</p><p className={`mt-1 text-xs ${selectedDraft.restructure_status === 'llm' ? 'text-emerald-300' : hasReadingView(selectedDraft) ? 'text-cyan' : 'text-amber-300'}`}>{reviewTab === 'structured' ? (selectedDraft.restructure_status === 'llm' ? 'AI reading view' : hasReadingView(selectedDraft) ? 'Lossless reading view' : 'Original extracted text') : 'Original extracted text'}</p></div><div className="flex items-center gap-2"><div className="flex rounded-lg border border-hairline bg-surface p-0.5"><button onClick={() => setReviewTab('structured')} className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${reviewTab === 'structured' ? 'bg-cyan/15 text-cyan' : 'text-stone hover:text-ink'}`}>Reading view</button><button onClick={() => setReviewTab('original')} className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${reviewTab === 'original' ? 'bg-surface-soft text-ink' : 'text-stone hover:text-ink'}`}>Original</button></div>{selectedDraft.restructure_status !== 'llm' && <button onClick={() => void handleRestructure(selectedDraft)} disabled={restructuringDraftId === selectedDraft.id} className="inline-flex items-center gap-1 rounded-md border border-cyan/30 px-2 py-1 text-[11px] font-semibold text-cyan hover:bg-cyan/10 disabled:opacity-50"><Sparkles size={12} />{restructuringDraftId === selectedDraft.id ? 'Formatting…' : 'Retry AI'}</button>}</div></div>{selectedDraft.restructure_error && <div className="border-b border-amber-400/20 bg-amber-400/[0.06] px-4 py-2 text-[11px] leading-5 text-amber-200 sm:px-6">{selectedDraft.restructure_error}</div>}<div className="ask-scroll min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">{renderMarkdown(reviewTab === 'structured' ? (selectedDraft.restructured_body_md || selectedDraft.summary || 'No extracted text available.') : (selectedDraft.summary || 'No extracted text available.'))}</div></section>
          <section className="flex min-h-0 flex-col"><div className="flex shrink-0 items-center gap-3 border-b border-hairline px-4 py-2.5 sm:px-6"><ArrowLeftRight size={15} className="text-amber-300" /><div><p className="text-[10px] font-semibold uppercase tracking-widest text-amber-300">Existing active article</p><p className="mt-1 truncate text-xs text-steel">{comparedArticle?.title || (matches.length ? 'Loading comparison…' : 'No high-similarity article selected')}</p></div></div><div className="ask-scroll min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">{compareLoading ? <div className="flex h-full items-center justify-center text-sm text-steel"><RefreshCw size={16} className="mr-2 animate-spin" /> Loading existing article…</div> : comparedArticle ? <>{renderMarkdown(comparedArticle.body_md)}<div className="mt-6 border-t border-hairline pt-3 text-xs text-stone">Version {comparedArticle.version} · {comparedArticle.lifecycle_status}</div></> : <div className="flex h-full items-center justify-center text-center text-sm text-stone">{matches.length ? 'Select a similar article above to compare its full content.' : 'This draft has no high-similarity active article.'}</div>}</div></section>
        </div>
        <footer className="flex shrink-0 flex-col gap-3 border-t border-hairline bg-surface px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between"><div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{selectedDraft.requires_update_confirmation ? <><span className="text-xs font-semibold text-amber-200">Version decision:</span><button onClick={() => { setUpdateArticleId(compareArticleId || matches[0]?.article_id || ''); setTreatAsNew(false) }} className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${!treatAsNew && updateArticleId ? 'border-amber-300/40 bg-amber-400/10 text-amber-200' : 'border-hairline text-steel hover:bg-surface-soft'}`}>Update selected article</button><button onClick={() => { setTreatAsNew(true); setUpdateArticleId('') }} className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${treatAsNew ? 'border-cyan/30 bg-cyan/10 text-cyan' : 'border-hairline text-steel hover:bg-surface-soft'}`}>Publish as new</button></> : <span className="text-xs text-steel">Ready to publish as a new active document.</span>}<select value={docType} onChange={event => setDocType(event.target.value)} className="field w-32 py-1.5 text-xs"><option>SOP</option><option>POLICY</option><option>DECISION</option><option>FAQ</option><option>RCA</option><option>HOWTO</option><option>PLAYBOOK</option><option>REFERENCE</option></select><select value={docDept} onChange={event => setDocDept(event.target.value)} className="field w-36 py-1.5 text-xs"><option>Engineering</option><option>Security</option><option>Human Resources</option><option>Legal</option><option>Operations</option></select></div><div className="flex shrink-0 justify-end gap-2"><button onClick={() => void handleReject(selectedDraft.id)} disabled={Boolean(actingDraftId)} className="rounded-lg border border-rose-400/25 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-400/10 disabled:opacity-50">Reject</button><button onClick={() => void handleConfirmApprove()} disabled={!decisionReady || Boolean(actingDraftId)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"><Check size={14} />{actingDraftId ? 'Publishing…' : 'Publish document'}</button></div></footer>
      </section></div>}
    </main>
  )
}
