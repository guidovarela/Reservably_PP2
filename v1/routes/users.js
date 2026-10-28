const express = require('express');
const usersController = require('../controllers/users.controller');
const { asyncRoute } = require('../middlewares/error.middleware');

const router = express.Router();

router.get('/', asyncRoute((req, res) => usersController.renderPanel(req, res)));
router.post('/login', asyncRoute((req, res) => usersController.login(req, res)));
router.post('/logout', (req, res) => usersController.logout(req, res));
router.post('/', asyncRoute((req, res) => usersController.createFromWeb(req, res)));
router.post('/:id/update', asyncRoute((req, res) => usersController.updateFromWeb(req, res)));
router.post('/:id/delete', asyncRoute((req, res) => usersController.deleteFromWeb(req, res)));

module.exports = router;
