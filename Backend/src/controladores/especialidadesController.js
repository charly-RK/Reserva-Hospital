const Especialidad = require('../modelos/especialidades');

const especialidadesController = {
    // Obtener todas las especialidades
    obtenerEspecialidades: async (req, res) => {
        try {
            const especialidades = await Especialidad.obtenerTodas();
            res.json(especialidades);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al obtener especialidades' });
        }
    },

    // Crear una nueva especialidad
    crearEspecialidad: async (req, res) => {
        try {
            const { nombre, descripcion } = req.body;
            const nuevaEspecialidad = await Especialidad.crear(nombre, descripcion);
            res.status(201).json(nuevaEspecialidad);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al crear especialidad' });
        }
    }
};

module.exports = especialidadesController;
