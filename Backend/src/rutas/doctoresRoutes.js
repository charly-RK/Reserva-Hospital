const express = require('express');
const router = express.Router();
const doctoresController = require('../controladores/doctoresController');

// Rutas para doctores
router.get('/', doctoresController.obtenerDoctores);
router.post('/', doctoresController.crearDoctor);
router.put('/:id', doctoresController.actualizarDoctor);

module.exports = router;
