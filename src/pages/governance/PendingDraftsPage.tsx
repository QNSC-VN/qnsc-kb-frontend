import React, { useEffect, useState } from 'react'
import { Check, X, FileText, ExternalLink, RefreshCw } from 'lucide-react'
import { getPendingDrafts, approveDraft, rejectDraft } from '../../api/governance'

export default function PendingDraftsPage() {
  const [drafts, setDrafts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actingDraftId, setActingDraftId] = useState<string | null>(null)
  
  // Approvation modal states
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [selectedDraft, setSelectedDraft] = useState<any>(null)
  const [docType, setDocType] = useState('SOP')
  const [docDept, setDocDept] = useState('Engineering')

  const fetchDrafts = async () => {
    setLoading(true)
    try {
      const data = await getPendingDrafts('pending')
      setDrafts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDrafts()
  }, [])

  const handleApproveClick = (draft: any) => {
    setSelectedDraft(draft)
    setShowApproveModal(true)
  }

  const handleConfirmApprove = async () => {
    if (!selectedDraft) return
    setActingDraftId(selectedDraft.id)
    setShowApproveModal(false)
    try {
      await approveDraft(selectedDraft.id, docType, docDept)
      setDrafts(drafts.filter(d => d.id !== selectedDraft.id))
    } catch (err) {
      console.error(err)
      alert('Failed to approve draft')
    } finally {
      setActingDraftId(null)
      setSelectedDraft(null)
    }
  }

  const handleReject = async (draftId: string) => {
    if (!window.confirm('Are you sure you want to reject and archive this draft?')) return
    setActingDraftId(draftId)
    try {
      await rejectDraft(draftId)
      setDrafts(drafts.filter(d => d.id !== draftId))
    } catch (err) {
      console.error(err)
      alert('Failed to reject draft')
    } finally {
      setActingDraftId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Pending Drafts</h1>
          <p className="text-slate-400 mt-1">Review, categorize, and approve ingested document snippets</p>
        </div>
        <button
          onClick={fetchDrafts}
          className="p-2 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500 mr-3" />
          <span>Syncing queue with ingestion triggers...</span>
        </div>
      ) : drafts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-850 p-12 text-center bg-slate-900/5">
          <FileText className="mx-auto text-slate-600 mb-3" size={40} />
          <h3 className="text-md font-semibold text-white">Draft queue is empty</h3>
          <p className="text-slate-500 text-xs mt-1">No ingested source documents are currently awaiting manual governance reviews.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="rounded-xl border border-slate-800 bg-slate-900/10 p-5 space-y-4 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white leading-snug">{draft.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="truncate max-w-sm">{draft.source_ref}</span>
                    <span>•</span>
                    <span>Received {new Date(draft.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproveClick(draft)}
                    disabled={actingDraftId === draft.id}
                    className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                    title="Approve and Publish"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => handleReject(draft.id)}
                    disabled={actingDraftId === draft.id}
                    className="p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                    title="Reject and Dismiss"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="bg-slate-950/60 rounded-lg p-3 text-slate-400 text-sm leading-relaxed border border-slate-900/60 font-sans">
                {draft.summary || 'No summary overview provided.'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve details Modal */}
      {showApproveModal && selectedDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Approve and Publish Document</h3>
            <p className="text-xs text-slate-400">Specify categorization metadata for the published knowledge base article:</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white outline-none focus:border-brand-500"
                >
                  <option value="POLICY">Policy</option>
                  <option value="SOP">SOP</option>
                  <option value="DECISION">Decision Log</option>
                  <option value="FAQ">FAQ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Assigned Department</label>
                <select
                  value={docDept}
                  onChange={(e) => setDocDept(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white outline-none focus:border-brand-500"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Security">Security</option>
                  <option value="Human Resources">HR</option>
                  <option value="Legal">Legal</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setShowApproveModal(false)
                  setSelectedDraft(null)
                }}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white rounded-lg shadow-lg shadow-emerald-600/20 transition-all"
              >
                Approve & Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
