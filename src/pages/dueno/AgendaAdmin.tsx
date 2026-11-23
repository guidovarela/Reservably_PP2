import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Calendar as CalendarIcon, Phone, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { NEGOCIO_ID } from '@/lib/supabase'
import {
  getTurnosAdmin,
  cancelarTurno,
  type TurnoAdminItem,
} from '@/services/turnoService'

function formatearNombre(nombre?: string | null, apellido?: string | null, fallback = 'Sin asignar') {
  if (!nombre) return fallback
  const capitalizado = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase()
  return apellido ? `${capitalizado} ${apellido}` : capitalizado
}

function formatearFechaHora(iso: string) {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return iso
  return fecha.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AgendaAdmin() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [procesandoId, setProcesandoId] = useState<string | null>(null)

  const { data: turnos = [], isLoading, isError, error } = useQuery({
    queryKey: ['turnos-admin', NEGOCIO_ID],
    queryFn: () => getTurnosAdmin(NEGOCIO_ID),
  })

  const turnosFiltrados = turnos.filter((t) => {
    if (filtroEstado === 'todos') return true
    return t.estado === filtroEstado
  })

  async function handleCancelar(id: string) {
    setProcesandoId(id)
    try {
      await cancelarTurno(id)
      toast('Turno cancelado', 'success')
      await qc.invalidateQueries({ queryKey: ['turnos-admin'] })
      await qc.invalidateQueries({ queryKey: ['agenda-staff'] })
    } catch (e: any) {
      toast(e?.message ?? 'No se pudo cancelar el turno', 'error')
    } finally {
      setProcesandoId(null)
    }
  }

  const badgeColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
      case 'pago_pendiente':
        return 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
      case 'confirmado':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-900/50'
      case 'completado':
        return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
      case 'cancelado':
      case 'no_show':
        return 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/dueno">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Volver al panel
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Administración de Agenda</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Visualizá todos los turnos, clientes, servicios y profesionales asignados.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-sm font-medium">
          {['todos', 'pendiente', 'confirmado', 'completado', 'cancelado'].map((est) => (
            <button
              key={est}
              type="button"
              onClick={() => setFiltroEstado(est)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                filtroEstado === est
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {est.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-500">
          Cargando turnos...
        </div>
      ) : isError ? (
        <div className="text-center py-12 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400">
          {(error as any)?.message ?? 'Error al cargar los turnos desde Supabase.'}
        </div>
      ) : (
        <div className="grid gap-3">
          {turnosFiltrados.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-500">
              No hay turnos registrados para este filtro.
            </div>
          ) : (
            turnosFiltrados.map((turno: TurnoAdminItem) => {
              const clienteNombre = formatearNombre(turno.cliente?.nombre, turno.cliente?.apellido, 'Cliente sin nombre')
              const staffNombre = formatearNombre(turno.staff?.nombre, turno.staff?.apellido, 'Staff sin asignar')
              const servicioNombre = turno.servicio?.nombre ?? 'Servicio no especificado'
              const monto = Number(turno.precio ?? turno.servicio?.precio ?? 0)
              const ocupado = procesandoId === turno.id
              const puedeCancelar = ['pendiente', 'pago_pendiente', 'confirmado'].includes(turno.estado)

              return (
                <div
                  key={turno.id}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors shadow-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                        {clienteNombre}
                      </p>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeColor(turno.estado)}`}
                      >
                        {turno.estado.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Servicio:{' '}
                      <strong className="text-gray-800 dark:text-gray-200">{servicioNombre}</strong> con{' '}
                      <span className="text-blue-600 dark:text-blue-400 font-medium">{staffNombre}</span>
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 pt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5" /> {formatearFechaHora(turno.inicio)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> {turno.cliente?.telefono || 'Sin teléfono'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 dark:border-gray-800">
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      ${monto.toLocaleString('es-AR')}
                    </span>

                    {puedeCancelar && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={ocupado}
                        onClick={() => handleCancelar(turno.id)}
                        className="gap-1.5 text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}