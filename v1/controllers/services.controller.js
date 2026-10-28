const servicesService = require('../services/services.service');
const { validateService } = require('../validators/service.validator');
const { respondWithValidation } = require('../middlewares/validate.middleware');
const { sendDatabaseError } = require('../middlewares/error.middleware');

/**
 * Controlador para los endpoints REST de servicios.
 */
class ServicesController {
  async list(req, res) {
    try {
      const data = await servicesService.getAllServices();
      res.json(data);
    } catch (error) {
      return sendDatabaseError(res, error);
    }
  }

  async getById(req, res) {
    try {
      const data = await servicesService.getServiceById(req.params.id);
      if (!data) return res.status(404).json({ error: 'Registro no encontrado.' });
      res.json(data);
    } catch (error) {
      return sendDatabaseError(res, error);
    }
  }

  async create(req, res) {
    const errors = validateService(req.body);
    if (respondWithValidation(res, errors)) return;

    try {
      const data = await servicesService.createService(req.body);
      res.status(201).json(data);
    } catch (error) {
      return sendDatabaseError(res, error);
    }
  }

  async update(req, res) {
    const errors = validateService(req.body, true);
    if (respondWithValidation(res, errors)) return;

    if (!Object.keys(req.body || {}).length) {
      return res.status(400).json({ error: 'Debe enviar al menos un campo para actualizar.' });
    }

    try {
      const data = await servicesService.updateService(req.params.id, req.body);
      if (!data) return res.status(404).json({ error: 'Registro no encontrado.' });
      res.json(data);
    } catch (error) {
      return sendDatabaseError(res, error);
    }
  }

  async remove(req, res) {
    try {
      const data = await servicesService.deleteService(req.params.id);
      if (!data) return res.status(404).json({ error: 'Registro no encontrado.' });
      res.status(204).end();
    } catch (error) {
      return sendDatabaseError(res, error);
    }
  }
}

module.exports = new ServicesController();
