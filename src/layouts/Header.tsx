import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Command, Globe, Menu, Monitor, Plus, Search as SearchIcon } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageProvider'
import { usePermission } from '../hooks/usePermission'
import { useTheme, type ThemePreference } from '../theme/ThemeProvider'
import { listNotifications, markNotificationRead, type InAppNotification } from '../api/notifications'

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate()
  const { language, setLanguage, t } = useLanguage()
  const { has } = usePermission()
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState<InAppNotification[]>([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const items = await listNotifications()
        if (active) setNotifications(items)
      } catch {
        // Notifications are supplementary; an unavailable endpoint must not
        // prevent primary navigation from rendering.
      }
    }
    void load()
    const timer = window.setInterval(() => void load(), 60_000)
    return () => { active = false; window.clearInterval(timer) }
  }, [])

  const unreadCount = notifications.filter((item) => !item.read_at).length
  const openNotification = async (item: InAppNotification) => {
    if (!item.read_at) {
      try { await markNotificationRead(item.id) } catch { /* navigation still works */ }
      setNotifications((items) => items.map((entry) => entry.id === item.id ? { ...entry, read_at: new Date().toISOString() } : entry))
    }
    setNotificationsOpen(false)
    if (item.payload.article_id) navigate(`/articles/${item.payload.article_id}`)
    else if (item.payload.draft_id && has('governance.read')) navigate('/governance/pending-drafts')
  }

  return (
    <header className="ops-header relative z-10 flex h-[68px] items-center justify-between gap-3 border-b border-border px-4 backdrop-blur-xl md:px-7">
      <button type="button" onClick={onMenuClick} aria-label="Open navigation" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-surface text-steel transition hover:bg-surface-soft hover:text-ink md:hidden"><Menu size={18} /></button>
      <div className="relative hidden w-full max-w-md md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone">
          <SearchIcon size={18} />
        </span>
        <input
          type="text"
          placeholder={t('header.searchPlaceholder')}
          onFocus={() => navigate('/search')}
          className="w-full rounded-lg border border-border bg-input py-2.5 pl-10 pr-12 text-sm text-foreground placeholder-stone outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
        <span className="absolute inset-y-0 right-0 flex items-center pr-2"><kbd className="rounded border border-border bg-surface-soft px-1.5 py-0.5 font-mono text-[10px] text-stone">⌘ K</kbd></span>
      </div>
      <div className="ml-auto flex items-center gap-2 md:gap-3">
        {has('article.create') && <button type="button" onClick={() => navigate('/articles/new')} className="hidden items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-[0_7px_16px_rgb(var(--shadow)/.18)] transition hover:bg-primary/90 sm:inline-flex"><Plus size={14} /> New article</button>}
        <div className="relative">
          <button type="button" onClick={() => setNotificationsOpen((open) => !open)} title="Notifications" aria-expanded={notificationsOpen} className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-steel transition hover:bg-surface-soft hover:text-ink">
            <Bell size={16} />
            {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white ring-2 ring-surface">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          {notificationsOpen && <div className="absolute right-0 top-11 z-30 w-80 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-3 py-2"><span className="text-sm font-bold text-ink">Notifications</span>{unreadCount > 0 && <span className="text-xs text-stone">{unreadCount} unread</span>}</div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? <p className="px-3 py-6 text-center text-sm text-stone">You’re all caught up.</p> : notifications.map((item) => <button type="button" key={item.id} onClick={() => void openNotification(item)} className={`block w-full border-b border-border px-3 py-3 text-left transition hover:bg-surface-soft ${item.read_at ? 'text-stone' : 'bg-primary/5 text-ink'}`}>
                <span className="block text-sm font-semibold">{item.payload.event === 'draft_assigned' ? 'Draft assigned for review' : item.payload.event === 'draft_rejected' ? 'Draft needs changes' : 'Draft approved'}</span>
                <span className="mt-0.5 block text-xs">{new Date(item.created_at).toLocaleString()}</span>
              </button>)}
            </div>
          </div>}
        </div>
        <label className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-2 text-xs font-semibold text-steel" title={t('language.switch')}>
          <Globe size={13} />
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as 'en' | 'vi')}
            aria-label={t('language.switch')}
            className="cursor-pointer border-0 bg-transparent p-0 text-xs font-semibold text-ink outline-none"
          >
            <option value="en">EN</option>
            <option value="vi">VI</option>
          </select>
        </label>
        <label className="hidden items-center gap-1.5 text-xs font-semibold text-steel md:flex" title="Appearance"><Monitor size={13} /><select value={theme} onChange={(event) => setTheme(event.target.value as ThemePreference)} aria-label="Appearance" className="theme-select"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
        <div className="hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[.12em] text-stone lg:flex"><Command size={12} /> Ops console</div>
      </div>
    </header>
  )
}
