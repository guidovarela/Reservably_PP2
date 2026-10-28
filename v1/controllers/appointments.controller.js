const appointmentsService = require('../services/appointments.service');
const { validateCreateAppointment } = require('../validators/appointment.validator');
const { respondWithValidation } = require('../middlewares/validate.middleware');
const { sendDatabaseError } = require('../middlewares/error.middleware');

/**
 * Controlador para los endpoints REST de turnos.
 */
class AppointmentsController {
  async list(req, res) {
    try {
      const data = await appointmentsService.getAllAppointments();
      res.json(data);
    } catch (error) {
      return sendDatabaseError(res, error);
    }
  }

  async create(req, res) {
    const errors = validateCreateAppointment(req.body);
    if (respondWithValidation(res, errors)) return;

    const { client_id: clientId, barber_id: barberId, service_id: serviceId, starts_at: startsAt } = req.body;

    try {
      const data = await appointmentsService.createAppointment({
        clientId,
        barberId,
        serviceId,
        startsAt
      });
      res.status(201).json(data);
    } catch (error) {
      if (error.status === 400) {
        return res.status(400).json({ error: error.message });
      }
      return sendDatabaseError(res, error);
    }
  }
}

module.exports = new AppointmentsController();
