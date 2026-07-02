const pool = require('../config/base_datos');

const Notificacion = {
    // Obtener todas las notificaciones (Admin)
    obtenerTodas: async () => {
        const query = `
            SELECT n.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido,
                   d.nombre as doctor_nombre, d.apellido as doctor_apellido
            FROM alertas_notificaciones n
            LEFT JOIN pacientes p ON n.paciente_id = p.id
            LEFT JOIN doctores d ON n.doctor_id = d.id
            ORDER BY n.fecha_programada DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    // Obtener notificaciones de un usuario/paciente/doctor
    obtenerPorDestinatario: async (pacienteId, doctorId, usuarioId) => {
        const query = `
            SELECT n.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido,
                   d.nombre as doctor_nombre, d.apellido as doctor_apellido
            FROM alertas_notificaciones n
            LEFT JOIN pacientes p ON n.paciente_id = p.id
            LEFT JOIN doctores d ON n.doctor_id = d.id
            WHERE ($1::int IS NOT NULL AND n.paciente_id = $1)
               OR ($2::int IS NOT NULL AND n.doctor_id = $2)
               OR ($3::int IS NOT NULL AND n.usuario_id = $3)
            ORDER BY n.fecha_programada DESC
        `;
        const result = await pool.query(query, [pacienteId || null, doctorId || null, usuarioId || null]);
        return result.rows;
    },

    // Crear notificación / alerta
    crear: async (datos) => {
        const {
            usuario_id, paciente_id, doctor_id, cita_id,
            titulo, mensaje, tipo = 'info', canal_envio = 'SISTEMA'
        } = datos;

        const query = `
            INSERT INTO alertas_notificaciones (
                usuario_id, paciente_id, doctor_id, cita_id,
                titulo, mensaje, tipo, canal_envio, enviado, leido
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, FALSE)
            RETURNING *
        `;
        const result = await pool.query(query, [
            usuario_id || null, paciente_id || null, doctor_id || null, cita_id || null,
            titulo, mensaje, tipo, canal_envio
        ]);
        return result.rows[0];
    },

    // Marcar como leída
    marcarLeida: async (id) => {
        const query = `
            UPDATE alertas_notificaciones
            SET leido = TRUE, fecha_lectura = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    toggleArchivar: async (id, archivado) => {
        const query = `
            UPDATE alertas_notificaciones
            SET archivado = $2
            WHERE id = $1
            RETURNING *
        `;
        const result = await pool.query(query, [id, archivado]);
        return result.rows[0];
    },

    toggleImportante: async (id, importante) => {
        const query = `
            UPDATE alertas_notificaciones
            SET importante = $2
            WHERE id = $1
            RETURNING *
        `;
        const result = await pool.query(query, [id, importante]);
        return result.rows[0];
    },

    marcarTodasLeidas: async () => {
        const query = `
            UPDATE alertas_notificaciones
            SET leido = TRUE, fecha_lectura = CURRENT_TIMESTAMP
            WHERE leido = FALSE
            RETURNING *
        `;
        const result = await pool.query(query);
        return result.rows;
    }
};

module.exports = Notificacion;
