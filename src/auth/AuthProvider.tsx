import React, { createContext, useEffect, useRef, useState } from 'react'
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
  const logoutInProgress = useRef(false)
  const { token, user, setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    if (token) {
      setLoading(false)
      return
    }
    if (logoutInProgress.current) {
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
    logoutInProgress.current = false
    setAuth(token, user, refreshToken)
  }

  const logout = () => {
    // Clearing local state triggers the authentication bootstrap effect. Keep
    // that effect from renewing the still-active refresh cookie before the
    // logout response has had a chance to clear it.
    logoutInProgress.current = true
    void logoutSession().catch(() => undefined)
    clearAuth()
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, loading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
