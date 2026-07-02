const Notificacion = require('../modelos/notificaciones');
const { resolverDoctorId } = require('../utils/resolverDoctor');

// Helper interno para despacho multicanal (Sistema, Email, WhatsApp)
const despacharAlertaMulticanal = async (alerta) => {
    const { canal_envio, titulo, mensaje } = alerta;
    
    switch (canal_envio?.toUpperCase()) {
        case 'EMAIL':
            console.log(`[EMAIL DISPATCH] Enviando correo electrónico: "${titulo}" -> ${mensaje}`);
            // Aquí se integraría Nodemailer o SendGrid
            break;

        case 'WHATSAPP':
            console.log(`[WHATSAPP DISPATCH] Preparando envío por WhatsApp: "${titulo}" -> ${mensaje}`);
            /* =========================================================================
             * MÓDULO PREPARADO PARA API OFICIAL DE WHATSAPP / TWILIO / META CLOUD API
             * Descomentar y configurar variables de entorno (WHATSAPP_TOKEN, PHONE_ID)
             * =========================================================================
             * try {
             *     const axios = require('axios');
             *     await axios.post(
             *         `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
             *         {
             *             messaging_product: 'whatsapp',
             *             to: alerta.telefono_destinatario || '+593900000000',
             *             type: 'text',
             *             text: { body: `*${titulo}*\n\n${mensaje}` }
             *         },
             *         { headers: { Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}` } }
             *     );
             *     console.log('[WHATSAPP DISPATCH] Mensaje entregado con éxito vía API externa.');
             * } catch (apiError) {
             *     console.error('[WHATSAPP DISPATCH ERROR] Falla al conectar con API externa:', apiError.message);
             * }
             * ========================================================================= */
            break;

        case 'SISTEMA':
        default:
            console.log(`[SISTEMA DISPATCH] Notificación interna registrada exitosamente: "${titulo}"`);
            break;
    }
};

const notificacionesController = {
    obtenerTodas: async (req, res) => {
        try {
            if (req.usuario && req.usuario.rol === 'DOCTOR') {
                const docId = await resolverDoctorId(req.usuario);
                const notificaciones = await Notificacion.obtenerPorDestinatario(null, docId, req.usuario.id);
                return res.json(notificaciones);
            }
            if (req.usuario && req.usuario.rol === 'PACIENTE') {
                const notificaciones = await Notificacion.obtenerPorDestinatario(req.usuario.paciente_id, null, req.usuario.id);
                return res.json(notificaciones);
            }
            const notificaciones = await Notificacion.obtenerTodas();
            res.json(notificaciones);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al obtener alertas y notificaciones' });
        }
    },

    obtenerMisNotificaciones: async (req, res) => {
        try {
            const { paciente_id, doctor_id, usuario_id } = req.query;
            const notificaciones = await Notificacion.obtenerPorDestinatario(paciente_id, doctor_id, usuario_id);
            res.json(notificaciones);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al obtener mis notificaciones' });
        }
    },

    crearAlerta: async (req, res) => {
        try {
            const nuevaAlerta = await Notificacion.crear(req.body);
            despacharAlertaMulticanal(nuevaAlerta).catch(e => console.error("Error en despacho multicanal:", e));
            res.status(201).json(nuevaAlerta);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al generar alerta', error: error.message });
        }
    },

    marcarLeida: async (req, res) => {
        try {
            const { id } = req.params;
            const alerta = await Notificacion.marcarLeida(id);
            res.json(alerta);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al marcar notificación como leída' });
        }
    },

    marcarTodasLeidas: async (req, res) => {
        try {
            const alertas = await Notificacion.marcarTodasLeidas();
            res.json(alertas);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al marcar todas las notificaciones como leídas' });
        }
    },

    archivar: async (req, res) => {
        try {
            const { id } = req.params;
            const { archivado } = req.body;
            const alerta = await Notificacion.toggleArchivar(id, archivado !== undefined ? archivado : true);
            res.json(alerta);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al archivar notificación' });
        }
    },

    importante: async (req, res) => {
        try {
            const { id } = req.params;
            const { importante } = req.body;
            const alerta = await Notificacion.toggleImportante(id, importante !== undefined ? importante : true);
            res.json(alerta);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al marcar importancia de notificación' });
        }
    }
};

module.exports = notificacionesController;
