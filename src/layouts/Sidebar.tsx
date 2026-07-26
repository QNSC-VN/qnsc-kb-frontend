import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Activity, AlertTriangle, BookOpen, Bookmark, Bot, ChevronDown, ClipboardList,
  Compass, FileArchive, FileText, FolderTree, Home, LayoutTemplate, Lock, LogOut,
  Search, Settings2, Tag, Users,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { useLanguage } from '../i18n/LanguageProvider'

type SectionKey = 'knowledge' | 'governance' | 'admin' | 'metadata'
type IconType = LucideIcon

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-w-0 items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
    isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'
  }`

function NavItem({ to, icon: Icon, children }: { to: string; icon: IconType; children: React.ReactNode }) {
  return <NavLink to={to} className={linkClass}><Icon size={15} className="shrink-0" /><span className="truncate">{children}</span></NavLink>
}

function NavSection({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return <section>
    <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-stone hover:bg-surface-soft">
      <span className="truncate">{title}</span><ChevronDown size={14} className={`shrink-0 transition-transform ${open ? '' : '-rotate-90'}`} />
    </button>
    {open && <div className="mt-0.5 space-y-0.5">{children}</div>}
  </section>
}

export default function Sidebar() {
  const { logout, user } = useAuth()
  const { t } = useLanguage()
  const isReviewerOrAbove = Boolean(user && ['Admin', 'CEO', 'Reviewer', 'Department Owner'].includes(user.role))
  const isAdmin = user?.role === 'Admin'
  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>(() => {
    try {
      const stored = localStorage.getItem('qnsc-sidebar-sections')
      return stored ? JSON.parse(stored) : { knowledge: true, governance: true, admin: false, metadata: false }
    } catch { return { knowledge: true, governance: true, admin: false, metadata: false } }
  })

  useEffect(() => { localStorage.setItem('qnsc-sidebar-sections', JSON.stringify(expanded)) }, [expanded])
  const toggle = (key: SectionKey) => setExpanded((current) => ({ ...current, [key]: !current[key] }))

  return <aside className="flex h-full min-h-0 w-60 shrink-0 flex-col overflow-hidden border-r border-hairline-soft bg-white">
    <div className="px-4 py-4">
      <h1 className="flex items-center gap-2 text-base font-semibold tracking-tight text-ink">
        <span className="rounded bg-ink px-1.5 py-0.5 text-[9px] font-bold text-white">QNSC</span>
        <span className="truncate">{t('app.knowledgeBase')}</span>
      </h1>
    </div>

    <nav className="sidebar-scroll min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 pb-3">
      <NavSection title={t('nav.knowledge')} open={expanded.knowledge} onToggle={() => toggle('knowledge')}>
        <NavItem to="/home" icon={Home}>Home</NavItem>
        <NavItem to="/articles" icon={BookOpen}>{t('nav.articles')}</NavItem>
        <NavItem to="/search" icon={Search}>{t('nav.search')}</NavItem>
        <NavItem to="/ai" icon={Bot}>{t('nav.aiAssistant')}</NavItem>
        <NavItem to="/browse" icon={FolderTree}>Browse library</NavItem>
        <NavItem to="/bookmarks" icon={Bookmark}>Saved</NavItem>
      </NavSection>

      {isReviewerOrAbove && <NavSection title={t('nav.governance')} open={expanded.governance} onToggle={() => toggle('governance')}>
        <NavItem to="/governance/pending-drafts" icon={FileText}>{t('nav.pendingDrafts')}</NavItem>
        <NavItem to="/governance/gap-queue" icon={AlertTriangle}>{t('nav.gapQueue')}</NavItem>
        <NavItem to="/governance/health" icon={Activity}>{t('nav.healthDashboard')}</NavItem>
        {isAdmin && <NavItem to="/governance/audit-log" icon={ClipboardList}>{t('nav.auditLogs')}</NavItem>}
        {isAdmin && <NavItem to="/admin/users" icon={Users}>{t('nav.usersRoles')}</NavItem>}
        {['Admin', 'CEO'].includes(user?.role || '') && <NavItem to="/admin/connectors" icon={FolderTree}>{t('nav.sourceConnectors')}</NavItem>}
        {['Admin', 'CEO'].includes(user?.role || '') && <NavItem to="/admin/features" icon={Settings2}>{t('nav.featureControls')}</NavItem>}
      </NavSection>}

      <NavSection title="Knowledge admin" open={expanded.admin} onToggle={() => toggle('admin')}>
        <NavItem to="/sources" icon={FileArchive}>Sources &amp; files</NavItem>
        <NavItem to="/templates" icon={LayoutTemplate}>Templates</NavItem>
        <NavItem to="/permissions" icon={Lock}>Permissions</NavItem>
      </NavSection>

      <NavSection title={t('nav.metadata')} open={expanded.metadata} onToggle={() => toggle('metadata')}>
        <NavItem to="/meta/tags" icon={Tag}>{t('nav.tags')}</NavItem>
        <NavItem to="/meta/glossary" icon={Compass}>{t('nav.glossary')}</NavItem>
        <NavItem to="/meta/taxonomy" icon={FolderTree}>{t('nav.taxonomy')}</NavItem>
      </NavSection>
    </nav>

    <div className="border-t border-hairline-soft p-3">
      <div className="mb-2 flex items-center gap-2 rounded-md border border-hairline bg-surface px-2.5 py-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">{user?.name?.substring(0, 2).toUpperCase() || 'US'}</div>
        <div className="min-w-0"><div className="truncate text-xs font-semibold text-ink">{user?.name || 'User'}</div><div className="truncate text-[11px] text-stone">{user?.role || 'Staff'}</div></div>
      </div>
      <button onClick={logout} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"><LogOut size={14} /><span>{t('nav.logOut')}</span></button>
    </div>
  </aside>
}
