const express = require('express');
const { getSupabase } = require('../config/supabase');
const { requireApiToken } = require('../middlewares/auth.middleware');
const { isUuid, validateId, respondWithValidation } = require('../middlewares/validate.middleware');
const { sendDatabaseError, asyncRoute, apiErrorHandler } = require('../middlewares/error.middleware');

const router = express.Router();
const userRoles = ['client', 'staff', 'admin'];

router.use(requireApiToken);

function validateUser(body, partial = false) {
  const errors = [];
  const required = ['full_name', 'email', 'role'];
  const allowed = ['full_name', 'email', 'phone', 'role'];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['El cuerpo debe ser un objeto JSON.'];
  }
  Object.keys(body).forEach((field) => {
    if (!allowed.includes(field)) errors.push(`Campo no permitido: ${field}.`);
  });

  if (!partial) {
    required.forEach((field) => {
      if (body[field] === undefined) errors.push(`Falta el campo ${field}.`);
    });
  }

  if (body.full_name !== undefined &&
      (typeof body.full_name !== 'string' || !body.full_name.trim())) {
    errors.push('full_name debe ser un texto no vacío.');
  }
  if (body.email !== undefined &&
      (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))) {
    errors.push('email debe ser una dirección válida.');
  }
  if (body.phone !== undefined && body.phone !== null && typeof body.phone !== 'string') {
    errors.push('phone debe ser texto o null.');
  }
  if (body.role !== undefined && !userRoles.includes(body.role)) {
    errors.push(`role debe ser uno de: ${userRoles.join(', ')}.`);
  }

  return errors;
}

function validateService(body, partial = false) {
  const errors = [];
  const required = ['name', 'price', 'duration_minutes'];
  const allowed = ['name', 'description', 'price', 'duration_minutes', 'active'];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['El cuerpo debe ser un objeto JSON.'];
  }
  Object.keys(body).forEach((field) => {
    if (!allowed.includes(field)) errors.push(`Campo no permitido: ${field}.`);
  });

  if (!partial) {
    required.forEach((field) => {
      if (body[field] === undefined) errors.push(`Falta el campo ${field}.`);
    });
  }

  if (body.name !== undefined && (typeof body.name !== 'string' || !body.name.trim())) {
    errors.push('name debe ser un texto no vacío.');
  }
  if (body.description !== undefined && body.description !== null &&
      typeof body.description !== 'string') {
    errors.push('description debe ser texto o null.');
  }
  if (body.price !== undefined &&
      (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price < 0)) {
    errors.push('price debe ser un número mayor o igual a cero.');
  }
  if (body.duration_minutes !== undefined &&
      (!Number.isInteger(body.duration_minutes) || body.duration_minutes <= 0)) {
    errors.push('duration_minutes debe ser un entero positivo.');
  }
  if (body.active !== undefined && typeof body.active !== 'boolean') {
    errors.push('active debe ser booleano.');
  }

  return errors;
}


function cleanInput(body, fields) {
  const input = {};
  fields.forEach((field) => {
    if (body[field] !== undefined) {
      input[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
    }
  });
  if (input.email) input.email = input.email.toLowerCase();
  return input;
}

function createCrudRoutes(resource, validator) {
  router.get(`/${resource}`, asyncRoute(async (req, res) => {
    const { data, error } = await getSupabase()
      .from(resource)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return sendDatabaseError(res, error);
    res.json(data);
  }));

  router.get(`/${resource}/:id`, validateId, asyncRoute(async (req, res) => {
    const { data, error } = await getSupabase()
      .from(resource)
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (error) return sendDatabaseError(res, error);
    if (!data) return res.status(404).json({ error: 'Registro no encontrado.' });
    res.json(data);
  }));

  router.post(`/${resource}`, asyncRoute(async (req, res) => {
    if (respondWithValidation(res, validator(req.body))) return;
    const { data, error } = await getSupabase()
      .from(resource)
      .insert(cleanInput(req.body, resource === 'users'
        ? ['full_name', 'email', 'phone', 'role']
        : ['name', 'description', 'price', 'duration_minutes', 'active']))
      .select()
      .single();
    if (error) return sendDatabaseError(res, error);
    res.status(201).json(data);
  }));

  router.patch(`/${resource}/:id`, validateId, asyncRoute(async (req, res) => {
    if (respondWithValidation(res, validator(req.body, true))) return;
    if (!Object.keys(req.body || {}).length) {
      return res.status(400).json({ error: 'Debe enviar al menos un campo para actualizar.' });
    }
    const { data, error } = await getSupabase()
      .from(resource)
      .update(cleanInput(req.body, resource === 'users'
        ? ['full_name', 'email', 'phone', 'role']
        : ['name', 'description', 'price', 'duration_minutes', 'active']))
      .eq('id', req.params.id)
      .select()
      .maybeSingle();
    if (error) return sendDatabaseError(res, error);
    if (!data) return res.status(404).json({ error: 'Registro no encontrado.' });
    res.json(data);
  }));

  router.delete(`/${resource}/:id`, validateId, asyncRoute(async (req, res) => {
    const { data, error } = await getSupabase()
      .from(resource)
      .delete()
      .eq('id', req.params.id)
      .select('id')
      .maybeSingle();
    if (error) return sendDatabaseError(res, error);
    if (!data) return res.status(404).json({ error: 'Registro no encontrado.' });
    res.status(204).end();
  }));
}

createCrudRoutes('users', validateUser);
createCrudRoutes('services', validateService);

router.get('/appointments', asyncRoute(async (req, res) => {
  const { data, error } = await getSupabase()
    .from('appointments')
    .select('*, client:users!appointments_client_id_fkey(id, full_name, email), barber:users!appointments_barber_id_fkey(id, full_name), service:services(id, name, price, duration_minutes)')
    .order('starts_at', { ascending: true });
  if (error) return sendDatabaseError(res, error);
  res.json(data);
}));

router.post('/appointments', asyncRoute(async (req, res) => {
  const { client_id: clientId, barber_id: barberId, service_id: serviceId, starts_at: startsAt } = req.body || {};
  const errors = [];
  if (!isUuid(clientId)) errors.push('client_id debe ser un UUID válido.');
  if (!isUuid(barberId)) errors.push('barber_id debe ser un UUID válido.');
  if (!isUuid(serviceId)) errors.push('service_id debe ser un UUID válido.');
  if (typeof startsAt !== 'string' || !/(Z|[+-]\d{2}:\d{2})$/i.test(startsAt) ||
      !Number.isFinite(Date.parse(startsAt))) {
    errors.push('starts_at debe ser fecha y hora ISO 8601 con zona horaria.');
  }
  if (respondWithValidation(res, errors)) return;

  const supabase = getSupabase();
  const [{ data: client, error: clientError }, { data: barber, error: barberError },
    { data: service, error: serviceError }] = await Promise.all([
    supabase.from('users').select('id, role').eq('id', clientId).maybeSingle(),
    supabase.from('users').select('id, role').eq('id', barberId).maybeSingle(),
    supabase.from('services').select('id, price, duration_minutes, active').eq('id', serviceId).maybeSingle()
  ]);

  if (clientError) return sendDatabaseError(res, clientError);
  if (barberError) return sendDatabaseError(res, barberError);
  if (serviceError) return sendDatabaseError(res, serviceError);
  if (!client || client.role !== 'client') {
    return res.status(400).json({ error: 'client_id no corresponde a un cliente existente.' });
  }
  if (!barber || barber.role !== 'staff') {
    return res.status(400).json({ error: 'barber_id no corresponde a un barbero existente.' });
  }
  if (!service || !service.active) {
    return res.status(400).json({ error: 'service_id no corresponde a un servicio activo.' });
  }

  const startDate = new Date(startsAt);
  const endDate = new Date(startDate.getTime() + service.duration_minutes * 60 * 1000);
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      client_id: clientId,
      barber_id: barberId,
      service_id: serviceId,
      starts_at: startDate.toISOString(),
      ends_at: endDate.toISOString(),
      price_at_booking: service.price,
      status: 'confirmed'
    })
    .select()
    .single();

  if (error) return sendDatabaseError(res, error);
  res.status(201).json(data);
}));

router.use(apiErrorHandler);

module.exports = router;
