import { supabase } from '@/lib/supabase'
import type { Turno } from '@/types/database'

export interface NuevoTurnoInput {
  id_negocio: string; id_cliente: string; id_staff: string; id_servicio: string; inicio: string; notas?: string
}

export async function crearTurno(input: NuevoTurnoInput) {
  const { data, error } = await supabase
    .from('turno').insert({ ...input, estado: 'pendiente' }).select().single()
  if (error) throw error
  return data as Turno
}

function minutesFromTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export async function getHorariosDisponibles(
  staffId: string,
  clienteId: string,
  fecha: string,
  duracionMinutos: number,
  turnoIgnoradoId?: string,
) {
  const [year, month, day] = fecha.split('-').map(Number)
  const fechaLocal = new Date(year, month - 1, day)
  const inicioDia = new Date(year, month - 1, day)
  const finDia = new Date(year, month - 1, day + 1)
  const diaSemana = fechaLocal.getDay() || 7

  let consultaTurnosStaff = supabase
    .from('turno')
    .select('id, inicio, fin')
    .eq('id_staff', staffId)
    .in('estado', ['pendiente', 'confirmado', 'pago_pendiente'])
    .lt('inicio', finDia.toISOString())
    .gt('fin', inicioDia.toISOString())
  let consultaTurnosCliente = supabase
    .from('turno')
    .select('id, inicio, fin')
    .eq('id_cliente', clienteId)
    .in('estado', ['pendiente', 'confirmado', 'pago_pendiente'])
    .lt('inicio', finDia.toISOString())
    .gt('fin', inicioDia.toISOString())

  if (turnoIgnoradoId) {
    consultaTurnosStaff = consultaTurnosStaff.neq('id', turnoIgnoradoId)
    consultaTurnosCliente = consultaTurnosCliente.neq('id', turnoIgnoradoId)
  }

  const [{ data: horarios, error: horarioError }, { data: turnosStaff, error: staffError }, { data: turnosCliente, error: clienteError }] = await Promise.all([
    supabase
      .from('horario_staff')
      .select('hora_inicio, hora_fin')
      .eq('id_usuario', staffId)
      .eq('dia_semana', diaSemana),
    consultaTurnosStaff,
    consultaTurnosCliente,
  ])

  if (horarioError) throw horarioError
  if (staffError) throw staffError
  if (clienteError) throw clienteError

  const ocupados = [...(turnosStaff ?? []), ...(turnosCliente ?? [])]
  const ahora = Date.now()
  const disponibles = new Set<string>()

  for (const horario of horarios ?? []) {
    const apertura = minutesFromTime(horario.hora_inicio)
    const cierre = minutesFromTime(horario.hora_fin)
    const primerSlot = Math.ceil(apertura / 30) * 30

    for (let minuto = primerSlot; minuto + duracionMinutos <= cierre; minuto += 30) {
      const horas = Math.floor(minuto / 60)
      const minutos = minuto % 60
      const inicioSlot = new Date(year, month - 1, day, horas, minutos)
      const finSlot = new Date(inicioSlot.getTime() + duracionMinutos * 60_000)
      if (inicioSlot.getTime() <= ahora) continue

      const seSuperpone = ocupados.some((turno) => (
        inicioSlot < new Date(turno.fin) && finSlot > new Date(turno.inicio)
      ))
      if (!seSuperpone) {
        disponibles.add(`${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`)
      }
    }
  }

  return [...disponibles].sort()
}

export async function getTurnoParaReprogramar(id: string, clienteId: string) {
  const { data, error } = await supabase
    .from('turno')
    .select('id, id_negocio, id_cliente, id_staff, id_servicio, inicio, estado, notas')
    .eq('id', id)
    .eq('id_cliente', clienteId)
    .single()

  if (error) throw error
  return data as Pick<Turno, 'id' | 'id_negocio' | 'id_cliente' | 'id_staff' | 'id_servicio' | 'inicio' | 'estado' | 'notas'>
}

export async function reprogramarTurno(id: string, clienteId: string, inicio: string) {
  const { data, error } = await supabase
    .from('turno')
    .update({ inicio })
    .eq('id', id)
    .eq('id_cliente', clienteId)
    .in('estado', ['pendiente', 'confirmado'])
    .select()
    .single()

  if (error) throw error
  return data as Turno
}

export async function getTurnosCliente(clienteId: string, page = 0, perPage = 10) {
  const from = page * perPage, to = from + perPage - 1
  const { data, error, count } = await supabase
    .from('turno')
    .select(`*, servicio:servicio(id, nombre, precio, duracion_minutos), staff:usuario!turno_id_staff_fkey(id, nombre, apellido)`, { count: 'exact' })
    .eq('id_cliente', clienteId)
    .order('inicio', { ascending: false })
    .range(from, to)
  if (error) throw error
  return { data: data ?? [], count: count ?? 0 }
}

export async function cancelarTurno(id: string) {
  const { error } = await supabase.from('turno').update({ estado: 'cancelado' }).eq('id', id)
  if (error) throw error
}

export async function getAgendaStaff(staffId: string, desde: string, hasta: string) {
  const { data, error } = await supabase
    .from('turno')
    .select(`*, servicio:servicio(id, nombre, duracion_minutos, precio), cliente:usuario!turno_id_cliente_fkey(id, nombre, apellido, telefono)`)
    .eq('id_staff', staffId).gte('inicio', desde).lte('inicio', hasta)
    .order('inicio', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function marcarCompletado(id: string) {
  const { error } = await supabase.from('turno').update({ estado: 'completado' }).eq('id', id)
  if (error) throw error
}