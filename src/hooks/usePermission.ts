import { useAuth } from '../auth/useAuth'

export function usePermission() {
  const { user } = useAuth()
  const permissions = new Set<string>(user?.permissions || [])
  return {
    has: (permission: string) => permissions.has(permission),
    scope: (permission: string) => user?.permission_scopes?.[permission] || null,
    can: (permission: string) => permissions.has(permission),
  }
}
