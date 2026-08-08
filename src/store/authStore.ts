import { create } from 'zustand'
import { setAccessToken } from '../api/client'

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: any | null
  setAuth: (token: string, user: any, refreshToken?: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  setAuth: (token, user, refreshToken) => {
    setAccessToken(token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ token, refreshToken: null, user })
  },
  clearAuth: () => {
    localStorage.removeItem('user')
    setAccessToken(null)
    set({ token: null, refreshToken: null, user: null })
  }
}))
