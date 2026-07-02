const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_super_segura_hospital_r_2026';

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token de autorización.' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7, authHeader.length) : authHeader;

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Token malformado o vacío.' });
    }

    try {
        const decodificado = jwt.verify(token, JWT_SECRET);
        req.usuario = decodificado;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado. Por favor, inicie sesión nuevamente.' });
    }
};

const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario || !req.usuario.rol) {
            return res.status(403).json({ error: 'Acceso denegado. No se identificó el rol del usuario.' });
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ error: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}.` });
        }

        next();
    };
};

const extraerUsuario = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7, authHeader.length) : authHeader;
        if (token) {
            try {
                req.usuario = jwt.verify(token, JWT_SECRET);
            } catch (error) {
                // Ignorar si expiró o es inválido al solo extraer
            }
        }
    }
    next();
};

module.exports = {
    verificarToken,
    verificarRol,
    extraerUsuario,
    JWT_SECRET
};
