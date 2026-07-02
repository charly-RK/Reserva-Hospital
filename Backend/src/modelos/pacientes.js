const pool = require('../config/base_datos');

const Paciente = {
    // Obtener todos los pacientes (con doctor asignado si existe, filtros y paginación opcional)
    obtenerTodos: async (filtros = {}) => {
        const { estado, busqueda } = filtros;
        let query = `
            SELECT p.*, d.nombre as doctor_nombre, d.apellido as doctor_apellido
            FROM pacientes p
            LEFT JOIN doctores d ON p.doctor_asignado_id = d.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (estado) {
            query += ` AND p.estado = $${paramIndex++}`;
            params.push(estado);
        }

        if (busqueda) {
            query += ` AND (p.nombre ILIKE $${paramIndex} OR p.apellido ILIKE $${paramIndex} OR p.cedula ILIKE $${paramIndex} OR p.email ILIKE $${paramIndex})`;
            params.push(`%${busqueda}%`);
            paramIndex++;
        }

        query += ` ORDER BY p.id DESC`;
        const resultado = await pool.query(query, params);
        return resultado.rows;
    },

    // Buscar paciente por ID con detalles (alergias, condiciones, medicamentos)
    obtenerPorId: async (id) => {
        const queryPaciente = `
            SELECT p.*, d.nombre as doctor_nombre, d.apellido as doctor_apellido
            FROM pacientes p
            LEFT JOIN doctores d ON p.doctor_asignado_id = d.id
            WHERE p.id = $1
        `;
        const resPaciente = await pool.query(queryPaciente, [id]);
        if (resPaciente.rows.length === 0) return null;

        const paciente = resPaciente.rows[0];

        const resAlergias = await pool.query('SELECT * FROM pacientes_alergias WHERE paciente_id = $1', [id]);
        const resCondiciones = await pool.query('SELECT * FROM pacientes_condiciones WHERE paciente_id = $1', [id]);
        const resMedicamentos = await pool.query('SELECT * FROM pacientes_medicamentos WHERE paciente_id = $1', [id]);

        paciente.alergias = resAlergias.rows;
        paciente.condiciones = resCondiciones.rows;
        paciente.medicamentos = resMedicamentos.rows;

        return paciente;
    },

    // Buscar paciente por cédula
    buscarPorCedula: async (cedula) => {
        const resultado = await pool.query('SELECT * FROM pacientes WHERE cedula = $1', [cedula]);
        return resultado.rows[0];
    },

    // Crear un nuevo paciente
    crear: async (datos) => {
        await pool.query("SELECT setval('pacientes_id_seq', (SELECT COALESCE(MAX(id), 0) FROM pacientes))").catch(()=>{});
        const {
            cedula, nombre, apellido, fecha_nacimiento, genero = 'No especificado',
            celular, email, direccion, tipo_sangre, seguro_medico,
            numero_poliza, doctor_asignado_id, prioridad = 'Media'
        } = datos;

        const query = `
            INSERT INTO pacientes (
                cedula, nombre, apellido, fecha_nacimiento, genero, celular,
                email, direccion, tipo_sangre, seguro_medico, numero_poliza,
                doctor_asignado_id, prioridad
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;
        const resultado = await pool.query(query, [
            cedula, nombre, apellido, fecha_nacimiento, genero, celular,
            email, direccion, tipo_sangre, seguro_medico, numero_poliza,
            doctor_asignado_id || null, prioridad
        ]);
        return resultado.rows[0];
    },

    // Actualizar paciente
    actualizar: async (id, datos) => {
        const {
            nombre, apellido, fecha_nacimiento, genero, celular, email,
            direccion, tipo_sangre, seguro_medico, prioridad, estado
        } = datos;

        const query = `
            UPDATE pacientes
            SET nombre = COALESCE($2, nombre),
                apellido = COALESCE($3, apellido),
                fecha_nacimiento = COALESCE($4, fecha_nacimiento),
                genero = COALESCE($5, genero),
                celular = COALESCE($6, celular),
                email = COALESCE($7, email),
                direccion = COALESCE($8, direccion),
                tipo_sangre = COALESCE($9, tipo_sangre),
                seguro_medico = COALESCE($10, seguro_medico),
                prioridad = COALESCE($11, prioridad),
                estado = COALESCE($12, estado)
            WHERE id = $1
            RETURNING *
        `;
        const resultado = await pool.query(query, [
            id, nombre, apellido, fecha_nacimiento, genero, celular, email,
            direccion, tipo_sangre, seguro_medico, prioridad, estado
        ]);
        return resultado.rows[0];
    },

    // Eliminación lógica (cambia estado a Inactivo)
    eliminarLogico: async (id) => {
        const query = `
            UPDATE pacientes
            SET estado = 'Inactivo'
            WHERE id = $1
            RETURNING *
        `;
        const resultado = await pool.query(query, [id]);
        return resultado.rows[0];
    }
};

module.exports = Paciente;
