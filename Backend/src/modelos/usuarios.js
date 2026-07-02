const pool = require('../config/base_datos');

const Usuario = {
    obtenerTodos: async () => {
        const query = `
            SELECT u.id, u.nombre, u.email, u.rol, u.doctor_id, u.fecha_creacion, d.nombre as doctor_nombre, d.apellido as doctor_apellido
            FROM usuarios u
            LEFT JOIN doctores d ON u.doctor_id = d.id
            ORDER BY u.id DESC
        `;
        const resultado = await pool.query(query);
        return resultado.rows;
    },

    crear: async (datos) => {
        await pool.query("SELECT setval('usuarios_id_seq', (SELECT COALESCE(MAX(id), 0) FROM usuarios))").catch(()=>{});
        const { nombre, email, password, rol, doctor_id } = datos;
        const query = `
            INSERT INTO usuarios (nombre, email, password, rol, doctor_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, nombre, email, rol, doctor_id
        `;
        const resultado = await pool.query(query, [nombre, email, password, rol, doctor_id]);
        return resultado.rows[0];
    },

    buscarPorEmail: async (email) => {
        const query = 'SELECT * FROM usuarios WHERE email = $1';
        const resultado = await pool.query(query, [email]);
        return resultado.rows[0];
    },

    buscarPorId: async (id) => {
        const query = 'SELECT id, nombre, email, rol, doctor_id FROM usuarios WHERE id = $1';
        const resultado = await pool.query(query, [id]);
        return resultado.rows[0];
    },

    actualizar: async (id, datos) => {
        const { nombre, email, rol, doctor_id } = datos;
        const query = `
            UPDATE usuarios
            SET nombre = COALESCE($2, nombre),
                email = COALESCE($3, email),
                rol = COALESCE($4, rol),
                doctor_id = COALESCE($5, doctor_id)
            WHERE id = $1
            RETURNING id, nombre, email, rol, doctor_id
        `;
        const resultado = await pool.query(query, [id, nombre, email, rol, doctor_id]);
        return resultado.rows[0];
    },

    eliminar: async (id) => {
        const query = 'DELETE FROM usuarios WHERE id = $1 RETURNING id';
        const resultado = await pool.query(query, [id]);
        return resultado.rows[0];
    },

    actualizarIntentosFallidos: async (id, intentos, bloqueadoHasta = null) => {
        const query = `
            UPDATE usuarios 
            SET intentos_fallidos = $2, bloqueado_hasta = $3 
            WHERE id = $1
        `;
        await pool.query(query, [id, intentos, bloqueadoHasta]);
    },

    resetearIntentos: async (id) => {
        const query = `
            UPDATE usuarios 
            SET intentos_fallidos = 0, bloqueado_hasta = NULL 
            WHERE id = $1
        `;
        await pool.query(query, [id]);
    }
};

module.exports = Usuario;
