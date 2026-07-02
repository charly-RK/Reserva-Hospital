const pool = require('../config/base_datos');

const Historial = {
    // Obtener historial de un paciente (incluyendo recetas asociadas)
    obtenerPorPaciente: async (pacienteId) => {
        const query = `
            SELECT h.*, d.nombre as doctor_nombre, d.apellido as doctor_apellido, e.nombre as especialidad
            FROM historial_medico h
            JOIN doctores d ON h.doctor_id = d.id
            JOIN especialidades e ON d.especialidad_id = e.id
            WHERE h.paciente_id = $1
            ORDER BY h.fecha_atencion DESC
        `;
        const resHistorial = await pool.query(query, [pacienteId]);
        const historiales = resHistorial.rows;

        for (let h of historiales) {
            const resRecetas = await pool.query('SELECT * FROM recetas_medicas WHERE historial_id = $1', [h.id]);
            h.recetas = resRecetas.rows;
        }

        return historiales;
    },

    // Crear nueva evolución médica
    crear: async (datos) => {
        const {
            paciente_id, doctor_id, cita_id, diagnostico, tratamiento, notas_evolucion,
            presion_arterial, frecuencia_cardiaca, frecuencia_respiratoria,
            temperatura, saturacion_oxigeno, peso_kg, altura_cm, imc,
            recetas = []
        } = datos;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const queryHistorial = `
                INSERT INTO historial_medico (
                    paciente_id, doctor_id, cita_id, diagnostico, tratamiento, notas_evolucion,
                    presion_arterial, frecuencia_cardiaca, frecuencia_respiratoria,
                    temperatura, saturacion_oxigeno, peso_kg, altura_cm, imc
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING *
            `;
            const resHistorial = await client.query(queryHistorial, [
                paciente_id, doctor_id || 1, cita_id || null, diagnostico, tratamiento, notas_evolucion || '',
                presion_arterial || null, frecuencia_cardiaca || null, frecuencia_respiratoria || null,
                temperatura || null, saturacion_oxigeno || null, peso_kg || null, altura_cm || null, imc || null
            ]);

            const nuevoHistorial = resHistorial.rows[0];
            nuevoHistorial.recetas = [];

            if (Array.isArray(recetas) && recetas.length > 0) {
                for (let r of recetas) {
                    const queryReceta = `
                        INSERT INTO recetas_medicas (historial_id, medicamento, dosis, frecuencia, duracion_dias, indicaciones)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING *
                    `;
                    const resReceta = await client.query(queryReceta, [
                        nuevoHistorial.id, r.medicamento, r.dosis, r.frecuencia, r.duracion_dias || 7, r.indicaciones || ''
                    ]);
                    nuevoHistorial.recetas.push(resReceta.rows[0]);
                }
            }

            // Si vino de una cita, marcarla como completada
            if (cita_id) {
                await client.query("UPDATE citas SET estado = 'Completada' WHERE id = $1", [cita_id]);
            }

            await client.query('COMMIT');
            return nuevoHistorial;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Actualizar evolución médica
    actualizar: async (id, datos) => {
        const { diagnostico, tratamiento, notas_evolucion } = datos;
        const query = `
            UPDATE historial_medico
            SET diagnostico = COALESCE($2, diagnostico),
                tratamiento = COALESCE($3, tratamiento),
                notas_evolucion = COALESCE($4, notas_evolucion)
            WHERE id = $1
            RETURNING *
        `;
        const resultado = await pool.query(query, [id, diagnostico, tratamiento, notas_evolucion]);
        return resultado.rows[0];
    },

    // Eliminar evolución médica
    eliminar: async (id) => {
        const query = 'DELETE FROM historial_medico WHERE id = $1 RETURNING id';
        const resultado = await pool.query(query, [id]);
        return resultado.rows[0];
    }
};

module.exports = Historial;
