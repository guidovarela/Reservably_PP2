import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/Toast'
import { desactivarServicio, getServicios } from '@/services/servicioService'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { NEGOCIO_ID } from '@/lib/supabase'

export default function ServiciosAdmin() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const { data } = useQuery({
    queryKey: ['servicios-admin', page],
    queryFn: () => getServicios(NEGOCIO_ID, page, 20),
  })

  async function desactivar(id: string) {
    if (!confirm('¿Desactivar servicio?')) return
    try {
      await desactivarServicio(id)
      toast('Servicio desactivado', 'success')
      qc.invalidateQueries({ queryKey: ['servicios-admin'] })
    } catch (e: any) { toast(e.message, 'error') }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Servicios</h1>
      <div className="grid gap-3">
        {(data?.data ?? []).map((s) => (
          <div key={s.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{s.nombre}</p>
              <p className="text-sm text-gray-500">{s.duracion_minutos} min · {formatCurrency(s.precio)}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => desactivar(s.id)}>Desactivar</Button>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-between">
        <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>
          Anterior
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={(data?.data.length ?? 0) < 20}
          onClick={() => setPage((current) => current + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}