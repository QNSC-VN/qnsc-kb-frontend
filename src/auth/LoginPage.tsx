import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login('mock-jwt-token', { username, email: `${username}@qnsc.vn`, role: 'admin' })
    navigate('/')
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-950 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <h2 className="mb-6 text-center text-3xl font-extrabold tracking-tight text-white">QNSC Knowledge Base</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-white outline-none focus:border-brand-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-white outline-none focus:border-brand-500"
              required
            />
          </div>
          <button type="submit" className="mt-6 w-full rounded-lg bg-brand-600 py-3 font-semibold text-white transition-all hover:bg-brand-500">
            Sign In
          </button>
        </div>
      </form>
    </div>
  )
}
