import { supabase } from '@/lib/supabase'

export async function getStaff(negocioId: string) {
  const { data, error } = await supabase
    .from('staff')
    .select(`*, usuario:usuario(id, nombre, apellido, foto_url, email, telefono)`)
    .eq('id_negocio', negocioId).eq('activo', true)
  if (error) throw error
  return data ?? []
}