import { supabase } from '@/lib/supabase'

export async function getStaff(negocioId: string) {
  const { data, error } = await supabase
    .from('staff')
    .select(`*, usuario:usuario(id, nombre, apellido, foto_url, email, telefono)`)
    .eq('id_negocio', negocioId).eq('activo', true)
  if (error) throw error
  return data ?? []
}

export async function getStaffParaServicio(negocioId: string, servicioId: string) {
  const [{ data: staffServicio, error: servicioError }, { data: staff, error: staffError }] = await Promise.all([
    supabase.from('staff_servicio').select('id_usuario').eq('id_servicio', servicioId),
    supabase
      .from('staff')
      .select('*, usuario:usuario(id, nombre, apellido, foto_url, email, telefono)')
      .eq('id_negocio', negocioId)
      .eq('activo', true),
  ])

  if (servicioError) throw servicioError
  if (staffError) throw staffError

  const staffIds = new Set((staffServicio ?? []).map((item) => item.id_usuario))
  return (staff ?? []).filter((item) => staffIds.has(item.id_usuario))
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