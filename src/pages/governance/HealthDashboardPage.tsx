import React, { useEffect, useState } from 'react'
import { Activity, Layers, AlertTriangle, ShieldCheck, HelpCircle, BarChart3, TrendingUp, RefreshCw } from 'lucide-react'
import { getHealthMetrics, getEvalRuns, verifyReviewDeadlines } from '../../api/governance'

export default function HealthDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [evalRuns, setEvalRuns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [verifyingReviews, setVerifyingReviews] = useState(false)

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const m = await getHealthMetrics()
      setMetrics(m)

      const ev = await getEvalRuns()
      setEvalRuns(ev)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const runReviewScan = async () => {
    setVerifyingReviews(true)
    try {
      await verifyReviewDeadlines()
      await fetchDashboardData()
    } finally {
      setVerifyingReviews(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500 mr-3" />
        <span>Compiling performance benchmarks...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">KB Health Dashboard</h1>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-slate-400 mt-1">Live metrics, governance audits, and offline RAG evaluation scores</p>
          <button onClick={() => void runReviewScan()} disabled={verifyingReviews} className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-brand-500/50 hover:text-white disabled:opacity-50">
            <RefreshCw size={14} className={verifyingReviews ? 'animate-spin' : ''} />
            {verifyingReviews ? 'Checking reviews…' : 'Check review deadlines'}
          </button>
        </div>
      </div>

      {/* Grid of stats */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {/* Card 1 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 space-y-2">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Articles</span>
              <Layers size={16} />
            </div>
            <div className="text-2xl font-extrabold text-white">{metrics.total_articles}</div>
            <div className="text-[10px] text-slate-500">Published documents</div>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 space-y-2">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Owner Coverage</span>
              <ShieldCheck size={16} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400">{metrics.percent_with_owner?.toFixed(0)}%</div>
            <div className="text-[10px] text-slate-500">Articles with registered owner</div>
          </div>

          {/* Card 3 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 space-y-2">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Overdue Review</span>
              <AlertTriangle size={16} className="text-rose-400" />
            </div>
            <div className="text-2xl font-extrabold text-rose-400">{metrics.percent_overdue?.toFixed(0)}%</div>
            <div className="text-[10px] text-slate-500">Awaiting governance review</div>
          </div>

          {/* Card 4 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 space-y-2">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Gaps</span>
              <HelpCircle size={16} className="text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400">{metrics.open_gaps}</div>
            <div className="text-[10px] text-slate-500">Unanswered search queries</div>
          </div>

          {/* Card 5 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 space-y-2">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Helpful Rate</span>
              <TrendingUp size={16} className="text-brand-400" />
            </div>
            <div className="text-2xl font-extrabold text-brand-400">{metrics.helpful_rate?.toFixed(0)}%</div>
            <div className="text-[10px] text-slate-500">Thumbs-up feedback ratio</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 space-y-2">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Search Miss Rate</span>
              <Activity size={16} className="text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400">{metrics.search_miss_rate?.toFixed(0)}%</div>
            <div className="text-[10px] text-slate-500">Queries with no authorized results</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 space-y-2">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">API Error Rate</span>
              <AlertTriangle size={16} className="text-rose-400" />
            </div>
            <div className="text-2xl font-extrabold text-rose-400">{metrics.api_error_rate?.toFixed(1)}%</div>
            <div className="text-[10px] text-slate-500">Persisted request telemetry</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 space-y-2">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">API P95</span>
              <Activity size={16} className="text-brand-400" />
            </div>
            <div className="text-2xl font-extrabold text-brand-400">{metrics.api_p95_latency_ms?.toFixed(0)}ms</div>
            <div className="text-[10px] text-slate-500">All recorded API requests</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 space-y-2">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">AI Tokens</span>
              <BarChart3 size={16} className="text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400">{metrics.ai_tokens_total?.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">{metrics.ai_requests || 0} logged AI requests</div>
          </div>
        </div>
      )}

      {/* RAG evaluation runs */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <BarChart3 size={18} className="text-brand-400" />
          <span>Offline RAG Evaluation Runs</span>
        </h2>
        
        {evalRuns.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-850 p-8 text-center bg-slate-900/5 text-slate-500 text-xs">
            No offline evaluation data found. Trigger eval suites in the background.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/20">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <th className="p-3.5 font-semibold">Evaluation Target</th>
                  <th className="p-3.5 font-semibold">Context Recall</th>
                  <th className="p-3.5 font-semibold">Faithfulness</th>
                  <th className="p-3.5 font-semibold">Correctness</th>
                  <th className="p-3.5 font-semibold">Executed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {evalRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5 font-mono">
                      {run.question?.question ? `Q: "${run.question.question}"` : 'Global Target'}
                    </td>
                    <td className={`p-3.5 font-bold ${run.context_recall >= 0.8 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {(run.context_recall * 100).toFixed(0)}%
                    </td>
                    <td className={`p-3.5 font-bold ${run.faithfulness >= 0.8 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {(run.faithfulness * 100).toFixed(0)}%
                    </td>
                    <td className={`p-3.5 font-bold ${run.answer_correctness >= 0.8 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {(run.answer_correctness * 100).toFixed(0)}%
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(run.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
