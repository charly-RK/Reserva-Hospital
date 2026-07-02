const Cita = require('../modelos/citas');
const notificacionesService = require('../servicios/notificacionesService');
const { resolverDoctorId } = require('../utils/resolverDoctor');

// Almacén temporal en memoria para códigos OTP de cancelación
const otpCancelacionCache = new Map();

const citasController = {
    // Agendar una nueva cita (con validación de horario anti-duplicados)
    agendarCita: async (req, res) => {
        try {
            const { doctor_id, fecha_cita, hora_cita } = req.body;
            if (doctor_id && fecha_cita && hora_cita) {
                const citasDelDia = await Cita.obtenerPorDoctorYFecha(doctor_id, fecha_cita);
                const conflicto = citasDelDia.some(c => {
                    const horaExistente = c.hora_cita.substring(0, 5);
                    const horaNueva = hora_cita.substring(0, 5);
                    return horaExistente === horaNueva;
                });
                if (conflicto) {
                    return res.status(409).json({
                        error: 'CONFLICTO_HORARIO',
                        mensaje: 'El médico seleccionado ya tiene una cita agendada en ese horario exacto.'
                    });
                }
            }
            const nuevaCita = await Cita.crear(req.body);
            
            // Disparar envío de notificación por correo y mensaje de forma asíncrona
            Cita.obtenerPorId(nuevaCita.id).then(citaCompleta => {
                if (citaCompleta) {
                    notificacionesService.enviarConfirmacionCita({
                        email: citaCompleta.paciente_email,
                        telefono: citaCompleta.paciente_telefono,
                        pacienteNombre: `${citaCompleta.paciente_nombre} ${citaCompleta.paciente_apellido}`,
                        doctorNombre: `${citaCompleta.doctor_nombre} ${citaCompleta.doctor_apellido}`,
                        especialidad: citaCompleta.especialidad,
                        fecha: citaCompleta.fecha_cita,
                        hora: citaCompleta.hora_cita,
                        codigoCita: citaCompleta.codigo_cita
                    }).catch(err => console.error("Error enviando notificación al agendar:", err));
                }
            }).catch(e => console.error("Error obteniendo datos de cita para notificar:", e));

            res.status(201).json(nuevaCita);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al agendar cita', error: error.message });
        }
    },

    // Obtener todas las citas (Admin/Doctor/Paciente filtrado)
    obtenerTodas: async (req, res) => {
        try {
            if (req.usuario && req.usuario.rol === 'DOCTOR') {
                const docId = await resolverDoctorId(req.usuario);
                if (docId) {
                    const citas = await Cita.obtenerPorDoctor(docId);
                    return res.json(citas);
                }
            }
            if (req.usuario && req.usuario.rol === 'PACIENTE' && req.usuario.paciente_id) {
                const citas = await Cita.obtenerPorPaciente(req.usuario.paciente_id);
                return res.json(citas);
            }
            const citas = await Cita.obtenerTodas();
            res.json(citas);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al obtener todas las citas' });
        }
    },

    // Obtener citas de un paciente
    misCitas: async (req, res) => {
        try {
            const { paciente_id } = req.params;
            const citas = await Cita.obtenerPorPaciente(paciente_id);
            res.json(citas);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al obtener citas' });
        }
    },

    // Obtener citas de un doctor
    citasDoctor: async (req, res) => {
        try {
            const { doctor_id } = req.params;
            const citas = await Cita.obtenerPorDoctor(doctor_id);
            res.json(citas);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al obtener citas del doctor' });
        }
    },

    // Obtener citas de un doctor en una fecha específica
    obtenerCitasDoctorFecha: async (req, res) => {
        try {
            const { doctor_id, fecha } = req.params;
            const citas = await Cita.obtenerPorDoctorYFecha(doctor_id, fecha);
            res.json(citas);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al obtener citas del doctor' });
        }
    },

    // Actualizar estado
    actualizarEstado: async (req, res) => {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            const citaActualizada = await Cita.actualizarEstado(id, estado);
            res.json(citaActualizada);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al actualizar estado de la cita' });
        }
    },

    // Cancelar cita directa
    cancelarCita: async (req, res) => {
        try {
            const { id } = req.params;
            const { motivo } = req.body;
            const citaCancelada = await Cita.cancelar(id, motivo);
            res.json(citaCancelada);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al cancelar cita' });
        }
    },

    // Solicitar código OTP para cancelar una cita por seguridad
    solicitarCancelacion: async (req, res) => {
        try {
            const { id } = req.params;
            const cita = await Cita.obtenerPorId(id);
            if (!cita) {
                return res.status(404).json({ mensaje: 'Cita no encontrada.' });
            }
            // Generar código aleatorio de 6 dígitos
            const codigoOTP = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Guardar en caché con expiración de 15 minutos
            otpCancelacionCache.set(Number(id), {
                codigo: codigoOTP,
                expiracion: Date.now() + 15 * 60 * 1000
            });

            // Enviar correo y mensaje
            await notificacionesService.enviarCodigoCancelacion(
                cita.paciente_email,
                cita.paciente_telefono,
                codigoOTP,
                cita.paciente_nombre
            );

            res.json({
                mensaje: 'Código de seguridad enviado al correo y teléfono registrados.',
                email: cita.paciente_email || 'No registrado',
                telefono: cita.paciente_telefono || 'No registrado',
                demoCode: codigoOTP // Retornado como respaldo informativo
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al solicitar código de cancelación' });
        }
    },

    // Confirmar cancelación verificando el código OTP
    confirmarCancelacionOTP: async (req, res) => {
        try {
            const { id } = req.params;
            const { codigo, motivo = 'Cancelado por el usuario con verificación OTP' } = req.body;

            const cacheData = otpCancelacionCache.get(Number(id));
            if (!cacheData) {
                return res.status(400).json({
                    error: 'CODIGO_EXPIRADO',
                    mensaje: 'No hay una solicitud de cancelación pendiente o el código ha expirado. Por favor solicita un nuevo código.'
                });
            }

            if (cacheData.expiracion < Date.now()) {
                otpCancelacionCache.delete(Number(id));
                return res.status(400).json({
                    error: 'CODIGO_EXPIRADO',
                    mensaje: 'El código de seguridad ha expirado. Por favor solicita uno nuevo.'
                });
            }

            if (cacheData.codigo !== codigo) {
                return res.status(400).json({
                    error: 'CODIGO_INCORRECTO',
                    mensaje: 'El código de seguridad ingresado es incorrecto.'
                });
            }

            // Código correcto, eliminar de caché y cancelar la cita
            otpCancelacionCache.delete(Number(id));
            const citaCancelada = await Cita.cancelar(id, motivo);
            res.json(citaCancelada);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al confirmar cancelación' });
        }
    },

    // Reagendar cita (con validación de horario)
    reagendarCita: async (req, res) => {
        try {
            const { id } = req.params;
            const { doctor_id, fecha_cita, hora_cita } = req.body;
            if (doctor_id && fecha_cita && hora_cita) {
                const citasDelDia = await Cita.obtenerPorDoctorYFecha(doctor_id, fecha_cita);
                const conflicto = citasDelDia.some(c => c.hora_cita.substring(0, 5) === hora_cita.substring(0, 5));
                if (conflicto) {
                    return res.status(409).json({
                        error: 'CONFLICTO_HORARIO',
                        mensaje: 'El médico seleccionado ya tiene una cita agendada en la nueva hora propuesta.'
                    });
                }
            }
            const citaReagendada = await Cita.reagendar(id, fecha_cita, hora_cita);
            res.json(citaReagendada);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al reagendar cita' });
        }
    },

    // Editar cita general
    editarCita: async (req, res) => {
        try {
            const { id } = req.params;
            const citaEditada = await Cita.actualizarDatos(id, req.body);
            res.json(citaEditada);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al editar cita' });
        }
    }
};

module.exports = citasController;
