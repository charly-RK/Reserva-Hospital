const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la conexión a la base de datos
const pool = new Pool(
    process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL }
        : {
              user: process.env.DB_USER || 'admin',
              host: process.env.DB_HOST || 'localhost',
              database: process.env.DB_NAME || 'hospital',
              password: process.env.DB_PASSWORD || '123',
              port: process.env.DB_PORT || 5432,
          }
);

// Verificar conexión
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error adquiriendo cliente', err.stack);
    }
    console.log('Conexión exitosa a la base de datos PostgreSQL');
    release();
});

module.exports = pool;
