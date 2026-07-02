const pool = require('../config/base_datos');

async function resolverDoctorId(usuario) {
    if (!usuario) return null;
    if (usuario.doctor_id) return usuario.doctor_id;
    if (usuario.email) {
        const res = await pool.query('SELECT id FROM doctores WHERE LOWER(email) = LOWER($1)', [usuario.email]);
        if (res.rows.length > 0) return res.rows[0].id;
    }
    if (usuario.nombre) {
        const cleanName = usuario.nombre.replace(/^Dr\.?\s*/i, '').trim();
        const res = await pool.query("SELECT id FROM doctores WHERE LOWER(CONCAT(nombre, ' ', apellido)) LIKE LOWER($1) OR LOWER(nombre) LIKE LOWER($1)", [`%${cleanName}%`]);
        if (res.rows.length > 0) return res.rows[0].id;
    }
    return null;
}

module.exports = { resolverDoctorId };
