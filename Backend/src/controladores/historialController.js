const Historial = require('../modelos/historial');
const { resolverDoctorId } = require('../utils/resolverDoctor');

const historialController = {
    // Obtener historial de un paciente
    obtenerHistorialPaciente: async (req, res) => {
        try {
            const { paciente_id } = req.params;
            const historiales = await Historial.obtenerPorPaciente(paciente_id);
            res.json(historiales);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al obtener historial médico' });
        }
    },

    // Registrar nueva evolución y recetas
    crearEvolucion: async (req, res) => {
        try {
            const datos = { ...req.body };
            if (!datos.doctor_id) {
                const docId = await resolverDoctorId(req.usuario);
                datos.doctor_id = docId || 1;
            }
            const nuevoHistorial = await Historial.crear(datos);
            res.status(201).json(nuevoHistorial);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al registrar evolución médica', error: error.message });
        }
    },

    // Actualizar evolución médica
    actualizarEvolucion: async (req, res) => {
        try {
            const { id } = req.params;
            const evolucionActualizada = await Historial.actualizar(id, req.body);
            if (!evolucionActualizada) {
                return res.status(404).json({ mensaje: 'Registro de evolución no encontrado' });
            }
            res.json(evolucionActualizada);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al actualizar evolución médica' });
        }
    },

    // Eliminar evolución médica
    eliminarEvolucion: async (req, res) => {
        try {
            const { id } = req.params;
            const eliminada = await Historial.eliminar(id);
            if (!eliminada) {
                return res.status(404).json({ mensaje: 'Registro de evolución no encontrado' });
            }
            res.json({ mensaje: 'Evolución médica eliminada correctamente', id });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al eliminar evolución médica' });
        }
    }
};

module.exports = historialController;
