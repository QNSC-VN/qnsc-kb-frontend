import React from 'react'
import { NavLink } from 'react-router-dom'
import { BookOpen, Search, Bot, LogOut } from 'lucide-react'
import { useAuth } from '../auth/useAuth'

export default function Sidebar() {
  const { logout, user } = useAuth()

  return (
    <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-900">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white tracking-wider">QNSC KB</h1>
      </div>
      <nav className="flex-1 space-y-1 px-4">
        <NavLink
          to="/articles"
          className={({ isActive }) =>
            `flex items-center space-x-3 rounded-lg px-4 py-2.5 font-medium transition-all ${
              isActive ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <BookOpen size={20} />
          <span>Articles</span>
        </NavLink>
        <NavLink
          to="/search"
          className={({ isActive }) =>
            `flex items-center space-x-3 rounded-lg px-4 py-2.5 font-medium transition-all ${
              isActive ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <Search size={20} />
          <span>Search</span>
        </NavLink>
        <NavLink
          to="/ai"
          className={({ isActive }) =>
            `flex items-center space-x-3 rounded-lg px-4 py-2.5 font-medium transition-all ${
              isActive ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <Bot size={20} />
          <span>AI Assistant</span>
        </NavLink>
      </nav>
      <div className="border-t border-slate-800 p-4">
        <div className="mb-4 flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
            {user?.username?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{user?.username || 'User'}</div>
            <div className="text-xs text-slate-500">{user?.role || 'Viewer'}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center space-x-3 rounded-lg px-4 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/10"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  )
}
