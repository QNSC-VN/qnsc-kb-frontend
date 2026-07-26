import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from './useAuth'
import { login as loginApi } from '../api/auth'
import { useLanguage } from '../i18n/LanguageProvider'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { language, setLanguage, t } = useLanguage()

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

  return <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4">
    <select value={language} onChange={event => setLanguage(event.target.value as 'en' | 'vi')} className="absolute right-5 top-5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-white outline-none" aria-label={t('language.switch')}>
      <option value="en">English</option>
      <option value="vi">Tiếng Việt</option>
    </select>
    <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
      <div className="mb-8 text-center">
        <span className="mb-3 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-extrabold text-white"><ShieldCheck size={14} />QNSC ENTERPRISE</span>
        <h1 className="text-2xl font-bold text-white">{t('auth.signIn')}</h1>
        <p className="mt-2 text-sm text-slate-400">{language === 'vi' ? 'Sử dụng tài khoản công ty được cấp.' : 'Use your provisioned company account.'}</p>
      </div>
      {error && <div className="mb-5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400">{error}</div>}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-slate-300">{t('auth.email')}<input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-brand-500" placeholder="name@company.com" required /></label>
        <label className="block text-sm font-semibold text-slate-300">{t('auth.password')}<input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-brand-500" required /></label>
        <button disabled={loading} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"><Mail size={15} />{loading ? t('auth.signingIn') : t('auth.signInEmail')}</button>
      </div>
      <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">Accounts are created by an Admin or CEO. Microsoft SSO will appear here when Entra ID is configured.</p>
    </form>
  </div>
}
