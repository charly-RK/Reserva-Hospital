const express = require('express');
const router = express.Router();
const facturacionController = require('../controladores/facturacionController');

router.get('/', facturacionController.obtenerTodas);
router.get('/paciente/:paciente_id', facturacionController.obtenerPorPaciente);
router.post('/', facturacionController.crearFactura);
router.put('/:id/estado', facturacionController.actualizarEstado);

module.exports = router;
