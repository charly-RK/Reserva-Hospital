-- Base de Datos - Hospital R


-- 1. Tabla de Especialidades Médicas
CREATE TABLE especialidades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

-- 2. Tabla de Doctores
CREATE TABLE doctores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    especialidad_id INT NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(150) UNIQUE NOT NULL,
    estado BOOLEAN DEFAULT TRUE, -- Activo/Inactivo
    CONSTRAINT fk_doctor_especialidad FOREIGN KEY (especialidad_id) REFERENCES especialidades(id)
);

-- 3. Tabla de Pacientes
CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    cedula VARCHAR(10) NOT NULL UNIQUE, -- Identificador principal
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    celular VARCHAR(20) NOT NULL, -- Para notificaciones de WhatsApp
    email VARCHAR(150) NOT NULL, -- Para envío de órdenes
    fecha_nacimiento DATE NOT NULL,
    direccion VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Citas Médicas
CREATE TABLE citas (
    id SERIAL PRIMARY KEY,
    paciente_id INT NOT NULL,
    doctor_id INT NOT NULL,
    fecha_cita DATE NOT NULL,
    hora_cita TIME NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE, COMPLETADA, CANCELADA, REAGENDADA
    motivo_cancelacion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cita_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    CONSTRAINT fk_cita_doctor FOREIGN KEY (doctor_id) REFERENCES doctores(id),
    CONSTRAINT chk_estado_cita CHECK (estado IN ('PENDIENTE', 'COMPLETADA', 'CANCELADA', 'REAGENDADA'))
);

-- 5. Tabla de Disponibilidad Médica
CREATE TABLE disponibilidad_medica (
    id SERIAL PRIMARY KEY,
    doctor_id INT NOT NULL,
    dia_semana INT NOT NULL, -- 0=Domingo, 1=Lunes, ..., 6=Sábado
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    CONSTRAINT fk_disponibilidad_doctor FOREIGN KEY (doctor_id) REFERENCES doctores(id),
    CONSTRAINT chk_dia_semana CHECK (dia_semana BETWEEN 0 AND 6)
);

-- 6. Tabla de Notificaciones (WhatsApp/Email)
CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    cita_id INT NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- WHATSAPP, EMAIL
    mensaje TEXT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE, ENVIADO, FALLIDO
    fecha_envio TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notificacion_cita FOREIGN KEY (cita_id) REFERENCES citas(id),
    CONSTRAINT chk_tipo_notificacion CHECK (tipo IN ('WHATSAPP', 'EMAIL')),
    CONSTRAINT chk_estado_notificacion CHECK (estado IN ('PENDIENTE', 'ENVIADO', 'FALLIDO'))
);

-- 7. Tabla de Auditoría de Citas (Historial de cambios)
CREATE TABLE auditoria_citas (
    id SERIAL PRIMARY KEY,
    cita_id INT NOT NULL,
    accion VARCHAR(50) NOT NULL, -- CREACION, CANCELACION, REAGENDAMIENTO
    detalles TEXT,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_auditoria_cita FOREIGN KEY (cita_id) REFERENCES citas(id)
);

-- 8. Tabla de Usuarios (Admin y Doctores)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hash
    rol VARCHAR(20) NOT NULL, -- ADMIN, DOCTOR
    doctor_id INT, -- Si es doctor, se vincula a su perfil
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_doctor FOREIGN KEY (doctor_id) REFERENCES doctores(id),
    CONSTRAINT chk_rol CHECK (rol IN ('ADMIN', 'DOCTOR'))
);

-- 9. Tabla de Bloqueos de Agenda (Vacaciones, Congresos)
CREATE TABLE bloqueos_agenda (
    id SERIAL PRIMARY KEY,
    doctor_id INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    motivo TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bloqueo_doctor FOREIGN KEY (doctor_id) REFERENCES doctores(id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_citas_fecha ON citas(fecha_cita);
CREATE INDEX idx_citas_paciente ON citas(paciente_id);
CREATE INDEX idx_citas_doctor ON citas(doctor_id);
CREATE INDEX idx_pacientes_cedula ON pacientes(cedula);
