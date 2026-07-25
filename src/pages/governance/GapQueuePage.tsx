import React, { useEffect, useState } from 'react'
import { AlertCircle, UserPlus, Trash2, RefreshCw } from 'lucide-react'
import { getSearchGaps, assignSearchGap, dismissSearchGap } from '../../api/governance'

export default function GapQueuePage() {
  const [gaps, setGaps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actingGapId, setActingGapId] = useState<string | null>(null)

  // Assignment Modal
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedGap, setSelectedGap] = useState<any>(null)
  const [assignDept, setAssignDept] = useState('Engineering')

  const fetchGaps = async () => {
    setLoading(true)
    try {
      const data = await getSearchGaps('open')
      setGaps(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGaps()
  }, [])

  const handleAssignClick = (gap: any) => {
    setSelectedGap(gap)
    setShowAssignModal(true)
  }

  const handleConfirmAssign = async () => {
    if (!selectedGap) return
    setActingGapId(selectedGap.id)
    setShowAssignModal(false)
    try {
      await assignSearchGap(selectedGap.id, assignDept)
      setGaps(gaps.filter(g => g.id !== selectedGap.id))
    } catch (err) {
      console.error(err)
      alert('Failed to assign gap')
    } finally {
      setActingGapId(null)
      setSelectedGap(null)
    }
  }

  const handleDismiss = async (gapId: string) => {
    setActingGapId(gapId)
    try {
      await dismissSearchGap(gapId)
      setGaps(gaps.filter(g => g.id !== gapId))
    } catch (err) {
      console.error(err)
      alert('Failed to dismiss gap')
    } finally {
      setActingGapId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Search Gaps</h1>
          <p className="text-slate-400 mt-1">Queries yielding zero results logged for human resolution</p>
        </div>
        <button
          onClick={fetchGaps}
          className="p-2 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500 mr-3" />
          <span>Analyzing search log queries...</span>
        </div>
      ) : gaps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-850 p-12 text-center bg-slate-900/5">
          <AlertCircle className="mx-auto text-slate-600 mb-3" size={40} />
          <h3 className="text-md font-semibold text-white">No search gaps logged</h3>
          <p className="text-slate-500 text-xs mt-1">Excellent! All recent employee queries have successfully resolved to articles in the KB.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {gaps.map((gap) => (
            <div
              key={gap.id}
              className="rounded-xl border border-slate-800 bg-slate-900/10 p-5 flex items-center justify-between shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-white bg-slate-950 px-2.5 py-1 rounded-md border border-slate-850">
                    "{gap.query}"
                  </span>
                  <span className="bg-brand-500/10 text-brand-400 border border-brand-500/10 px-2 py-0.5 rounded text-[10px] font-semibold">
                    Misses: {gap.count}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">First logged on {new Date(gap.created_at).toLocaleDateString()}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAssignClick(gap)}
                  disabled={actingGapId === gap.id}
                  className="px-3.5 py-2 bg-brand-600/10 hover:bg-brand-600 hover:text-white border border-brand-500/20 text-brand-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <UserPlus size={14} />
                  <span>Assign</span>
                </button>
                <button
                  onClick={() => handleDismiss(gap.id)}
                  disabled={actingGapId === gap.id}
                  className="p-2 bg-slate-800/60 text-slate-400 border border-slate-800 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                  title="Dismiss Gap"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedGap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Assign Query Gap</h3>
            <p className="text-xs text-slate-400">Route this missing content request to a specific organizational department:</p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Department</label>
              <select
                value={assignDept}
                onChange={(e) => setAssignDept(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white outline-none focus:border-brand-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Security">Security</option>
                <option value="Human Resources">HR</option>
                <option value="Legal">Legal</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedGap(null)
                }}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssign}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white rounded-lg shadow-lg shadow-brand-600/20 transition-all"
              >
                Confirm Route
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
