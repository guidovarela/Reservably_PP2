const { getSupabase } = require('../config/supabase');

/**
 * Repositorio para operaciones directas con la tabla 'appointments' en Supabase.
 */
class AppointmentsRepository {
  async findAllWithDetails() {
    const { data, error } = await getSupabase()
      .from('appointments')
      .select('*, client:users!appointments_client_id_fkey(id, full_name, email), barber:users!appointments_barber_id_fkey(id, full_name), service:services(id, name, price, duration_minutes)')
      .order('starts_at', { ascending: true });
    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await getSupabase()
      .from('appointments')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async create(appointmentData) {
    const { data, error } = await getSupabase()
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

module.exports = new AppointmentsRepository();
