const express = require('express');
const servicesService = require('../services/services.service');
const usersService = require('../services/users.service');

const router = express.Router();

router.get('/', async (req, res) => {
  const title = 'Sistema de Turnos';

  try {
    const [services, staff] = await Promise.all([
      servicesService.getActiveServices(),
      usersService.getStaffUsers()
    ]);

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
