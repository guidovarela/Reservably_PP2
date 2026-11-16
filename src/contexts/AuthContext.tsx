import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { SignUpInput, Usuario } from '@/types/database'

interface SignUpResult {
  error: string | null
  requiresEmailConfirmation?: boolean
}

interface Ctx {
  session: Session | null
  user: User | null
  profile: Usuario | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (input: SignUpInput) => Promise<SignUpResult>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}
const AuthContext = createContext<Ctx | undefined>(undefined)

function normalizeOptional(value?: string | null): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function mapSignUpError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return 'Ya existe una cuenta registrada con ese email.'
  }
  if (lower.includes('password') && lower.includes('at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }
  if (lower.includes('invalid email') || lower.includes('unable to validate email')) {
    return 'Ingresá un email válido.'
  }
  if (lower.includes('database error saving new user')) {
    return 'No se pudo registrar el perfil de usuario. Verificá los datos e intentá nuevamente.'
  }
  return message
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string): Promise<Usuario | null> {
    const { data, error } = await supabase.from('usuario').select('*').eq('id', userId).single()
    if (error) { console.error('[auth]', error); setProfile(null); return null }
    const loaded = data as Usuario
    setProfile(loaded)
    return loaded
  }

  async function refreshProfile() { if (user) await loadProfile(user.id) }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      if (data.session?.user) loadProfile(data.session.user.id).finally(() => setLoading(false))
      else setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) loadProfile(s.user.id)
      else setProfile(null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signUp(input: SignUpInput): Promise<SignUpResult> {
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: {
        data: {
          nombre: input.nombre.trim(),
          apellido: normalizeOptional(input.apellido),
          telefono: normalizeOptional(input.telefono),
          fecha_nacimiento: normalizeOptional(input.fecha_nacimiento),
          preferencias: normalizeOptional(input.preferencias),
          foto_url: normalizeOptional(input.foto_url),
          rol: 'cliente',
          estado: 'ACTIVO',
        },
      },
    })
    if (error) return { error: mapSignUpError(error.message) }

    if (data.session && data.user) {
      setSession(data.session)
      setUser(data.user)
      await loadProfile(data.user.id)
      return { error: null, requiresEmailConfirmation: false }
    }

    return { error: null, requiresEmailConfirmation: true }
  }

  async function signOut() { await supabase.auth.signOut(); setProfile(null) }

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth dentro de AuthProvider')
  return ctx
}