const express = require('express');
const router = express.Router();
const imagenesController = require('../controladores/imagenesController');

router.get('/paciente/:paciente_id', imagenesController.obtenerPorPaciente);
router.post('/', imagenesController.subirImagen);
router.put('/:id', imagenesController.actualizarImagen);
router.delete('/:id', imagenesController.eliminarImagen);

module.exports = router;
