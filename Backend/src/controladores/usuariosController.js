const Usuario = require('../modelos/usuarios');
const bcrypt = require('bcryptjs');

const usuariosController = {
    obtenerTodos: async (req, res) => {
        try {
            const usuarios = await Usuario.obtenerTodos();
            res.json(usuarios);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener usuarios' });
        }
    },

    obtenerPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const usuario = await Usuario.buscarPorId(id);
            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            res.json(usuario);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener usuario por ID' });
        }
    },

    crear: async (req, res) => {
        try {
            const { nombre, email, password, rol = 'DOCTOR', doctor_id = null } = req.body;
            
            const existingUser = await Usuario.buscarPorEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'El correo electrónico ya está en uso' });
            }

            const hashedPassword = await bcrypt.hash(password || '123456', 10);
            const nuevoUsuario = await Usuario.crear({ nombre, email, password: hashedPassword, rol, doctor_id });
            res.status(201).json(nuevoUsuario);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear usuario' });
        }
    },

    actualizar: async (req, res) => {
        try {
            const { id } = req.params;
            const usuarioActualizado = await Usuario.actualizar(id, req.body);
            if (!usuarioActualizado) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            res.json(usuarioActualizado);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar usuario' });
        }
    },

    eliminar: async (req, res) => {
        try {
            const { id } = req.params;
            const usuarioEliminado = await Usuario.eliminar(id);
            if (!usuarioEliminado) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            res.json({ mensaje: 'Usuario eliminado exitosamente', id });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al eliminar usuario' });
        }
    }
};

module.exports = usuariosController;
