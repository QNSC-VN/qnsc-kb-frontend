import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Calendar, 
  User as UserIcon, 
  Shield, 
  Edit, 
  Trash2, 
  Bookmark, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare,
  History,
  Lock
} from 'lucide-react'
import { 
  getArticle, 
  getRelatedArticles,
  deleteArticle, 
  getComments, 
  addComment, 
  deleteComment, 
  castVote, 
  getVotesSummary, 
  getUserVote, 
  bookmarkArticle, 
  unbookmarkArticle, 
  isBookmarked,
  getHistory,
  restoreArticleVersion
} from '../../api/articles'
import { downloadArticleSource } from '../../api/articles'
import PdfViewer from '../../components/ai/PdfViewer'
import { useAuth } from '../../auth/useAuth'
import { useDialog } from '../../components/ui/DialogProvider'
import { useLanguage } from '../../i18n/LanguageProvider'

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const dialog = useDialog()
  const { t } = useLanguage()

  const [article, setArticle] = useState<any>(null)
  const [relatedArticles, setRelatedArticles] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0 })
  const [userVote, setUserVote] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [sourceViewer, setSourceViewer] = useState<{ url: string; name: string } | null>(null)
  const [sourceLoading, setSourceLoading] = useState(false)
  
  const [loading, setLoading] = useState(true)
  const [submittingComment, setSubmittingComment] = useState(false)

  const loadArticleDetails = async () => {
    if (!id) return
    setLoading(true)
    try {
      const art = await getArticle(id)
      setArticle(art)
      const related = await getRelatedArticles(id).catch(() => [])
      setRelatedArticles(related)
      
      const comm = await getComments(id)
      setComments(comm)

      const vt = await getVotesSummary(id)
      setVotes(vt)

      const uVt = await getUserVote(id)
      setUserVote(uVt.vote)

      const book = await isBookmarked(currentUser.id, id).catch(() => false)
      setBookmarked(book)

      const hist = await getHistory(id)
      setHistory(hist)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArticleDetails()
  }, [id])

  const handleDelete = async () => {
    if (!id) return
    if (await dialog.confirm('Are you sure you want to soft-delete this article?', { title: 'Delete article', confirmLabel: 'Delete article', tone: 'danger' })) {
      try {
        await deleteArticle(id)
        navigate('/articles')
      } catch (err) {
        console.error(err)
        await dialog.alert('Failed to delete article', { title: 'Delete failed' })
      }
    }
  }

  const handleOpenSource = async () => {
    if (!id || sourceLoading) return
    setSourceLoading(true)
    try {
      const url = await downloadArticleSource(id)
      setSourceViewer({ url, name: article?.title || 'Original source' })
    } catch {
      await dialog.alert('The original source is not available for this article.', { title: 'Source unavailable', tone: 'info' })
    } finally {
      setSourceLoading(false)
    }
  }

  const handleRestoreVersion = async (hist: any) => {
    if (!id || !article || hist.version === article.version) return
    const confirmed = await dialog.confirm(
      t('articles.restoreConfirm', { version: hist.version }),
      { title: `${t('articles.restoreTitle')} ${hist.version}`, confirmLabel: t('articles.restoreButton'), tone: 'info' },
    )
    if (!confirmed) return
    try {
      const restored = await restoreArticleVersion(id, hist.version)
      setArticle(restored)
      setHistory(await getHistory(id))
      await dialog.alert(t('articles.versionRestored', { version: hist.version, newVersion: restored.version }), { title: 'Version restored', tone: 'success' })
    } catch (err: any) {
      await dialog.alert(err?.response?.data?.detail || 'Could not restore this version.', { title: 'Restore failed', tone: 'danger' })
    }
  }

  const handleVote = async (value: number) => {
    if (!id) return
    try {
      // Toggle vote
      const nextVoteVal = userVote === value ? 0 : value
      const summary = await castVote(id, nextVoteVal)
      setVotes(summary)
      setUserVote(nextVoteVal)
    } catch (err) {
      console.error(err)
    }
  }

  const handleBookmarkToggle = async () => {
    if (!id) return
    try {
      if (bookmarked) {
        await unbookmarkArticle(id)
        setBookmarked(false)
      } else {
        await bookmarkArticle(id)
        setBookmarked(true)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !newComment.trim()) return
    setSubmittingComment(true)
    try {
      const comm = await addComment(id, newComment)
      setComments([...comments, comm])
      setNewComment('')
    } catch (err) {
      console.error(err)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleCommentDelete = async (commId: string) => {
    try {
      await deleteComment(commId)
      setComments(comments.filter(c => c.id !== commId))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500 mr-3" />
        <span>Loading article...</span>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="text-center p-12">
        <h3 className="text-xl font-bold text-rose-500">Article not found</h3>
        <p className="text-slate-400 mt-2">This document does not exist or has been deleted.</p>
        <Link to="/articles" className="mt-4 inline-block text-brand-400 underline">Back to Articles</Link>
      </div>
    )
  }

  const canEdit = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Department Owner' || currentUser.id === article.owner_id)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Navigation & Controls */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link to="/articles" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm">
          <ArrowLeft size={16} />
          <span>{t('articles.back')}</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleBookmarkToggle}
            className={`p-2 rounded-lg border transition-all ${
              bookmarked 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white'
            }`}
            title={bookmarked ? "Bookmarked" : "Bookmark article"}
          >
            <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
          </button>
          
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-lg border transition-all ${
              showHistory 
                ? 'bg-brand-500/10 border-brand-500/30 text-brand-400' 
                : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white'
            }`}
            title="Version History"
          >
            <History size={18} />
          </button>

          {canEdit && (
            <>
              <Link
                to={`/articles/${article.id}/edit`}
                className="p-2 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white transition-all"
                title="Edit Article"
              >
                <Edit size={18} />
              </Link>
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg border border-slate-800 bg-slate-900/40 text-rose-400 hover:bg-rose-500/10 transition-all"
                title="Soft Delete"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
          {article.source_available && (
            <button
              onClick={() => void handleOpenSource()}
              disabled={sourceLoading}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs font-semibold text-slate-300 transition-all hover:border-brand-500/50 hover:text-white disabled:cursor-wait disabled:opacity-60"
              title="Review original source"
            >
              {sourceLoading ? 'Loading source…' : 'Review source'}
            </button>
          )}
        </div>
      </div>

      {/* Main Grid split: Content & Sidebar metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Content body */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-6 md:p-8 space-y-6">
            <div>
              {/* Title & metadata */}
              <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-slate-500 text-xs mt-4">
                <span className="flex items-center gap-1">
                  <UserIcon size={14} />
                  <span>{article.owner?.name || 'Owner'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>Created {new Date(article.created_at).toLocaleDateString()}</span>
                </span>
                <span className="bg-slate-800/60 text-slate-400 px-2 py-0.5 rounded uppercase font-semibold">
                  v{article.version}
                </span>
              </div>
            </div>

            {/* Render Markdown text (simple fallback renderer for preview logic) */}
            <div className="prose prose-invert max-w-none text-slate-350 leading-relaxed text-sm font-sans border-t border-slate-800/40 pt-6 prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white prose-code:rounded prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body_md}</ReactMarkdown>
            </div>

            {/* Voting Bar */}
            <div className="flex items-center gap-4 border-t border-slate-800/40 pt-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Was this helpful?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVote(1)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs ${
                    userVote === 1
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-md'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white'
                  }`}
                >
                  <ThumbsUp size={14} />
                  <span>{votes.upvotes}</span>
                </button>
                <button
                  onClick={() => handleVote(-1)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs ${
                    userVote === -1
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-md'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white'
                  }`}
                >
                  <ThumbsDown size={14} />
                  <span>{votes.downvotes}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Comments section */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare size={18} />
              <span>Comments ({comments.length})</span>
            </h3>

            {/* Comments Thread list */}
            <div className="space-y-4">
              {comments.map((comm) => (
                <div key={comm.id} className="border-b border-slate-850 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs">
                        {comm.user?.name?.substring(0,2).toUpperCase() || 'US'}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white">{comm.user?.name}</span>
                        <span className="text-[10px] text-slate-500 ml-2">
                          {new Date(comm.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {currentUser && currentUser.id === comm.user_id && (
                      <button
                        onClick={() => handleCommentDelete(comm.id)}
                        className="text-xs text-rose-400 hover:underline hover:text-rose-300"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm mt-2 pl-9 whitespace-pre-wrap leading-relaxed">
                    {comm.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="pt-4 border-t border-slate-800/60">
              <textarea
                placeholder="Share your thoughts or suggest corrections..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-brand-500 h-24 resize-none"
                required
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>

          {relatedArticles.length > 0 && (
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Related articles</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {relatedArticles.map((related) => (
                  <Link key={related.id} to={`/articles/${related.id}`} className="rounded-lg border border-slate-800 bg-slate-950/30 p-3 transition hover:border-brand-500/50 hover:bg-slate-900">
                    <p className="truncate text-sm font-semibold text-white">{related.title}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{related.dept} · {related.domain}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Metadata */}
        <div className="lg:col-span-1 space-y-6">
          {/* Attributes card */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
              Attributes
            </h3>
            
            <div className="space-y-3.5 text-sm">
              {article.needs_update && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300">
                  Review overdue — content needs update
                </div>
              )}
              {article.status === 'published' && article.index_status && article.index_status !== 'ready' && (
                <div className={`rounded-lg border px-3 py-2 text-xs font-semibold ${article.index_status === 'failed' ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
                  Search index: {article.index_status === 'processing' ? 'processing in background…' : article.index_status}
                </div>
              )}
              <div>
                <label className="text-slate-500 text-xs block mb-0.5">Department</label>
                <span className="text-white font-semibold">{article.dept}</span>
              </div>
              <div>
                <label className="text-slate-500 text-xs block mb-0.5">Domain Context</label>
                <span className="text-white font-semibold">{article.domain}</span>
              </div>
              <div>
                <label className="text-slate-500 text-xs block mb-0.5">Sensitivity</label>
                <div className="flex items-center gap-1.5 text-white font-semibold capitalize mt-0.5">
                  <Shield size={14} className="text-brand-400" />
                  <span>{article.sensitivity}</span>
                </div>
              </div>
              <div>
                <label className="text-slate-500 text-xs block mb-0.5">Document Type</label>
                <span className="bg-slate-800 text-brand-400 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider inline-block mt-0.5">
                  {article.type}
                </span>
              </div>
              <div>
                <label className="text-slate-500 text-xs block mb-0.5">Next Review Schedule</label>
                <span className="text-white font-semibold">
                  {article.next_review ? new Date(article.next_review).toLocaleDateString() : 'No schedule set'}
                </span>
              </div>
            </div>
          </div>

          {/* Access groups constraints */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Lock size={14} className="text-slate-400" />
              <span>Access Scoping</span>
            </h3>

            {article.access_groups && article.access_groups.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {article.access_groups.map((group: any) => (
                  <span key={group.id} className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded text-xs font-medium">
                    {group.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-normal">
                This article is open to everyone in the organization (unrestricted access).
              </p>
            )}
          </div>

          {/* Version History Sidebar list if toggled */}
          {showHistory && (
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 space-y-4 animate-fadeIn">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                {t('articles.versionHistory')}
              </h3>
              <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
                {history.map((hist) => (
                  <div 
                    key={hist.id} 
                    onClick={() => {
                      void dialog.alert(`Showing title of historical snapshot version ${hist.version}: "${hist.snapshot.title}"\n\nContent:\n${hist.snapshot.body_md}`, { title: `Historical version ${hist.version}`, tone: 'info' })
                    }}
                    className="cursor-pointer hover:bg-slate-800/40 p-2 rounded transition-all text-xs border border-transparent hover:border-slate-800"
                  >
                    <div className="flex justify-between items-center text-white font-bold mb-1">
                      <span>Version {hist.version}</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {new Date(hist.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-slate-400 line-clamp-1">{hist.snapshot.title}</div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500">Edited by: {hist.editor?.name || 'Owner'}</span>
                      {hist.version === article.version ? (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">{t('articles.active')}</span>
                      ) : canEdit ? (
                        <button
                          onClick={(event) => { event.stopPropagation(); void handleRestoreVersion(hist) }}
                          className="rounded-md border border-cyan/30 px-2 py-1 text-[10px] font-semibold text-cyan transition hover:bg-cyan/10"
                        >
                          {t('articles.restoreActive')}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
      {sourceViewer && (
        <PdfViewer
          open
          fileName={sourceViewer.name}
          url={sourceViewer.url}
          onClose={() => {
            URL.revokeObjectURL(sourceViewer.url)
            setSourceViewer(null)
          }}
        />
      )}
    </div>
  )
}
