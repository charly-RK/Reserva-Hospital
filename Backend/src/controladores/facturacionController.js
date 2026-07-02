const Facturacion = require('../modelos/facturacion');

const facturacionController = {
    obtenerTodas: async (req, res) => {
        try {
            const facturas = await Facturacion.obtenerTodas();
            res.json(facturas);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al obtener facturas' });
        }
    },

    obtenerPorPaciente: async (req, res) => {
        try {
            const { paciente_id } = req.params;
            const facturas = await Facturacion.obtenerPorPaciente(paciente_id);
            res.json(facturas);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al obtener facturas del paciente' });
        }
    },

    crearFactura: async (req, res) => {
        try {
            const nuevaFactura = await Facturacion.crear(req.body);
            res.status(201).json(nuevaFactura);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al generar factura', error: error.message });
        }
    },

    actualizarEstado: async (req, res) => {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            const facturaActualizada = await Facturacion.actualizarEstado(id, estado);
            res.json(facturaActualizada);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al actualizar estado de la factura' });
        }
    }
};

module.exports = facturacionController;
