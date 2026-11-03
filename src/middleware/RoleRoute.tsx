import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { RolUsuario } from '@/types/database'
import { Spinner } from '@/components/ui/Spinner'

export function RoleRoute({ allow, redirectTo = '/cliente' }: { allow: RolUsuario[]; redirectTo?: string }) {
  const { profile, loading } = useAuth()
  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>
  if (!profile) return <Navigate to="/login" replace />
  if (!allow.includes(profile.rol)) return <Navigate to={redirectTo} replace />
  return <Outlet />
}