import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, DollarSign, CheckCircle2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { NEGOCIO_ID } from '@/lib/supabase'
import { getTurnosAdmin, type TurnoAdminItem } from '@/services/turnoService'

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

function obtenerImporte(turno: TurnoAdminItem): number {
  const valor = turno.precio ?? turno.servicio?.precio ?? 0
  const numero = Number(valor)
  return Number.isNaN(numero) ? 0 : numero
}

export default function IngresosAdmin() {
  const {
    data: turnos = [],
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['turnos-admin', NEGOCIO_ID],
    queryFn: () => getTurnosAdmin(NEGOCIO_ID),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })

  const turnosCompletados = turnos.filter((t) => t.estado === 'completado')
  const totalFacturado = turnosCompletados.reduce((acc, turno) => acc + obtenerImporte(turno), 0)

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link to="/dueno">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Volver al panel
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Control de Ingresos</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Detalle de servicios concluidos y total facturado.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/30 px-5 py-3 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
              Total Facturado
            </p>
            <p className="text-2xl font-bold text-emerald-950 dark:text-emerald-100">
              ${totalFacturado.toLocaleString('es-AR')}
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-500">
          Cargando ingresos...
        </div>
      ) : isError ? (
        <div className="text-center py-12 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400">
          {(error as any)?.message ?? 'Error al cargar los ingresos desde Supabase.'}
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {turnosCompletados.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-500">
                Aún no hay turnos concluidos para contabilizar ingresos.
              </div>
            ) : (
              turnosCompletados.map((turno) => {
                const clienteNombre = formatearNombre(
                  turno.cliente?.nombre,
                  turno.cliente?.apellido,
                  'Cliente sin nombre',
                )
                const staffNombre = formatearNombre(
                  turno.staff?.nombre,
                  turno.staff?.apellido,
                  'Staff sin asignar',
                )
                const servicioNombre = turno.servicio?.nombre ?? 'Servicio no especificado'
                const importe = obtenerImporte(turno)

                return (
                  <div
                    key={turno.id}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                          {servicioNombre}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Cliente:{' '}
                        <strong className="text-gray-800 dark:text-gray-200">{clienteNombre}</strong>{' '}
                        &nbsp;•&nbsp; Atendido por:{' '}
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {staffNombre}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Fecha: {formatearFechaHora(turno.inicio)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between w-full md:w-auto md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 dark:border-gray-800">
                      <span className="text-xs text-gray-400 md:hidden">Arancel:</span>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        +${importe.toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {turnosCompletados.length > 0 && (
            <div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  Total acumulado ({turnosCompletados.length}{' '}
                  {turnosCompletados.length === 1 ? 'servicio' : 'servicios'})
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Suma de todos los turnos marcados como completados
                </p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${totalFacturado.toLocaleString('es-AR')}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}