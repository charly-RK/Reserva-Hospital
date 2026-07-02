const pool = require('../config/base_datos');

const Disponibilidad = {
    // Obtener disponibilidad de un doctor
    obtenerPorDoctor: async (doctorId) => {
        const query = `
            SELECT * FROM disponibilidad_medica
            WHERE doctor_id = $1
            ORDER BY dia_semana, hora_inicio
        `;
        const resultado = await pool.query(query, [doctorId]);
        return resultado.rows;
    },

    // Agregar disponibilidad
    crear: async (datos) => {
        const { doctor_id, dia_semana, hora_inicio, hora_fin, duracion_cita_minutos = 30 } = datos;
        const query = `
            INSERT INTO disponibilidad_medica (doctor_id, dia_semana, hora_inicio, hora_fin, duracion_cita_minutos)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const resultado = await pool.query(query, [doctor_id, dia_semana, hora_inicio, hora_fin, duracion_cita_minutos]);
        return resultado.rows[0];
    },

    // Guardar horario completo de un doctor (reemplaza anterior)
    guardarPorDoctor: async (doctorId, horarios, duracionMinutos = 30) => {
        await pool.query('DELETE FROM disponibilidad_medica WHERE doctor_id = $1', [doctorId]);
        
        const resultados = [];
        for (const h of horarios) {
            if (h.activo !== false) {
                const query = `
                    INSERT INTO disponibilidad_medica (doctor_id, dia_semana, hora_inicio, hora_fin, duracion_cita_minutos)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *
                `;
                const r = await pool.query(query, [doctorId, h.dia_semana, h.hora_inicio, h.hora_fin, duracionMinutos]);
                resultados.push(r.rows[0]);
            }
        }
        return resultados;
    }
};

module.exports = Disponibilidad;
