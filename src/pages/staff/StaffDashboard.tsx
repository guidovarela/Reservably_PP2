import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar, Phone, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import {
  getAgendaStaff,
  confirmarTurno,
  cancelarTurno,
  marcarCompletado,
} from '@/services/turnoService'
import { getServiciosDeStaff } from '@/services/staffService'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import type { EstadoTurno } from '@/types/database'

type FiltroAgenda = 'todos' | 'hoy' | 'pendiente' | 'completado' | 'cancelado'

const FILTROS: Array<{ id: FiltroAgenda; label: string }> = [
  { id: 'todos', label: 'Todos' },
  { id: 'hoy', label: 'Hoy' },
  { id: 'pendiente', label: 'Pendientes' },
  { id: 'completado', label: 'Completados' },
  { id: 'cancelado', label: 'Cancelados' },
]

function esDeHoy(fechaISO: string): boolean {
  const fecha = new Date(fechaISO)
  const hoy = new Date()
  return (
    fecha.getFullYear() === hoy.getFullYear()
    && fecha.getMonth() === hoy.getMonth()
    && fecha.getDate() === hoy.getDate()
  )
}

function badgeEstado(estado: EstadoTurno | string): string {
  switch (estado) {
    case 'pendiente':
    case 'pago_pendiente':
      return 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50'
    case 'confirmado':
      return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900/50'
    case 'completado':
      return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50'
    case 'cancelado':
    case 'no_show':
      return 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/50'
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
  }
}

export default function StaffDashboard() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const qc = useQueryClient()
  const [filtro, setFiltro] = useState<FiltroAgenda>('todos')
  const [procesandoId, setProcesandoId] = useState<string | null>(null)

  const {
    data: turnos = [],
    isLoading,
    isError: errorTurnos,
    isFetching: fetchingTurnos,
    refetch: refetchTurnos,
  } = useQuery({
    queryKey: ['agenda-staff', profile?.id],
    queryFn: () => getAgendaStaff(profile!.id),
    enabled: !!profile,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })

  const {
    data: servicios = [],
    isLoading: loadingServicios,
    isFetching: fetchingServicios,
    refetch: refetchServicios,
  } = useQuery({
    queryKey: ['mis-servicios-staff', profile?.id],
    queryFn: () => getServiciosDeStaff(profile!.id),
    enabled: !!profile,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })

  async function handleConfirmar(id: string) {
    setProcesandoId(id)
    try {
      await confirmarTurno(id)
      toast('Turno confirmado', 'success')
      await qc.invalidateQueries({ queryKey: ['agenda-staff'] })
      await qc.invalidateQueries({ queryKey: ['turnos-admin'] })
    } catch (e: any) {
      toast(e.message ?? 'No se pudo confirmar el turno', 'error')
    } finally {
      setProcesandoId(null)
    }
  }

  async function handleCancelar(id: string) {
    setProcesandoId(id)
    try {
      await cancelarTurno(id)
      toast('Turno cancelado', 'success')
      await qc.invalidateQueries({ queryKey: ['agenda-staff'] })
      await qc.invalidateQueries({ queryKey: ['turnos-admin'] })
    } catch (e: any) {
      toast(e.message ?? 'No se pudo cancelar el turno', 'error')
    } finally {
      setProcesandoId(null)
    }
  }

  async function completar(id: string) {
    setProcesandoId(id)
    try {
      await marcarCompletado(id)
      toast('Turno completado', 'success')
      await qc.invalidateQueries({ queryKey: ['agenda-staff'] })
      await qc.invalidateQueries({ queryKey: ['turnos-admin'] })
    } catch (e: any) {
      toast(e.message ?? 'No se pudo completar el turno', 'error')
    } finally {
      setProcesandoId(null)
    }
  }

  const turnosFiltrados = (turnos as any[]).filter((t) => {
    if (filtro === 'todos') return true
    if (filtro === 'hoy') return esDeHoy(t.inicio)
    if (filtro === 'pendiente') return ['pendiente', 'confirmado', 'pago_pendiente'].includes(t.estado)
    return t.estado === filtro
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 space-y-10">
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold">Mis servicios asignados ({servicios.length})</h2>
            <p className="text-sm text-gray-500">Servicios que tenés habilitados para atender</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetchServicios()}
            disabled={fetchingServicios}
            className="gap-2 self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${fetchingServicios ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {loadingServicios ? (
          <p className="text-gray-500 text-sm">Cargando servicios...</p>
        ) : servicios.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center text-sm text-gray-500">
            Todavía no tenés servicios asignados por el dueño.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {servicios.map((s) => (
              <div key={s.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {s.categoria && (
                      <p className="text-xs uppercase tracking-wide text-brand-500 font-semibold">{s.categoria}</p>
                    )}
                    <p className="font-semibold">{s.nombre}</p>
                    <p className="text-sm text-gray-500">{s.duracion_minutos} min</p>
                  </div>
                  <span className="font-bold text-sm">{formatCurrency(s.precio)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Mis turnos ({turnos.length})</h1>
            <p className="text-gray-500">{formatDate(new Date())}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-sm font-medium">
              {FILTROS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFiltro(f.id)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    filtro === f.id
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetchTurnos()}
              disabled={fetchingTurnos}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${fetchingTurnos ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-gray-500">Cargando turnos...</p>
        ) : errorTurnos ? (
          <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            No se pudieron cargar tus turnos. Intentá nuevamente.
          </p>
        ) : turnosFiltrados.length === 0 ? (
          <div id="agenda-dia" className="rounded-2xl border border-gray-200 dark:border-gray-800 p-10 text-center text-gray-500">
            {filtro === 'todos' ? 'Todavía no tenés turnos asignados' : 'No hay turnos para este filtro'}
          </div>
        ) : (
          <div id="agenda-dia" className="grid gap-3">
            {turnosFiltrados.map((t) => {
              const ocupado = procesandoId === t.id
              const esPendiente = ['pendiente', 'pago_pendiente'].includes(t.estado)
              const esConfirmado = t.estado === 'confirmado'
              const puedeCancelar = ['pendiente', 'pago_pendiente', 'confirmado'].includes(t.estado)

              return (
                <div key={t.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${badgeEstado(t.estado)}`}>
                          {t.estado}
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm text-brand-500 font-semibold">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(t.inicio)} · {formatTime(t.inicio)} – {formatTime(t.fin)}
                        </span>
                      </div>
                      <p className="font-semibold">{t.servicio?.nombre ?? 'Servicio'}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span>Cliente: {t.cliente?.nombre ?? 'Sin nombre'} {t.cliente?.apellido ?? ''}</span>
                        {t.cliente?.telefono && (
                          <span className="inline-flex items-center gap-1 text-xs">
                            <Phone className="h-3.5 w-3.5" /> {t.cliente.telefono}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {t.precio !== undefined && t.precio !== null && (
                        <span className="font-bold text-sm mr-1">{formatCurrency(t.precio)}</span>
                      )}
                      {puedeCancelar && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={ocupado}
                          onClick={() => handleCancelar(t.id)}
                          className="text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30"
                        >
                          Cancelar
                        </Button>
                      )}
                      {esPendiente && (
                        <Button
                          size="sm"
                          disabled={ocupado}
                          onClick={() => handleConfirmar(t.id)}
                        >
                          Confirmar
                        </Button>
                      )}
                      {esConfirmado && (
                        <Button
                          id="btn-completar"
                          size="sm"
                          disabled={ocupado}
                          onClick={() => completar(t.id)}
                        >
                          Marcar completado
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}