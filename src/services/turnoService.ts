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