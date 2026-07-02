const pool = require('../config/base_datos');

const ImagenMedica = {
    // Obtener imágenes de un paciente
    obtenerPorPaciente: async (pacienteId) => {
        const query = `
            SELECT i.*, d.nombre as doctor_nombre, d.apellido as doctor_apellido
            FROM biblioteca_imagenes i
            LEFT JOIN doctores d ON i.doctor_solicitante_id = d.id
            WHERE i.paciente_id = $1
            ORDER BY i.fecha_estudio DESC
        `;
        const resultado = await pool.query(query, [pacienteId]);
        return resultado.rows;
    },

    // Subir / registrar nueva imagen médica
    crear: async (datos) => {
        const {
            paciente_id, historial_id, doctor_solicitante_id, nombre_estudio,
            tipo_imagen, url_archivo, tamano_mb, formato,
            descripcion, informe_radiologico, fecha_estudio
        } = datos;

        const query = `
            INSERT INTO biblioteca_imagenes (
                paciente_id, historial_id, doctor_solicitante_id, nombre_estudio,
                tipo_imagen, url_archivo, tamano_mb, formato, descripcion,
                informe_radiologico, fecha_estudio
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;
        const resultado = await pool.query(query, [
            paciente_id,
            historial_id || null,
            doctor_solicitante_id || null,
            nombre_estudio || datos.titulo || 'Estudio clínico radiológico',
            tipo_imagen || datos.tipo_estudio || 'Radiografía',
            url_archivo || datos.url || "",
            tamano_mb || 2.1,
            formato || 'JPG',
            descripcion || '',
            informe_radiologico || '',
            fecha_estudio || new Date()
        ]);
        return resultado.rows[0];
    },

    // Actualizar imagen médica
    actualizar: async (id, datos) => {
        const { titulo, nombre_estudio, tipo_estudio, tipo_imagen, descripcion } = datos;
        const query = `
            UPDATE biblioteca_imagenes
            SET nombre_estudio = COALESCE($2, nombre_estudio),
                tipo_imagen = COALESCE($3, tipo_imagen),
                descripcion = COALESCE($4, descripcion)
            WHERE id = $1
            RETURNING *
        `;
        const resultado = await pool.query(query, [id, nombre_estudio || titulo, tipo_imagen || tipo_estudio, descripcion]);
        return resultado.rows[0];
    },

    // Eliminar imagen
    eliminar: async (id) => {
        const query = 'DELETE FROM biblioteca_imagenes WHERE id = $1 RETURNING *';
        const resultado = await pool.query(query, [id]);
        return resultado.rows[0];
    }
};

module.exports = ImagenMedica;
