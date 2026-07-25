import React, { useEffect, useState } from 'react'
import { ClipboardList, ShieldAlert, RefreshCw } from 'lucide-react'
import { getAuditLogs } from '../../api/governance'

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const data = await getAuditLogs()
      setLogs(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <ClipboardList size={28} className="text-slate-400" />
            <span>Audit Trail Logs</span>
          </h1>
          <p className="text-slate-400 mt-1">Append-only log recording every create, update, delete, and permission change</p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500 mr-3" />
          <span>Retrieving security records...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-850 p-12 text-center bg-slate-900/5 text-slate-500 text-xs">
          No audit logs recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/20">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="p-3.5 font-semibold">User</th>
                <th className="p-3.5 font-semibold">Action</th>
                <th className="p-3.5 font-semibold">Target Entity</th>
                <th className="p-3.5 font-semibold">Entity Reference</th>
                <th className="p-3.5 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-350">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3.5 font-medium text-white">{log.user?.name || 'System Worker'}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                      log.action === 'create' || log.action === 'approve'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : log.action === 'delete' || log.action === 'reject'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 uppercase font-semibold text-[10px] text-slate-400">{log.target_type}</td>
                  <td className="p-3.5 font-mono text-slate-500">{log.target_id || 'N/A'}</td>
                  <td className="p-3.5 text-slate-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
