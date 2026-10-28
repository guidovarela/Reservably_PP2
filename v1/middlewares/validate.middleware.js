const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isUuid(value) {
  return typeof value === 'string' && uuidPattern.test(value);
}

function isEmail(value) {
  return typeof value === 'string' && emailPattern.test(value.trim());
}

/**
 * Middleware para validar que el parámetro :id sea un UUID válido.
 */
function validateId(req, res, next) {
  if (!isUuid(req.params.id)) {
    return res.status(400).json({ error: 'El id debe ser un UUID válido.' });
  }
  next();
}

/**
 * Helper para responder error 400 si hay errores de validación.
 */
function respondWithValidation(res, errors) {
  if (!errors || !errors.length) return false;
  res.status(400).json({ error: 'Datos inválidos.', details: errors });
  return true;
}

module.exports = {
  uuidPattern,
  emailPattern,
  isUuid,
  isEmail,
  validateId,
  respondWithValidation
};
