const Paciente = require('../modelos/pacientes');
const pool = require('../config/base_datos');
const { resolverDoctorId } = require('../utils/resolverDoctor');

const pacientesController = {
    // Obtener todos los pacientes
    obtenerTodos: async (req, res) => {
        try {
            if (req.usuario && req.usuario.rol === 'DOCTOR') {
                const docId = await resolverDoctorId(req.usuario);
                if (docId) {
                    const query = `
                        SELECT DISTINCT p.*, d.nombre as doctor_nombre, d.apellido as doctor_apellido 
                        FROM pacientes p
                        LEFT JOIN doctores d ON p.doctor_asignado_id = d.id
                        LEFT JOIN citas c ON c.paciente_id = p.id
                        WHERE (c.doctor_id = $1 OR p.doctor_asignado_id = $1) AND p.estado != 'INACTIVO'
                        ORDER BY p.id DESC
                    `;
                    const resDoc = await pool.query(query, [docId]);
                    return res.json(resDoc.rows);
                }
            }
            if (req.usuario && req.usuario.rol === 'PACIENTE' && req.usuario.paciente_id) {
                const paciente = await Paciente.obtenerPorId(req.usuario.paciente_id);
                return res.json(paciente ? [paciente] : []);
            }
            const pacientes = await Paciente.obtenerTodos(req.query);
            res.json(pacientes);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al obtener pacientes' });
        }
    },

    // Obtener paciente por ID
    obtenerPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const paciente = await Paciente.obtenerPorId(id);
            if (paciente) {
                res.json(paciente);
            } else {
                res.status(404).json({ mensaje: 'Paciente no encontrado' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al buscar paciente por ID' });
        }
    },

    // Buscar paciente por cédula
    buscarPaciente: async (req, res) => {
        try {
            const { cedula } = req.params;
            const paciente = await Paciente.buscarPorCedula(cedula);
            if (paciente) {
                res.json(paciente);
            } else {
                res.status(404).json({ mensaje: 'Paciente no encontrado' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al buscar paciente por cédula' });
        }
    },

    // Registrar un nuevo paciente
    registrarPaciente: async (req, res) => {
        try {
            const nuevoPaciente = await Paciente.crear(req.body);
            res.status(201).json(nuevoPaciente);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al registrar paciente', error: error.message });
        }
    },

    // Actualizar paciente
    actualizarPaciente: async (req, res) => {
        try {
            const { id } = req.params;
            const pacienteActualizado = await Paciente.actualizar(id, req.body);
            res.json(pacienteActualizado);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al actualizar paciente' });
        }
    },

    // Eliminación lógica de paciente
    eliminarLogico: async (req, res) => {
        try {
            const { id } = req.params;
            const pacienteEliminado = await Paciente.eliminarLogico(id);
            if (pacienteEliminado) {
                res.json({ mensaje: 'Paciente dado de baja / inactivado correctamente', paciente: pacienteEliminado });
            } else {
                res.status(404).json({ mensaje: 'Paciente no encontrado' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al dar de baja al paciente' });
        }
    }
};

module.exports = pacientesController;
