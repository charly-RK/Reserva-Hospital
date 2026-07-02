const express = require('express');
const router = express.Router();
const disponibilidadController = require('../controladores/disponibilidadController');

// Rutas para disponibilidad
router.get('/doctor/:doctor_id', disponibilidadController.obtenerDisponibilidad);
router.post('/', disponibilidadController.agregarDisponibilidad);
router.put('/doctor/:doctor_id', disponibilidadController.guardarHorarioDoctor);

module.exports = router;
