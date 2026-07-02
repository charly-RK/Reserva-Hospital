const pool = require('../config/base_datos');

const Facturacion = {
    // Obtener todas las facturas (Panel Admin)
    obtenerTodas: async () => {
        const query = `
            SELECT f.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido, p.email as paciente_email, p.celular as paciente_telefono,
                   d.nombre as doctor_nombre, d.apellido as doctor_apellido
            FROM facturacion f
            JOIN pacientes p ON f.paciente_id = p.id
            LEFT JOIN doctores d ON f.doctor_id = d.id
            ORDER BY f.fecha_emision DESC, f.id DESC
        `;
        const resultado = await pool.query(query);
        const facturas = resultado.rows;

        for (let f of facturas) {
            const resDetalles = await pool.query('SELECT * FROM detalles_factura WHERE factura_id = $1', [f.id]);
            f.detalles = resDetalles.rows;
        }

        return facturas;
    },

    // Obtener facturas por paciente
    obtenerPorPaciente: async (pacienteId) => {
        const query = `
            SELECT f.*, d.nombre as doctor_nombre, d.apellido as doctor_apellido
            FROM facturacion f
            LEFT JOIN doctores d ON f.doctor_id = d.id
            WHERE f.paciente_id = $1
            ORDER BY f.fecha_emision DESC
        `;
        const resFacturas = await pool.query(query, [pacienteId]);
        const facturas = resFacturas.rows;

        for (let f of facturas) {
            const resDetalles = await pool.query('SELECT * FROM detalles_factura WHERE factura_id = $1', [f.id]);
            f.detalles = resDetalles.rows;
        }

        return facturas;
    },

    // Crear nueva factura con detalles (Transacción)
    crear: async (datos) => {
        const {
            numero_factura, paciente_id, doctor_id, cita_id,
            subtotal = 0, impuesto = 0, descuento = 0, total = 0,
            cobertura_seguro = 0, monto_a_pagar = 0, metodo_pago = 'Efectivo',
            estado = 'Pendiente', fecha_emision, notas, detalles = []
        } = datos;

        const numFactura = numero_factura || `FAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const queryFactura = `
                INSERT INTO facturacion (
                    numero_factura, paciente_id, doctor_id, cita_id,
                    subtotal, impuesto, descuento, total, cobertura_seguro,
                    monto_a_pagar, metodo_pago, estado, fecha_emision, notas
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING *
            `;
            const resFactura = await client.query(queryFactura, [
                numFactura, paciente_id, doctor_id || null, cita_id || null,
                subtotal, impuesto, descuento, total, cobertura_seguro,
                monto_a_pagar, metodo_pago, estado, fecha_emision || new Date(), notas || ''
            ]);

            const nuevaFactura = resFactura.rows[0];
            nuevaFactura.detalles = [];

            if (Array.isArray(detalles) && detalles.length > 0) {
                for (let det of detalles) {
                    const queryDet = `
                        INSERT INTO detalles_factura (factura_id, concepto, cantidad, precio_unitario, subtotal)
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING *
                    `;
                    const resDet = await client.query(queryDet, [
                        nuevaFactura.id, det.concepto, det.cantidad || 1, det.precio_unitario || 0, det.subtotal || 0
                    ]);
                    nuevaFactura.detalles.push(resDet.rows[0]);
                }
            }

            // Si se cobró una deuda anterior o es pendiente, actualizar deuda en paciente
            if (estado === 'Pendiente') {
                await client.query('UPDATE pacientes SET deuda_actual = deuda_actual + $1 WHERE id = $2', [monto_a_pagar, paciente_id]);
            }

            await client.query('COMMIT');
            return nuevaFactura;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Actualizar estado de factura (ej: Pagar)
    actualizarEstado: async (id, estado) => {
        const query = `
            UPDATE facturacion
            SET estado = $2, fecha_pago = CASE WHEN $2 = 'Pagado' THEN CURRENT_TIMESTAMP ELSE fecha_pago END
            WHERE id = $1
            RETURNING *
        `;
        const resultado = await pool.query(query, [id, estado]);
        return resultado.rows[0];
    }
};

module.exports = Facturacion;
