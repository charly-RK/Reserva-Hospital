const pool = require('../config/base_datos');

const Especialidad = {
    // Obtener todas las especialidades
    obtenerTodas: async () => {
        const resultado = await pool.query('SELECT * FROM especialidades');
        return resultado.rows;
    },

    // Crear una nueva especialidad
    crear: async (nombre, descripcion) => {
        const resultado = await pool.query(
            'INSERT INTO especialidades (nombre, descripcion) VALUES ($1, $2) RETURNING *',
            [nombre, descripcion]
        );
        return resultado.rows[0];
    }
};

module.exports = Especialidad;
