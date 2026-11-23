import { supabase, NEGOCIO_ID } from '@/lib/supabase'
import type { Servicio } from '@/types/database'
import { ensureStaffEnNegocio } from '@/services/staffService'

export async function getServiciosAdmin(negocioId?: string | unknown) {
  let query = supabase.from('servicio').select('*')

  if (typeof negocioId === 'string' && negocioId.trim()) {
    query = query.eq('id_negocio', negocioId)
  }

  const { data, error } = await query.order('nombre')
  if (error) throw error
  return (data ?? []) as Servicio[]
}

export async function getServiciosLanding() {
  const { data, error } = await supabase
    .from('servicio')
    .select('*')
    .eq('activo', true)
    .order('nombre')

  if (error) throw error
  return (data ?? []) as Servicio[]
}

export async function getServiciosParaReserva(negocioId?: string) {
  let query = supabase.from('servicio').select('*').eq('activo', true)

  if (negocioId && negocioId.trim()) {
    query = query.eq('id_negocio', negocioId)
  }

  const { data, error } = await query.order('nombre')
  if (error) throw error
  return (data ?? []) as Servicio[]
}

export async function crearServicio(
  input: Omit<Servicio, 'id' | 'created_at' | 'updated_at' | 'activo'>,
) {
  const { data, error } = await supabase
    .from('servicio')
    .insert({ ...input, activo: true })
    .select()
    .single()

  if (error) throw error
  return data as Servicio
}

export async function desactivarServicio(id: string) {
  const { error } = await supabase
    .from('servicio')
    .update({ activo: false })
    .eq('id', id)

  if (error) throw error
}

export async function activarServicio(id: string) {
  const { error } = await supabase
    .from('servicio')
    .update({ activo: true })
    .eq('id', id)

  if (error) throw error
}

export async function getStaffMembers() {
  const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .in('rol', ['staff', 'cliente'])
    .order('nombre')

  if (error) throw error
  return data ?? []
}

export async function cambiarRolUsuario(
  userId: string,
  nuevoRol: 'staff' | 'cliente',
  negocioId: string = NEGOCIO_ID,
) {
  const { error: rolError } = await supabase
    .from('usuario')
    .update({ rol: nuevoRol })
    .eq('id', userId)

  if (rolError) throw rolError

  if (nuevoRol === 'staff') {
    if (negocioId) {
      await ensureStaffEnNegocio(userId, negocioId)
    }
  } else {
    await supabase.from('staff_servicio').delete().eq('id_usuario', userId)
    await supabase
      .from('staff')
      .update({ activo: false, desactivado_en: new Date().toISOString() })
      .eq('id_usuario', userId)
  }
}

export async function desactivarStaff(id: string) {
  const ahora = new Date().toISOString()
  const { error } = await supabase
    .from('usuario')
    .update({
      estado: 'INACTIVO',
      desactivado_en: ahora,
    })
    .eq('id', id)

  if (error) throw error

  const { error: staffError } = await supabase
    .from('staff')
    .update({ activo: false, desactivado_en: ahora })
    .eq('id_usuario', id)

  if (staffError) throw staffError
}

export async function activarStaff(id: string) {
  const { error } = await supabase
    .from('usuario')
    .update({
      estado: 'ACTIVO',
      desactivado_en: null,
    })
    .eq('id', id)

  if (error) throw error

  const { error: staffError } = await supabase
    .from('staff')
    .update({ activo: true, desactivado_en: null })
    .eq('id_usuario', id)

  if (staffError) throw staffError
}