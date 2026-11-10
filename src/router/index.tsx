import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Spinner } from '@/components/ui/Spinner'
import { ProtectedRoute } from '@/middleware/ProtectedRoute'
import { RoleRoute } from '@/middleware/RoleRoute'

const Landing = lazy(() => import('@/pages/landing/LandingPage'))
const Login = lazy(() => import('@/pages/auth/LoginPage'))
const Register = lazy(() => import('@/pages/auth/RegisterPage'))
const ClienteDashboard = lazy(() => import('@/pages/cliente/ClienteDashboard'))
const NuevoTurno = lazy(() => import('@/pages/cliente/NuevoTurno'))
const MisTurnos = lazy(() => import('@/pages/cliente/MisTurnos'))
const StaffDashboard = lazy(() => import('@/pages/staff/StaffDashboard'))
const DuenoDashboard = lazy(() => import('@/pages/dueno/DuenoDashboard'))
const ServiciosAdmin = lazy(() => import('@/pages/dueno/ServiciosAdmin'))
const StaffAdmin = lazy(() => import('@/pages/dueno/StaffAdmin'))

const Load = () => <div className="min-h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>

const router = createBrowserRouter([
  {
    path: '/', element: <Layout />,
    children: [
      { index: true, element: <Suspense fallback={<Load />}><Landing /></Suspense> },
      { path: 'login', element: <Suspense fallback={<Load />}><Login /></Suspense> },
      { path: 'register', element: <Suspense fallback={<Load />}><Register /></Suspense> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'cliente', element: <RoleRoute allow={['cliente']} />,
            children: [
              { index: true, element: <Suspense fallback={<Load />}><ClienteDashboard /></Suspense> },
              { path: 'nuevo-turno', element: <Suspense fallback={<Load />}><NuevoTurno /></Suspense> },
              { path: 'mis-turnos', element: <Suspense fallback={<Load />}><MisTurnos /></Suspense> },
            ],
          },
          {
            path: 'staff', element: <RoleRoute allow={['staff']} />,
            children: [{ index: true, element: <Suspense fallback={<Load />}><StaffDashboard /></Suspense> }],
          },
          {
          path: 'dueno', element: <RoleRoute allow={['dueno', 'admin']} />,
          children: [
            { index: true, element: <Suspense fallback={<Load />}><DuenoDashboard /></Suspense> },
            { path: 'servicios', element: <Suspense fallback={<Load />}><ServiciosAdmin /></Suspense> },
            { path: 'staff', element: <Suspense fallback={<Load />}><StaffAdmin /></Suspense> },
          ],
          },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export function AppRouter() { return <RouterProvider router={router} /> }