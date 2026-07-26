import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Filter, Tag as TagIcon, Layers, Shield, MessageSquare, ThumbsUp, Bookmark, Upload, Sparkles, CheckSquare, Square } from 'lucide-react'
import { autoTagArticles, getArticles } from '../../api/articles'
import { getTags } from '../../api/search'
import { uploadSources } from '../../api/governance'
import { useDialog } from '../../components/ui/DialogProvider'
import { useLanguage } from '../../i18n/LanguageProvider'

export default function ArticleListPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedSensitivity, setSelectedSensitivity] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([])
  const [autoTagging, setAutoTagging] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [uploadTags, setUploadTags] = useState<string[]>([])
  const uploadInputRef = useRef<HTMLInputElement>(null)

  const navigate = useNavigate()
  const dialog = useDialog()
  const { t } = useLanguage()

  const toggleArticleSelection = (articleId: string) => {
    setSelectedArticleIds(current => current.includes(articleId) ? current.filter(id => id !== articleId) : [...current, articleId])
  }

  const handleAutoTag = async () => {
    if (!selectedArticleIds.length || autoTagging) return
    setAutoTagging(true)
    try {
      const result = await autoTagArticles(selectedArticleIds)
      const added = result.results?.filter((item: any) => item.added_tags?.length > 0) || []
      await dialog.alert(
        added.length
          ? added.map((item: any) => `${item.title}: ${item.added_tags.join(', ')}`).join('\n')
          : 'AI did not find any new tags for the selected articles.',
        { title: 'AI tagging complete', tone: added.length ? 'success' : 'info' },
      )
      setSelectedArticleIds([])
      await fetchArticlesList()
    } catch (error: any) {
      await dialog.alert(error?.response?.data?.detail || 'Could not generate tags for the selected articles.', { title: 'AI tagging failed', tone: 'danger' })
    } finally {
      setAutoTagging(false)
    }
  }
  const articleStats = useMemo(() => ({
    total: articles.length,
    published: articles.filter(article => article.status === 'published').length,
    drafts: articles.filter(article => article.status !== 'published').length,
    protected: articles.filter(article => ['confidential', 'restricted'].includes(article.sensitivity)).length,
  }), [articles])

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return
    setUploadFiles(files)
    setUploadTags(files.map(() => ''))
  }

  const handleSourceUpload = async () => {
    if (!uploadFiles.length) return
    const tagsByFile = uploadTags.map(value => value.split(',').map(tag => tag.trim()).filter(Boolean))
    setUploading(true)
    try {
      const result = await uploadSources(uploadFiles, tagsByFile)
      // The batch endpoint returns { results: [...] }. Keep compatibility
      // with the single-file endpoint/proxies that return the draft directly.
      const items = Array.isArray(result?.results)
        ? result.results
        : result?.id
          ? [{ ...result, status: result.status === 'pending' ? 'queued' : (result.status || 'queued') }]
          : []
      const queued = items.filter((item: any) => ['queued', 'pending'].includes(item.status) || (!item.status && item.id))
      const duplicates = items.filter((item: any) => ['duplicate', 'duplicate_document'].includes(item.status) || item.detail?.code === 'duplicate_document')
      const failed = items.filter((item: any) => !queued.includes(item) && !duplicates.includes(item))
      const processed = items.length || Number(result?.queued_count || 0) + Number(result?.duplicate_count || 0) + Number(result?.failed_count || 0)
      const summary = processed === 0
        ? 'No files were processed. Please select files again and retry.'
        : `${processed} file${processed === 1 ? '' : 's'} processed\n\n${queued.length} queued for review\n${duplicates.length} duplicate${duplicates.length === 1 ? '' : 's'} skipped\n${failed.length} failed`
      const resultTone = queued.length > 0 ? 'success' : failed.length > 0 ? 'danger' : 'info'
      const resultTitle = queued.length > 0 ? 'Upload successful' : failed.length > 0 ? 'Upload needs attention' : 'No new files uploaded'
      const openQueue = queued.length > 0
        ? await dialog.confirm('Your files were processed successfully and queued for review.', { title: 'Upload successful', confirmLabel: 'Review now', cancelLabel: 'Close', tone: 'success' })
        : (await dialog.alert(summary, { title: resultTitle, tone: resultTone }), false)
      if (openQueue) navigate('/governance/pending-drafts')
    } catch (error: any) {
      const detail = error?.response?.data?.detail
      if (error?.response?.status === 409 && detail?.code === 'duplicate_document') {
        const existing = detail.article_id ? ` Existing article: ${detail.article_id}.` : ''
        await dialog.alert(`This document already exists and was not uploaded.${existing}`, { title: 'Duplicate document', confirmLabel: 'Understood', tone: 'info' })
      } else if (typeof detail === 'object' && detail?.code === 'update_confirmation_required') {
        await dialog.alert('A very similar document is already in the knowledge base. Review the pending draft and choose whether it is an update or a new document.', { title: 'Similar document found', tone: 'info' })
        navigate('/governance/pending-drafts')
      } else {
        await dialog.alert(detail || 'Could not process this source file.', { title: 'Upload failed' })
      }
    } finally {
      setUploading(false)
      setUploadFiles([])
      setUploadTags([])
    }
  }

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
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone"><Layers size={14} className="text-cyan" /> {t('articles.workspace')}</div>
          <h1 className="text-2xl font-semibold tracking-tight text-white lg:text-3xl">{t('articles.title')}</h1>
          <p className="mt-1 text-sm text-slate-400">{t('articles.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          {selectedArticleIds.length > 0 && <button type="button" onClick={() => void handleAutoTag()} disabled={autoTagging} className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2.5 text-sm font-semibold text-cyan transition hover:bg-cyan/20 disabled:opacity-50"><Sparkles size={16} />{autoTagging ? 'Generating tags…' : `AI auto-tag (${selectedArticleIds.length})`}</button>}
          <input ref={uploadInputRef} type="file" multiple className="hidden" onChange={handleFileSelection} accept=".pdf,.docx,.xlsx,.xlsm,.pptx,.txt,.md,.csv,.png,.jpg,.jpeg,.tif,.tiff,.bmp,.webp" />
          <button
            type="button"
            onClick={() => uploadInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-800 disabled:opacity-50"
          >
            <Upload size={16} />
            <span>{uploading ? t('articles.processing') : t('articles.uploadSources')}</span>
          </button>
          <Link
            to="/articles/new"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-500"
          >
            <Plus size={18} />
            <span>{t('articles.newArticle')}</span>
          </Link>
        </div>
      </div>

      {uploadFiles.length > 0 && (
        <div className="rounded-xl border border-cyan/25 bg-cyan/[0.06] p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-ink">Add tags to uploaded files</h2>
              <p className="mt-0.5 text-xs text-steel">Use comma-separated tags. These tags will be saved with each pending draft and published article.</p>
            </div>
            <button type="button" onClick={() => { setUploadFiles([]); setUploadTags([]) }} className="text-xs font-semibold text-stone hover:text-ink">Cancel</button>
          </div>
          <div className="space-y-2">
            {uploadFiles.map((file, index) => (
              <div key={`${file.name}-${file.lastModified}`} className="grid gap-2 rounded-lg border border-hairline bg-surface p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:items-center">
                <div className="min-w-0"><p className="truncate text-xs font-semibold text-ink">{file.name}</p><p className="text-[11px] text-stone">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
                <input value={uploadTags[index] || ''} onChange={event => setUploadTags(current => current.map((value, tagIndex) => tagIndex === index ? event.target.value : value))} placeholder="e.g. database, incident response, sop" className="field text-xs" aria-label={`Tags for ${file.name}`} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <button type="button" onClick={() => void handleSourceUpload()} disabled={uploading} className="inline-flex items-center gap-2 rounded-lg bg-cyan px-4 py-2 text-xs font-semibold text-[#07131a] transition hover:bg-cyan/80 disabled:opacity-50"><Upload size={14} />{uploading ? 'Uploading…' : `Upload ${uploadFiles.length} file${uploadFiles.length === 1 ? '' : 's'}`}</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[[t('articles.visible'), articleStats.total, 'bg-surface'], [t('articles.published'), articleStats.published, 'bg-emerald-500/[0.06]'], [t('articles.inProgress'), articleStats.drafts, 'bg-amber-400/[0.06]'], [t('articles.protected'), articleStats.protected, 'bg-cyan/[0.06]']].map(([label, value, tone]) => <div key={String(label)} className={`rounded-xl border border-slate-800 p-4 ${tone}`}><p className="text-[11px] font-medium text-slate-500">{label}</p><p className="mt-1 text-xl font-semibold text-white">{value}</p></div>)}
      </div>

      {/* Filter panel */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <Filter size={16} className="text-slate-400" />
          <div><span className="text-sm font-semibold text-slate-300">{t('articles.find')}</span><p className="mt-0.5 text-[11px] text-slate-500">{t('articles.findHelp')}</p></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {/* Search Input */}
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('articles.searchText')}</label>
            <input
              type="text"
              placeholder={t('articles.searchTitle')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 py-2 px-3 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500"
            />
          </div>

          {/* Department Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('articles.department')}</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 py-2 px-3 text-xs text-white outline-none focus:border-brand-500"
            >
              <option value="">{t('articles.allDepartments')}</option>
              <option value="Engineering">Engineering</option>
              <option value="Security">Security</option>
              <option value="Human Resources">HR</option>
              <option value="Legal">Legal</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          {/* Type Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('articles.type')}</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 py-2 px-3 text-xs text-white outline-none focus:border-brand-500"
            >
              <option value="">{t('articles.allTypes')}</option>
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
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('articles.sensitivity')}</label>
            <select
              value={selectedSensitivity}
              onChange={(e) => setSelectedSensitivity(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 py-2 px-3 text-xs text-white outline-none focus:border-brand-500"
            >
              <option value="">{t('articles.allSensitivity')}</option>
              <option value="public">Public</option>
              <option value="internal">Internal</option>
              <option value="confidential">Confidential</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>

          {/* Status Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('articles.status')}</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 py-2 px-3 text-xs text-white outline-none focus:border-brand-500"
            >
              <option value="">{t('articles.allStatuses')}</option>
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
          <span>{t('common.loading')}</span>
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/10 p-12 text-center">
          <Layers className="mx-auto text-slate-600 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-white">{t('articles.noArticles')}</h3>
          <p className="text-slate-500 text-sm mt-1">Try resetting your filters or make a new write-up.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <div
              key={art.id}
              onClick={() => navigate(`/articles/${art.id}`)}
              className="group relative cursor-pointer rounded-xl border border-slate-800/80 bg-slate-900/20 p-5 hover:bg-slate-900/40 hover:border-slate-700/80 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <button
                type="button"
                aria-label={`Select ${art.title}`}
                onClick={(event) => { event.stopPropagation(); toggleArticleSelection(art.id) }}
                className="absolute right-4 top-4 rounded-md p-1 text-slate-500 transition hover:bg-surface-soft hover:text-cyan"
              >
                {selectedArticleIds.includes(art.id) ? <CheckSquare size={18} className="text-cyan" /> : <Square size={18} />}
              </button>
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
