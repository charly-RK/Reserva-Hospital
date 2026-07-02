const Doctor = require('../modelos/doctores');
const pool = require('../config/base_datos');
const bcrypt = require('bcryptjs');
const notificacionesService = require('../servicios/notificacionesService');

const formatearNombrePropio = (str) => {
    if (!str || typeof str !== 'string') return str;
    return str.trim().toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const doctoresController = {
    // Obtener todos los doctores
    obtenerDoctores: async (req, res) => {
        try {
            const { especialidad_id } = req.query;
            let doctores;
            if (especialidad_id) {
                doctores = await Doctor.obtenerPorEspecialidad(especialidad_id);
            } else {
                doctores = await Doctor.obtenerTodos();
            }
            // Asegurar formato en respuesta si alguno quedó en minúsculas en BD
            const formatDoctores = (doctores || []).map(d => ({
                ...d,
                nombre: d.nombre ? d.nombre.replace(/^Dr\.\s*/i, "") : "",
                nombreCompleto: `Dr. ${formatearNombrePropio(d.nombre ? d.nombre.replace(/^Dr\.\s*/i, "") : "")} ${formatearNombrePropio(d.apellido || "")}`.trim()
            }));
            res.json(formatDoctores);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al obtener doctores' });
        }
    },

    // Crear un nuevo doctor
    crearDoctor: async (req, res) => {
        try {
            if (req.body.nombre) req.body.nombre = formatearNombrePropio(req.body.nombre);
            if (req.body.apellido) req.body.apellido = formatearNombrePropio(req.body.apellido);

            await pool.query("SELECT setval('doctores_id_seq', (SELECT COALESCE(MAX(id), 0) FROM doctores))").catch(()=>{});
            const nuevoDoctor = await Doctor.crear(req.body);
            
            // Crear automáticamente cuenta de usuario asociada
            if (nuevoDoctor && nuevoDoctor.email) {
                const checkUser = await pool.query('SELECT id FROM usuarios WHERE email = $1', [nuevoDoctor.email]);
                if (checkUser.rows.length === 0) {
                    await pool.query("SELECT setval('usuarios_id_seq', (SELECT COALESCE(MAX(id), 0) FROM usuarios))").catch(()=>{});
                    const passTexto = req.body.password || 'Doctor123*';
                    const pass = await bcrypt.hash(passTexto, 10);
                    await pool.query(
                        'INSERT INTO usuarios (nombre, email, password, rol, doctor_id) VALUES ($1, $2, $3, $4, $5)',
                        [`Dr. ${nuevoDoctor.nombre} ${nuevoDoctor.apellido}`, nuevoDoctor.email, pass, 'DOCTOR', nuevoDoctor.id]
                    );

                    // Notificar por correo / whatsapp
                    notificacionesService.enviarCredencialesDoctor({
                        email: nuevoDoctor.email,
                        nombre: `${nuevoDoctor.nombre} ${nuevoDoctor.apellido}`,
                        password: passTexto,
                        telefono: nuevoDoctor.telefono
                    }).catch(err => console.error("Error envío bienvenida:", err));
                }
            }
            res.status(201).json(nuevoDoctor);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al crear doctor', error: error.message });
        }
    },

    // Actualizar doctor
    actualizarDoctor: async (req, res) => {
        try {
            if (req.body.nombre) req.body.nombre = formatearNombrePropio(req.body.nombre);
            if (req.body.apellido) req.body.apellido = formatearNombrePropio(req.body.apellido);

            const { id } = req.params;
            const doctorActualizado = await Doctor.actualizar(id, req.body);
            
            // Si el doctor existe en usuarios, sincronizar su nombre
            if (doctorActualizado) {
                await pool.query(
                    'UPDATE usuarios SET nombre = $1, email = $2 WHERE doctor_id = $3',
                    [`Dr. ${doctorActualizado.nombre} ${doctorActualizado.apellido}`, doctorActualizado.email, id]
                ).catch(()=>{});
            }

            res.json(doctorActualizado);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al actualizar doctor' });
        }
    }
};

module.exports = doctoresController;
