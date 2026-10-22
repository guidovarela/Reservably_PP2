const express = require('express');
const { requireApiToken } = require('../middlewares/auth.middleware');
const { validateId } = require('../middlewares/validate.middleware');
const { asyncRoute, apiErrorHandler } = require('../middlewares/error.middleware');
const usersController = require('../controllers/users.controller');
const servicesController = require('../controllers/services.controller');
const appointmentsController = require('../controllers/appointments.controller');

const router = express.Router();

router.use(requireApiToken);

// === USUARIOS ===
router.get('/users', asyncRoute((req, res) => usersController.list(req, res)));
router.get('/users/:id', validateId, asyncRoute((req, res) => usersController.getById(req, res)));
router.post('/users', asyncRoute((req, res) => usersController.create(req, res)));
router.patch('/users/:id', validateId, asyncRoute((req, res) => usersController.update(req, res)));
router.delete('/users/:id', validateId, asyncRoute((req, res) => usersController.remove(req, res)));

// === SERVICIOS ===
router.get('/services', asyncRoute((req, res) => servicesController.list(req, res)));
router.get('/services/:id', validateId, asyncRoute((req, res) => servicesController.getById(req, res)));
router.post('/services', asyncRoute((req, res) => servicesController.create(req, res)));
router.patch('/services/:id', validateId, asyncRoute((req, res) => servicesController.update(req, res)));
router.delete('/services/:id', validateId, asyncRoute((req, res) => servicesController.remove(req, res)));

// === TURNOS ===
router.get('/appointments', asyncRoute((req, res) => appointmentsController.list(req, res)));
router.post('/appointments', asyncRoute((req, res) => appointmentsController.create(req, res)));

router.use(apiErrorHandler);

module.exports = router;
