import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { getServicios } from '@/services/servicioService'
import { getStaff } from '@/services/staffService'
import { crearTurno } from '@/services/turnoService'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { NEGOCIO_ID } from '@/lib/supabase'

export default function NuevoTurno() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [paso, setPaso] = useState(1)
  const [servicioId, setServicioId] = useState<string | null>(null)
  const [staffId, setStaffId] = useState<string | null>(null)
  const [inicio, setInicio] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data: servicios } = useQuery({ queryKey: ['servicios', NEGOCIO_ID], queryFn: () => getServicios(NEGOCIO_ID) })
  const { data: staff } = useQuery({ queryKey: ['staff', NEGOCIO_ID], queryFn: () => getStaff(NEGOCIO_ID) })

  async function reservar() {
    if (!profile || !servicioId || !staffId || !inicio) return
    setSubmitting(true)
    try {
      await crearTurno({
        id_negocio: NEGOCIO_ID, id_cliente: profile.id, id_staff: staffId,
        id_servicio: servicioId, inicio: new Date(inicio).toISOString(),
      })
      toast('¡Turno reservado!', 'success')
      navigate('/cliente')
    } catch (e: any) {
      toast(e.message ?? 'Error al reservar', 'error')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Reservar turno</h1>
      <p className="text-gray-500 mb-8">Paso {paso} de 3</p>

      {paso === 1 && (
        <div id="servicios-lista">
          <h2 className="font-semibold mb-4">Elegí un servicio</h2>
          <div className="grid gap-3">
            {(servicios?.data ?? []).map((s) => (
              <button key={s.id} onClick={() => { setServicioId(s.id); setPaso(2) }}
                className="text-left rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:border-brand-500 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{s.nombre}</p>
                    <p className="text-sm text-gray-500">{s.duracion_minutos} min</p>
                  </div>
                  <span className="font-bold">{formatCurrency(s.precio)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {paso === 2 && (
        <div>
          <h2 className="font-semibold mb-4">Elegí profesional</h2>
          <div className="grid grid-cols-2 gap-3">
            {(staff ?? []).map((s: any) => (
              <button key={s.id_usuario} onClick={() => { setStaffId(s.id_usuario); setPaso(3) }}
                className="text-left rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:border-brand-500 transition-colors">
                <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900 mb-2" />
                <p className="font-semibold">{s.usuario?.nombre} {s.usuario?.apellido}</p>
              </button>
            ))}
          </div>
          <Button variant="ghost" onClick={() => setPaso(1)} className="mt-4">← Volver</Button>
        </div>
      )}

      {paso === 3 && (
        <div>
          <h2 className="font-semibold mb-4">Elegí fecha y hora</h2>
          <input type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)}
            className="w-full max-w-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
          <div className="mt-6 flex gap-3">
            <Button variant="ghost" onClick={() => setPaso(2)}>← Volver</Button>
            <Button onClick={reservar} disabled={!inicio || submitting}>{submitting ? 'Reservando...' : 'Confirmar reserva'}</Button>
          </div>
        </div>
      )}
    </div>
  )
}