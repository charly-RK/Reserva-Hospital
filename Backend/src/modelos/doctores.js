const pool = require('../config/base_datos');

const Doctor = {
    // Obtener todos los doctores
    obtenerTodos: async () => {
        const query = `
            SELECT d.*, e.nombre as especialidad_nombre, e.costo_base,
            (
                SELECT COUNT(DISTINCT p.id)
                FROM pacientes p
                WHERE p.doctor_asignado_id = d.id
                   OR p.id IN (SELECT c.paciente_id FROM citas c WHERE c.doctor_id = d.id)
            ) as pacientes_totales
            FROM doctores d
            JOIN especialidades e ON d.especialidad_id = e.id
            ORDER BY d.id ASC
        `;
        const resultado = await pool.query(query);
        return resultado.rows;
    },

    // Obtener doctores por especialidad
    obtenerPorEspecialidad: async (especialidadId) => {
        const query = `
            SELECT d.*, e.nombre as especialidad_nombre, e.costo_base,
            (
                SELECT COUNT(DISTINCT p.id)
                FROM pacientes p
                WHERE p.doctor_asignado_id = d.id
                   OR p.id IN (SELECT c.paciente_id FROM citas c WHERE c.doctor_id = d.id)
            ) as pacientes_totales
            FROM doctores d
            JOIN especialidades e ON d.especialidad_id = e.id
            WHERE d.especialidad_id = $1 AND d.estado = 'Activo'
            ORDER BY d.nombre ASC
        `;
        const resultado = await pool.query(query, [especialidadId]);
        return resultado.rows;
    },

    // Crear un nuevo doctor
    crear: async (datos) => {
        await pool.query("SELECT setval('doctores_id_seq', (SELECT COALESCE(MAX(id), 0) FROM doctores))").catch(()=>{});
        const {
            cedula, nombre, apellido, especialidad_id, telefono, email,
            experiencia_anios = 0, consultorio = '', biografia = '', estado = 'Activo'
        } = datos;

        const query = `
            INSERT INTO doctores (
                cedula, nombre, apellido, especialidad_id, telefono, email,
                experiencia_anios, consultorio, biografia, estado
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        const resultado = await pool.query(query, [
            cedula, nombre, apellido, especialidad_id, telefono, email,
            experiencia_anios, consultorio, biografia, estado
        ]);
        return resultado.rows[0];
    },

    // Actualizar doctor
    actualizar: async (id, datos) => {
        const {
            nombre, apellido, especialidad_id, telefono, email,
            experiencia_anios, consultorio, biografia, estado
        } = datos;

        const query = `
            UPDATE doctores
            SET nombre = COALESCE($2, nombre),
                apellido = COALESCE($3, apellido),
                especialidad_id = COALESCE($4, especialidad_id),
                telefono = COALESCE($5, telefono),
                email = COALESCE($6, email),
                experiencia_anios = COALESCE($7, experiencia_anios),
                consultorio = COALESCE($8, consultorio),
                biografia = COALESCE($9, biografia),
                estado = COALESCE($10, estado)
            WHERE id = $1
            RETURNING *
        `;
        const resultado = await pool.query(query, [
            id, nombre, apellido, especialidad_id, telefono, email,
            experiencia_anios, consultorio, biografia, estado
        ]);
        return resultado.rows[0];
    }
};

module.exports = Doctor;
