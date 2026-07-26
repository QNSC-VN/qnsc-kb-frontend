import React, { createContext, useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

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
    setLoading(false)
  }, [token])

  const login = (token: string, user: any, refreshToken?: string) => {
    setAuth(token, user, refreshToken)
  }

  const logout = () => {
    clearAuth()
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, loading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
