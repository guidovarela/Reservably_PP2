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
  if (staffIds.size === 0) return []

  return ((staff ?? []) as StaffConUsuario[]).filter(
    (item) => staffIds.has(item.id_usuario) && (!item.usuario?.estado || item.usuario.estado === 'ACTIVO'),
  )
}

export async function getAllStaffServicios() {
  const { data, error } = await supabase
    .from('staff_servicio')
    .select('id_usuario, id_servicio')

  if (error) throw error
  return (data ?? []) as Array<{ id_usuario: string; id_servicio: string }>
}

export interface ServicioAsignado {
  id: string
  nombre: string
  categoria: string | null
  duracion_minutos: number
  precio: number
  activo: boolean
}

export async function getServiciosDeStaff(staffId: string): Promise<ServicioAsignado[]> {
  const { data, error } = await supabase
    .from('staff_servicio')
    .select('servicio:servicio(id, nombre, categoria, duracion_minutos, precio, activo)')
    .eq('id_usuario', staffId)

  if (error) throw error

  return (data ?? [])
    .map((row: any) => row.servicio as ServicioAsignado | null)
    .filter((s): s is ServicioAsignado => Boolean(s && s.activo))
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
}

export async function getStaffAsignadoIds(servicioId: string) {
  const { data, error } = await supabase
    .from('staff_servicio')
    .select('id_usuario')
    .eq('id_servicio', servicioId)

  if (error) throw error
  return (data ?? []).map((item) => item.id_usuario)
}

function todayLocalISO(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export async function ensureStaffEnNegocio(staffId: string, negocioId: string) {
  const { data: existente, error: checkError } = await supabase
    .from('staff')
    .select('id_usuario, activo')
    .eq('id_usuario', staffId)
    .eq('id_negocio', negocioId)
    .maybeSingle()

  if (checkError) throw checkError
  if (existente?.activo) return

  if (existente && !existente.activo) {
    const { error: updateError } = await supabase
      .from('staff')
      .update({ activo: true, desactivado_en: null })
      .eq('id_usuario', staffId)
      .eq('id_negocio', negocioId)
    if (updateError) throw updateError
    return
  }

  const { data: neg } = await supabase
    .from('negocio')
    .select('comision_default')
    .eq('id', negocioId)
    .maybeSingle()

  const { error: insertError } = await supabase
    .from('staff')
    .insert({
      id_usuario: staffId,
      id_negocio: negocioId,
      comision_porcentaje: Number(neg?.comision_default ?? 40),
      contratado_en: todayLocalISO(),
      activo: true,
    })

  if (insertError) throw insertError
}

export async function asignarStaffServicio(staffId: string, servicioId: string, negocioId?: string) {
  let idNegocio = negocioId?.trim()
  if (!idNegocio) {
    const { data: srv, error: srvError } = await supabase
      .from('servicio')
      .select('id_negocio')
      .eq('id', servicioId)
      .single()
    if (srvError) throw srvError
    idNegocio = srv.id_negocio
  }

  if (idNegocio) {
    await ensureStaffEnNegocio(staffId, idNegocio)
  }

  const { error } = await supabase
    .from('staff_servicio')
    .insert({ id_usuario: staffId, id_servicio: servicioId })

  if (error && error.code !== '23505') throw error
}

export async function desasignarStaffServicio(staffId: string, servicioId: string) {
  const { error } = await supabase
    .from('staff_servicio')
    .delete()
    .eq('id_usuario', staffId)
    .eq('id_servicio', servicioId)

  if (error) throw error
}