import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getStaffMembers,
  getServiciosAdmin,
  desactivarStaff,
  activarStaff,
  cambiarRolUsuario,
} from '@/services/servicioService'
import {
  asignarStaffServicio,
  desasignarStaffServicio,
  getAllStaffServicios,
} from '@/services/staffService'
import { NEGOCIO_ID } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, Plus, UserCheck, UserMinus } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

export default function StaffAdmin() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [procesandoKey, setProcesandoKey] = useState<string | null>(null)

  const { data: usuarios = [], isLoading: loadingUsuarios } = useQuery({
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

  async function refrescarTodo() {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['staff-admin'] }),
      qc.invalidateQueries({ queryKey: ['staff-servicios-admin'] }),
      qc.invalidateQueries({ queryKey: ['staff-reserva'] }),
      qc.invalidateQueries({ queryKey: ['mis-servicios-staff'] }),
    ])
  }

  async function handleToggleEstado(id: string, estadoActual: string) {
    const estaActivo = estadoActual === 'ACTIVO'
    const accion = estaActivo ? 'desactivar' : 'activar'
    if (!confirm(`¿Estás seguro de ${accion} a este usuario?`)) return

    const key = `estado:${id}`
    setProcesandoKey(key)
    try {
      if (estaActivo) {
        await desactivarStaff(id)
        toast('Usuario desactivado', 'success')
      } else {
        await activarStaff(id)
        toast('Usuario activado', 'success')
      }
      await refrescarTodo()
    } catch (e: any) {
      toast(e.message ?? 'No se pudo actualizar el estado', 'error')
    } finally {
      setProcesandoKey(null)
    }
  }

  async function handleCambiarRol(persona: any) {
    const esStaff = persona.rol === 'staff'
    const nuevoRol: 'staff' | 'cliente' = esStaff ? 'cliente' : 'staff'
    const mensaje = esStaff
      ? `¿Pasar a ${persona.nombre} de STAFF a CLIENTE? Se quitarán sus servicios asignados.`
      : `¿Hacer a ${persona.nombre} miembro del STAFF?`

    if (!confirm(mensaje)) return

    const key = `rol:${persona.id}`
    setProcesandoKey(key)
    try {
      await cambiarRolUsuario(persona.id, nuevoRol, NEGOCIO_ID)
      toast(
        nuevoRol === 'staff'
          ? 'Usuario promovido a staff'
          : 'Usuario cambiado a cliente',
        'success',
      )
      await refrescarTodo()
    } catch (e: any) {
      toast(e.message ?? 'No se pudo cambiar el rol', 'error')
    } finally {
      setProcesandoKey(null)
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
      await refrescarTodo()
    } catch (e: any) {
      toast(e.message ?? 'No se pudo actualizar la asignación', 'error')
    } finally {
      setProcesandoKey(null)
    }
  }

  if (loadingUsuarios || loadingServicios || loadingAsignaciones) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        Cargando usuarios...
      </div>
    )
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

      <h1 className="text-3xl font-bold mb-2">Administración de Usuarios y Staff</h1>
      <p className="text-gray-500 mb-8">
        Gestioná roles entre cliente y staff, activá o desactivá cuentas y asigná servicios al equipo.
      </p>

      <div className="grid gap-4">
        {usuarios.length === 0 ? (
          <p className="text-gray-500">No hay usuarios registrados.</p>
        ) : (
          usuarios.map((persona: any) => {
            const activo = persona.estado === 'ACTIVO'
            const esStaff = persona.rol === 'staff'
            const ocupadoEstado = procesandoKey === `estado:${persona.id}`
            const ocupadoRol = procesandoKey === `rol:${persona.id}`

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
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-lg">
                        {persona.nombre
                          ? persona.nombre.charAt(0).toUpperCase() +
                            persona.nombre.slice(1).toLowerCase()
                          : 'Sin nombre'}
                        {persona.apellido ? ` ${persona.apellido}` : ''}
                      </p>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          esStaff
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {persona.rol?.toUpperCase()}
                      </span>
                      {!activo && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
                          INACTIVO
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {persona.email || 'Sin correo registrado'}
                    </p>
                    <p className="text-sm text-gray-400">
                      Tel: {persona.telefono || 'Sin teléfono'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={ocupadoRol || !activo}
                      onClick={() => handleCambiarRol(persona)}
                      className="gap-1.5"
                    >
                      {esStaff ? (
                        <>
                          <UserMinus className="h-4 w-4" />
                          Hacer cliente
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4" />
                          Hacer staff
                        </>
                      )}
                    </Button>

                    <Button
                      variant={activo ? 'ghost' : 'outline'}
                      size="sm"
                      disabled={ocupadoEstado}
                      onClick={() => handleToggleEstado(persona.id, persona.estado)}
                    >
                      {activo ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </div>

                {esStaff && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2.5">
                      Servicios asignados ({serviciosAsignadosIds.size})
                    </p>
                    {serviciosDisponibles.length === 0 ? (
                      <p className="text-sm text-gray-400">
                        No hay servicios activos para asignar.
                      </p>
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
                              onClick={() =>
                                handleToggleServicio(
                                  persona.id,
                                  srv.id,
                                  srv.id_negocio,
                                  asignado,
                                )
                              }
                              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors disabled:opacity-50 ${
                                asignado
                                  ? 'border-brand-500 bg-brand-500 text-white hover:bg-brand-600'
                                  : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-brand-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                              }`}
                            >
                              {asignado ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Plus className="h-3.5 w-3.5" />
                              )}
                              <span>{srv.nombre}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}