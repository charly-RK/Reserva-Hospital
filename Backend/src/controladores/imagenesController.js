const ImagenMedica = require('../modelos/imagenes');

const imagenesController = {
    obtenerPorPaciente: async (req, res) => {
        try {
            const { paciente_id } = req.params;
            const imagenes = await ImagenMedica.obtenerPorPaciente(paciente_id);
            res.json(imagenes);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al obtener imágenes médicas' });
        }
    },

    subirImagen: async (req, res) => {
        try {
            const nuevaImagen = await ImagenMedica.crear(req.body);
            res.status(201).json(nuevaImagen);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al registrar imagen médica', error: error.message });
        }
    },

    actualizarImagen: async (req, res) => {
        try {
            const { id } = req.params;
            const imagenActualizada = await ImagenMedica.actualizar(id, req.body);
            res.json(imagenActualizada);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al actualizar imagen médica' });
        }
    },

    eliminarImagen: async (req, res) => {
        try {
            const { id } = req.params;
            const imagenEliminada = await ImagenMedica.eliminar(id);
            res.json(imagenEliminada);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al eliminar imagen médica' });
        }
    }
};

module.exports = imagenesController;
