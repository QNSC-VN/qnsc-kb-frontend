import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Send, User as UserIcon, HelpCircle, ThumbsUp, ThumbsDown, BookOpen, Plus, Trash2, X, ExternalLink, MessageSquare } from 'lucide-react'
import { askAI, createConversation, deleteConversation, getConversationMessages, getConversations, submitAIFeedback } from '../../api/ai'

interface Citation {
  article_id: string
  title: string
  section_ref?: string
  source_ref: string
  excerpt?: string
}

interface Message {
  id?: string
  sender: 'user' | 'ai'
  text: string
  citations?: Citation[]
  logId?: string
  feedbackSubmitted?: boolean
}

interface Conversation {
  id: string
  title: string
  updated_at: string
}

const WELCOME: Message = {
  sender: 'ai',
  text: 'Hello! I am your QNSC AI Assistant. Ask me about policies, SOPs, or company guidelines. Answers are grounded in the documents you are authorized to access.',
}

const SUGGESTIONS = [
  'What is the SOP for database outage recovery?',
  'What is the corporate travel policy?',
  'Explain what RAG means in QNSC.',
]

function renderAnswer(text: string, citations: Citation[] = [], onSource: (citation: Citation) => void) {
  const parts = text.split(/(\[Source ID:\s*\d+\])/g)
  return parts.map((part, index) => {
    const match = part.match(/\[Source ID:\s*(\d+)\]/)
    if (!match) return <React.Fragment key={index}>{part}</React.Fragment>
    const citation = citations[Number(match[1])]
    return citation ? (
      <button key={index} onClick={() => onSource(citation)} className="mx-1 inline-flex items-center gap-1 rounded-full border border-minimaxBlue/30 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-minimaxBlue hover:bg-blue-100">
        <BookOpen size={11} /> Source {Number(match[1]) + 1}
      </button>
    ) : null
  })
}

export default function AskPage() {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [selectedSource, setSelectedSource] = useState<Citation | null>(null)

  const activeConversation = useMemo(() => conversations.find((item) => item.id === conversationId), [conversations, conversationId])

  const refreshConversations = async () => {
    const items = await getConversations()
    setConversations(items)
    return items
  }

  useEffect(() => {
    refreshConversations().finally(() => setHistoryLoading(false)).catch(console.error)
  }, [])

  const startNewChat = () => {
    setConversationId(null)
    setMessages([WELCOME])
    setQuestion('')
    setSelectedSource(null)
  }

  const selectConversation = async (id: string) => {
    setConversationId(id)
    setSelectedSource(null)
    try {
      const history = await getConversationMessages(id)
      setMessages(history.map((item: any) => ({
        id: item.id,
        sender: item.role === 'user' ? 'user' : 'ai',
        text: item.content,
        citations: item.citations,
        logId: item.usage_log_id,
      })))
    } catch (error) {
      console.error(error)
    }
  }

  const handleAsk = async (queryText: string) => {
    if (!queryText.trim() || loading) return
    setLoading(true)
    setMessages((prev) => [...prev, { sender: 'user', text: queryText }])
    setQuestion('')
    try {
      let activeId = conversationId
      if (!activeId) {
        const conversation = await createConversation(queryText.slice(0, 80))
        activeId = conversation.id
        setConversationId(activeId)
      }
      const data = await askAI(queryText, activeId ?? undefined)
      setMessages((prev) => [...prev, {
        sender: 'ai',
        text: data.answer,
        citations: data.citations,
        logId: data.log_id,
      }])
      await refreshConversations()
    } catch (error) {
      console.error(error)
      setMessages((prev) => [...prev, { sender: 'ai', text: 'I could not complete that request. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id)
      const remaining = await refreshConversations()
      if (conversationId === id) startNewChat()
      if (!remaining.length) startNewChat()
    } catch (error) {
      console.error(error)
    }
  }

  const handleFeedback = async (msgIndex: number, rating: number) => {
    const message = messages[msgIndex]
    if (!message.logId || message.feedbackSubmitted) return
    try {
      await submitAIFeedback({ ai_usage_log_id: message.logId, rating })
      setMessages((prev) => prev.map((item, index) => index === msgIndex ? { ...item, feedbackSubmitted: true } : item))
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-7xl gap-4">
      <aside className="hidden w-64 shrink-0 flex-col rounded-2xl border border-hairline bg-white p-3 lg:flex">
        <button onClick={startNewChat} className="mb-3 flex items-center justify-center gap-2 rounded-full bg-ink px-3 py-2.5 text-sm font-semibold text-white hover:bg-charcoal">
          <Plus size={16} /> New chat
        </button>
        <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-stone">Your conversations</div>
        <div className="flex-1 space-y-1 overflow-y-auto">
          {historyLoading ? <div className="px-2 py-3 text-xs text-stone">Loading history...</div> : conversations.length === 0 ? <div className="px-2 py-3 text-xs text-stone">No saved chats yet.</div> : conversations.map((conversation) => (
            <div key={conversation.id} className={`group flex items-center gap-2 rounded-lg px-2 py-2 ${conversation.id === conversationId ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'}`}>
              <button onClick={() => selectConversation(conversation.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left text-xs">
                <MessageSquare size={14} className="shrink-0" />
                <span className="truncate">{conversation.title}</span>
              </button>
              <button onClick={() => handleDeleteConversation(conversation.id)} className="hidden shrink-0 text-stone hover:text-rose-600 group-hover:block" title="Delete chat"><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-1 flex-col rounded-2xl border border-hairline bg-white p-5">
        <div className="flex items-center justify-between border-b border-hairline-soft pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral text-white"><Bot size={22} /></div>
            <div><h1 className="text-xl font-semibold tracking-tight text-ink">{activeConversation?.title || 'AI Assistant'}</h1><p className="text-xs text-stone">Private, security-scoped QNSC Knowledge Base chat</p></div>
          </div>
          <button onClick={startNewChat} className="rounded-full border border-hairline p-2 text-steel hover:bg-surface hover:text-ink lg:hidden" title="New chat"><Plus size={16} /></button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto py-5 pr-2">
          {messages.map((message, index) => (
            <div key={message.id || `${message.sender}-${index}`} className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.sender === 'ai' && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-coral text-white"><Bot size={16} /></div>}
              <div className="max-w-[88%] space-y-2">
                <div className={`rounded-2xl p-4 text-sm leading-relaxed ${message.sender === 'user' ? 'rounded-tr-none bg-ink text-white' : 'rounded-tl-none border border-hairline bg-surface text-charcoal'}`}>
                  <div className="whitespace-pre-wrap">{message.sender === 'ai' ? renderAnswer(message.text, message.citations, setSelectedSource) : message.text}</div>
                  {message.sender === 'ai' && message.citations && message.citations.length > 0 && <div className="mt-4 border-t border-hairline pt-3"><div className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-stone"><BookOpen size={10} /> Verified sources</div><div className="grid gap-2 sm:grid-cols-2">{message.citations.map((citation, citationIndex) => <button key={`${citation.article_id}-${citationIndex}`} onClick={() => setSelectedSource(citation)} className="rounded-xl border border-hairline bg-white p-2 text-left hover:border-minimaxBlue/40"><div className="truncate text-xs font-semibold text-minimaxBlue">Source {citationIndex + 1}</div><div className="truncate text-[11px] text-steel">{citation.title}</div></button>)}</div></div>}
                </div>
                {message.sender === 'ai' && message.logId && !message.feedbackSubmitted && <div className="flex items-center gap-2 pl-2 text-xs text-stone"><span>Helpful?</span><button onClick={() => handleFeedback(index, 1)} className="hover:text-success"><ThumbsUp size={13} /></button><button onClick={() => handleFeedback(index, -1)} className="hover:text-rose-600"><ThumbsDown size={13} /></button></div>}
              </div>
              {message.sender === 'user' && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-steel"><UserIcon size={16} /></div>}
            </div>
          ))}
          {loading && <div className="flex gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral text-white"><Bot size={16} /></div><div className="rounded-2xl rounded-tl-none border border-hairline bg-surface p-4 text-sm text-steel">Searching authorized documents and preparing a grounded answer...</div></div>}
        </div>

        {messages.length === 1 && <div className="mb-4"><p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-stone"><HelpCircle size={12} /> Suggested questions</p><div className="flex flex-wrap gap-2">{SUGGESTIONS.map((suggestion) => <button key={suggestion} onClick={() => handleAsk(suggestion)} className="rounded-full border border-hairline bg-white px-3 py-1.5 text-xs text-steel hover:bg-surface">{suggestion}</button>)}</div></div>}
        <form onSubmit={(event) => { event.preventDefault(); handleAsk(question) }} className="relative"><input value={question} onChange={(event) => setQuestion(event.target.value)} disabled={loading} placeholder="Ask a question grounded in internal documents..." className="w-full rounded-full border border-hairline bg-white py-4 pl-4 pr-14 text-sm text-ink placeholder-stone outline-none focus:border-minimaxBlue" /><button type="submit" disabled={loading || !question.trim()} className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full bg-ink p-2 text-white hover:bg-charcoal disabled:opacity-40"><Send size={16} /></button></form>
      </main>

      {selectedSource && <aside className="hidden w-80 shrink-0 rounded-2xl border border-hairline bg-white p-4 xl:block"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold text-ink"><BookOpen size={16} className="text-minimaxBlue" /> Source reference</div><button onClick={() => setSelectedSource(null)} className="text-stone hover:text-ink"><X size={16} /></button></div><h2 className="text-sm font-semibold text-minimaxBlue">{selectedSource.title}</h2><p className="mt-1 text-xs text-stone">{selectedSource.section_ref || 'General section'}</p><p className="mt-4 rounded-xl border border-hairline bg-surface p-3 text-xs leading-relaxed text-charcoal">{selectedSource.excerpt || 'Open the article to inspect the full source.'}</p><button onClick={() => navigate(`/articles/${selectedSource.article_id}`)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white hover:bg-charcoal">Open article <ExternalLink size={13} /></button></aside>}
      {selectedSource && <div className="fixed inset-0 z-50 flex items-end bg-ink/40 p-4 backdrop-blur-sm xl:hidden"><div className="w-full rounded-2xl border border-hairline bg-white p-4"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold text-ink"><BookOpen size={16} className="text-minimaxBlue" /> Source reference</div><button onClick={() => setSelectedSource(null)} className="text-stone hover:text-ink"><X size={16} /></button></div><h2 className="text-sm font-semibold text-minimaxBlue">{selectedSource.title}</h2><p className="mt-1 text-xs text-stone">{selectedSource.section_ref || 'General section'}</p><p className="mt-4 rounded-xl border border-hairline bg-surface p-3 text-xs leading-relaxed text-charcoal">{selectedSource.excerpt || 'Open the article to inspect the full source.'}</p><button onClick={() => navigate(`/articles/${selectedSource.article_id}`)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white hover:bg-charcoal">Open article <ExternalLink size={13} /></button></div></div>}
    </div>
  )
}
