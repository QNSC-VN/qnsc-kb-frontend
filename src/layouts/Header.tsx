import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'

export default function Header() {
  const navigate = useNavigate()

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/50 px-6 backdrop-blur-md">
      <div className="relative w-96">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
          <SearchIcon size={18} />
        </span>
        <input
          type="text"
          placeholder="Global search articles, gaps, or glossary..."
          onFocus={() => navigate('/search')}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 py-1.5 pl-10 pr-4 text-sm text-white placeholder-slate-400 outline-none focus:border-brand-500"
        />
      </div>
      <div className="flex items-center space-x-4">
        <div className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-brand-400">
          v0.1.0-alpha
        </div>
      </div>
    </header>
  )
}
