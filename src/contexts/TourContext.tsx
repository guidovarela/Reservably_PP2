import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'

export interface TourStep {
  target: string
  title: string
  description: string
}
const TOURS: Record<string, TourStep[]> = {
  CLIENTE: [
    { target: '#hero-booking', title: 'Reservá en segundos', description: 'Hacé click acá para empezar.' },
    { target: '#servicios-lista', title: 'Elegí un servicio', description: 'Mirá todo lo disponible.' },
    { target: '#mis-turnos', title: 'Gestioná tus turnos', description: 'Reprogramá o cancelá desde acá.' },
  ],
  STAFF: [
    { target: '#agenda-dia', title: 'Tu agenda', description: 'Los turnos del día.' },
    { target: '#btn-completar', title: 'Marcá completado', description: 'Al terminar un turno.' },
  ],
  DUENO: [
    { target: '#panel-servicios', title: 'Servicios', description: 'Cargá y editá.' },
  ],
}

interface Ctx {
  active: boolean
  steps: TourStep[]
  currentStep: number
  start: () => void
  next: () => void
  prev: () => void
  skip: () => void
}
const TourContext = createContext<Ctx | undefined>(undefined)

export function TourProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()
  const [steps, setSteps] = useState<TourStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [active, setActive] = useState(false)

  useEffect(() => { if (profile) check() }, [profile])

  async function check() {
    if (!profile) return
    const rol = profile.rol.toUpperCase()
    const tour = TOURS[rol]
    if (!tour) return
    const { data } = await supabase
      .from('tour_usuario').select('*')
      .eq('id_usuario', profile.id).eq('rol', rol).maybeSingle()
    const mostrar = !data || (!data.completado && !data.no_volver_mostrar)
    if (mostrar) { setSteps(tour); setCurrentStep(0); setActive(true) }
  }

  async function persist(completado: boolean, omitido: boolean) {
    if (!profile) return
    const rol = profile.rol.toUpperCase()
    const version = Number(import.meta.env.VITE_APP_TOUR_VERSION ?? 1)
    await supabase.from('tour_usuario').upsert({
      id_usuario: profile.id, rol, completado, version,
      no_volver_mostrar: omitido,
      fecha_completado: completado ? new Date().toISOString() : null,
    })
  }

  function start() { if (!profile) return; const t = TOURS[profile.rol.toUpperCase()]; if (!t) return; setSteps(t); setCurrentStep(0); setActive(true) }
  function next() { if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1); else { setActive(false); persist(true, false) } }
  function prev() { if (currentStep > 0) setCurrentStep((s) => s - 1) }
  function skip() { setActive(false); persist(false, true) }

  return (
    <TourContext.Provider value={{ active, steps, currentStep, start, next, prev, skip }}>
      {children}
    </TourContext.Provider>
  )
}

export function useTour() {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour dentro de TourProvider')
  return ctx
}