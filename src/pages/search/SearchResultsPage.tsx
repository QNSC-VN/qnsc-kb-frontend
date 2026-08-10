import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, Filter, Layers, Shield, FileText, ArrowRight, X, Sparkles } from 'lucide-react'
import { search } from '../../api/search'
import { listDepartments } from '../../api/auth'
import { useAuth } from '../../auth/useAuth'
import { useLanguage } from '../../i18n/LanguageProvider'
import { requestContent } from '../../api/knowledge'
import PageHeader from '../../components/ui/PageHeader'
import { Select } from '../../components/ui/Select'

export default function SearchResultsPage() {
  const [query, setQuery] = useState('')
  const [dept, setDept] = useState('')
  const [tag, setTag] = useState('')
  const [status, setStatus] = useState('published')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [requested, setRequested] = useState(false)
  const [departments, setDepartments] = useState<{ id: string; name: string; company_domain: string; active: boolean }[]>([])
  
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user } = useAuth()

  useEffect(() => {
    void listDepartments().then(setDepartments).catch((err) => console.error('Failed to load departments', err))
  }, [])

  const visibleDepartments = departments.filter(item => item.active && item.company_domain === user?.company_domain)

  useEffect(() => {
    if (dept && !visibleDepartments.some(item => item.name === dept)) setDept('')
  }, [dept, visibleDepartments])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)

    try {
      const data = await search({
        q: query,
        dept: dept || undefined,
        tag: tag.trim() || undefined,
        status: status || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo ? `${dateTo}T23:59:59` : undefined,
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
    setTag('')
    setStatus('published')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div className="page-shell page-stack">
      <PageHeader eyebrow="Discovery engine" title={t('search.hybrid')} description={t('search.subtitle')} icon={SearchIcon} actions={<span className="flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground"><Sparkles size={13} className="text-info" /> Hybrid retrieval</span>} />

      {/* Search Input and Filters Form */}
      <form onSubmit={handleSearch} className="glass-panel soft-grid space-y-4 rounded-2xl border border-border p-5 backdrop-blur-md sm:p-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t('search.placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="field flex-1 py-3"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="mm-primary flex items-center gap-2 px-6 text-sm font-semibold"
          >
            {loading ? t('search.searching') : t('nav.search')}
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-end justify-between gap-4 pt-3 border-t border-slate-800/60">
          <div className="grid w-full gap-3 text-xs sm:grid-cols-2 lg:grid-cols-5">
            <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-muted">
              <Filter size={12} />
              <span>{t('search.filters')}</span>
            </span>
            
            {/* Department */}
            <Select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="theme-select"
            >
              <option value="">All Departments</option>
              {visibleDepartments.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
            </Select>

            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Tag"
              className="field min-w-0"
              aria-label="Tag filter"
            />

            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="theme-select" aria-label="Status filter">
              <option value="published">Published</option>
              <option value="">Any status</option>
            </Select>

            <label className="text-muted">
              From
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="field mt-1 w-full" aria-label="Date from" />
            </label>

            <label className="text-muted">
              To
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="field mt-1 w-full" aria-label="Date to" />
            </label>

          </div>

          {(dept || tag || status !== 'published' || dateFrom || dateTo) && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-0.5 text-xs text-destructive hover:text-destructive/80"
            >
              <X size={12} />
              <span>{t('search.reset')}</span>
            </button>
          )}
        </div>
      </form>

      {/* Results listing */}
      {loading ? (
        <div className="glass-panel flex h-48 items-center justify-center rounded-2xl border border-border text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500 mr-3" />
          <span>Fusing keyword and embedding metrics...</span>
        </div>
      ) : searched && results.length === 0 ? (
          <div className="glass-panel rounded-2xl border border-dashed border-border bg-surface/30 p-12 text-center">
          <Layers className="mx-auto mb-3 text-muted" size={40} />
          <h3 className="text-md font-semibold text-foreground">{t('search.noMatches')}</h3>
          <p className="mt-1 text-xs text-muted-foreground">No authorized document matched this query.</p>
          <button type="button" disabled={requested} onClick={() => void requestContent(query, dept || undefined).then(() => setRequested(true))} className="mm-primary mt-5 px-4 py-2 text-xs font-semibold disabled:opacity-60">{requested ? 'Content request submitted' : 'Request this content'}</button>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((res, idx) => (
              <div
              key={idx}
              onClick={() => navigate(`/articles/${res.article_id}`)}
              className="glass-panel interactive-lift group flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-border p-5"
            >
              <div className="space-y-2.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground">
                    {res.dept}
                  </span>
                  {res.section_ref && (
                    <span className="rounded-full border border-primary/10 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                      {res.section_ref}
                    </span>
                  )}
                  {/* Score helper */}
                  <span className="ml-auto text-[10px] font-semibold text-muted">
                    {t('search.matchStrength')}: {(res.score * 100).toFixed(0)}%
                  </span>
                </div>

                <h3 className="flex items-center gap-1.5 text-base font-bold text-foreground transition-colors group-hover:text-primary">
                  <FileText size={16} />
                  <span>{res.title}</span>
                </h3>

                <p className="whitespace-pre-wrap border-l-2 border-border pl-5 text-sm leading-relaxed text-muted-foreground">
                  {res.chunk_text}
                </p>
                {res.source_url && <a href={res.source_url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="mt-3 inline-flex text-xs font-semibold text-info hover:underline">Open cited source{res.page_number ? ` · page ${res.page_number}` : ''}</a>}
              </div>

              <div className="shrink-0 self-center rounded-xl bg-surface-muted p-2 text-muted transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
