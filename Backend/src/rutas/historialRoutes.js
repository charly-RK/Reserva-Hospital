const express = require('express');
const router = express.Router();
const historialController = require('../controladores/historialController');
const { verificarToken } = require('../config/authMiddleware');

router.get('/paciente/:paciente_id', historialController.obtenerHistorialPaciente);
router.post('/', verificarToken, historialController.crearEvolucion);
router.put('/:id', verificarToken, historialController.actualizarEvolucion);
router.delete('/:id', verificarToken, historialController.eliminarEvolucion);

module.exports = router;
