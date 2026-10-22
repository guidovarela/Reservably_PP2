const { isUuid } = require('../middlewares/validate.middleware');

/**
 * Valida los datos requeridos para reservar un turno.
 */
function validateCreateAppointment(body) {
  const { client_id: clientId, barber_id: barberId, service_id: serviceId, starts_at: startsAt } = body || {};
  const errors = [];

  if (!isUuid(clientId)) errors.push('client_id debe ser un UUID válido.');
  if (!isUuid(barberId)) errors.push('barber_id debe ser un UUID válido.');
  if (!isUuid(serviceId)) errors.push('service_id debe ser un UUID válido.');
  if (typeof startsAt !== 'string' || !/(Z|[+-]\d{2}:\d{2})$/i.test(startsAt) ||
      !Number.isFinite(Date.parse(startsAt))) {
    errors.push('starts_at debe ser fecha y hora ISO 8601 con zona horaria.');
  }

  return errors;
}

module.exports = {
  validateCreateAppointment
};
