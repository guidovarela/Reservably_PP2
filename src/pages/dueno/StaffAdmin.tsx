import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getStaffMembers, desactivarStaff, activarStaff } from '@/services/servicioService'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

export default function StaffAdmin() {
  const { toast } = useToast()
  const qc = useQueryClient()

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['staff-admin'],
    queryFn: getStaffMembers,
  })

  async function handleToggleEstado(id: string, estadoActual: string) {
    const estaActivo = estadoActual === 'ACTIVO'
    const accion = estaActivo ? 'desactivar' : 'activar'
    if (!confirm(`¿Estás seguro de ${accion} a este miembro del staff?`)) return
    
    try {
      if (estaActivo) {
        await desactivarStaff(id)
        toast('Miembro del staff desactivado', 'success')
      } else {
        await activarStaff(id)
        toast('Miembro del staff activado', 'success')
      }
      qc.invalidateQueries({ queryKey: ['staff-admin'] })
    } catch (e: any) { 
      toast(e.message, 'error') 
    }
  }

  if (isLoading) {
    return <div className="container mx-auto max-w-6xl px-4 py-10">Cargando equipo...</div>
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      {/* Botón de retorno al panel principal */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/dueno">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Volver al panel
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Administración de Equipo (Staff)</h1>
      
      <div className="grid gap-3">
        {staff.length === 0 ? (
          <p className="text-gray-500">No hay miembros del staff registrados.</p>
        ) : (
          staff.map((persona) => {
            const activo = persona.estado === 'ACTIVO'
            
            return (
              <div 
                key={persona.id} 
                className={`rounded-2xl border p-4 flex justify-between items-center transition-colors ${
                  activo 
                    ? 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900' 
                    : 'border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg">
                      {persona.nombre ? persona.nombre.charAt(0).toUpperCase() + persona.nombre.slice(1).toLowerCase() : 'Sin nombre'}
                    </p>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                      {persona.rol.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{persona.email || 'Sin correo registrado'}</p>
                  <p className="text-sm text-gray-400">Tel: {persona.telefono || 'Sin teléfono'}</p>
                </div>

                <Button 
                  variant={activo ? "ghost" : "outline"} 
                  size="sm" 
                  onClick={() => handleToggleEstado(persona.id, persona.estado)}
                >
                  {activo ? 'Desactivar' : 'Activar'}
                </Button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}