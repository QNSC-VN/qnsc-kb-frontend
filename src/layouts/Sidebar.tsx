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
  FolderTree
} from 'lucide-react'
import { useAuth } from '../auth/useAuth'

export default function Sidebar() {
  const { logout, user } = useAuth()

  const isReviewerOrAbove = user && ["Admin", "Reviewer", "Department Owner"].includes(user.role)
  const isAdmin = user && user.role === "Admin"

  return (
    <aside className="flex w-64 flex-col border-r border-hairline-soft bg-white overflow-y-auto">
      <div className="p-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink">
          <span className="rounded-lg bg-ink px-2 py-1.5 text-xs font-bold text-white">QNSC</span>
          <span>Knowledge Base</span>
        </h1>
      </div>
      
      <nav className="flex-1 space-y-6 px-4">
        {/* Core Knowledge section */}
        <div>
          <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-stone">Knowledge</h2>
          <div className="space-y-1">
            <NavLink
              to="/articles"
              className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-lg px-4 py-2.5 font-medium transition-all ${
                  isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'
                }`
              }
            >
              <BookOpen size={18} />
              <span>Articles</span>
            </NavLink>
            <NavLink
              to="/search"
              className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-lg px-4 py-2.5 font-medium transition-all ${
                  isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'
                }`
              }
            >
              <Search size={18} />
              <span>Search</span>
            </NavLink>
            <NavLink
              to="/ai"
              className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-lg px-4 py-2.5 font-medium transition-all ${
                  isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'
                }`
              }
            >
              <Bot size={18} />
              <span>AI Assistant</span>
            </NavLink>
          </div>
        </div>

        {/* Governance section */}
        {isReviewerOrAbove && (
          <div>
            <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-stone">Governance</h2>
            <div className="space-y-1">
              <NavLink
                to="/governance/pending-drafts"
                className={({ isActive }) =>
                    `flex items-center space-x-3 rounded-lg px-4 py-2.5 font-medium transition-all ${
                    isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'
                  }`
                }
              >
                <FileText size={18} />
                <span>Pending Drafts</span>
              </NavLink>
              <NavLink
                to="/governance/gap-queue"
                className={({ isActive }) =>
                    `flex items-center space-x-3 rounded-lg px-4 py-2.5 font-medium transition-all ${
                    isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'
                  }`
                }
              >
                <AlertTriangle size={18} />
                <span>Gap Queue</span>
              </NavLink>
              <NavLink
                to="/governance/health"
                className={({ isActive }) =>
                    `flex items-center space-x-3 rounded-lg px-4 py-2.5 font-medium transition-all ${
                    isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'
                  }`
                }
              >
                <Activity size={18} />
                <span>Health Dashboard</span>
              </NavLink>
              {isAdmin && (
                <NavLink
                  to="/governance/audit-log"
                  className={({ isActive }) =>
                      `flex items-center space-x-3 rounded-lg px-4 py-2.5 font-medium transition-all ${
                      isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'
                    }`
                  }
                >
                  <ClipboardList size={18} />
                  <span>Audit Logs</span>
                </NavLink>
              )}
            </div>
          </div>
        )}

        {/* Metadata section */}
        <div>
          <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-stone">Metadata</h2>
          <div className="space-y-1">
            <NavLink
              to="/meta/tags"
              className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-lg px-4 py-2.5 font-medium transition-all ${
                  isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'
                }`
              }
            >
              <Tag size={18} />
              <span>Tags</span>
            </NavLink>
            <NavLink
              to="/meta/glossary"
              className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-lg px-4 py-2.5 font-medium transition-all ${
                  isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'
                }`
              }
            >
              <Compass size={18} />
              <span>Glossary</span>
            </NavLink>
            <NavLink
              to="/meta/taxonomy"
              className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-lg px-4 py-2.5 font-medium transition-all ${
                  isActive ? 'bg-surface text-ink' : 'text-steel hover:bg-surface-soft hover:text-ink'
                }`
              }
            >
              <FolderTree size={18} />
              <span>Taxonomy</span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Footer / Auth state */}
      <div className="border-t border-hairline-soft p-4">
        <div className="mb-4 flex items-center space-x-3 rounded-xl border border-hairline bg-surface p-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
            {user?.name?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="truncate">
            <div className="truncate text-sm font-semibold text-ink">{user?.name || 'User'}</div>
            <div className="truncate text-xs text-stone">{user?.role || 'Staff'}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center space-x-3 rounded-full px-4 py-2.5 text-sm font-medium text-rose-600 transition-all hover:bg-rose-50"
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  )
}
