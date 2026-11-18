import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { getServiciosAdmin } from '@/services/servicioService'
import { getStaffMembers } from '@/services/servicioService'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { supabase, NEGOCIO_ID } from '@/lib/supabase'

export default function NuevoTurno() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const useNavigateInstance = useNavigate()
  const [paso, setPaso] = useState(1)
  const [servicioId, setServicioId] = useState<string | null>(null)
  const [staffId, setStaffId] = useState<string | null>(null)
  const [inicio, setInicio] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data: servicios = [] } = useQuery({ 
    queryKey: ['servicios-turno'], 
    queryFn: getServiciosAdmin 
  })
  
  const { data: staff = [] } = useQuery({ 
    queryKey: ['staff-turno'], 
    queryFn: getStaffMembers 
  })

  async function reservar() {
    if (!profile || !servicioId || !staffId || !inicio) return
    setSubmitting(true)
    try {
      const servicioSeleccionado = servicios.find(s => s.id === servicioId)
      const staffSeleccionado = staff.find(s => s.id === staffId)

      const { error } = await supabase.from('turno').insert({
        id_negocio: NEGOCIO_ID, 
        id_cliente: profile.id, 
        id_staff: staffId,
        id_servicio: servicioId, 
        inicio: new Date(inicio).toISOString(),
        estado: 'pendiente',
        precio: servicioSeleccionado?.precio ?? 0,
        servicioNombre: servicioSeleccionado?.nombre ?? '',
        staffNombre: staffSeleccionado?.nombre ?? ''
      })

      if (error) throw error

      toast('¡Turno reservado con éxito!', 'success')
      useNavigateInstance('/cliente')
    } catch (e: any) {
      toast(e.message ?? 'Error al reservar', 'error')
    } finally { 
      setSubmitting(false) 
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Reservar turno</h1>
      <p className="text-gray-500 mb-8">Paso {paso} de 3</p>

      {paso === 1 && (
        <div id="servicios-lista">
          <h2 className="font-semibold mb-4">Elegí un servicio</h2>
          <div className="grid gap-3">
            {servicios.filter(s => s.activo).map((s) => (
              <div key={s.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex justify-between items-center transition-colors">
                <div>
                  <p className="font-semibold">{s.nombre}</p>
                  <p className="text-sm text-gray-500">{s.duracion_minutos} min · {formatCurrency(s.precio)}</p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => { setServicioId(s.id); setPaso(2) }}
                >
                  Reservar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {paso === 2 && (
        <div>
          <h2 className="font-semibold mb-4">Elegí un profesional</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(staff ?? []).map((s: any) => (
              <div key={s.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center font-bold text-brand-700 dark:text-brand-300">
                    {s.nombre?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{s.nombre} {s.apellido}</p>
                    <p className="text-xs text-gray-500 capitalize">{s.rol}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => { setStaffId(s.id); setPaso(3) }}
                >
                  Seleccionar
                </Button>
              </div>
            ))}
          </div>
          <Button variant="ghost" onClick={() => setPaso(1)} className="mt-4">← Volver</Button>
        </div>
      )}

      {paso === 3 && (
        <div>
          <h2 className="font-semibold mb-4">Elegí fecha y hora</h2>
          <input 
            type="datetime-local" 
            value={inicio} 
            onChange={(e) => setInicio(e.target.value)}
            className="w-full max-w-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" 
          />
          <div className="mt-6 flex gap-3">
            <Button variant="ghost" onClick={() => setPaso(2)}>← Volver</Button>
            <Button onClick={reservar} disabled={!inicio || submitting}>
              {submitting ? 'Reservando...' : 'Confirmar reserva'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}