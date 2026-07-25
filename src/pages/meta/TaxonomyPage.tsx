import React, { useEffect, useState } from 'react'
import { FolderTree, Layers, Network, RefreshCw } from 'lucide-react'
import { getTaxonomy } from '../../api/search'

export default function TaxonomyPage() {
  const [taxonomy, setTaxonomy] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)

  const fetchTaxonomyStructure = async () => {
    setLoading(true)
    try {
      const data = await getTaxonomy()
      setTaxonomy(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTaxonomyStructure()
  }, [])

  const taxEntries = Object.entries(taxonomy)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <FolderTree size={28} className="text-brand-500" />
            <span>Taxonomy Hierarchy</span>
          </h1>
          <p className="text-slate-400 mt-1">Structure mapping departments to operational domains</p>
        </div>
        <button
          onClick={fetchTaxonomyStructure}
          className="p-2 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500 mr-3" />
          <span>Analyzing taxonomy index...</span>
        </div>
      ) : taxEntries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-850 p-12 text-center bg-slate-900/5 text-slate-500 text-xs">
          Taxonomy maps are empty. Once published articles record departments and domains, they will index here.
        </div>
      ) : (
        <div className="space-y-5">
          {taxEntries.map(([dept, domains]) => (
            <div
              key={dept}
              className="rounded-xl border border-slate-800 bg-slate-900/10 p-6 space-y-4 shadow-sm"
            >
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                <div className="h-8 w-8 rounded-lg bg-brand-600/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                  <Network size={16} />
                </div>
                <h3 className="text-base font-extrabold text-white">{dept}</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {domains.map((dom, dIdx) => (
                  <div
                    key={dIdx}
                    className="bg-slate-950/60 rounded-lg p-3 text-xs text-slate-300 font-semibold border border-slate-900 text-center truncate shadow-sm hover:border-slate-800 transition-all"
                  >
                    {dom}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
