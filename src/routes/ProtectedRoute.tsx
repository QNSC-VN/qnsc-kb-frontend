import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  permission?: string
}

export default function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (permission && !user?.permissions?.includes(permission)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
