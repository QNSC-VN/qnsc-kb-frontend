import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle, ArrowUp, BookOpen, Bot, Check, ChevronDown, ChevronLeft, ChevronRight,
  Copy, ExternalLink, FileText, Layers, List, MessageSquare, Pencil, Search as SearchIcon,
  Plus, Sparkles, ThumbsDown, ThumbsUp, Trash2, User as UserIcon, X,
} from 'lucide-react'
import {
  askAIStream, createConversation, deleteConversation, getConversationMessages,
  getConversations, renameConversation, submitAIFeedback,
  downloadArticleSource,
} from '../../api/ai'
import PdfViewer from '../../components/ai/PdfViewer'
import AnswerText from '../../components/ai/AnswerText'
import { useDialog } from '../../components/ui/DialogProvider'
import { useLanguage } from '../../i18n/LanguageProvider'

interface Citation {
  source_index?: number
  article_id: string
  title: string
  section_ref?: string
  source_ref: string
  excerpt?: string
  highlight_text?: string
  highlight_texts?: string[]
  page_number?: number
  source_url?: string
}

interface Message {
  id?: string
  sender: 'user' | 'ai'
  text: string
  citations?: Citation[]
  logId?: string
  feedbackSubmitted?: boolean
  failed?: boolean
  retryQuestion?: string
}

interface Conversation {
  id: string
  title: string
  updated_at: string
}

const SUGGESTIONS = [
  'What is the SOP for database outage recovery?',
  'What is the corporate travel policy?',
  'Explain what RAG means in QNSC.',
]

function HighlightedSourceText({ text, highlights, highlight }: { text: string; highlights?: string[]; highlight?: string }) {
  const sourceText = text || 'Open the article to inspect the full source.'
  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const highlightValues = (highlights?.length ? highlights : [highlight || '']).map((value) => value.trim()).filter(Boolean)
  const ranges: Array<{ start: number; end: number }> = []

  for (const value of highlightValues) {
    const tokens = value.split(/\s+/).filter(Boolean).slice(0, 48)
    if (!tokens.length) continue
    const pattern = new RegExp(tokens.map(escapeRegExp).join('\\s+'), 'gi')
    let match: RegExpExecArray | null
    while ((match = pattern.exec(sourceText)) !== null) {
      ranges.push({ start: match.index, end: match.index + match[0].length })
      if (!match[0].length) pattern.lastIndex += 1
    }
  }

  if (!ranges.length) return <>{sourceText}</>
  ranges.sort((left, right) => left.start - right.start)
  const mergedRanges = ranges.reduce<Array<{ start: number; end: number }>>((merged, range) => {
    const previous = merged[merged.length - 1]
    if (previous && range.start <= previous.end) previous.end = Math.max(previous.end, range.end)
    else merged.push({ ...range })
    return merged
  }, [])

  return (
    <>
      {mergedRanges.map((range, index) => (
        <React.Fragment key={`${range.start}-${range.end}`}>
          {index === 0 && sourceText.slice(0, range.start)}
          {index > 0 && sourceText.slice(mergedRanges[index - 1].end, range.start)}
          <mark className="rounded bg-amber-300/25 px-0.5 text-amber-100 ring-1 ring-amber-300/30">{sourceText.slice(range.start, range.end)}</mark>
          {index === mergedRanges.length - 1 && sourceText.slice(range.end)}
        </React.Fragment>
      ))}
    </>
  )
}

// Lightweight, dependency-free motion primitives. Plain CSS keyframes so they
// work regardless of Tailwind config, and fully disabled under
// prefers-reduced-motion so the "quality floor" holds for anyone who needs it.
const MOTION_STYLES = `
@keyframes askFadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes askFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes askSlideInRight {
  from { opacity: 0; transform: translateX(18px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes askPulseRing {
  0%, 100% { box-shadow: 0 0 0 0 rgba(217,119,87,0.30); }
  50%      { box-shadow: 0 0 0 5px rgba(217,119,87,0.14); }
}
@keyframes askShimmerDot {
  0%, 80%, 100% { transform: scale(0.85); opacity: 0.5; }
  40%           { transform: scale(1.15); opacity: 1; }
}
.ask-fade-up { animation: askFadeUp 0.34s cubic-bezier(0.16,1,0.3,1) both; }
.ask-fade-in { animation: askFadeIn 0.28s ease-out both; }
.ask-slide-in { animation: askSlideInRight 0.3s cubic-bezier(0.16,1,0.3,1) both; }
.ask-avatar-live { animation: askPulseRing 1.7s ease-in-out infinite; }
.ask-press { transition: transform 120ms ease, background-color 150ms ease, color 150ms ease, border-color 150ms ease, box-shadow 150ms ease; }
.ask-press:active { transform: scale(0.96); }
.ask-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.14) transparent; }
.ask-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
.ask-scroll::-webkit-scrollbar-track { background: transparent; }
.ask-scroll::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.14); border-radius: 999px; border: 2px solid transparent; background-clip: content-box; }
.ask-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,0.24); background-clip: content-box; }
@media (prefers-reduced-motion: reduce) {
  .ask-fade-up, .ask-fade-in, .ask-slide-in, .ask-avatar-live { animation: none !important; }
  .ask-press:active { transform: none; }
}
`

export default function AskPage() {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSource, setSelectedSource] = useState<Citation | null>(null)
  const [viewerSource, setViewerSource] = useState<{ citation: Citation; url: string } | null>(null)
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [sourceLoading, setSourceLoading] = useState(false)
  const [sourceError, setSourceError] = useState('')
  const [sourceCollapsed, setSourceCollapsed] = useState(false)
  // Keep the conversation workspace focused on the current chat by default;
  // the compact list button remains available for opening history.
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [historyQuery, setHistoryQuery] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const sourceUrlRef = useRef<string | null>(null)
  const dialog = useDialog()
  const { t } = useLanguage()

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === conversationId),
    [conversations, conversationId],
  )
  const visibleConversations = useMemo(() => {
    const query = historyQuery.trim().toLowerCase()
    return query ? conversations.filter((item) => item.title.toLowerCase().includes(query)) : conversations
  }, [conversations, historyQuery])

  const loadConversation = async (id: string) => {
    setConversationId(id)
    setSelectedSource(null)
    setError('')
    if (window.innerWidth < 1024) setSidebarOpen(false)
    try {
      const history = await getConversationMessages(id)
      setMessages(history.map((item: any) => ({
        id: item.id,
        sender: item.role === 'user' ? 'user' : 'ai',
        text: item.content,
        citations: item.citations || [],
        logId: item.usage_log_id,
      })))
    } catch {
      setError('Could not load this conversation.')
    }
  }

  const refreshConversations = async (selectFirst = false) => {
    const items = await getConversations()
    setConversations(items)
    if (selectFirst && items.length > 0) await loadConversation(items[0].id)
    return items
  }

  useEffect(() => {
    refreshConversations(true).catch(() => setError('Could not load chat history.')).finally(() => setHistoryLoading(false))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: loading ? 'auto' : 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    const element = textareaRef.current
    if (!element) return
    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, 176)}px`
  }, [question])

  useEffect(() => {
    if (sourceUrlRef.current) {
      URL.revokeObjectURL(sourceUrlRef.current)
      sourceUrlRef.current = null
      setSourceUrl(null)
    }
    if (!selectedSource) {
      setSourceLoading(false)
      setSourceError('')
      return
    }

    let active = true
    setSourceLoading(true)
    setSourceError('')
    downloadArticleSource(selectedSource.article_id)
      .then((url) => {
        if (!active) {
          URL.revokeObjectURL(url)
          return
        }
        sourceUrlRef.current = url
        setSourceUrl(url)
      })
      .catch(() => {
        if (active) setSourceError('This original source could not be loaded.')
      })
      .finally(() => {
        if (active) setSourceLoading(false)
      })

    return () => { active = false }
  }, [selectedSource])

  const startNewChat = () => {
    setConversationId(null)
    setMessages([])
    setQuestion('')
    setError('')
    setSelectedSource(null)
    setViewerSource(null)
    setSourceCollapsed(false)
    textareaRef.current?.focus()
  }

  const openSourceViewer = (citation: Citation) => {
    if (sourceUrlRef.current) setViewerSource({ citation, url: sourceUrlRef.current })
  }

  const handleAsk = async (value = question) => {
    const query = value.trim()
    if (!query || loading) return
    setLoading(true)
    setError('')
    setQuestion('')
    setMessages((previous) => [...previous, { sender: 'user', text: query }])
    let assistantMessageId = ''
    try {
      let activeId = conversationId
      if (!activeId) {
        const conversation = await createConversation(query.slice(0, 80))
        activeId = conversation.id
        setConversationId(activeId)
      }
      assistantMessageId = `ai-${Date.now()}`
      setMessages((previous) => [...previous, { id: assistantMessageId, sender: 'ai', text: '', citations: [] }])
      await askAIStream(
        query,
        activeId ?? undefined,
        (content) => setMessages((previous) => previous.map((message) => {
          if (message.id !== assistantMessageId) return message
          const replaceMarker = '\u0000REPLACE\u0000'
          return content.startsWith(replaceMarker)
            ? { ...message, text: content.slice(replaceMarker.length) }
            : { ...message, text: message.text + content }
        })),
        (citations) => setMessages((previous) => previous.map((message) => message.id === assistantMessageId ? { ...message, citations } : message)),
        (data) => setMessages((previous) => previous.map((message) => message.id === assistantMessageId ? { ...message, logId: data.log_id } : message)),
      )
      await refreshConversations()
    } catch (requestError: any) {
      setError(requestError?.response?.data?.detail || 'Could not reach the answer service. Try again.')
      setMessages((previous) => {
        const failure = { text: 'I could not complete that request. You can retry without losing this conversation.', failed: true, retryQuestion: query }
        return assistantMessageId
          ? previous.map((message) => message.id === assistantMessageId ? { ...message, ...failure } : message)
          : [...previous, { sender: 'ai' as const, ...failure }]
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleAsk()
    }
  }

  const handleDelete = async (id: string) => {
    const conversation = conversations.find((item) => item.id === id)
    if (!(await dialog.confirm(`Delete “${conversation?.title || 'this chat'}”? The conversation history will be removed.`, { title: 'Delete conversation', confirmLabel: 'Delete chat', tone: 'danger' }))) return
    await deleteConversation(id)
    const remaining = await refreshConversations()
    if (conversationId === id) {
      if (remaining.length > 0) await loadConversation(remaining[0].id)
      else startNewChat()
    }
  }

  const saveRename = async (id: string) => {
    const title = editTitle.trim()
    if (title) {
      const updated = await renameConversation(id, title)
      setConversations((items) => items.map((item) => item.id === id ? { ...item, title: updated.title } : item))
    }
    setEditingId(null)
  }

  const copyMessage = async (message: Message, index: number) => {
    const id = message.id || `${message.sender}-${index}`
    await navigator.clipboard.writeText(message.text)
    setCopiedId(id)
    window.setTimeout(() => setCopiedId(null), 1600)
  }

  const handleFeedback = async (index: number, rating: number) => {
    const message = messages[index]
    if (!message.logId || message.feedbackSubmitted) return
    await submitAIFeedback({ ai_usage_log_id: message.logId, rating })
    setMessages((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, feedbackSubmitted: true } : item))
  }

  const isEmpty = messages.length === 0

  return (
    <>
      <style>{MOTION_STYLES}</style>
      <div className="relative flex h-[calc(100vh-7rem)] min-h-[520px] overflow-hidden bg-canvas">
        {sidebarOpen && (
          <button
            className="ask-fade-in fixed inset-0 z-20 bg-black/35 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close chat history"
          />
        )}

        <aside className={`${sidebarOpen ? 'w-64' : 'w-12'} absolute inset-y-0 left-0 z-30 flex shrink-0 flex-col overflow-hidden border-r border-hairline bg-canvas transition-[width] duration-300 ease-out lg:static`}>
          {sidebarOpen ? (
            <>
              <div className="flex shrink-0 items-center gap-2 border-b border-hairline p-4">
                <button
                  onClick={startNewChat}
                  className="ask-press flex flex-1 items-center justify-center gap-2 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-charcoal hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-minimaxBlue/40"
                >
                  <Plus size={16} className="transition-transform duration-200 group-hover:rotate-90" /> {t('chat.new')}
                </button>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="ask-press rounded-lg p-2 text-steel hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-minimaxBlue/40"
                  title="Close sidebar"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
              <div className="ask-scroll flex-1 space-y-1 overflow-y-auto p-2">
                <div className="mb-2 flex items-center justify-between px-3 pt-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-stone">{t('chat.history')}</p>
                  {conversations.length > 0 && <span className="text-[10px] tabular-nums text-stone">{conversations.length}</span>}
                </div>
                {conversations.length > 0 && (
                  <label className="relative mx-2 mb-2 block">
                    <SearchIcon size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-stone" />
                    <input
                      value={historyQuery}
                      onChange={(event) => setHistoryQuery(event.target.value)}
                      placeholder={t('chat.findChat')}
                      aria-label="Search chat history"
                      className="w-full rounded-lg border border-hairline bg-canvas py-2 pl-8 pr-2 text-xs text-ink outline-none placeholder:text-stone focus:border-minimaxBlue focus:ring-2 focus:ring-minimaxBlue/20"
                    />
                  </label>
                )}
                {historyLoading ? (
                  <p className="ask-fade-in px-3 py-3 text-xs text-steel">{t('common.loading')}</p>
                ) : visibleConversations.length === 0 ? (
                  <p className="ask-fade-in px-3 py-3 text-xs text-steel">{historyQuery ? 'No chats match your search.' : 'No saved chats yet.'}</p>
                ) : visibleConversations.map((conversation, conversationIndex) => {
                  const active = conversation.id === conversationId
                  const editing = editingId === conversation.id
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => !editing && void loadConversation(conversation.id)}
                      style={{ animationDelay: `${Math.min(conversationIndex, 8) * 30}ms` }}
                      className={`ask-fade-up group relative flex cursor-pointer items-center gap-2 rounded-lg border-l-2 px-3 py-2.5 transition-colors duration-150 ${active ? 'border-minimaxBlue bg-surface text-ink shadow-sm' : 'border-transparent text-steel hover:border-hairline hover:bg-surface hover:text-ink'}`}
                    >
                      <MessageSquare size={15} className={`shrink-0 transition-colors duration-150 ${active ? 'text-minimaxBlue' : ''}`} />
                      {editing ? (
                        <input
                          autoFocus
                          value={editTitle}
                          onChange={(event) => setEditTitle(event.target.value)}
                          onClick={(event) => event.stopPropagation()}
                          onKeyDown={(event) => { if (event.key === 'Enter') void saveRename(conversation.id); if (event.key === 'Escape') setEditingId(null) }}
                          onBlur={() => void saveRename(conversation.id)}
                          className="min-w-0 flex-1 rounded border border-minimaxBlue bg-canvas px-1.5 py-0.5 text-xs text-ink outline-none ring-2 ring-minimaxBlue/20 transition-shadow"
                        />
                      ) : (
                        <span
                          className="min-w-0 flex-1 truncate text-[13px] leading-5"
                          onDoubleClick={(event) => { event.stopPropagation(); setEditingId(conversation.id); setEditTitle(conversation.title) }}
                        >
                          {conversation.title || t('chat.new')}
                        </span>
                      )}
                      {!editing && (
                        <span className="absolute right-2 hidden items-center gap-1 bg-inherit pl-1 opacity-0 transition-opacity duration-150 group-hover:flex group-hover:opacity-100">
                          <button
                            onClick={(event) => { event.stopPropagation(); setEditingId(conversation.id); setEditTitle(conversation.title) }}
                            className="ask-press rounded p-1 text-stone hover:bg-surface-soft hover:text-ink"
                            title="Rename chat"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={(event) => { event.stopPropagation(); void handleDelete(conversation.id) }}
                            className="ask-press rounded p-1 text-stone hover:bg-rose-500/15 hover:text-rose-400"
                            title="Delete chat"
                          >
                            <Trash2 size={13} />
                          </button>
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center gap-2 pt-3">
              <button
                onClick={startNewChat}
                className="ask-press rounded-lg p-2 text-steel hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-minimaxBlue/40"
                title="New chat"
                aria-label="New chat"
              >
                <Plus size={17} />
              </button>
              <button
                onClick={() => setSidebarOpen(true)}
                className="ask-press rounded-lg p-2 text-steel hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-minimaxBlue/40"
                title="Open chat history"
                aria-label="Open chat history"
              >
                <List size={17} />
              </button>
            </div>
          )}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
          <div className="flex shrink-0 items-center justify-between border-b border-hairline px-5 py-3.5 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className={`grid h-9 w-9 place-items-center rounded-xl bg-coral text-white transition-shadow ${loading ? 'ask-avatar-live' : ''}`}>
                <Bot size={19} />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold text-ink transition-colors">{activeConversation?.title || 'AI Assistant'}</h1>
                <p className="text-[11px] text-stone">Grounded in your authorized documents</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1.5 text-[11px] text-stone sm:flex">
                <span className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${loading ? 'animate-pulse bg-amber-300' : 'bg-emerald-400'}`} />
                {loading ? t('search.searching') : t('chat.ready')}
              </span>

            </div>
          </div>

          <div className="ask-scroll flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mx-auto w-full max-w-3xl px-5 py-8 lg:px-8">
              {isEmpty ? (
                <div className="flex flex-col items-center pt-12 text-center lg:pt-16">
                  <span className="ask-fade-up grid h-11 w-11 place-items-center rounded-xl border border-hairline bg-surface-soft text-minimaxBlue">
                    <Layers size={20} />
                  </span>
                  <div className="ask-fade-up mt-5 flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5 text-[11px] text-stone" style={{ animationDelay: '60ms' }}>
                    <Sparkles size={13} className="text-coral" /> Private workspace assistant
                  </div>
                  <h2 className="ask-fade-up mt-4 text-3xl font-normal tracking-tight text-ink" style={{ animationDelay: '120ms' }}>{t('chat.askKnowledge')}</h2>
                  <p className="ask-fade-up mt-2 max-w-md text-sm leading-7 text-steel" style={{ animationDelay: '160ms' }}>Every answer is grounded in documents you can access. Click a citation to inspect its source passage.</p>
                  <div className="mt-8 flex w-full max-w-xl flex-col gap-2.5">
                    {SUGGESTIONS.map((suggestion, suggestionIndex) => (
                      <button
                        key={suggestion}
                        onClick={() => void handleAsk(suggestion)}
                        style={{ animationDelay: `${220 + suggestionIndex * 60}ms` }}
                        className="ask-fade-up ask-press group flex w-full items-center gap-3 rounded-lg border border-hairline bg-canvas px-4 py-3 text-left text-sm leading-6 text-steel transition-all duration-200 hover:-translate-y-0.5 hover:border-minimaxBlue hover:bg-surface hover:text-ink hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-minimaxBlue/40"
                      >
                        <Sparkles size={15} className="shrink-0 text-stone transition-colors duration-200 group-hover:text-minimaxBlue" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {messages.map((message, index) => {
                    const messageId = message.id || `${message.sender}-${index}`
                    const isStreamingThis = loading && index === messages.length - 1 && message.sender === 'ai'
                    if (message.sender === 'user') return (
                      <div key={messageId} className="ask-fade-up group flex justify-end">
                        <div className="flex max-w-[82%] flex-col items-end gap-1">
                          <p className="whitespace-pre-wrap rounded-2xl border border-hairline bg-surface px-4 py-2.5 text-sm leading-relaxed text-ink transition-shadow duration-200 group-hover:shadow-sm">{message.text}</p>
                          <button
                            onClick={() => void copyMessage(message, index)}
                            className="ask-press mr-2 p-1 text-stone opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:text-ink"
                            title="Copy question"
                          >
                            {copiedId === messageId ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                          </button>
                        </div>
                        <div className="ml-2 mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-soft text-steel">
                          <UserIcon size={14} />
                        </div>
                      </div>
                    )
                    const isNoAnswer = !message.failed && !isStreamingThis &&
                      /not found in the knowledge base/i.test(message.text.trim()) && !(message.citations && message.citations.length > 0)
                    const isFailure = Boolean(message.failed)
                    return (
                      <div
                        key={messageId}
                        className={`ask-fade-up group relative rounded-2xl border p-4 sm:p-5 transition-colors ${isFailure ? 'border-rose-400/25 bg-rose-500/5' : isNoAnswer ? 'border-dashed border-hairline bg-transparent' : 'border-[#354457] bg-[#18232f]'}`}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-shadow ${isFailure ? 'bg-rose-500/15 text-rose-300' : isNoAnswer ? 'bg-surface-soft text-stone' : 'bg-coral text-white'} ${isStreamingThis ? 'ask-avatar-live' : ''}`}
                          >
                            {isFailure || isNoAnswer ? <AlertCircle size={14} /> : <Bot size={14} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            {message.failed ? (
                              <div className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2.5">
                                <div className="flex items-start gap-2 text-sm leading-relaxed text-rose-100">
                                  <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-300" />
                                  <span>{message.text}</span>
                                </div>
                                <button
                                  onClick={() => void handleAsk(message.retryQuestion || '')}
                                  className="ask-press mt-2 inline-flex items-center gap-1.5 rounded-md border border-rose-300/25 bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-100 hover:bg-rose-500/20"
                                >
                                  Try again <ArrowUp size={12} />
                                </button>
                              </div>
                            ) : isNoAnswer ? (
                              <p className="text-sm italic leading-relaxed text-stone">{message.text}</p>
                            ) : (
                              <AnswerText content={message.text} citations={message.citations} onCitationClick={setSelectedSource} />
                            )}
                            {isStreamingThis && <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-coral align-text-bottom" />}
                          </div>
                        </div>
                        {message.citations && message.citations.length > 0 && (
                          <div className="mt-4 border-t border-hairline pt-4 pl-10">
                            <button
                              type="button"
                              aria-expanded={expandedSources[messageId] ?? true}
                              onClick={() => setExpandedSources((items) => ({ ...items, [messageId]: !(items[messageId] ?? true) }))}
                              className="ask-press mb-2 flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-[10px] font-semibold uppercase tracking-widest text-stone hover:bg-surface hover:text-ink"
                            >
                              <span>{message.citations.length} source{message.citations.length > 1 ? 's' : ''}</span>
                              <ChevronDown size={14} className={`transition-transform duration-200 ${expandedSources[messageId] ?? true ? 'rotate-0' : '-rotate-90'}`} />
                            </button>
                            {(expandedSources[messageId] ?? true) && (
                              <div className="flex flex-col gap-1">
                                {message.citations.map((citation, citationIndex) => (
                                  <button
                                    key={`${citation.article_id}-${citationIndex}`}
                                    onClick={() => setSelectedSource(citation)}
                                    style={{ animationDelay: `${citationIndex * 40}ms` }}
                                    className="ask-fade-up flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-all duration-150 hover:translate-x-0.5 hover:bg-surface hover:shadow-sm"
                                  >
                                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-500/20 text-[11px] font-semibold text-blue-300 transition-transform duration-150 group-hover:scale-105">{citation.source_index ?? citationIndex + 1}</span>
                                    <FileText size={14} className="shrink-0 text-stone" />
                                    <span className="truncate text-[13px] text-steel">{citation.title}</span>
                                    <span className="ml-auto shrink-0 text-[11px] text-stone">{citation.section_ref || 'General'}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="mt-4 flex items-center gap-2 border-t border-hairline/70 pt-3 pl-10">
                          <button
                            onClick={() => void copyMessage(message, index)}
                            className="ask-press flex items-center gap-1.5 rounded-md border border-hairline bg-canvas px-2 py-1 text-xs text-steel transition-[background-color,color,border-color] duration-150 hover:border-[#50627a] hover:bg-surface-soft hover:text-ink"
                            title="Copy answer"
                          >
                            {copiedId === messageId ? <><Check size={13} className="text-success" /> Copied</> : <><Copy size={13} /> Copy answer</>}
                          </button>
                          {message.logId && !message.feedbackSubmitted && (
                            <>
                              <span className="ml-2 text-xs text-stone">Helpful?</span>
                              <button onClick={() => void handleFeedback(index, 1)} className="ask-press rounded-full p-1 text-stone hover:bg-emerald-500/10 hover:text-success"><ThumbsUp size={13} /></button>
                              <button onClick={() => void handleFeedback(index, -1)} className="ask-press rounded-full p-1 text-stone hover:bg-rose-500/10 hover:text-rose-400"><ThumbsDown size={13} /></button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {loading && (
                    <div className="ask-fade-in flex items-center gap-2 pl-10 text-sm text-steel">
                      <span className="flex gap-1">
                        <i className="inline-block h-1.5 w-1.5 rounded-full bg-coral/70" style={{ animation: 'askShimmerDot 1.1s ease-in-out infinite' }} />
                        <i className="inline-block h-1.5 w-1.5 rounded-full bg-coral/70" style={{ animation: 'askShimmerDot 1.1s ease-in-out infinite', animationDelay: '150ms' }} />
                        <i className="inline-block h-1.5 w-1.5 rounded-full bg-coral/70" style={{ animation: 'askShimmerDot 1.1s ease-in-out infinite', animationDelay: '300ms' }} />
                      </span>
                      {t('search.searching')}
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 border-t border-hairline bg-canvas">
            <div className="mx-auto w-full max-w-3xl px-5 py-4 lg:px-8">
              {error && (
                <div className="ask-fade-up mb-3 flex items-start gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-200">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span className="flex-1">{error}</span>
                  <button onClick={() => setError('')} className="ask-press underline hover:text-rose-100">Dismiss</button>
                </div>
              )}
              <div className="mb-2 flex items-center gap-1.5 text-[11px] text-stone">
                Press <kbd className="rounded border border-hairline bg-surface px-1.5 py-0.5 font-mono text-[10px] text-steel">Enter</kbd> to send · <kbd className="rounded border border-hairline bg-surface px-1.5 py-0.5 font-mono text-[10px] text-steel">Shift+Enter</kbd> for a new line
                <span className="ml-auto tabular-nums">{question.length}/4000</span>
              </div>
              <div className="flex items-end gap-2 rounded-xl border border-hairline bg-surface p-2 transition-all duration-200 focus-within:border-minimaxBlue focus-within:shadow-md focus-within:ring-2 focus-within:ring-minimaxBlue/20">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  maxLength={4000}
                  placeholder={t('chat.askPlaceholder')}
                  className="max-h-44 min-h-[28px] flex-1 resize-none overflow-hidden bg-transparent px-2 py-1.5 text-sm leading-relaxed text-ink outline-none placeholder:text-stone"
                />
                <button
                  onClick={() => void handleAsk()}
                  disabled={!question.trim() || loading}
                  aria-label="Send question"
                  className="ask-press grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink text-white transition-all hover:scale-105 hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                >
                  <ArrowUp size={17} />
                </button>
              </div>
            </div>
          </div>
        </main>

        {selectedSource && (
          <>
            <button aria-label="Close source" onClick={() => setSelectedSource(null)} className="ask-fade-in fixed inset-0 z-40 bg-black/40 lg:hidden" />
            <aside className={`${sourceCollapsed ? 'w-12' : 'w-full max-w-sm lg:w-80'} ask-slide-in fixed inset-y-0 right-0 z-50 flex flex-col border-l border-hairline bg-surface transition-[width] duration-300 ease-out lg:static lg:shrink-0`}>
              <header className="flex h-14 shrink-0 items-center gap-2 border-b border-hairline px-3">
                <span className={`${sourceCollapsed ? 'hidden' : 'flex'} flex-1 text-[10px] font-semibold uppercase tracking-widest text-stone`}>Source reference</span>
                <button
                  onClick={() => setSourceCollapsed((value) => !value)}
                  className="ask-press rounded-lg p-2 text-steel hover:bg-surface-soft hover:text-ink"
                  title={sourceCollapsed ? 'Expand source' : 'Collapse source'}
                >
                  {sourceCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
                <button onClick={() => setSelectedSource(null)} className="ask-press rounded-lg p-2 text-steel hover:bg-surface-soft hover:text-ink">
                  <X size={16} />
                </button>
              </header>
              {!sourceCollapsed && (
                <>
                  <div className="ask-scroll ask-fade-in flex-1 overflow-y-auto p-5">
                    <div className="flex items-start gap-2.5">
                      <BookOpen size={16} className="mt-0.5 shrink-0 text-minimaxBlue" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{selectedSource.title}</p>
                        <p className="mt-0.5 text-[11px] text-stone">{selectedSource.section_ref || 'General section'}{selectedSource.page_number ? ` · Page ${selectedSource.page_number}` : ''}</p>
                      </div>
                    </div>
                    <div className="mt-5">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-stone">Source overview</p>
                      <blockquote className="rounded-r-md border-l-2 border-minimaxBlue bg-canvas px-4 py-3 text-xs leading-relaxed text-steel transition-colors">
                        <HighlightedSourceText text={selectedSource.excerpt || ''} highlights={selectedSource.highlight_texts} highlight={selectedSource.highlight_text} />
                      </blockquote>
                    </div>
                    {sourceError && <p className="ask-fade-up mt-3 text-xs text-rose-300">{sourceError}</p>}
                  </div>
                  <footer className="space-y-2 border-t border-hairline p-4">
                    <button
                      disabled={sourceLoading || !sourceUrl}
                      onClick={() => openSourceViewer(selectedSource)}
                      className="ask-press flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-charcoal hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
                    >
                      {sourceLoading ? 'Loading source…' : selectedSource.page_number ? `View PDF · page ${selectedSource.page_number}` : 'View original source'} <BookOpen size={13} />
                    </button>
                    <button
                      onClick={() => navigate(`/articles/${selectedSource.article_id}`)}
                      className="ask-press flex w-full items-center justify-center gap-2 rounded-lg border border-hairline bg-canvas px-3 py-2 text-xs font-semibold text-ink transition-all hover:bg-surface-soft hover:shadow-sm"
                    >
                      Open article <ExternalLink size={13} />
                    </button>
                  </footer>
                </>
              )}
            </aside>
          </>
        )}

        {viewerSource && <PdfViewer open fileName={viewerSource.citation.title} url={viewerSource.url} page={viewerSource.citation.page_number} onClose={() => setViewerSource(null)} />}
      </div>
    </>
  )
}
