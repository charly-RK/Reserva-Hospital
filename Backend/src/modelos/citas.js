const pool = require('../config/base_datos');

const Cita = {
    // Crear una nueva cita
    crear: async (datos) => {
        await pool.query("SELECT setval('citas_id_seq', (SELECT COALESCE(MAX(id), 0) FROM citas))").catch(()=>{});
        const {
            paciente_id,
            doctor_id,
            fecha_cita,
            hora_cita,
            duracion_minutos = 30,
            tipo_consulta = 'Consulta General',
            motivo_consulta = null,
            codigo_cita
        } = datos;

        // Generar código único si no se proporciona
        const codigo = codigo_cita || `CIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const query = `
            INSERT INTO citas (
                codigo_cita, paciente_id, doctor_id, fecha_cita, hora_cita,
                duracion_minutos, tipo_consulta, motivo_consulta, estado
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pendiente')
            RETURNING *
        `;
        const resultado = await pool.query(query, [
            codigo, paciente_id, doctor_id, fecha_cita, hora_cita,
            duracion_minutos, tipo_consulta, motivo_consulta
        ]);
        return resultado.rows[0];
    },

    // Obtener todas las citas (para panel admin)
    obtenerTodas: async () => {
        const query = `
            SELECT c.*,
                   p.nombre as paciente_nombre, p.apellido as paciente_apellido, p.cedula as paciente_cedula, p.celular as paciente_telefono, p.email as paciente_email,
                   d.nombre as doctor_nombre, d.apellido as doctor_apellido, e.nombre as especialidad
            FROM citas c
            JOIN pacientes p ON c.paciente_id = p.id
            JOIN doctores d ON c.doctor_id = d.id
            JOIN especialidades e ON d.especialidad_id = e.id
            ORDER BY c.fecha_cita DESC, c.hora_cita DESC
        `;
        const resultado = await pool.query(query);
        return resultado.rows;
    },

    // Obtener citas por paciente
    obtenerPorPaciente: async (pacienteId) => {
        const query = `
            SELECT c.*,
                   d.nombre as doctor_nombre, d.apellido as doctor_apellido, e.nombre as especialidad,
                   p.nombre as paciente_nombre, p.apellido as paciente_apellido, p.cedula as paciente_cedula, p.email as paciente_email, p.celular as paciente_telefono
            FROM citas c
            JOIN doctores d ON c.doctor_id = d.id
            JOIN especialidades e ON d.especialidad_id = e.id
            JOIN pacientes p ON c.paciente_id = p.id
            WHERE c.paciente_id = $1
            ORDER BY c.fecha_cita DESC, c.hora_cita DESC
        `;
        const resultado = await pool.query(query, [pacienteId]);
        return resultado.rows;
    },

    // Obtener cita individual por ID con datos completos
    obtenerPorId: async (id) => {
        const query = `
            SELECT c.*,
                   d.nombre as doctor_nombre, d.apellido as doctor_apellido, e.nombre as especialidad,
                   p.nombre as paciente_nombre, p.apellido as paciente_apellido, p.cedula as paciente_cedula, p.email as paciente_email, p.celular as paciente_telefono
            FROM citas c
            JOIN doctores d ON c.doctor_id = d.id
            JOIN especialidades e ON d.especialidad_id = e.id
            JOIN pacientes p ON c.paciente_id = p.id
            WHERE c.id = $1
        `;
        const resultado = await pool.query(query, [id]);
        return resultado.rows[0];
    },

    // Obtener citas por doctor
    obtenerPorDoctor: async (doctorId) => {
        const query = `
            SELECT c.*,
                   p.nombre as paciente_nombre, p.apellido as paciente_apellido, p.cedula as paciente_cedula, p.celular as paciente_telefono, p.email as paciente_email,
                   d.nombre as doctor_nombre, d.apellido as doctor_apellido, e.nombre as especialidad
            FROM citas c
            JOIN pacientes p ON c.paciente_id = p.id
            JOIN doctores d ON c.doctor_id = d.id
            JOIN especialidades e ON d.especialidad_id = e.id
            WHERE c.doctor_id = $1
            ORDER BY c.fecha_cita DESC, c.hora_cita DESC
        `;
        const resultado = await pool.query(query, [doctorId]);
        return resultado.rows;
    },

    // Obtener citas por doctor y fecha (para verificar disponibilidad)
    obtenerPorDoctorYFecha: async (doctorId, fecha) => {
        const query = `
            SELECT hora_cita
            FROM citas
            WHERE doctor_id = $1 AND fecha_cita = $2 AND estado != 'Cancelada'
        `;
        const resultado = await pool.query(query, [doctorId, fecha]);
        return resultado.rows;
    },

    // Actualizar estado general de cita
    actualizarEstado: async (id, estado) => {
        const query = `
            UPDATE citas
            SET estado = $2
            WHERE id = $1
            RETURNING *
        `;
        const resultado = await pool.query(query, [id, estado]);
        return resultado.rows[0];
    },

    // Cancelar cita
    cancelar: async (id, motivo) => {
        const query = `
            UPDATE citas
            SET estado = 'Cancelada', motivo_cancelacion = $2
            WHERE id = $1
            RETURNING *
        `;
        const resultado = await pool.query(query, [id, motivo]);
        return resultado.rows[0];
    },

    // Reagendar cita
    reagendar: async (id, nuevaFecha, nuevaHora) => {
        const query = `
            UPDATE citas
            SET fecha_cita = $2, hora_cita = $3, estado = 'Reagendada'
            WHERE id = $1
            RETURNING *
        `;
        const resultado = await pool.query(query, [id, nuevaFecha, nuevaHora]);
        return resultado.rows[0];
    },

    // Actualizar datos generales de la cita
    actualizarDatos: async (id, datos) => {
        const {
            paciente_id, doctor_id, fecha_cita, hora_cita,
            tipo_consulta, motivo_consulta, estado
        } = datos;

        const query = `
            UPDATE citas
            SET paciente_id = COALESCE($2, paciente_id),
                doctor_id = COALESCE($3, doctor_id),
                fecha_cita = COALESCE($4, fecha_cita),
                hora_cita = COALESCE($5, hora_cita),
                tipo_consulta = COALESCE($6, tipo_consulta),
                motivo_consulta = COALESCE($7, motivo_consulta),
                estado = COALESCE($8, estado)
            WHERE id = $1
            RETURNING *
        `;
        const resultado = await pool.query(query, [
            id, paciente_id || null, doctor_id || null, fecha_cita || null,
            hora_cita || null, tipo_consulta || null, motivo_consulta || null, estado || null
        ]);
        return resultado.rows[0];
    }
};

module.exports = Cita;
