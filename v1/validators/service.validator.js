/**
 * Valida los datos recibidos en el cuerpo para la API de servicios.
 */
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

/**
 * Sanitiza y limpia el cuerpo de una petición de servicio para la API.
 */
function cleanServiceInput(body) {
  const fields = ['name', 'description', 'price', 'duration_minutes', 'active'];
  const input = {};
  fields.forEach((field) => {
    if (body[field] !== undefined) {
      input[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
    }
  });
  return input;
}

module.exports = {
  validateService,
  cleanServiceInput
};
