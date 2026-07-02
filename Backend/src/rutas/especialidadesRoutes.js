const express = require('express');
const router = express.Router();
const especialidadesController = require('../controladores/especialidadesController');

// Rutas para especialidades
router.get('/', especialidadesController.obtenerEspecialidades);
router.post('/', especialidadesController.crearEspecialidad);

module.exports = router;
