import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, FileText, GitMerge, Scissors, Trash2, Type } from 'lucide-react'
import { commitDraftCandidates, getDraftCandidates, reviewDraftCandidate } from '../../api/governance'
import { useDialog } from '../../components/ui/DialogProvider'

type Candidate = {
  id: string
  position: number
  title: string
  body_md: string
  source_start: number
  source_end: number
  heading?: string | null
  status: string
  review_note?: string | null
}

export default function BatchReviewPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const dialog = useDialog()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try { setCandidates(await getDraftCandidates(id)); setError('') } catch { setError('Could not load split candidates.') } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [id])

  const active = candidates.filter(item => item.status === 'candidate')
  const operate = async (payload: Parameters<typeof reviewDraftCandidate>[1]) => {
    setBusy(true)
    try { setCandidates(await reviewDraftCandidate(id, payload)) } catch (requestError: any) { await dialog.alert(requestError?.response?.data?.detail || 'The candidate operation failed.', { title: 'Batch review failed', tone: 'danger' }) } finally { setBusy(false) }
  }
  const rename = async (candidate: Candidate) => {
    const title = (await dialog.prompt('Candidate title:', { title: 'Rename candidate', defaultValue: candidate.title, confirmLabel: 'Rename' }))?.trim()
    if (title) await operate({ operation: 'rename', candidate_id: candidate.id, title })
  }
  const split = async (candidate: Candidate) => {
    const raw = await dialog.prompt(`Split position in characters (1-${candidate.body_md.length - 1}):`, { title: 'Split candidate', defaultValue: String(Math.floor(candidate.body_md.length / 2)), confirmLabel: 'Split', validate: value => Number.isInteger(Number(value)) && Number(value) > 0 && Number(value) < candidate.body_md.length ? undefined : 'Enter a whole-number position inside the candidate.' })
    const splitAt = Number(raw)
    if (Number.isInteger(splitAt) && splitAt > 0) await operate({ operation: 'split', candidate_id: candidate.id, split_at: splitAt })
  }
  const merge = async (candidate: Candidate) => {
    const next = active.find(item => item.position > candidate.position)
    if (!next) return
    await operate({ operation: 'merge', candidate_id: candidate.id, other_candidate_id: next.id })
  }
  const discard = async (candidate: Candidate) => {
    if (await dialog.confirm(`Discard “${candidate.title}”?`, { title: 'Discard candidate', confirmLabel: 'Discard', tone: 'danger' })) await operate({ operation: 'discard', candidate_id: candidate.id })
  }
  const commit = async () => {
    if (!active.length) return
    if (!(await dialog.confirm(`Commit ${active.length} reviewed candidate${active.length === 1 ? '' : 's'} as independent drafts?`, { title: 'Commit split output', confirmLabel: 'Create drafts', tone: 'success' }))) return
    setBusy(true)
    try { await commitDraftCandidates(id); await dialog.alert('The reviewed candidates are now independent drafts in the approval queue.', { title: 'Batch review committed', tone: 'success' }); navigate('/governance/pending-drafts') } catch (requestError: any) { await dialog.alert(requestError?.response?.data?.detail || 'The candidates could not be committed.', { title: 'Commit failed', tone: 'danger' }) } finally { setBusy(false) }
  }

  return <main className="page-shell page-stack p-3 text-ink sm:p-4 lg:p-0">
    <header className="page-hero glass-panel rounded-panel border border-border p-5 sm:p-6">
      <button type="button" onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-stone hover:text-ink"><ArrowLeft size={14} /> Back to pending drafts</button>
      <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-stone"><FileText size={14} className="text-cyan" /> F23 / F24 document operations</div><h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">Batch review</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-steel">Review the structure-aware candidates before they become independent knowledge Articles. Source positions remain attached to each candidate.</p></div><button type="button" onClick={() => void commit()} disabled={busy || !active.length} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-50"><CheckCircle2 size={15} /> Commit reviewed drafts</button></div>
    </header>
    {error && <div className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
    {loading ? <div className="rounded-xl border border-border p-8 text-sm text-stone">Loading candidates…</div> : <section className="space-y-3">{candidates.map(candidate => <article key={candidate.id} className={`rounded-2xl border p-4 ${candidate.status === 'candidate' ? 'border-border bg-surface' : 'border-border/50 bg-surface/40 opacity-60'}`}><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-stone"><span>Candidate {candidate.position}</span><span>Chars {candidate.source_start}–{candidate.source_end}</span>{candidate.heading && <span className="text-cyan">{candidate.heading}</span>}<span className={candidate.status === 'candidate' ? 'text-emerald-300' : 'text-stone'}>{candidate.status}</span></div><h2 className="mt-2 text-base font-bold text-foreground">{candidate.title}</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-steel">{candidate.body_md}</p>{candidate.review_note && <p className="mt-2 text-xs text-stone">{candidate.review_note}</p>}</div>{candidate.status === 'candidate' && <div className="flex shrink-0 flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => void rename(candidate)} className="mm-secondary inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold"><Type size={13} /> Rename</button><button type="button" disabled={busy} onClick={() => void split(candidate)} className="mm-secondary inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold"><Scissors size={13} /> Split</button><button type="button" disabled={busy || !active.some(item => item.position > candidate.position)} onClick={() => void merge(candidate)} className="mm-secondary inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold"><GitMerge size={13} /> Merge next</button><button type="button" disabled={busy} onClick={() => void discard(candidate)} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/25 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/10"><Trash2 size={13} /> Discard</button></div>}</div></article>)}</section>}
  </main>
}
