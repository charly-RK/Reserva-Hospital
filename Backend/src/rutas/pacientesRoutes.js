const express = require('express');
const router = express.Router();
const pacientesController = require('../controladores/pacientesController');
const { extraerUsuario } = require('../config/authMiddleware');

// Rutas para pacientes
router.get('/', extraerUsuario, pacientesController.obtenerTodos);
router.get('/id/:id', pacientesController.obtenerPorId);
router.get('/cedula/:cedula', pacientesController.buscarPaciente);
router.post('/', pacientesController.registrarPaciente);
router.put('/:id', pacientesController.actualizarPaciente);
router.delete('/:id', pacientesController.eliminarLogico);

module.exports = router;
