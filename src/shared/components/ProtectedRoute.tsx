import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { useAuth } from '@/features/auth/contexts/AuthContext'
import type { AppRole } from '@/features/auth/types'

interface ProtectedRouteProps {
  /** Restringe o acesso a administradores (papel `admin`) ou super admins. */
  adminOnly?: boolean
  /** Lista de papéis autorizados. Super admin sempre tem acesso. */
  allowedRoles?: AppRole[]
  /** Conteúdo a proteger. Se ausente, usa <Outlet /> (rota de layout). */
  children?: ReactNode
}

export function ProtectedRoute({
  adminOnly = false,
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const { session, loading, roles, isAdmin, isSuperAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/auth" replace state={{ from: location }} />
  }

  if (adminOnly && !isAdmin && !isSuperAdmin) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const autorizado =
      isSuperAdmin || allowedRoles.some((role) => roles.includes(role))
    if (!autorizado) {
      return <Navigate to="/" replace />
    }
  }

  return <>{children ?? <Outlet />}</>
}
