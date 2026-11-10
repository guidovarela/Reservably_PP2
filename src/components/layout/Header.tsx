import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from './ThemeToggle'
import { Button } from '@/components/ui/Button'

export function Header() {
  const { session, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const panel = profile?.rol === 'dueno' ? '/dueno' : profile?.rol === 'staff' ? '/staff' : '/cliente'

  async function logout() { await signOut(); navigate('/') }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
      <div className="container mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-brand-500" />
          <span className="font-bold text-lg tracking-tight">El Estilo</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className="px-4 py-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Inicio</Link>
          {session && <Link to={panel} className="px-4 py-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Mi Panel</Link>}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session ? (
            <>
                <span className="hidden sm:inline text-sm text-gray-500">{profile?.nombre ? profile.nombre.charAt(0).toUpperCase() + profile.nombre.slice(1).toLowerCase() : ''}</span>              
                <Button variant="ghost" onClick={logout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex px-4 py-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Ingresar</Link>
              <Link to="/register" className="inline-flex items-center justify-center rounded-full bg-brand-500 text-white px-5 py-2.5 text-sm font-medium hover:bg-brand-600">Crear cuenta</Link>
            </>
          )}
          <button className="md:hidden p-2" onClick={() => setOpen((o) => !o)} aria-label="Menú">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
          <div className="container mx-auto max-w-6xl px-4 py-3 flex flex-col gap-1">
            <Link to="/" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">Inicio</Link>
            {session && <Link to={panel} onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">Mi Panel</Link>}
          </div>
        </div>
      )}
    </header>
  )
}