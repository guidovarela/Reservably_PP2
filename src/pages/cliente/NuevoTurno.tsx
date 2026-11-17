import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { getServiciosParaReserva } from '@/services/servicioService'
import { getStaffParaServicio } from '@/services/staffService'
import { crearTurno, getHorariosDisponibles, getTurnoParaReprogramar, reprogramarTurno } from '@/services/turnoService'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { NEGOCIO_ID } from '@/lib/supabase'

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
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const turnoId = searchParams.get('reprogramar')
  const [paso, setPaso] = useState(1)
  const [servicioId, setServicioId] = useState('')
  const [staffId, setStaffId] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [notas, setNotas] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
  })

  async function reservar() {
    if (!profile || !servicio || !staffId || !fecha || !hora) return
    if (turnoId && !puedeReprogramar) return
    setSubmitting(true)
    try {
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
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">{turnoId ? 'Reprogramar turno' : 'Reservar turno'}</h1>
      <p className="mb-8 text-gray-500">Paso {paso} de 3</p>

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
          <Button variant="ghost" onClick={() => setPaso(1)} className="mt-4">← Volver</Button>
        </section>
      )}

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
          </div>
        </section>
      )}
    </div>
  )
}
