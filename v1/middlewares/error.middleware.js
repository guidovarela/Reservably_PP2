/**
 * Mapea y responde con el código de error HTTP adecuado para errores conocidos de PostgreSQL/Supabase.
 */
function sendDatabaseError(res, error) {
  if (error.code === '23P01') {
    return res.status(409).json({ error: 'El barbero o el cliente ya tiene un turno en ese horario.' });
  }
  if (error.code === '23505') {
    return res.status(409).json({ error: 'Ya existe un registro con esos datos únicos.' });
  }
  if (error.code === '23503') {
    return res.status(400).json({ error: 'Una referencia indicada no existe o no puede eliminarse.' });
  }

  console.error('Error de Supabase:', error);
  return res.status(500).json({ error: 'No se pudo completar la operación en Supabase.' });
}

/**
 * Traduce códigos de error de base de datos a mensajes descriptivos para vistas SSR.
 */
function databaseErrorMessage(error) {
  if (error.code === '23505') return 'Ya existe un usuario registrado con ese email.';
  if (error.code === '23503') return 'No se puede eliminar este usuario porque tiene turnos asociados.';
  return 'No se pudo completar la operación en Supabase.';
}

/**
 * Wrapper para controladores asíncronos en Express.
 */
function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

/**
 * Middleware de manejo de errores finales para la API REST.
 */
function apiErrorHandler(error, req, res, next) {
  if (error.status) {
    return res.status(error.status).json({ error: error.message });
  }
  console.error('Error inesperado en la API:', error);
  res.status(500).json({ error: 'Error interno del servidor.' });
}

module.exports = {
  sendDatabaseError,
  databaseErrorMessage,
  asyncRoute,
  apiErrorHandler
};
