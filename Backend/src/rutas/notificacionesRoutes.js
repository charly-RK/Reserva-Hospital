const express = require('express');
const router = express.Router();
const notificacionesController = require('../controladores/notificacionesController');

router.get('/', notificacionesController.obtenerTodas);
router.get('/mis-alertas', notificacionesController.obtenerMisNotificaciones);
router.post('/', notificacionesController.crearAlerta);
router.put('/marcar-todas', notificacionesController.marcarTodasLeidas);
router.put('/:id/leido', notificacionesController.marcarLeida);
router.put('/:id/archivar', notificacionesController.archivar);
router.put('/:id/importante', notificacionesController.importante);

module.exports = router;
