import React, { useEffect, useState } from 'react'
import { BookOpen, Compass, Search, RefreshCw } from 'lucide-react'
import { getGlossary } from '../../api/search'

export default function GlossaryPage() {
  const [glossary, setGlossary] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterText, setFilterText] = useState('')

  const fetchGlossaryList = async () => {
    setLoading(true)
    try {
      const data = await getGlossary()
      setGlossary(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGlossaryList()
  }, [])

  const filteredGlossary = glossary.filter(item => 
    item.term.toLowerCase().includes(filterText.toLowerCase()) || 
    item.definition.toLowerCase().includes(filterText.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Compass size={28} className="text-brand-500" />
            <span>Glossary Terms</span>
          </h1>
          <p className="text-slate-400 mt-1">Definitions of standardized company acronyms and definitions</p>
        </div>
        
        {/* Quick search inside glossary */}
        <div className="relative w-64 self-start sm:self-auto">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search glossary..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/60 py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500 mr-3" />
          <span>Syncing terms glossary...</span>
        </div>
      ) : filteredGlossary.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-850 p-12 text-center bg-slate-900/5 text-slate-500 text-xs">
          No matching glossary terms found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGlossary.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-900/10 p-5 space-y-2.5 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="bg-brand-500/10 text-brand-400 border border-brand-500/10 px-3 py-1 rounded-lg text-xs font-extrabold uppercase">
                  {item.term}
                </span>
              </div>
              <p className="text-slate-350 text-sm leading-relaxed leading-normal">
                {item.definition}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
