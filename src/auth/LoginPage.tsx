import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { login as loginApi, register as registerApi } from '../api/auth'

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [dept, setDept] = useState('Engineering')
  const [role, setRole] = useState('Staff')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        // Register flow
        const registerData = {
          email,
          name,
          password,
          dept,
          role
        }
        await registerApi(registerData)
        
        // Auto-login after registration
        const formData = new FormData()
        formData.append('username', email)
        formData.append('password', password)
        const loginData = await loginApi(formData)
        login(loginData.access_token, loginData.user)
        navigate('/')
      } else {
        // Login flow
        const formData = new FormData()
        formData.append('username', email)
        formData.append('password', password)
        const loginData = await loginApi(formData)
        login(loginData.access_token, loginData.user)
        navigate('/')
      }
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="mb-8 text-center">
          <span className="inline-block bg-brand-600 px-3 py-1.5 rounded-xl text-white font-extrabold text-xs mb-3 shadow-lg shadow-brand-600/30">
            QNSC ENTERPRISE
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            {isRegister ? 'Set up your developer profile' : 'Sign in to access your organization KB'}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all text-sm placeholder-slate-600"
                placeholder="John Doe"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all text-sm placeholder-slate-600"
              placeholder="name@qnsc.vn"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all text-sm placeholder-slate-600"
              placeholder="••••••••"
              required
            />
          </div>

          {isRegister && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Department</label>
                <select
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-white outline-none focus:border-brand-500 text-sm"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Security">Security</option>
                  <option value="Human Resources">HR</option>
                  <option value="Legal">Legal</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Testing Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-white outline-none focus:border-brand-500 text-sm"
                >
                  <option value="Staff">Staff</option>
                  <option value="Reviewer">Reviewer</option>
                  <option value="Department Owner">Dept Owner</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-brand-600 py-3 font-semibold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-500 hover:shadow-brand-500/35 disabled:opacity-50 text-sm"
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-slate-400">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister)
              setError('')
            }}
            className="font-semibold text-brand-400 hover:text-brand-300 underline transition-all"
          >
            {isRegister ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  )
}
