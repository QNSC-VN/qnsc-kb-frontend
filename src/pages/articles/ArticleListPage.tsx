import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Filter, Tag as TagIcon, Layers, Shield, MessageSquare, ThumbsUp, Bookmark } from 'lucide-react'
import { getArticles } from '../../api/articles'
import { getTags } from '../../api/search'

export default function ArticleListPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedSensitivity, setSelectedSensitivity] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  const fetchArticlesList = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (selectedDept) params.dept = selectedDept
      if (selectedType) params.type = selectedType
      if (selectedSensitivity) params.sensitivity = selectedSensitivity
      if (selectedStatus) params.status = selectedStatus
      if (searchQuery) params.q = searchQuery
      
      const data = await getArticles(params)
      setArticles(data)
    } catch (err) {
      console.error('Failed to fetch articles', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticlesList()
  }, [selectedDept, selectedType, selectedSensitivity, selectedStatus, searchQuery])

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const t = await getTags()
        setTags(t)
      } catch (err) {
        console.error(err)
      }
    }
    fetchMetadata()
  }, [])

  return (
    <div className="space-y-6">
      {/* Upper action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Knowledge Articles</h1>
          <p className="text-slate-400 mt-1">Browse SOPs, policies, FAQs, and decision logs</p>
        </div>
        <Link
          to="/articles/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4.5 py-2.5 font-semibold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-500 hover:shadow-brand-500/30 transition-all text-sm self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>New Article</span>
        </Link>
      </div>

      {/* Filter panel */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <Filter size={16} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-300">Filter Knowledge Base</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {/* Search Input */}
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Search Text</label>
            <input
              type="text"
              placeholder="Search title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 py-2 px-3 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500"
            />
          </div>

          {/* Department Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 py-2 px-3 text-xs text-white outline-none focus:border-brand-500"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Security">Security</option>
              <option value="Human Resources">HR</option>
              <option value="Legal">Legal</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          {/* Type Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Document Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 py-2 px-3 text-xs text-white outline-none focus:border-brand-500"
            >
              <option value="">All Types</option>
              <option value="POLICY">Policy</option>
              <option value="SOP">SOP</option>
              <option value="DECISION">Decision Log</option>
              <option value="FAQ">FAQ</option>
              <option value="RCA">RCA</option>
              <option value="HOWTO">How-To</option>
              <option value="PLAYBOOK">Playbook</option>
              <option value="REFERENCE">Reference</option>
            </select>
          </div>

          {/* Sensitivity Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Sensitivity</label>
            <select
              value={selectedSensitivity}
              onChange={(e) => setSelectedSensitivity(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 py-2 px-3 text-xs text-white outline-none focus:border-brand-500"
            >
              <option value="">All Sensitivity</option>
              <option value="public">Public</option>
              <option value="internal">Internal</option>
              <option value="confidential">Confidential</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>

          {/* Status Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 py-2 px-3 text-xs text-white outline-none focus:border-brand-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="pending_review">Pending Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex justify-center items-center h-64 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500 mr-3" />
          <span>Fetching knowledge database...</span>
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/10 p-12 text-center">
          <Layers className="mx-auto text-slate-600 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-white">No articles found</h3>
          <p className="text-slate-500 text-sm mt-1">Try resetting your filters or make a new write-up.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <div
              key={art.id}
              onClick={() => navigate(`/articles/${art.id}`)}
              className="group cursor-pointer rounded-xl border border-slate-800/80 bg-slate-900/20 p-5 hover:bg-slate-900/40 hover:border-slate-700/80 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Badges row */}
                <div className="flex flex-wrap gap-2 mb-3.5">
                  <span className="bg-slate-850 px-2 py-0.5 rounded text-[10px] font-semibold text-brand-400 uppercase tracking-wider border border-brand-500/10">
                    {art.type}
                  </span>
                  <span className="bg-slate-850 px-2 py-0.5 rounded text-[10px] font-semibold text-teal-400 uppercase tracking-wider border border-teal-500/10">
                    {art.dept}
                  </span>
                  {art.sensitivity === 'confidential' && (
                    <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[10px] font-semibold uppercase border border-amber-500/20">
                      Confidential
                    </span>
                  )}
                  {art.sensitivity === 'restricted' && (
                    <span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded text-[10px] font-semibold uppercase border border-rose-500/20">
                      Restricted
                    </span>
                  )}
                  {art.status === 'draft' && (
                    <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                      Draft
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-2">
                  {art.title}
                </h3>
                
                {/* Description snippet */}
                <p className="text-slate-400 text-sm mt-2 line-clamp-3 leading-relaxed">
                  {art.body_md ? art.body_md.replace(/[#*`_]/g, '') : 'No content preview.'}
                </p>
              </div>

              {/* Footer info card */}
              <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 uppercase text-[10px]">
                    {art.owner?.name?.substring(0, 2) || 'OW'}
                  </div>
                  <span>{art.owner?.name || 'Owner'}</span>
                </div>
                <span>v{art.version}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
