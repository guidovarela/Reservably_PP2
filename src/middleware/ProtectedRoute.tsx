import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Spinner } from '@/components/ui/Spinner'

export function ProtectedRoute() {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}