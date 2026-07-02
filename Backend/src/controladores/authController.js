const Usuario = require('../modelos/usuarios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/authMiddleware');
const { resolverDoctorId } = require('../utils/resolverDoctor');
const pool = require('../config/base_datos');

const authController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const usuario = await Usuario.buscarPorEmail(email);

            if (!usuario) {
                return res.status(401).json({ error: 'Credenciales incorrectas. Verifique su correo o contraseña.' });
            }

            // Verificar si la cuenta está bloqueada
            if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date()) {
                const diffMin = Math.ceil((new Date(usuario.bloqueado_hasta) - new Date()) / 60000);
                return res.status(403).json({ 
                    error: `Cuenta bloqueada temporalmente por seguridad tras varios intentos fallidos. Intente nuevamente en ${diffMin} minuto(s).` 
                });
            }

            // Verificar si la contraseña coincide
            let passwordCoincide = false;
            if (usuario.password && (usuario.password.startsWith('$2a$') || usuario.password.startsWith('$2b$'))) {
                passwordCoincide = await bcrypt.compare(password, usuario.password);
            } else {
                passwordCoincide = (usuario.password === password);
            }

            if (!passwordCoincide) {
                const nuevosIntentos = (usuario.intentos_fallidos || 0) + 1;
                if (nuevosIntentos >= 3) {
                    const bloqueadoHasta = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
                    await Usuario.actualizarIntentosFallidos(usuario.id, nuevosIntentos, bloqueadoHasta);
                    return res.status(403).json({ 
                        error: 'Has superado el límite de 3 intentos incorrectos. Tu cuenta ha sido bloqueada por 30 minutos por seguridad.' 
                    });
                } else {
                    await Usuario.actualizarIntentosFallidos(usuario.id, nuevosIntentos, null);
                    const restantes = 3 - nuevosIntentos;
                    return res.status(401).json({ 
                        error: `Contraseña incorrecta. Te queda(n) ${restantes} intento(s) antes del bloqueo temporal.` 
                    });
                }
            }

            // Si el inicio de sesión es exitoso, resetear intentos si los hubiere
            if ((usuario.intentos_fallidos && usuario.intentos_fallidos > 0) || usuario.bloqueado_hasta) {
                await Usuario.resetearIntentos(usuario.id);
            }

            let docId = usuario.doctor_id;
            if (usuario.rol === 'DOCTOR' && !docId) {
                docId = await resolverDoctorId(usuario);
            }

            // Generar token JWT
            const requiereCambio = password && (password.startsWith('Med-') || password.startsWith('Doctor') || password === 'temporal123');
            const payload = {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                doctor_id: docId,
                paciente_id: usuario.paciente_id,
                requiere_cambio: requiereCambio
            };

            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

            res.json({
                token,
                user: payload,
                ...payload
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error en el servidor al iniciar sesión' });
        }
    },

    register: async (req, res) => {
        try {
            const { nombre, email, password, rol = 'PACIENTE', doctor_id = null, paciente_id = null } = req.body;

            const existingUser = await Usuario.buscarPorEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const nuevoUsuario = await Usuario.crear({ nombre, email, password: hashedPassword, rol, doctor_id, paciente_id });
            res.status(201).json(nuevoUsuario);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al registrar usuario' });
        }
    },

    cambiarClave: async (req, res) => {
        try {
            const { email, nuevaPassword } = req.body;
            if (!email || !nuevaPassword || nuevaPassword.length < 6) {
                return res.status(400).json({ error: 'Debes proporcionar una contraseña de al menos 6 caracteres' });
            }
            const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
            await pool.query('UPDATE usuarios SET password = $1 WHERE email = $2', [hashedPassword, email]);
            res.json({ mensaje: 'Contraseña actualizada correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al cambiar contraseña' });
        }
    }
};

module.exports = authController;
