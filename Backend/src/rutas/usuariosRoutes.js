const express = require('express');
const router = express.Router();
const usuariosController = require('../controladores/usuariosController');
const { verificarToken, verificarRol } = require('../config/authMiddleware');

// Proteger todas las rutas de usuarios o dejar accesible para administración
router.get('/', usuariosController.obtenerTodos);
router.get('/:id', usuariosController.obtenerPorId);
router.post('/', usuariosController.crear);
router.put('/:id', usuariosController.actualizar);
router.delete('/:id', usuariosController.eliminar);

module.exports = router;
