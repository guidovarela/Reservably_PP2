import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/Toast'
import { desactivarServicio, activarServicio, getServiciosAdmin } from '@/services/servicioService'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export default function ServiciosAdmin() {
  const { toast } = useToast()
  const qc = useQueryClient()

  const { data: servicios = [], isLoading } = useQuery({
    queryKey: ['servicios-admin'],
    queryFn: getServiciosAdmin,
  })

  async function handleToggleEstado(id: string, activoActual: boolean) {
    const accion = activoActual ? 'desactivar' : 'activar'
    if (!confirm(`¿Estás seguro de ${accion} este servicio?`)) return
    
    try {
      if (activoActual) {
        await desactivarServicio(id)
        toast('Servicio desactivado', 'success')
      } else {
        await activarServicio(id)
        toast('Servicio activado', 'success')
      }
      qc.invalidateQueries({ queryKey: ['servicios-admin'] })
    } catch (e: any) { 
      toast(e.message, 'error') 
    }
  }

  if (isLoading) {
    return <div className="container mx-auto max-w-6xl px-4 py-10">Cargando servicios...</div>
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Administración de Servicios</h1>
      
      <div className="grid gap-3">
        {servicios.length === 0 ? (
          <p className="text-gray-500">No hay servicios registrados.</p>
        ) : (
          servicios.map((s) => (
            <div 
              key={s.id} 
              className={`rounded-2xl border p-4 flex justify-between items-center transition-colors ${
                s.activo 
                  ? 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900' 
                  : 'border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{s.nombre}</p>
                  {!s.activo && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-medium">
                      Inactivo
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{s.duracion_minutos} min · {formatCurrency(s.precio)}</p>
              </div>

              <Button 
                variant={s.activo ? "ghost" : "outline"} 
                size="sm" 
                onClick={() => handleToggleEstado(s.id, s.activo)}
              >
                {s.activo ? 'Desactivar' : 'Activar'}
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}