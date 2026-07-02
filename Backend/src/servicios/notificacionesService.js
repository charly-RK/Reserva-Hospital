const nodemailer = require('nodemailer');

// Configuración de transportador Nodemailer listo para usar con variables de entorno o cuenta de Gmail
const crearTransportador = () => {
    // Si las variables de entorno están configuradas (por ejemplo SMTP_USER o EMAIL_USER y EMAIL_PASS)
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = process.env.SMTP_PORT || 465;
    const user = process.env.EMAIL_USER || process.env.SMTP_USER;
    const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

    if (user && pass) {
        return nodemailer.createTransport({
            host,
            port: Number(port),
            secure: Number(port) === 465, // true para 465, false para otros puertos
            auth: { user, pass }
        });
    }
    return null;
};

const notificacionesService = {
    // Envío de confirmación de cita al agendar o confirmar
    enviarConfirmacionCita: async (datosCita) => {
        const {
            email,
            telefono,
            pacienteNombre = 'Estimado Paciente',
            doctorNombre = 'Especialista asignado',
            especialidad = 'Medicina General',
            fecha,
            hora,
            codigoCita
        } = datosCita;

        const asunto = `✔ Confirmación de Cita Médica [${codigoCita || 'MediCenter'}]`;
        const mensajeTexto = `Hola ${pacienteNombre}, su cita médica en MediCenter ha sido programada para el ${fecha} a las ${hora} con el Dr/a. ${doctorNombre} (${especialidad}). Código de cita: ${codigoCita}.`;

        const mensajeHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                <div style="background: linear-gradient(135px, #0284c7, #0369a1); padding: 30px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700;">MediCenter Hospital</h1>
                    <p style="margin: 8px 0 0; opacity: 0.9; font-size: 15px;">Confirmación Oficial de Cita Médica</p>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h2 style="color: #0f172a; font-size: 20px; margin-top: 0;">¡Hola, ${pacienteNombre}!</h2>
                    <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                        Tu cita médica ha sido agendada exitosamente en nuestro sistema. A continuación te presentamos los detalles de tu consulta:
                    </p>
                    
                    <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 20px; border-radius: 6px; margin: 24px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Especialidad:</td>
                                <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 15px;">${especialidad}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Doctor/a:</td>
                                <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 15px;">Dr/a. ${doctorNombre}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Fecha:</td>
                                <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 15px;">${fecha}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Hora:</td>
                                <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 15px;">${hora} hrs</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Código de Cita:</td>
                                <td style="padding: 8px 0; color: #0284c7; font-weight: 700; font-size: 15px;">${codigoCita || 'N/A'}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="margin-top: 24px;">
                        <h4 style="color: #0f172a; font-size: 15px; margin-bottom: 10px;">Recordatorios importantes:</h4>
                        <ul style="color: #475569; font-size: 14px; line-height: 1.7; padding-left: 20px;">
                            <li>Por favor acude 15 minutos antes de la hora programada.</li>
                            <li>Lleva contigo tu cédula de identidad o documento original.</li>
                            <li>Por seguridad, si necesitas cancelar tu consulta, te solicitaremos un código de verificación enviado a este correo.</li>
                        </ul>
                    </div>
                </div>
                <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
                    © ${new Date().getFullYear()} MediCenter Hospital. Todos los derechos reservados.<br/>
                    Sistema de Gestión Hospitalaria Integral
                </div>
            </div>
        `;

        // Envío por Correo Electrónico 
        try {
            const transporter = crearTransportador();
            if (transporter && email) {
                await transporter.sendMail({
                    from: `"MediCenter Hospital" <${process.env.EMAIL_USER || process.env.SMTP_USER}>`,
                    to: email,
                    subject: asunto,
                    text: mensajeTexto,
                    html: mensajeHtml
                });
                console.log(`[CORREO ENVIADO] Confirmación enviada exitosamente a: ${email}`);
            } else {
                console.log(`[SIMULACIÓN CORREO] (Falta configurar EMAIL_USER/EMAIL_PASS en .env). Correo que se enviaría a ${email || 'correo del paciente'}:\nAsunto: ${asunto}\nContenido: ${mensajeTexto}`);
            }
        } catch (errorMail) {
            console.error(`[ERROR CORREO] No se pudo enviar el correo de confirmación a ${email}:`, errorMail.message);
        }

        // Envío por Mensaje Celular (SMS / WhatsApp) 
        try {
            if (telefono) {
                console.log(`[SIMULACIÓN SMS/WHATSAPP] Envío preparado al número ${telefono}: "${mensajeTexto}"`);
                /* =========================================================================
                 * LISTO PARA CONECTAR API DE SMS O WHATSAPP (Twilio / Meta API)
                 * Si configuras TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN en .env:
                 * =========================================================================
                 * if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
                 *     const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                 *     await twilio.messages.create({
                 *         body: mensajeTexto,
                 *         from: process.env.TWILIO_PHONE_NUMBER,
                 *         to: telefono.startsWith('+') ? telefono : `+593${telefono.replace(/^0/, '')}`
                 *     });
                 *     console.log(`[SMS ENVIADO] Mensaje entregado a ${telefono}`);
                 * }
                 * ========================================================================= */
            }
        } catch (errorSms) {
            console.error(`[ERROR SMS] No se pudo enviar SMS al número ${telefono}:`, errorSms.message);
        }
    },

    // Envío de código OTP de seguridad para cancelar cita
    enviarCodigoCancelacion: async (email, telefono, codigoOTP, pacienteNombre = 'Paciente') => {
        const asunto = `Código de Seguridad para Cancelar Cita: ${codigoOTP}`;
        const mensajeTexto = `MediCenter: Tu código de seguridad para confirmar la cancelación de tu cita es: ${codigoOTP}. No compartas este código con nadie.`;

        const mensajeHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                <div style="background-color: #ef4444; padding: 25px; text-align: center; color: white;">
                    <h2 style="margin: 0; font-size: 22px;">Verificación de Seguridad</h2>
                    <p style="margin: 5px 0 0; opacity: 0.9; font-size: 14px;">Cancelación de Cita Médica</p>
                </div>
                <div style="padding: 30px; text-align: center;">
                    <p style="color: #334155; font-size: 15px; text-align: left;">
                        Hola <strong>${pacienteNombre}</strong>,<br/><br/>
                        Hemos recibido una solicitud para cancelar tu cita médica programada en MediCenter. Para proteger tu cita contra cancelaciones no autorizadas, ingresa el siguiente código de 6 dígitos:
                    </p>
                    
                    <div style="margin: 30px 0; background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px;">
                        <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ef4444;">${codigoOTP}</span>
                    </div>

                    <p style="color: #64748b; font-size: 13px; text-align: left;">
                        Si tú no solicitaste cancelar tu cita, por favor ignora este mensaje. Tu cita médica permanecerá activa y segura.
                    </p>
                </div>
                <div style="background-color: #f1f5f9; padding: 15px; text-align: center; color: #94a3b8; font-size: 12px;">
                    MediCenter Hospital - Seguridad y Privacidad del Paciente
                </div>
            </div>
        `;

        console.log(`\n======================================================`);
        console.log(`[CÓDIGO DE SEGURIDAD OTP GENERADO PARA CANCELACIÓN]`);
        console.log(`Destinatario: ${email || 'Sin email'} / Teléfono: ${telefono || 'Sin teléfono'}`);
        console.log(`CÓDIGO OTP: --> ${codigoOTP} <--`);
        console.log(`======================================================\n`);

        try {
            const transporter = crearTransportador();
            if (transporter && email) {
                await transporter.sendMail({
                    from: `"MediCenter Hospital Seguridad" <${process.env.EMAIL_USER || process.env.SMTP_USER}>`,
                    to: email,
                    subject: asunto,
                    text: mensajeTexto,
                    html: mensajeHtml
                });
                console.log(`[CORREO ENVIADO] Código OTP enviado a ${email}`);
            }
        } catch (errorMail) {
            console.error(`[ERROR CORREO OTP] No se pudo enviar correo a ${email}:`, errorMail.message);
        }

        try {
            if (telefono) {
                // Listo para mandar por SMS o WhatsApp real
                console.log(`[SMS/WHATSAPP LISTO] Mensaje con código ${codigoOTP} preparado para el número ${telefono}`);
            }
        } catch (errorSms) {
            console.error(`[ERROR SMS OTP] No se pudo enviar por SMS:`, errorSms.message);
        }
    },

    // Envío de credenciales a nuevo doctor
    enviarCredencialesDoctor: async ({ email, nombre, password, telefono }) => {
        const asunto = `Bienvenido al sistema MediCenter - Tus claves de acceso`;
        const mensajeTexto = `Hola Dr/a. ${nombre},\n\nBienvenido/a al sistema de gestión hospitalaria MediCenter.\nTus claves de acceso para ingresar a la plataforma son:\n\nCorreo: ${email}\nContraseña temporal: ${password}\n\nPor seguridad, el sistema te solicitará cambiar esta contraseña en tu primer ingreso.\n\nSaludos,\nAdministración MediCenter`;
        const mensajeHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 10px;">
                <h2 style="color: #1e3a8a;">¡Bienvenido/a al Sistema MediCenter!</h2>
                <p>Estimado/a <strong>Dr/a. ${nombre}</strong>,</p>
                <p>Tu cuenta médica ha sido creada exitosamente por la administración. A continuación, te compartimos tus credenciales de acceso:</p>
                <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Usuario / Correo:</strong> ${email}</p>
                    <p style="margin: 5px 0;"><strong>Contraseña Temporal:</strong> ${password}</p>
                </div>
                <p style="color: #ef4444; font-size: 0.9em;">* Por seguridad, al ingresar por primera vez el sistema te solicitará cambiar tu contraseña.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 0.8em; color: #64748b;">Este es un mensaje automático generado por MediCenter Hospital.</p>
            </div>
        `;

        console.log(`\n================= [CREDENCIALES NUEVO DOCTOR] =================`);
        console.log(`Para: ${nombre} (${email}) | Teléfono: ${telefono || 'N/A'}`);
        console.log(`Contraseña temporal: ${password}`);
        console.log(`===============================================================\n`);

        try {
            const transporter = crearTransportador();
            if (transporter && email) {
                await transporter.sendMail({
                    from: `"MediCenter Hospital" <${process.env.EMAIL_USER || process.env.SMTP_USER || 'soporte@medicenter.com'}>`,
                    to: email,
                    subject: asunto,
                    text: mensajeTexto,
                    html: mensajeHtml
                });
                console.log(`[CORREO BIENVENIDA ENVIADO] a ${email}`);
            }
        } catch (errorMail) {
            console.error(`[ERROR CORREO BIENVENIDA] No se pudo enviar correo a ${email}:`, errorMail.message);
        }

        try {
            if (telefono && process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN) {
                console.log(`[WHATSAPP LISTO] Enviando credenciales vía WhatsApp API al ${telefono}...`);
            }
        } catch (errW) {
            console.error(`[ERROR WHATSAPP]`, errW.message);
        }
    }
};

module.exports = notificacionesService;
