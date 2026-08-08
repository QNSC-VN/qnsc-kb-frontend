import React, { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Activity, AlertTriangle, BookOpen, Bookmark, Bot, ChevronDown, ClipboardList,
  Compass, FileArchive, FileText, FolderTree, Home, LogOut,
  Search, Settings2, Tag, Users, Shield, Sparkles, X, Building2,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { useLanguage } from '../i18n/LanguageProvider'
import { usePermission } from '../hooks/usePermission'

type SectionKey = 'knowledge' | 'governance' | 'admin' | 'metadata'
type IconType = LucideIcon

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `group flex min-w-0 items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${
    isActive ? 'ops-sidebar-active text-foreground shadow-[inset_3px_0_0_rgb(var(--info))]' : 'text-steel ops-sidebar-hover hover:text-ink'
  }`

function NavItem({ to, icon: Icon, children }: { to: string; icon: IconType; children: React.ReactNode }) {
  return <NavLink to={to} className={linkClass}><Icon size={15} className="shrink-0" /><span className="truncate">{children}</span></NavLink>
}

function NavSection({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return <section>
    <button type="button" onClick={onToggle} aria-expanded={open} className="ops-sidebar-hover flex w-full items-center justify-between rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-stone">
      <span className="truncate">{title}</span><ChevronDown size={14} className={`shrink-0 transition-transform ${open ? '' : '-rotate-90'}`} />
    </button>
    {open && <div className="mt-0.5 space-y-0.5">{children}</div>}
  </section>
}

export default function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const { logout, user } = useAuth()
  const location = useLocation()
  const { t } = useLanguage()
  const { has } = usePermission()
  const isReviewerOrAbove = has('governance.read')
  const isAdmin = has('role.manage')
  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>(() => {
    try {
      const stored = localStorage.getItem('qnsc-sidebar-sections')
      return stored ? JSON.parse(stored) : { knowledge: true, governance: true, admin: false, metadata: false }
    } catch { return { knowledge: true, governance: true, admin: false, metadata: false } }
  })

  useEffect(() => { localStorage.setItem('qnsc-sidebar-sections', JSON.stringify(expanded)) }, [expanded])
  useEffect(() => { onClose() }, [location.pathname, onClose])
  const toggle = (key: SectionKey) => setExpanded((current) => ({ ...current, [key]: !current[key] }))

  return <>
    {mobileOpen && <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] md:hidden" />}
    <aside className={`ops-sidebar fixed inset-y-0 left-0 z-40 flex h-[100dvh] min-h-0 w-[280px] shrink-0 flex-col overflow-hidden border-r border-border shadow-2xl transition-transform duration-200 md:relative md:z-20 md:h-full md:w-[272px] md:translate-x-0 md:shadow-none ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="border-b border-border px-5 py-5">
        <div className="flex items-center justify-between gap-3"><h1 className="flex min-w-0 items-center gap-2.5 text-base font-semibold tracking-tight text-ink"><span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary-muted to-primary text-[11px] font-extrabold text-primary-foreground shadow-[0_6px_15px_rgb(var(--shadow)/.2)]">Q</span><span className="min-w-0"><span className="block truncate leading-4">QNSC</span><span className="block text-[10px] font-medium uppercase tracking-[.14em] text-stone">Control room</span></span></h1><button type="button" onClick={onClose} aria-label="Close navigation" className="grid h-8 w-8 place-items-center rounded-lg text-stone transition hover:bg-surface-soft hover:text-ink md:hidden"><X size={17} /></button></div>
      </div>

      <nav className="sidebar-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4">
        <NavSection title={t('nav.knowledge')} open={expanded.knowledge} onToggle={() => toggle('knowledge')}>
          <NavItem to="/home" icon={Home}>Home</NavItem><NavItem to="/articles" icon={BookOpen}>{t('nav.articles')}</NavItem><NavItem to="/search" icon={Search}>{t('nav.search')}</NavItem><NavItem to="/ai" icon={Bot}>{t('nav.aiAssistant')}</NavItem><NavItem to="/bookmarks" icon={Bookmark}>Saved</NavItem>
        </NavSection>
        {isReviewerOrAbove && <NavSection title={t('nav.governance')} open={expanded.governance} onToggle={() => toggle('governance')}>
          <NavItem to="/governance/pending-drafts" icon={FileText}>{t('nav.pendingDrafts')}</NavItem><NavItem to="/governance/gap-queue" icon={AlertTriangle}>{t('nav.gapQueue')}</NavItem><NavItem to="/governance/health" icon={Activity}>{t('nav.healthDashboard')}</NavItem>{isAdmin && <NavItem to="/governance/audit-log" icon={ClipboardList}>{t('nav.auditLogs')}</NavItem>}
        </NavSection>}
        <NavSection title="Administration" open={expanded.admin} onToggle={() => toggle('admin')}>
          {has('user.manage') && <NavItem to="/admin/users" icon={Users}>{t('nav.usersRoles')}</NavItem>}{has('user.manage') && <NavItem to="/admin/departments" icon={Building2}>Departments</NavItem>}{has('role.manage') && <NavItem to="/admin/roles" icon={Shield}>Roles &amp; permissions</NavItem>}{has('connector.manage') && <NavItem to="/admin/connectors" icon={FolderTree}>{t('nav.sourceConnectors')}</NavItem>}{has('role.manage') && <NavItem to="/admin/features" icon={Settings2}>{t('nav.featureControls')}</NavItem>}{has('role.manage') && <NavItem to="/admin/llm" icon={Sparkles}>AI provider</NavItem>}{has('article.create') && <NavItem to="/sources" icon={FileArchive}>Sources &amp; files</NavItem>}
        </NavSection>
        <NavSection title={t('nav.metadata')} open={expanded.metadata} onToggle={() => toggle('metadata')}>
          <NavItem to="/meta/tags" icon={Tag}>{t('nav.tags')}</NavItem><NavItem to="/meta/glossary" icon={Compass}>{t('nav.glossary')}</NavItem>
        </NavSection>
      </nav>

      <div className="border-t border-border p-3"><div className="mb-2 flex items-center gap-2.5 rounded-lg border border-border bg-surface px-2.5 py-2.5"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-[10px] font-bold text-secondary-foreground">{user?.name?.substring(0, 2).toUpperCase() || 'US'}</div><div className="min-w-0"><div className="truncate text-xs font-semibold text-ink">{user?.name || 'User'}</div><div className="truncate text-[11px] text-stone">{user?.role || 'Staff'}</div></div></div><button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-400/10"><LogOut size={14} /><span>{t('nav.logOut')}</span></button></div>
    </aside>
  </>
}
