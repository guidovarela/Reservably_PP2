import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
<<<<<<< HEAD
import { getServiciosParaReserva } from '@/services/servicioService'
import { getStaffParaServicio } from '@/services/staffService'
import { crearTurno, getHorariosDisponibles, getTurnoParaReprogramar, reprogramarTurno } from '@/services/turnoService'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { NEGOCIO_ID } from '@/lib/supabase'
=======
import { getServiciosAdmin } from '@/services/servicioService'
import { getStaffMembers } from '@/services/servicioService'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { supabase, NEGOCIO_ID } from '@/lib/supabase'
>>>>>>> 308d6324a6dc4a624cc930bc85c63233a2b8eff9

function fechaLocalActual() {
  const ahora = new Date()
  const año = ahora.getFullYear()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  return `${año}-${mes}-${dia}`
}

function fechaLocal(fecha: string) {
  const date = new Date(fecha)
  const año = date.getFullYear()
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const dia = String(date.getDate()).padStart(2, '0')
  return `${año}-${mes}-${dia}`
}

function obtenerMensajeError(error: unknown) {
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23P01') {
    return 'Ese horario acaba de ocuparse. Elegí otro horario disponible.'
  }
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return 'No se pudo reservar el turno. Intentá nuevamente.'
}

export default function NuevoTurno() {
  const { profile } = useAuth()
  const { toast } = useToast()
<<<<<<< HEAD
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const turnoId = searchParams.get('reprogramar')
=======
  const useNavigateInstance = useNavigate()
>>>>>>> 308d6324a6dc4a624cc930bc85c63233a2b8eff9
  const [paso, setPaso] = useState(1)
  const [servicioId, setServicioId] = useState('')
  const [staffId, setStaffId] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [notas, setNotas] = useState('')
  const [submitting, setSubmitting] = useState(false)

<<<<<<< HEAD
  const turnoQuery = useQuery({
    queryKey: ['turno-reprogramar', turnoId, profile?.id],
    queryFn: () => getTurnoParaReprogramar(turnoId!, profile!.id),
    enabled: Boolean(turnoId && profile),
  })
  const serviciosQuery = useQuery({
    queryKey: ['servicios-reserva', NEGOCIO_ID],
    queryFn: () => getServiciosParaReserva(NEGOCIO_ID),
    enabled: Boolean(NEGOCIO_ID),
  })
  const staffQuery = useQuery({
    queryKey: ['staff-reserva', NEGOCIO_ID, servicioId],
    queryFn: () => getStaffParaServicio(NEGOCIO_ID, servicioId),
    enabled: Boolean(NEGOCIO_ID && servicioId),
  })
  const servicio = serviciosQuery.data?.find((item) => item.id === servicioId)
  const profesional = staffQuery.data?.find((item) => item.id_usuario === staffId)
  const puedeReprogramar = Boolean(
    turnoQuery.data
    && ['pendiente', 'confirmado'].includes(turnoQuery.data.estado)
    && new Date(turnoQuery.data.inicio).getTime() > Date.now(),
  )

  useEffect(() => {
    const turno = turnoQuery.data
    if (!turno || !puedeReprogramar) return
    setServicioId(turno.id_servicio)
    setStaffId(turno.id_staff)
    setFecha(fechaLocal(turno.inicio))
    setPaso(3)
  }, [turnoQuery.data, puedeReprogramar])

  const horariosQuery = useQuery({
    queryKey: ['disponibilidad-turno', staffId, profile?.id, fecha, servicio?.duracion_minutos, turnoId],
    queryFn: () => getHorariosDisponibles(staffId, profile!.id, fecha, servicio!.duracion_minutos, turnoId ?? undefined),
    enabled: Boolean(staffId && profile && fecha && servicio),
=======
  const { data: servicios = [] } = useQuery({ 
    queryKey: ['servicios-turno'], 
    queryFn: getServiciosAdmin 
  })
  
  const { data: staff = [] } = useQuery({ 
    queryKey: ['staff-turno'], 
    queryFn: getStaffMembers 
>>>>>>> 308d6324a6dc4a624cc930bc85c63233a2b8eff9
  })

  async function reservar() {
    if (!profile || !servicio || !staffId || !fecha || !hora) return
    if (turnoId && !puedeReprogramar) return
    setSubmitting(true)
    try {
<<<<<<< HEAD
      const horariosActualizados = await getHorariosDisponibles(
        staffId,
        profile.id,
        fecha,
        servicio.duracion_minutos,
        turnoId ?? undefined,
      )
      if (!horariosActualizados.includes(hora)) {
        await horariosQuery.refetch()
        setHora('')
        toast('Ese horario ya no está disponible. Elegí otro.', 'error')
        return
      }

      const [año, mes, dia] = fecha.split('-').map(Number)
      const [horas, minutos] = hora.split(':').map(Number)
      const inicio = new Date(año, mes - 1, dia, horas, minutos)
      if (turnoId) {
        await reprogramarTurno(turnoId, profile.id, inicio.toISOString())
        toast('¡Turno reprogramado!', 'success')
      } else {
        await crearTurno({
          id_negocio: NEGOCIO_ID,
          id_cliente: profile.id,
          id_staff: staffId,
          id_servicio: servicio.id,
          inicio: inicio.toISOString(),
          notas: notas.trim() || undefined,
        })
        toast('¡Turno reservado!', 'success')
      }
      navigate('/cliente')
    } catch (error) {
      toast(obtenerMensajeError(error), 'error')
    } finally {
      setSubmitting(false)
=======
      const servicioSeleccionado = servicios.find(s => s.id === servicioId)
      const staffSeleccionado = staff.find(s => s.id === staffId)

      const { error } = await supabase.from('turno').insert({
        id_negocio: NEGOCIO_ID, 
        id_cliente: profile.id, 
        id_staff: staffId,
        id_servicio: servicioId, 
        inicio: new Date(inicio).toISOString(),
        estado: 'pendiente',
        precio: servicioSeleccionado?.precio ?? 0,
        servicioNombre: servicioSeleccionado?.nombre ?? '',
        staffNombre: staffSeleccionado?.nombre ?? ''
      })

      if (error) throw error

      toast('¡Turno reservado con éxito!', 'success')
      useNavigateInstance('/cliente')
    } catch (e: any) {
      toast(e.message ?? 'Error al reservar', 'error')
    } finally { 
      setSubmitting(false) 
>>>>>>> 308d6324a6dc4a624cc930bc85c63233a2b8eff9
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">{turnoId ? 'Reprogramar turno' : 'Reservar turno'}</h1>
      <p className="mb-8 text-gray-500">Paso {paso} de 3</p>

<<<<<<< HEAD
      {turnoId && turnoQuery.isLoading && <p className="text-gray-500">Cargando turno...</p>}
      {turnoId && turnoQuery.isError && (
        <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          No se pudo cargar el turno para reprogramar: {obtenerMensajeError(turnoQuery.error)}
        </p>
      )}
      {turnoId && turnoQuery.data && !puedeReprogramar && (
        <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          Este turno ya no se puede reprogramar.
        </p>
      )}

      {!NEGOCIO_ID && (
        <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          Falta configurar el negocio para {turnoId ? 'reprogramar' : 'reservar'}.
        </p>
      )}

      {NEGOCIO_ID && (!turnoId || (puedeReprogramar && !turnoQuery.isLoading)) && paso === 1 && (
        <section id="servicios-lista">
          <h2 className="mb-4 font-semibold">Elegí un servicio</h2>
          {serviciosQuery.isLoading ? <p className="text-gray-500">Cargando servicios...</p>
          : serviciosQuery.isError ? <p role="alert" className="text-red-600">No se pudieron cargar los servicios: {obtenerMensajeError(serviciosQuery.error)}</p>
          : (serviciosQuery.data ?? []).length === 0 ? <p className="text-gray-500">No hay servicios disponibles para reservar.</p>
          : (
            <div className="grid gap-3">
              {serviciosQuery.data?.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setServicioId(item.id)
                    setStaffId('')
                    setHora('')
                    setPaso(2)
                  }}
                  className="rounded-2xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-brand-500 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      {item.imagen_url && (
                        <img
                          src={item.imagen_url}
                          alt=""
                          loading="lazy"
                          className="mb-3 h-16 w-16 rounded-xl object-cover"
                        />
                      )}
                      <p className="font-semibold">{item.nombre}</p>
                      <p className="text-sm text-gray-500">{item.duracion_minutos} min</p>
                      {item.descripcion && <p className="mt-1 text-sm text-gray-500">{item.descripcion}</p>}
                    </div>
                    <span className="font-bold">{formatCurrency(item.precio)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {NEGOCIO_ID && (!turnoId || (puedeReprogramar && !turnoQuery.isLoading)) && paso === 2 && (
        <section>
          <h2 className="mb-4 font-semibold">Elegí profesional</h2>
          {staffQuery.isLoading ? <p className="text-gray-500">Cargando profesionales...</p>
          : staffQuery.isError ? <p role="alert" className="text-red-600">No se pudo cargar el personal: {obtenerMensajeError(staffQuery.error)}</p>
          : (staffQuery.data ?? []).length === 0 ? <p className="text-gray-500">No hay profesionales habilitados para este servicio.</p>
          : (
            <div className="grid gap-3 sm:grid-cols-2">
              {staffQuery.data?.map((item) => (
                <button
                  key={item.id_usuario}
                  type="button"
                  onClick={() => {
                    setStaffId(item.id_usuario)
                    setFecha('')
                    setHora('')
                    setPaso(3)
                  }}
                  className="rounded-2xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-brand-500 dark:border-gray-800 dark:bg-gray-900"
                >
                  <p className="font-semibold">{item.usuario?.nombre} {item.usuario?.apellido}</p>
                </button>
              ))}
            </div>
          )}
=======
      {paso === 1 && (
        <div id="servicios-lista">
          <h2 className="font-semibold mb-4">Elegí un servicio</h2>
          <div className="grid gap-3">
            {servicios.filter(s => s.activo).map((s) => (
              <div key={s.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex justify-between items-center transition-colors">
                <div>
                  <p className="font-semibold">{s.nombre}</p>
                  <p className="text-sm text-gray-500">{s.duracion_minutos} min · {formatCurrency(s.precio)}</p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => { setServicioId(s.id); setPaso(2) }}
                >
                  Reservar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {paso === 2 && (
        <div>
          <h2 className="font-semibold mb-4">Elegí un profesional</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(staff ?? []).map((s: any) => (
              <div key={s.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center font-bold text-brand-700 dark:text-brand-300">
                    {s.nombre?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{s.nombre} {s.apellido}</p>
                    <p className="text-xs text-gray-500 capitalize">{s.rol}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => { setStaffId(s.id); setPaso(3) }}
                >
                  Seleccionar
                </Button>
              </div>
            ))}
          </div>
>>>>>>> 308d6324a6dc4a624cc930bc85c63233a2b8eff9
          <Button variant="ghost" onClick={() => setPaso(1)} className="mt-4">← Volver</Button>
        </section>
      )}

<<<<<<< HEAD
      {NEGOCIO_ID && (!turnoId || (puedeReprogramar && !turnoQuery.isLoading)) && paso === 3 && (
        <section>
          <h2 className="mb-4 font-semibold">Elegí fecha y horario</h2>
          <div className="grid gap-6">
            {turnoId && (serviciosQuery.isLoading || staffQuery.isLoading) && (
              <p className="text-sm text-gray-500">Cargando los datos del turno...</p>
            )}
            {turnoId && !serviciosQuery.isLoading && !servicio && (
              <p role="alert" className="text-sm text-red-600">El servicio del turno ya no está disponible para reprogramar.</p>
            )}
            {turnoId && !staffQuery.isLoading && !profesional && (
              <p role="alert" className="text-sm text-red-600">El profesional del turno ya no está disponible para reprogramar.</p>
            )}
            <Input
              id="fecha-turno"
              label="Fecha"
              type="date"
              min={fechaLocalActual()}
              value={fecha}
              onChange={(event) => {
                setFecha(event.target.value)
                setHora('')
              }}
            />

            {fecha && (
              <div>
                <h3 className="mb-3 text-sm font-medium">Horarios disponibles</h3>
                {horariosQuery.isLoading ? <p className="text-sm text-gray-500">Consultando disponibilidad...</p>
                : horariosQuery.isError ? <p role="alert" className="text-sm text-red-600">No se pudo consultar la disponibilidad: {obtenerMensajeError(horariosQuery.error)}</p>
                : (horariosQuery.data ?? []).length === 0 ? <p className="text-sm text-gray-500">No hay horarios disponibles para esta fecha.</p>
                : (
                  <div className="flex flex-wrap gap-2">
                    {horariosQuery.data?.map((horario) => (
                      <Button
                        key={horario}
                        type="button"
                        variant={hora === horario ? 'primary' : 'outline'}
                        aria-pressed={hora === horario}
                        onClick={() => setHora(horario)}
                      >
                        {horario}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!turnoId && <div>
              <label htmlFor="notas-turno" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Comentario (opcional)
              </label>
              <textarea
                id="notas-turno"
                value={notas}
                onChange={(event) => setNotas(event.target.value)}
                maxLength={500}
                rows={3}
                placeholder="¿Querés agregar alguna indicación?"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
              />
              <p className="mt-1 text-right text-xs text-gray-500">{notas.length}/500</p>
            </div>}

            {servicio && hora && (
              <div className="rounded-xl bg-gray-50 p-4 text-sm dark:bg-gray-800">
                <p className="font-semibold">Resumen</p>
                <p>{servicio.nombre} · {formatCurrency(servicio.precio)}</p>
                <p>{profesional?.usuario?.nombre} {profesional?.usuario?.apellido} · {fecha} · {hora}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {!turnoId && <Button variant="ghost" onClick={() => setPaso(2)}>← Volver</Button>}
              <Button onClick={reservar} disabled={!hora || submitting || horariosQuery.isError || Boolean(turnoId && !puedeReprogramar)}>
                {submitting ? 'Guardando...' : turnoId ? 'Confirmar reprogramación' : 'Confirmar reserva'}
              </Button>
            </div>
=======
      {paso === 3 && (
        <div>
          <h2 className="font-semibold mb-4">Elegí fecha y hora</h2>
          <input 
            type="datetime-local" 
            value={inicio} 
            onChange={(e) => setInicio(e.target.value)}
            className="w-full max-w-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" 
          />
          <div className="mt-6 flex gap-3">
            <Button variant="ghost" onClick={() => setPaso(2)}>← Volver</Button>
            <Button onClick={reservar} disabled={!inicio || submitting}>
              {submitting ? 'Reservando...' : 'Confirmar reserva'}
            </Button>
>>>>>>> 308d6324a6dc4a624cc930bc85c63233a2b8eff9
          </div>
        </section>
      )}
    </div>
  )
}
