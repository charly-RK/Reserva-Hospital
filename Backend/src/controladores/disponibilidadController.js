const Disponibilidad = require('../modelos/disponibilidad');

const disponibilidadController = {
    // Obtener disponibilidad de un doctor
    obtenerDisponibilidad: async (req, res) => {
        try {
            const { doctor_id } = req.params;
            const horarios = await Disponibilidad.obtenerPorDoctor(doctor_id);
            res.json(horarios);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al obtener disponibilidad' });
        }
    },

    // Agregar disponibilidad
    agregarDisponibilidad: async (req, res) => {
        try {
            const nuevaDisponibilidad = await Disponibilidad.crear(req.body);
            res.status(201).json(nuevaDisponibilidad);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al agregar disponibilidad' });
        }
    },

    // Guardar horario completo de un doctor
    guardarHorarioDoctor: async (req, res) => {
        try {
            const { doctor_id } = req.params;
            const { horarios, duracion_cita_minutos = 30 } = req.body;
            const resultados = await Disponibilidad.guardarPorDoctor(doctor_id, horarios, duracion_cita_minutos);
            res.json({ mensaje: 'Horario actualizado correctamente', horarios: resultados });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al guardar el horario del doctor' });
        }
    }
};

module.exports = disponibilidadController;
