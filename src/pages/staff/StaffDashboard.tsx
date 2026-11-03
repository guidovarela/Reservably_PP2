import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { getAgendaStaff, marcarCompletado } from '@/services/turnoService'
import { formatDate, formatTime } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

function todayRange() {
  const a = new Date(); a.setHours(0, 0, 0, 0)
  const b = new Date(); b.setHours(23, 59, 59, 999)
  return { desde: a.toISOString(), hasta: b.toISOString() }
}

export default function StaffDashboard() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const qc = useQueryClient()
  const { desde, hasta } = todayRange()
  const { data: turnos, isLoading } = useQuery({
    queryKey: ['agenda-staff', profile?.id],
    queryFn: () => getAgendaStaff(profile!.id, desde, hasta),
    enabled: !!profile,
  })

  async function completar(id: string) {
    try {
      await marcarCompletado(id)
      toast('Turno completado', 'success')
      qc.invalidateQueries({ queryKey: ['agenda-staff'] })
    } catch (e: any) { toast(e.message, 'error') }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Mi agenda</h1>
      <p className="text-gray-500 mb-8">{formatDate(new Date())}</p>
      {isLoading ? <p>Cargando...</p>
      : (turnos ?? []).length === 0 ? <div id="agenda-dia" className="rounded-2xl border border-gray-200 dark:border-gray-800 p-10 text-center text-gray-500">No tenés turnos hoy</div>
      : (
        <div id="agenda-dia" className="grid gap-3">
          {(turnos as any[]).map((t) => (
            <div key={t.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-brand-500 font-semibold">{formatTime(t.inicio)} – {formatTime(t.fin)}</p>
                  <p className="font-semibold">{t.servicio?.nombre}</p>
                  <p className="text-sm text-gray-500">{t.cliente?.nombre} {t.cliente?.apellido}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">{t.estado}</span>
                  {!['completado', 'cancelado'].includes(t.estado) && (
                    <Button id="btn-completar" size="sm" onClick={() => completar(t.id)}>Marcar completado</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}