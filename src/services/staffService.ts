import { supabase } from '@/lib/supabase'

export interface StaffUsuarioResumen {
  id: string
  nombre: string
  apellido: string | null
  foto_url: string | null
  email: string
  telefono: string | null
  estado?: string
}

export interface StaffConUsuario {
  id_usuario: string
  id_negocio: string
  descripcion?: string | null
  activo: boolean
  usuario: StaffUsuarioResumen | null
}

export async function getStaff(negocioId?: string) {
  let query = supabase
    .from('staff')
    .select(`*, usuario:usuario(id, nombre, apellido, foto_url, email, telefono, estado)`)
    .eq('activo', true)

  if (negocioId && negocioId.trim()) {
    query = query.eq('id_negocio', negocioId)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as StaffConUsuario[]
}

export async function getStaffParaServicio(negocioId: string | undefined, servicioId: string): Promise<StaffConUsuario[]> {
  let staffQuery = supabase
    .from('staff')
    .select('*, usuario:usuario(id, nombre, apellido, foto_url, email, telefono, estado)')
    .eq('activo', true)

  if (negocioId && negocioId.trim()) {
    staffQuery = staffQuery.eq('id_negocio', negocioId)
  }

  const [{ data: staffServicio, error: servicioError }, { data: staff, error: staffError }] = await Promise.all([
    supabase.from('staff_servicio').select('id_usuario').eq('id_servicio', servicioId),
    staffQuery,
  ])

  if (servicioError) throw servicioError
  if (staffError) throw staffError

  const staffIds = new Set((staffServicio ?? []).map((item) => item.id_usuario))
  const staffActivos = ((staff ?? []) as StaffConUsuario[]).filter(
    (item) => !item.usuario?.estado || item.usuario.estado === 'ACTIVO',
  )

  if (staffIds.size > 0) {
    const asignadosEnStaff = staffActivos.filter((item) => staffIds.has(item.id_usuario))
    if (asignadosEnStaff.length > 0) return asignadosEnStaff
  }

  if (staffActivos.length > 0) {
    return staffActivos
  }

  // Fallback: usuarios con rol = 'staff' y estado = 'ACTIVO' (cuando no se ejecutó 03-promote-users.sql)
  const { data: usuariosStaff, error: usuariosError } = await supabase
    .from('usuario')
    .select('id, nombre, apellido, foto_url, email, telefono, estado')
    .eq('rol', 'staff')
    .eq('estado', 'ACTIVO')
    .order('nombre')

  if (usuariosError) throw usuariosError

  const mapeados: StaffConUsuario[] = (usuariosStaff ?? []).map((u) => ({
    id_usuario: u.id,
    id_negocio: negocioId ?? '',
    activo: true,
    usuario: u as StaffUsuarioResumen,
  }))

  if (staffIds.size > 0) {
    const asignadosEnUsuario = mapeados.filter((item) => staffIds.has(item.id_usuario))
    if (asignadosEnUsuario.length > 0) return asignadosEnUsuario
  }

  return mapeados
}

export async function getStaffAsignadoIds(servicioId: string) {
  const { data, error } = await supabase
    .from('staff_servicio')
    .select('id_usuario')
    .eq('id_servicio', servicioId)

  if (error) throw error
  return (data ?? []).map((item) => item.id_usuario)
}

export async function asignarStaffServicio(staffId: string, servicioId: string) {
  const { error } = await supabase
    .from('staff_servicio')
    .insert({ id_usuario: staffId, id_servicio: servicioId })

  if (error) throw error
}

export async function desasignarStaffServicio(staffId: string, servicioId: string) {
  const { error } = await supabase
    .from('staff_servicio')
    .delete()
    .eq('id_usuario', staffId)
    .eq('id_servicio', servicioId)

  if (error) throw error
}