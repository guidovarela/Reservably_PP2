import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getStaffMembers, getServiciosAdmin, desactivarStaff, activarStaff } from '@/services/servicioService'
import { asignarStaffServicio, desasignarStaffServicio, getAllStaffServicios } from '@/services/staffService'
import { NEGOCIO_ID } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, Plus } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

export default function StaffAdmin() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [procesandoKey, setProcesandoKey] = useState<string | null>(null)

  const { data: staff = [], isLoading: loadingStaff } = useQuery({
    queryKey: ['staff-admin'],
    queryFn: getStaffMembers,
  })

  const { data: servicios = [], isLoading: loadingServicios } = useQuery({
    queryKey: ['servicios-admin'],
    queryFn: () => getServiciosAdmin(NEGOCIO_ID),
  })

  const { data: asignaciones = [], isLoading: loadingAsignaciones } = useQuery({
    queryKey: ['staff-servicios-admin'],
    queryFn: getAllStaffServicios,
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
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['staff-admin'] }),
        qc.invalidateQueries({ queryKey: ['staff-reserva'] }),
      ])
    } catch (e: any) { 
      toast(e.message ?? 'No se pudo actualizar el estado', 'error') 
    }
  }

  async function handleToggleServicio(
    staffId: string,
    servicioId: string,
    negocioId: string,
    estaAsignado: boolean,
  ) {
    const key = `${staffId}:${servicioId}`
    setProcesandoKey(key)
    try {
      if (estaAsignado) {
        await desasignarStaffServicio(staffId, servicioId)
        toast('Servicio quitado del profesional', 'success')
      } else {
        await asignarStaffServicio(staffId, servicioId, negocioId)
        toast('Servicio asignado al profesional', 'success')
      }
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['staff-servicios-admin'] }),
        qc.invalidateQueries({ queryKey: ['staff-reserva'] }),
        qc.invalidateQueries({ queryKey: ['mis-servicios-staff'] }),
      ])
    } catch (e: any) {
      toast(e.message ?? 'No se pudo actualizar la asignación', 'error')
    } finally {
      setProcesandoKey(null)
    }
  }

  if (loadingStaff || loadingServicios || loadingAsignaciones) {
    return <div className="container mx-auto max-w-6xl px-4 py-10">Cargando equipo...</div>
  }

  const serviciosDisponibles = servicios.filter((s) => s.activo)

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/dueno">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Volver al panel
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Administración de Equipo (Staff)</h1>
      <p className="text-gray-500 mb-8">Activá profesionales y asignales qué servicios pueden atender.</p>
      
      <div className="grid gap-4">
        {staff.length === 0 ? (
          <p className="text-gray-500">No hay miembros del staff registrados.</p>
        ) : (
          staff.map((persona) => {
            const activo = persona.estado === 'ACTIVO'
            const serviciosAsignadosIds = new Set(
              asignaciones
                .filter((a) => a.id_usuario === persona.id)
                .map((a) => a.id_servicio),
            )
            
            return (
              <div 
                key={persona.id} 
                className={`rounded-2xl border p-5 transition-colors ${
                  activo 
                    ? 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900' 
                    : 'border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 opacity-75'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-lg">
                        {persona.nombre ? persona.nombre.charAt(0).toUpperCase() + persona.nombre.slice(1).toLowerCase() : 'Sin nombre'}
                        {persona.apellido ? ` ${persona.apellido}` : ''}
                      </p>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                        {persona.rol.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{persona.email || 'Sin correo registrado'}</p>
                    <p className="text-sm text-gray-400">Tel: {persona.telefono || 'Sin teléfono'}</p>
                  </div>

                  <Button 
                    variant={activo ? 'ghost' : 'outline'} 
                    size="sm" 
                    onClick={() => handleToggleEstado(persona.id, persona.estado)}
                  >
                    {activo ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2.5">
                    Servicios asignados ({serviciosAsignadosIds.size})
                  </p>
                  {serviciosDisponibles.length === 0 ? (
                    <p className="text-sm text-gray-400">No hay servicios activos para asignar.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {serviciosDisponibles.map((srv) => {
                        const asignado = serviciosAsignadosIds.has(srv.id)
                        const ocupado = procesandoKey === `${persona.id}:${srv.id}`
                        return (
                          <button
                            key={srv.id}
                            type="button"
                            disabled={ocupado || !activo}
                            aria-pressed={asignado}
                            onClick={() => handleToggleServicio(persona.id, srv.id, srv.id_negocio, asignado)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors disabled:opacity-50 ${
                              asignado
                                ? 'border-brand-500 bg-brand-500 text-white hover:bg-brand-600'
                                : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-brand-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            {asignado ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                            <span>{srv.nombre}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}