import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { cancelarTurno, getTurnosCliente } from '@/services/turnoService'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'

export default function MisTurnos() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const perPage = 10

  const { data, isLoading } = useQuery({
    queryKey: ['mis-turnos', profile?.id, page],
    queryFn: () => getTurnosCliente(profile!.id, page, perPage),
    enabled: !!profile,
  })

  async function handleCancelar(id: string) {
    if (!confirm('¿Cancelar este turno?')) return
    try {
      await cancelarTurno(id)
      toast('Turno cancelado', 'success')
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['mis-turnos'] }),
        qc.invalidateQueries({ queryKey: ['turnos-cliente'] }),
        qc.invalidateQueries({ queryKey: ['disponibilidad-turno'] }),
      ])
    } catch (e: any) { toast(e.message, 'error') }
  }

  const turnos = data?.data ?? []
  const total = data?.count ?? 0
  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mis turnos</h1>
          <p className="text-gray-500">Historial completo de tus reservas</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/cliente" className="inline-flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
            ← Volver al panel
          </Link>
          <Link to="/cliente/nuevo-turno" className="inline-flex items-center justify-center rounded-full bg-brand-500 text-white px-5 py-2.5 text-sm font-medium hover:bg-brand-600">
            Reservar turno
          </Link>
        </div>
      </div>

      {isLoading ? <p className="text-gray-500">Cargando...</p>
      : turnos.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-10 text-center text-gray-500">Todavía no tenés turnos</div>
      ) : (
        <>
          <div className="grid gap-3">
            {turnos.map((t: any) => (
              <div key={t.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase font-semibold text-brand-500">{t.estado}</p>
                    <p className="font-semibold">{t.servicio?.nombre ?? 'Servicio'}</p>
                    {t.staff && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Profesional: {t.staff.nombre} {t.staff.apellido ?? ''}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      {formatDate(t.inicio)} · {formatTime(t.inicio)}{t.fin ? ` – ${formatTime(t.fin)}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{formatCurrency(t.precio)}</span>
                    {['pendiente', 'confirmado', 'pago_pendiente'].includes(t.estado) && (
                      <>
                        {new Date(t.inicio).getTime() > Date.now() && (
                          <Link
                            to={`/cliente/nuevo-turno?reprogramar=${t.id}`}
                            className="rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            Reprogramar
                          </Link>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleCancelar(t.id)}>Cancelar</Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
              <span className="px-4 py-2 text-sm">Página {page + 1} de {totalPages}</span>
              <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}