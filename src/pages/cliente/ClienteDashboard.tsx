import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar, Plus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { cancelarTurno, getTurnosCliente } from '@/services/turnoService'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export default function ClienteDashboard() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['turnos-cliente', profile?.id],
    queryFn: () => getTurnosCliente(profile!.id, 0, 10),
    enabled: !!profile,
  })
  const proximos = (data?.data ?? []).filter((t: any) => ['pendiente', 'confirmado', 'pago_pendiente'].includes(t.estado))

  async function handleCancelar(id: string) {
    if (!confirm('¿Cancelar este turno?')) return
    try {
      await cancelarTurno(id)
      toast('Turno cancelado', 'success')
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['turnos-cliente'] }),
        qc.invalidateQueries({ queryKey: ['mis-turnos'] }),
        qc.invalidateQueries({ queryKey: ['disponibilidad-turno'] }),
      ])
    } catch (e: any) {
      toast(e.message ?? 'No se pudo cancelar el turno', 'error')
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Hola, {profile?.nombre} 👋</h1>
          <p className="text-gray-500">Tus próximos turnos</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/cliente/mis-turnos" className="inline-flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
            Mis turnos ({data?.count ?? 0})
          </Link>
          <Link to="/cliente/nuevo-turno" className="inline-flex items-center gap-2 rounded-full bg-brand-500 text-white px-5 py-2.5 text-sm font-medium hover:bg-brand-600">
            <Plus className="h-4 w-4" /> Reservar turno
          </Link>
        </div>
      </div>

      <section id="mis-turnos">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Próximos turnos</h2>
          <Link to="/cliente/mis-turnos" className="text-sm text-brand-500 font-medium hover:underline">
            Ver historial completo →
          </Link>
        </div>
        {isLoading ? <p className="text-gray-500">Cargando...</p>
        : proximos.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-10 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No tenés turnos próximos</p>
            <Link to="/cliente/nuevo-turno" className="inline-flex items-center justify-center rounded-full bg-brand-500 text-white px-5 py-2.5 font-medium hover:bg-brand-600">Reservar ahora</Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {proximos.map((t: any) => (
              <div key={t.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-brand-500 font-semibold uppercase">{t.estado}</p>
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
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold">{formatCurrency(t.precio)}</span>
                  <Link to="/cliente/mis-turnos" className="px-3 py-1.5 text-sm rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    Ver
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => handleCancelar(t.id)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}