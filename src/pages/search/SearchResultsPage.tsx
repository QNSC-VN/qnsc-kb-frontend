import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, Filter, Layers, Shield, FileText, ArrowRight, X } from 'lucide-react'
import { search } from '../../api/search'
import { useLanguage } from '../../i18n/LanguageProvider'
import { requestContent } from '../../api/knowledge'

export default function SearchResultsPage() {
  const [query, setQuery] = useState('')
  const [dept, setDept] = useState('')
  const [sensitivity, setSensitivity] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [requested, setRequested] = useState(false)
  
  const navigate = useNavigate()
  const { t } = useLanguage()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)

    try {
      const data = await search({
        q: query,
        dept: dept || undefined,
        sensitivity: sensitivity || undefined,
        limit: 10
      })
      setResults(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setDept('')
    setSensitivity('')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <SearchIcon size={28} className="text-brand-500" />
          <span>{t('search.hybrid')}</span>
        </h1>
        <p className="text-slate-400 mt-1">{t('search.subtitle')}</p>
      </div>

      {/* Search Input and Filters Form */}
      <form onSubmit={handleSearch} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t('search.placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 rounded-lg border border-slate-800 bg-slate-950 py-3 px-4 text-white placeholder-slate-500 outline-none focus:border-brand-500 text-sm"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 rounded-lg transition-all text-sm flex items-center gap-2"
          >
            {loading ? t('search.searching') : t('nav.search')}
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/60">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Filter size={12} />
              <span>{t('search.filters')}</span>
            </span>
            
            {/* Department */}
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 py-1.5 px-2.5 text-slate-300 outline-none focus:border-brand-500"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Security">Security</option>
              <option value="Human Resources">HR</option>
              <option value="Legal">Legal</option>
              <option value="Operations">Operations</option>
            </select>

            {/* Sensitivity */}
            <select
              value={sensitivity}
              onChange={(e) => setSensitivity(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 py-1.5 px-2.5 text-slate-300 outline-none focus:border-brand-500"
            >
              <option value="">All Sensitivity</option>
              <option value="public">Public</option>
              <option value="internal">Internal</option>
              <option value="confidential">Confidential</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>

          {(dept || sensitivity) && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-0.5"
            >
              <X size={12} />
              <span>{t('search.reset')}</span>
            </button>
          )}
        </div>
      </form>

      {/* Results listing */}
      {loading ? (
        <div className="flex justify-center items-center h-48 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500 mr-3" />
          <span>Fusing keyword and embedding metrics...</span>
        </div>
      ) : searched && results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-850 p-12 text-center bg-slate-900/5">
          <Layers className="mx-auto text-slate-600 mb-3" size={40} />
          <h3 className="text-md font-semibold text-white">{t('search.noMatches')}</h3>
          <p className="text-slate-500 text-xs mt-1">No authorized document matched this query.</p>
          <button type="button" disabled={requested} onClick={() => void requestContent(query, dept || undefined).then(() => setRequested(true))} className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500 disabled:opacity-60">{requested ? 'Content request submitted' : 'Request this content'}</button>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((res, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/articles/${res.article_id}`)}
              className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-900/10 p-5 hover:bg-slate-900/30 hover:border-slate-700 transition-all duration-300 flex items-start justify-between gap-4"
            >
              <div className="space-y-2.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-slate-850 text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">
                    {res.type}
                  </span>
                  <span className="bg-slate-850 text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">
                    {res.dept}
                  </span>
                  {res.section_ref && (
                    <span className="bg-brand-500/10 text-brand-400 border border-brand-500/10 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                      {res.section_ref}
                    </span>
                  )}
                  {/* Score helper */}
                  <span className="text-[10px] text-slate-500 font-semibold ml-auto">
                    {t('search.matchStrength')}: {(res.score * 100).toFixed(0)}%
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors flex items-center gap-1.5">
                  <FileText size={16} />
                  <span>{res.title}</span>
                </h3>

                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap pl-5 border-l-2 border-slate-800">
                  {res.chunk_text}
                </p>
              </div>

              <div className="p-2 rounded-lg bg-slate-800/40 text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-all shrink-0 self-center">
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
