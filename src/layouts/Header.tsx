import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, Search as SearchIcon } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageProvider'

export default function Header() {
  const navigate = useNavigate()
  const { language, setLanguage, t } = useLanguage()

  return (
    <header className="flex h-16 items-center justify-between border-b border-hairline-soft bg-white px-6">
      <div className="relative w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone">
          <SearchIcon size={18} />
        </span>
        <input
          type="text"
          placeholder={t('header.searchPlaceholder')}
          onFocus={() => navigate('/search')}
          className="w-full rounded-full border border-hairline bg-surface py-2 pl-10 pr-4 text-sm text-ink placeholder-stone outline-none focus:border-minimaxBlue"
        />
      </div>
      <div className="flex items-center space-x-4">
        <label className="flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-semibold text-steel" title={t('language.switch')}>
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
        <div className="rounded-full border border-hairline bg-white px-3 py-1 text-xs font-semibold text-steel">
          v0.1.0-alpha
        </div>
      </div>
    </header>
  )
}
