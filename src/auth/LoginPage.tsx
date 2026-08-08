import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Monitor, ShieldCheck } from 'lucide-react'
import { useAuth } from './useAuth'
import { login as loginApi } from '../api/auth'
import { useLanguage } from '../i18n/LanguageProvider'
import { useTheme, type ThemePreference } from '../theme/ThemeProvider'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { language, setLanguage, t } = useLanguage()
  const { theme, setTheme } = useTheme()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)
      const loginData = await loginApi(formData)
      login(loginData.access_token, loginData.user, loginData.refresh_token)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || t('auth.invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  return <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
    <div className="pointer-events-none absolute -left-40 -top-48 h-[480px] w-[480px] rounded-full bg-primary/15 blur-3xl" /><div className="pointer-events-none absolute -bottom-56 -right-24 h-[420px] w-[420px] rounded-full bg-info/10 blur-3xl" />
    <div className="absolute right-5 top-5 flex items-center gap-2">
    <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><Monitor size={13} /><select value={theme} onChange={event => setTheme(event.target.value as ThemePreference)} className="theme-select" aria-label="Appearance"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
    <select value={language} onChange={event => setLanguage(event.target.value as 'en' | 'vi')} className="theme-select" aria-label={t('language.switch')}>
      <option value="en">English</option>
      <option value="vi">Tiếng Việt</option>
    </select>
    </div>
    <form onSubmit={handleSubmit} className="ops-elevated relative w-full max-w-md rounded-2xl border border-border p-8 shadow-2xl shadow-[rgb(var(--shadow)/.22)] backdrop-blur-xl">
      <div className="mb-8 text-center">
        <span className="mb-3 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-extrabold tracking-wide text-primary-foreground shadow-lg shadow-[rgb(var(--shadow)/.16)]"><ShieldCheck size={14} />QNSC CONTROL</span>
        <h1 className="text-2xl font-bold text-white">{t('auth.signIn')}</h1>
        <p className="mt-2 text-sm text-slate-400">{language === 'vi' ? 'Sử dụng tài khoản công ty được cấp.' : 'Use your provisioned company account.'}</p>
      </div>
      {error && <div className="mb-5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400">{error}</div>}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-secondary-foreground">{t('auth.email')}<input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-input px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" placeholder="name@company.com" required /></label>
        <label className="block text-sm font-semibold text-secondary-foreground">{t('auth.password')}<input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-input px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" required /></label>
        <button disabled={loading} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"><Mail size={15} />{loading ? t('auth.signingIn') : t('auth.signInEmail')}</button>
      </div>
      <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">Accounts are created by an Admin or CEO. Microsoft SSO will appear here when Entra ID is configured.</p>
    </form>
  </div>
}
