# 🏥 Sistema de Reserva de Citas Hospitalarias

Este proyecto es una aplicación web integral diseñada para la gestión eficiente de citas médicas, administración de doctores y pacientes, y control de notificaciones en un entorno hospitalario.

## 🚀 Tecnologías Utilizadas

El sistema está construido con una arquitectura moderna separada en Frontend y Backend.

### Frontend (Cliente)
- **Framework**: React 18
- **Build Tool**: Vite
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes UI**: Shadcn/UI, Radix UI
- **Gestión de Estado/Data**: TanStack Query (React Query)
- **Formularios**: React Hook Form + Zod
- **Iconos**: Lucide React

### Backend (Servidor)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL
- **Driver**: `pg` (node-postgres)
- **Variables de Entorno**: Dotenv

## 🗄️ Base de Datos

El sistema utiliza PostgreSQL con un esquema relacional robusto que incluye:

- **Doctores y Especialidades**: Gestión de personal médico y sus áreas.
- **Pacientes**: Registro detallado de pacientes.
- **Citas**: Control de agendamiento, estados (Pendiente, Completada, Cancelada) y auditoría.
- **Disponibilidad**: Horarios configurables por doctor.
- **Notificaciones**: Sistema para alertas por WhatsApp y Email.
- **Seguridad**: Usuarios con roles (Admin, Doctor) y bloqueos de agenda.

## 📂 Estructura del Proyecto

```
Hospital-R/
├── Backend/
│   ├── src/
│   │   ├── controladores/    # Lógica de control y respuesta
│   │   ├── modelos/          # Modelos de base de datos
│   │   ├── rutas/            # Definición de endpoints API
│   │   ├── config/           # Configuración (DB, variables)
│   │   └── index.js          # Punto de entrada del servidor
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/       # Componentes reutilizables UI
│   │   ├── pages/            # Vistas y páginas principales
│   │   ├── servicios/        # Comunicación con el Backend (API)
│   │   ├── hooks/            # Custom Hooks (Lógica de estado)
│   │   ├── layouts/          # Estructuras de diseño (MainLayout)
│   │   └── lib/              # Utilidades y configuraciones
│   └── package.json
│
└── BASE_HOSPITAL.txt         # Script SQL de la base de datos
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js (v18 o superior)
- PostgreSQL
- npm o yarn

### 1. Configuración del Backend

1. Navega a la carpeta del backend:
   ```bash
   cd Backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno (`.env`) con tus credenciales de base de datos.
4. Inicia el servidor:
   ```bash
   npm run dev
   ```

### 2. Configuración del Frontend

1. Navega a la carpeta del frontend:
   ```bash
   cd Frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abre el navegador en la URL indicada (usualmente `http://localhost:5173`).

## 📱 Funcionalidades Principales

- **Agendamiento de Citas**: Interfaz intuitiva para reservar citas según disponibilidad.
- **Gestión de Horarios**: Los doctores pueden definir sus horarios de atención.
- **Historial y Auditoría**: Registro de cambios en las citas y acciones realizadas.
- **Notificaciones**: Preparado para integración con servicios de mensajería.


## 👨‍💻 Autor
**Risk Keep**
