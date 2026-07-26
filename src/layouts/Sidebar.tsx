import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  BookOpen, 
  Search, 
  Bot, 
  LogOut, 
  FileText, 
  AlertTriangle, 
  ClipboardList, 
  Activity, 
  Tag, 
  Compass,
  FolderTree,
  Users,
  Settings2
} from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { useLanguage } from '../i18n/LanguageProvider'

export default function Sidebar() {
  const { logout, user } = useAuth()
  const { t } = useLanguage()

  const isReviewerOrAbove = user && ["Admin", "CEO", "Reviewer", "Department Owner"].includes(user.role)
  const isAdmin = user && user.role === "Admin"

  return (
    <aside className="flex h-full min-h-0 w-64 shrink-0 flex-col overflow-hidden border-r border-hairline-soft bg-white">
      <div className="p-4">
        <h1 className="flex items-center gap-2 text-base font-semibold tracking-tight text-ink">
          <span className="rounded-md bg-ink px-1.5 py-1 text-[10px] font-bold text-white">QNSC</span>
          <span>{t('app.knowledgeBase')}</span>
        </h1>
      </div>
      
      <nav className="flex-1 space-y-4 px-3">
        {/* Core Knowledge section */}
        <div>
          <h2 className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-stone">{t('nav.knowledge')}</h2>
          <div className="space-y-0.5">
            <NavLink
              to="/articles"
              className={({ isActive }) =>
                  `flex items-center space-x-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'
                }`
              }
            >
              <BookOpen size={16} />
              <span>{t('nav.articles')}</span>
            </NavLink>
            <NavLink
              to="/search"
              className={({ isActive }) =>
                  `flex items-center space-x-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'
                }`
              }
            >
              <Search size={16} />
              <span>{t('nav.search')}</span>
            </NavLink>
            <NavLink
              to="/ai"
              className={({ isActive }) =>
                  `flex items-center space-x-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'
                }`
              }
            >
              <Bot size={16} />
              <span>{t('nav.aiAssistant')}</span>
            </NavLink>
          </div>
        </div>

        {/* Governance section */}
        {isReviewerOrAbove && (
          <div>
            <h2 className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-stone">{t('nav.governance')}</h2>
            <div className="space-y-0.5">
              <NavLink
                to="/governance/pending-drafts"
                className={({ isActive }) =>
                    `flex items-center space-x-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                    isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'
                  }`
                }
              >
                <FileText size={16} />
                <span>{t('nav.pendingDrafts')}</span>
              </NavLink>
              <NavLink
                to="/governance/gap-queue"
                className={({ isActive }) =>
                    `flex items-center space-x-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                    isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'
                  }`
                }
              >
                <AlertTriangle size={16} />
                <span>{t('nav.gapQueue')}</span>
              </NavLink>
              <NavLink
                to="/governance/health"
                className={({ isActive }) =>
                    `flex items-center space-x-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                    isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'
                  }`
                }
              >
                <Activity size={16} />
                <span>{t('nav.healthDashboard')}</span>
              </NavLink>
              {isAdmin && (
                <NavLink
                  to="/governance/audit-log"
                  className={({ isActive }) =>
                      `flex items-center space-x-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                      isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'
                    }`
                  }
                >
                  <ClipboardList size={16} />
                  <span>{t('nav.auditLogs')}</span>
                </NavLink>
              )}
              {isAdmin && <NavLink to="/admin/users" className={({ isActive }) => `flex items-center space-x-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'}`}><Users size={16} /><span>{t('nav.usersRoles')}</span></NavLink>}
              {user && ["Admin", "CEO"].includes(user.role) && <NavLink to="/admin/connectors" className={({ isActive }) => `flex items-center space-x-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'}`}><FolderTree size={16} /><span>{t('nav.sourceConnectors')}</span></NavLink>}
              {user && ["Admin", "CEO"].includes(user.role) && <NavLink to="/admin/features" className={({ isActive }) => `flex items-center space-x-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'}`}><Settings2 size={16} /><span>{t('nav.featureControls')}</span></NavLink>}
            </div>
          </div>
        )}

        {/* Metadata section */}
        <div>
            <h2 className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-stone">{t('nav.metadata')}</h2>
            <div className="space-y-0.5">
            <NavLink
              to="/meta/tags"
              className={({ isActive }) =>
                  `flex items-center space-x-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'
                }`
              }
            >
              <Tag size={16} />
              <span>{t('nav.tags')}</span>
            </NavLink>
            <NavLink
              to="/meta/glossary"
              className={({ isActive }) =>
                  `flex items-center space-x-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'
                }`
              }
            >
              <Compass size={16} />
              <span>{t('nav.glossary')}</span>
            </NavLink>
            <NavLink
              to="/meta/taxonomy"
              className={({ isActive }) =>
                  `flex items-center space-x-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'
                }`
              }
            >
              <FolderTree size={16} />
              <span>{t('nav.taxonomy')}</span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Footer / Auth state */}
      <div className="border-t border-hairline-soft p-3">
        <div className="mb-2 flex items-center space-x-2 rounded-lg border border-hairline bg-surface p-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
            {user?.name?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="truncate">
            <div className="truncate text-xs font-semibold text-ink">{user?.name || 'User'}</div>
            <div className="truncate text-[11px] text-stone">{user?.role || 'Staff'}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center space-x-2 rounded-full px-3 py-1.5 text-xs font-medium text-rose-600 transition-all hover:bg-rose-50"
        >
          <LogOut size={14} />
          <span>{t('nav.logOut')}</span>
        </button>
      </div>
    </aside>
  )
}
