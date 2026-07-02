const express = require('express');
const router = express.Router();
const citasController = require('../controladores/citasController');
const { extraerUsuario } = require('../config/authMiddleware');

// Rutas para citas
router.post('/', citasController.agendarCita);
router.get('/', extraerUsuario, citasController.obtenerTodas);
router.get('/paciente/:paciente_id', citasController.misCitas);
router.get('/doctor/:doctor_id', citasController.citasDoctor);
router.get('/doctor/:doctor_id/fecha/:fecha', citasController.obtenerCitasDoctorFecha);
router.put('/:id/estado', citasController.actualizarEstado);
router.put('/:id/cancelar', citasController.cancelarCita);
router.post('/:id/solicitar-cancelacion', citasController.solicitarCancelacion);
router.post('/:id/confirmar-cancelacion', citasController.confirmarCancelacionOTP);
router.put('/:id/reagendar', citasController.reagendarCita);
router.put('/:id', citasController.editarCita);

module.exports = router;
