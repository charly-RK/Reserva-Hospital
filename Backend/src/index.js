const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de seguridad y auditoría
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[AUDIT LOG] ${timestamp} | Método: ${req.method} | Ruta: ${req.originalUrl} | IP: ${req.ip}`);
    next();
});

// Rutas existentes
const especialidadesRoutes = require('./rutas/especialidadesRoutes');
const doctoresRoutes = require('./rutas/doctoresRoutes');
const pacientesRoutes = require('./rutas/pacientesRoutes');
const citasRoutes = require('./rutas/citasRoutes');
const disponibilidadRoutes = require('./rutas/disponibilidadRoutes');
const authRoutes = require('./rutas/authRoutes');
const usuariosRoutes = require('./rutas/usuariosRoutes');

// Nuevas rutas de los módulos hospitalarios completos
const historialRoutes = require('./rutas/historialRoutes');
const imagenesRoutes = require('./rutas/imagenesRoutes');
const facturacionRoutes = require('./rutas/facturacionRoutes');
const notificacionesRoutes = require('./rutas/notificacionesRoutes');

app.use('/api/especialidades', especialidadesRoutes);
app.use('/api/doctores', doctoresRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/disponibilidad', disponibilidadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Uso de nuevos módulos
app.use('/api/historial', historialRoutes);
app.use('/api/imagenes', imagenesRoutes);
app.use('/api/facturacion', facturacionRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

app.get('/', (req, res) => {
    res.send('API Hospital R 100% Validada y Conectada a PostgreSQL funcionando correctamente');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
