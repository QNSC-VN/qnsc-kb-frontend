import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
