const express = require('express');
const { getSupabase } = require('../lib/supabase');

const router = express.Router();

router.get('/', async (req, res) => {
  const title = 'Sistema de Turnos';

  try {
    const supabase = getSupabase();
    const [{ data: services, error: servicesError }, { data: staff, error: staffError }] =
      await Promise.all([
        supabase.from('services').select('id, name, description, price, duration_minutes')
          .eq('active', true).order('name'),
        supabase.from('users').select('id, full_name')
          .eq('role', 'staff').order('full_name')
      ]);

    if (servicesError) throw servicesError;
    if (staffError) throw staffError;

    res.render('index', {
      title,
      connectionOk: true,
      connectionMessage: 'Conexión correcta con Supabase.',
      services,
      staff,
      queryError: null
    });
  } catch (error) {
    console.error('Error al consultar Supabase:', error);
    res.status(error.status || 200).render('index', {
      title,
      connectionOk: false,
      connectionMessage: error.status === 503
        ? error.message
        : 'No se pudieron cargar los servicios y el equipo.',
      services: [],
      staff: [],
      queryError: error.status ? null : error.message
    });
  }
});

module.exports = router;
