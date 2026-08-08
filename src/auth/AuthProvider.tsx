import React, { createContext, useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { logoutSession } from '../api/auth'
import { getAccessToken, refreshSession } from '../api/client'

interface AuthContextType {
  isAuthenticated: boolean
  loading: boolean
  user: any
  login: (token: string, user: any, refreshToken?: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const { token, user, setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    if (token) {
      setLoading(false)
      return
    }
    void refreshSession().then((ok) => {
      const refreshedUser = JSON.parse(localStorage.getItem('user') || 'null')
      const refreshedToken = getAccessToken()
      if (ok && refreshedToken && refreshedUser) setAuth(refreshedToken, refreshedUser)
    }).finally(() => setLoading(false))
  }, [token])

  const login = (token: string, user: any, refreshToken?: string) => {
    setAuth(token, user, refreshToken)
  }

  const logout = () => {
    void logoutSession().catch(() => undefined)
    clearAuth()
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, loading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
