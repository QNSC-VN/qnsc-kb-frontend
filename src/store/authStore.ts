import { create } from 'zustand'

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: any | null
  setAuth: (token: string, user: any, refreshToken?: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refresh_token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  setAuth: (token, user, refreshToken) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken)
    set({ token, refreshToken: refreshToken || localStorage.getItem('refresh_token'), user })
  },
  clearAuth: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('refresh_token')
    set({ token: null, refreshToken: null, user: null })
  }
}))
