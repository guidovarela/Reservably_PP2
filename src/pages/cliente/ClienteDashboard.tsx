import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Plus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getTurnosCliente } from '@/services/turnoService'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

export default function ClienteDashboard() {
  const { profile } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['turnos-cliente', profile?.id],
    queryFn: () => getTurnosCliente(profile!.id, 0, 5),
    enabled: !!profile,
  })
  const proximos = (data?.data ?? []).filter((t: any) => ['pendiente', 'confirmado', 'pago_pendiente'].includes(t.estado))

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Hola, {profile?.nombre} 👋</h1>
          <p className="text-gray-500">Tus próximos turnos</p>
        </div>
        <Link to="/cliente/nuevo-turno" className="inline-flex items-center gap-2 rounded-full bg-brand-500 text-white px-5 py-2.5 font-medium hover:bg-brand-600">
          <Plus className="h-4 w-4" /> Reservar turno
        </Link>
      </div>

      <section id="mis-turnos">
        <h2 className="text-xl font-semibold mb-4">Próximos turnos</h2>
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
                  <p className="text-sm text-brand-500 font-semibold uppercase">{t.estado}</p>
                  <p className="font-semibold">{t.servicio?.nombre}</p>
                  <p className="text-sm text-gray-500">{formatDate(t.inicio)} · {formatTime(t.inicio)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{formatCurrency(t.precio)}</span>
                  <Link to="/cliente/mis-turnos" className="px-4 py-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Ver</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}