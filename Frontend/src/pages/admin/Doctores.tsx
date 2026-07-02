import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Search,
    Plus,
    MoreHorizontal,
    Mail,
    Phone,
    Stethoscope,
    Calendar,
    Clock,
    UserCheck,
    AlertTriangle,
    Eye,
    EyeOff,
    KeyRound,
    Copy,
    Check,
    MessageSquare
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import doctoresService from "@/servicios/doctores";
import especialidadesService from "@/servicios/especialidades";
import disponibilidadService from "@/servicios/disponibilidad";
import pacientesService from "@/servicios/pacientes";
import citasService from "@/servicios/citas";

const formatearNombrePropio = (str?: string) => {
    if (!str) return "";
    return str.trim().toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const Doctores = () => {
    const [busqueda, setBusqueda] = useState("");
    const [doctores, setDoctores] = useState<any[]>([]);
    const [especialidades, setEspecialidades] = useState<any[]>([]);
    
    // Estados para Modales
    const [modalNuevo, setModalNuevo] = useState(false);
    const [modalPerfil, setModalPerfil] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalHorario, setModalHorario] = useState(false);
    const [duracionCita, setDuracionCita] = useState<number>(30);
    const [horariosDoctor, setHorariosDoctor] = useState<any[]>([
        { dia_semana: 1, nombre: "Lunes", activo: true, hora_inicio: "08:00", hora_fin: "16:00" },
        { dia_semana: 2, nombre: "Martes", activo: true, hora_inicio: "08:00", hora_fin: "16:00" },
        { dia_semana: 3, nombre: "Miércoles", activo: true, hora_inicio: "08:00", hora_fin: "16:00" },
        { dia_semana: 4, nombre: "Jueves", activo: true, hora_inicio: "08:00", hora_fin: "16:00" },
        { dia_semana: 5, nombre: "Viernes", activo: true, hora_inicio: "08:00", hora_fin: "16:00" },
        { dia_semana: 6, nombre: "Sábado", activo: false, hora_inicio: "08:00", hora_fin: "12:00" },
        { dia_semana: 0, nombre: "Domingo", activo: false, hora_inicio: "08:00", hora_fin: "12:00" }
    ]);
    const [modalDesactivar, setModalDesactivar] = useState(false);
    const [doctorSeleccionado, setDoctorSeleccionado] = useState<any | null>(null);
    const [mostrarClave, setMostrarClave] = useState(false);
    const [copiado, setCopiado] = useState(false);
    const [modalCredenciales, setModalCredenciales] = useState<{
        open: boolean;
        nombre: string;
        email: string;
        password: string;
        telefono: string;
    }>({ open: false, nombre: "", email: "", password: "", telefono: "" });
    const [alertaModal, setAlertaModal] = useState<{ open: boolean; titulo: string; mensaje: string }>({
        open: false,
        titulo: "",
        mensaje: ""
    });

    // Formulario Nuevo/Editar Doctor
    const [formDoctor, setFormDoctor] = useState({
        cedula: "",
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        telefono: " ",
        especialidad_id: "1",
        experiencia_anios: "5",
        estado: "Activo"
    });

    const cargarDoctores = async () => {
        try {
            const [data, pacientesBD, citasBD] = await Promise.all([
                doctoresService.obtenerTodos(),
                pacientesService.obtenerTodos().catch(() => []),
                citasService.obtenerTodas().catch(() => [])
            ]);
            if (data && Array.isArray(data)) {
                setDoctores(data.map((d: any) => {
                    const nomLim = (d.nombre || "").replace(/^Dr\.\s*/i, "").trim();
                    const apeLim = (d.apellido || "").trim();
                    const nomCap = formatearNombrePropio(nomLim);
                    const apeCap = formatearNombrePropio(apeLim);

                    const pacientesDelDoc = new Set<number>();
                    if (Array.isArray(pacientesBD)) {
                        pacientesBD.forEach((p: any) => {
                            if (p.doctor_asignado_id === d.id) pacientesDelDoc.add(p.id);
                        });
                    }
                    if (Array.isArray(citasBD)) {
                        citasBD.forEach((c: any) => {
                            if (c.doctor_id === d.id && c.paciente_id) pacientesDelDoc.add(c.paciente_id);
                        });
                    }
                    const conteoPacientes = d.pacientes_totales !== undefined && d.pacientes_totales !== null
                        ? parseInt(d.pacientes_totales, 10) || 0
                        : (d.pacientes !== undefined ? d.pacientes : pacientesDelDoc.size);

                    return {
                        ...d,
                        nombre: nomCap,
                        apellido: apeCap,
                        nombreCompleto: `Dr. ${nomCap} ${apeCap}`.trim(),
                        especialidad: d.especialidad_nombre || d.especialidad,
                        experiencia: d.experiencia_anios !== undefined && d.experiencia_anios !== null ? `${d.experiencia_anios} años` : (d.experiencia || "1 año"),
                        pacientes: conteoPacientes,
                        estado: d.estado || "Activo"
                    };
                }));
            }
        } catch (error) {
            console.error("Error al obtener doctores desde PostgreSQL:", error);
        }
    };

    const cargarEspecialidades = async () => {
        try {
            const data = await especialidadesService.obtenerTodas();
            if (Array.isArray(data)) {
                setEspecialidades(data);
            }
        } catch (error) {
            console.error("Error al obtener especialidades:", error);
        }
    };

    useEffect(() => {
        cargarDoctores();
        cargarEspecialidades();
    }, []);

    const generarClaveSegura = () => {
        const mayus = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const minus = "abcdefghijklmnopqrstuvwxyz";
        const nums = "0123456789";
        const simbs = "*#$@";
        let clave = "Med-";
        for (let i = 0; i < 2; i++) clave += mayus.charAt(Math.floor(Math.random() * mayus.length));
        for (let i = 0; i < 3; i++) clave += minus.charAt(Math.floor(Math.random() * minus.length));
        for (let i = 0; i < 2; i++) clave += nums.charAt(Math.floor(Math.random() * nums.length));
        clave += simbs.charAt(Math.floor(Math.random() * simbs.length));
        setFormDoctor(prev => ({ ...prev, password: clave }));
    };

    const doctoresFiltrados = doctores.filter(d => 
        (d.nombreCompleto || d.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) || 
        (d.especialidad || "").toLowerCase().includes(busqueda.toLowerCase())
    );

    const handleCrearDoctor = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validación estricta de campos
        if (!formDoctor.cedula || formDoctor.cedula.trim().length < 10) {
            setAlertaModal({ open: true, titulo: "Cédula Inválida", mensaje: "La cédula debe contener al menos 10 dígitos numéricos." });
            return;
        }
        if (!formDoctor.nombre || !formDoctor.apellido) {
            setAlertaModal({ open: true, titulo: "Campos Requeridos", mensaje: "Por favor ingresa el nombre y apellido del médico." });
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formDoctor.email)) {
            setAlertaModal({ open: true, titulo: "Correo Inválido", mensaje: "El correo electrónico ingresado no tiene un formato válido." });
            return;
        }
        if (!formDoctor.password || formDoctor.password.length < 6) {
            setAlertaModal({ open: true, titulo: "Contraseña Insegura", mensaje: "La contraseña de acceso debe tener al menos 6 caracteres." });
            return;
        }

        const nomCap = formatearNombrePropio(formDoctor.nombre);
        const apeCap = formatearNombrePropio(formDoctor.apellido);

        try {
            await doctoresService.crear({
                cedula: formDoctor.cedula.trim(),
                nombre: nomCap,
                apellido: apeCap,
                email: formDoctor.email.trim(),
                password: formDoctor.password,
                telefono: formDoctor.telefono.trim() || "0999999999",
                especialidad_id: parseInt(formDoctor.especialidad_id) || 1,
                experiencia_anios: parseInt(formDoctor.experiencia_anios) || 5,
                estado: "Activo"
            });
            setModalNuevo(false);
            
            // Abrir Modal Profesional de Credenciales Creadas
            setModalCredenciales({
                open: true,
                nombre: `Dr. ${nomCap} ${apeCap}`,
                email: formDoctor.email.trim(),
                password: formDoctor.password,
                telefono: formDoctor.telefono.trim()
            });

            setFormDoctor({ cedula: "", nombre: "", apellido: "", email: "", password: "", telefono: "", especialidad_id: "1", experiencia_anios: "5", estado: "Activo" });
            cargarDoctores();
        } catch (err) {
            console.error("Error al crear doctor:", err);
            setAlertaModal({
                open: true,
                titulo: "Error de Registro",
                mensaje: "No se pudo registrar al médico. Es posible que la cédula o el correo ya se encuentren registrados en el sistema."
            });
        }
    };

    const handleEditarDoctor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!doctorSeleccionado) return;
        try {
            await doctoresService.actualizar(doctorSeleccionado.id, {
                cedula: formDoctor.cedula,
                nombre: formDoctor.nombre,
                apellido: formDoctor.apellido,
                email: formDoctor.email,
                telefono: formDoctor.telefono,
                especialidad_id: parseInt(formDoctor.especialidad_id) || 1,
                experiencia_anios: parseInt(formDoctor.experiencia_anios) || 5,
                estado: formDoctor.estado
            });
            setModalEditar(false);
            cargarDoctores();
        } catch (err) {
            console.error("Error al actualizar doctor:", err);
            setAlertaModal({
                open: true,
                titulo: "Error de Actualización",
                mensaje: "Hubo un problema al actualizar los datos del doctor."
            });
        }
    };

    const handleCambiarEstado = async () => {
        if (!doctorSeleccionado) return;
        try {
            const nuevoEstado = doctorSeleccionado.estado === "Activo" ? "Inactivo" : "Activo";
            await doctoresService.actualizar(doctorSeleccionado.id, { estado: nuevoEstado });
            setModalDesactivar(false);
            cargarDoctores();
        } catch (err) {
            console.error("Error al cambiar estado:", err);
        }
    };

    const abrirEditar = (d: any) => {
        setDoctorSeleccionado(d);
        setFormDoctor({
            cedula: d.cedula || "",
            nombre: d.nombre?.replace(/^Dr\.\s*/i, "") || "",
            apellido: d.apellido || "",
            email: d.email || "",
            password: "",
            telefono: d.telefono || "",
            especialidad_id: String(d.especialidad_id || "1"),
            experiencia_anios: String(d.experiencia_anios || "5"),
            estado: d.estado || "Activo"
        });
        setModalEditar(true);
    };

    const abrirHorario = async (doctor: any) => {
        setDoctorSeleccionado(doctor);
        setModalHorario(true);
        try {
            const disp = await disponibilidadService.obtenerPorDoctor(doctor.id);
            const diasBase = [
                { dia_semana: 1, nombre: "Lunes", activo: false, hora_inicio: "08:00", hora_fin: "16:00" },
                { dia_semana: 2, nombre: "Martes", activo: false, hora_inicio: "08:00", hora_fin: "16:00" },
                { dia_semana: 3, nombre: "Miércoles", activo: false, hora_inicio: "08:00", hora_fin: "16:00" },
                { dia_semana: 4, nombre: "Jueves", activo: false, hora_inicio: "08:00", hora_fin: "16:00" },
                { dia_semana: 5, nombre: "Viernes", activo: false, hora_inicio: "08:00", hora_fin: "16:00" },
                { dia_semana: 6, nombre: "Sábado", activo: false, hora_inicio: "08:00", hora_fin: "12:00" },
                { dia_semana: 0, nombre: "Domingo", activo: false, hora_inicio: "08:00", hora_fin: "12:00" }
            ];
            if (disp && Array.isArray(disp) && disp.length > 0) {
                setDuracionCita(disp[0].duracion_cita_minutos || 30);
                const diasActualizados = diasBase.map(d => {
                    const encontrado = disp.find((h: any) => h.dia_semana === d.dia_semana);
                    if (encontrado) {
                        return {
                            ...d,
                            activo: true,
                            hora_inicio: encontrado.hora_inicio ? encontrado.hora_inicio.slice(0, 5) : "08:00",
                            hora_fin: encontrado.hora_fin ? encontrado.hora_fin.slice(0, 5) : "16:00"
                        };
                    }
                    return d;
                });
                setHorariosDoctor(diasActualizados);
            } else {
                setDuracionCita(30);
                setHorariosDoctor([
                    { dia_semana: 1, nombre: "Lunes", activo: true, hora_inicio: "08:00", hora_fin: "16:00" },
                    { dia_semana: 2, nombre: "Martes", activo: true, hora_inicio: "08:00", hora_fin: "16:00" },
                    { dia_semana: 3, nombre: "Miércoles", activo: true, hora_inicio: "08:00", hora_fin: "16:00" },
                    { dia_semana: 4, nombre: "Jueves", activo: true, hora_inicio: "08:00", hora_fin: "16:00" },
                    { dia_semana: 5, nombre: "Viernes", activo: true, hora_inicio: "08:00", hora_fin: "16:00" },
                    { dia_semana: 6, nombre: "Sábado", activo: false, hora_inicio: "08:00", hora_fin: "12:00" },
                    { dia_semana: 0, nombre: "Domingo", activo: false, hora_inicio: "08:00", hora_fin: "12:00" }
                ]);
            }
        } catch (err) {
            console.error("Error al cargar horarios:", err);
        }
    };

    const handleGuardarHorario = async () => {
        if (!doctorSeleccionado) return;
        try {
            await disponibilidadService.guardarHorario(doctorSeleccionado.id, {
                horarios: horariosDoctor.filter(h => h.activo),
                duracion_cita_minutos: Number(duracionCita)
            });
            setModalHorario(false);
            setAlertaModal({
                open: true,
                titulo: "Horario Guardado",
                mensaje: "El horario de disponibilidad médica y la duración de turnos se han guardado en la base de datos."
            });
        } catch (err) {
            console.error("Error al guardar horario:", err);
            setAlertaModal({
                open: true,
                titulo: "Error",
                mensaje: "Hubo un problema al guardar el horario en el servidor."
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Doctores</h1>
                    
                </div>
                <Button 
                    onClick={() => {
                        setFormDoctor({ cedula: "", nombre: "", apellido: "", email: "", password: "", telefono: "", especialidad_id: "1", experiencia_anios: "5", estado: "Activo" });
                        setModalNuevo(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Doctor
                </Button>
            </div>

            {/* Barra de búsqueda */}
            <div className="flex items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar doctor por nombre o especialidad..."
                        className="pl-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-blue-500"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid de Doctores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctoresFiltrados.map((doctor) => (
                    <Card key={doctor.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                    {(doctor.nombreCompleto || doctor.nombre || "D").charAt(0)}
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">{doctor.nombreCompleto || doctor.nombre}</CardTitle>
                                    <CardDescription className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                                        <Stethoscope className="h-3 w-3" />
                                        {doctor.especialidad}
                                    </CardDescription>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                    <DropdownMenuItem className="cursor-pointer" onClick={() => { setDoctorSeleccionado(doctor); setModalPerfil(true); }}>
                                        Ver perfil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer" onClick={() => abrirEditar(doctor)}>
                                        Editar información
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer" onClick={() => abrirHorario(doctor)}>
                                        Gestionar horario
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => { setDoctorSeleccionado(doctor); setModalDesactivar(true); }}>
                                        {doctor.estado === "Activo" ? "Desactivar cuenta" : "Activar cuenta"}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Mail className="h-4 w-4 text-slate-400" />
                                {doctor.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Phone className="h-4 w-4 text-slate-400" />
                                {doctor.telefono}
                            </div>
                            <div className="pt-2 flex items-center justify-between">
                                <Badge variant="secondary" className={`
                                    ${doctor.estado === 'Activo' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : ''}
                                    ${doctor.estado === 'De vacaciones' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : ''}
                                    ${doctor.estado === 'Inactivo' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' : ''}
                                `}>
                                    {doctor.estado}
                                </Badge>
                                <span className="text-xs text-slate-500">{doctor.experiencia} exp.</span>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-4">
                            <div className="w-full flex justify-between text-sm">
                                <span className="text-slate-500">Pacientes totales</span>
                                <span className="font-semibold text-slate-900 dark:text-white">{doctor.pacientes}</span>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
                {doctoresFiltrados.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
                        No se encontraron doctores en la base de datos.
                    </div>
                )}
            </div>

            {/* Modal Nuevo Doctor */}
            <Dialog open={modalNuevo} onOpenChange={setModalNuevo}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle>Registrar Nuevo Médico</DialogTitle>
                        <DialogDescription>Completa los datos para registrar al profesional médico en el sistema.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCrearDoctor} className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Cédula</Label>
                                <Input required value={formDoctor.cedula} onChange={e => setFormDoctor({...formDoctor, cedula: e.target.value})} placeholder="" />
                            </div>
                            <div>
                                <Label className="flex justify-between items-center">
                                    <span>Contraseña de Acceso</span>
                                    <button 
                                        type="button" 
                                        onClick={generarClaveSegura}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                                    >
                                        <KeyRound className="h-3 w-3" /> Generar
                                    </button>
                                </Label>
                                <div className="relative mt-1">
                                    <Input 
                                        type={mostrarClave ? "text" : "password"} 
                                        required 
                                        value={formDoctor.password} 
                                        onChange={e => setFormDoctor({...formDoctor, password: e.target.value})} 
                                        placeholder="Min. 6 caracteres"
                                        className="pr-10" 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarClave(!mostrarClave)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        {mostrarClave ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Nombre</Label>
                                <Input required value={formDoctor.nombre} onChange={e => setFormDoctor({...formDoctor, nombre: e.target.value})} placeholder="" />
                            </div>
                            <div>
                                <Label>Apellido</Label>
                                <Input required value={formDoctor.apellido} onChange={e => setFormDoctor({...formDoctor, apellido: e.target.value})} placeholder="" />
                            </div>
                        </div>
                        <div>
                            <Label>Correo Electrónico</Label>
                            <Input type="email" required value={formDoctor.email} onChange={e => setFormDoctor({...formDoctor, email: e.target.value})} placeholder="" />
                        </div>
                        <div>
                            <Label>Teléfono</Label>
                            <Input required value={formDoctor.telefono} onChange={e => setFormDoctor({...formDoctor, telefono: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>ID Especialidad</Label>
                                <select 
                                    className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
                                    value={formDoctor.especialidad_id}
                                    onChange={e => setFormDoctor({...formDoctor, especialidad_id: e.target.value})}
                                >
                                    {especialidades.map(esp => (
                                        <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                                    ))} 
                                </select>
                            </div>
                            <div>
                                <Label>Años Experiencia</Label>
                                <Input type="number" required value={formDoctor.experiencia_anios} onChange={e => setFormDoctor({...formDoctor, experiencia_anios: e.target.value})} />
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setModalNuevo(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Guardar Doctor</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de Credenciales Creadas (Profesional) */}
            <Dialog open={modalCredenciales.open} onOpenChange={o => setModalCredenciales({ ...modalCredenciales, open: o })}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 backdrop-blur-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                            <Check className="h-6 w-6 text-emerald-500" /> ¡Doctor Registrado Exitosamente!
                        </DialogTitle>
                        <DialogDescription>
                            Las credenciales han sido generadas y enviadas al correo registrado. Puedes compartirlas con el profesional:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Bienvenido al sistema MediCenter</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Estimado/a <strong>{modalCredenciales.nombre}</strong>, tus credenciales de acceso son:</p>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 font-mono text-sm space-y-1">
                            <div><span className="text-slate-400 text-xs">Correo: </span><span className="font-semibold">{modalCredenciales.email}</span></div>
                            <div><span className="text-slate-400 text-xs">Clave temporal: </span><span className="font-semibold text-blue-600">{modalCredenciales.password}</span></div>
                        </div>
                        <p className="text-[11px] text-amber-600 dark:text-amber-400">* Por seguridad, al iniciar sesión por primera vez se le solicitará cambiar la contraseña.</p>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
                        <Button 
                            variant="outline"
                            onClick={() => {
                                const texto = `Bienvenido al sistema MediCenter Hospital\n\nHola ${modalCredenciales.nombre},\nTus credenciales de acceso son:\n\nCorreo: ${modalCredenciales.email}\nClave temporal: ${modalCredenciales.password}\n\nIngresa al portal médico para gestionar tus consultas.`;
                                navigator.clipboard.writeText(texto);
                                setCopiado(true);
                                setTimeout(() => setCopiado(false), 3000);
                            }}
                            className="w-full sm:w-auto border-slate-300"
                        >
                            {copiado ? <Check className="mr-2 h-4 w-4 text-emerald-500" /> : <Copy className="mr-2 h-4 w-4" />}
                            {copiado ? "¡Copiado!" : "Copiar Credenciales"}
                        </Button>
                        <Button 
                            onClick={() => {
                                const num = modalCredenciales.telefono.replace(/\D/g, '');
                                const texto = `Bienvenido al sistema *MediCenter Hospital* 🏥\n\nHola *${modalCredenciales.nombre}*,\nTus credenciales de acceso son:\n\n📧 *Correo:* ${modalCredenciales.email}\n🔑 *Clave temporal:* ${modalCredenciales.password}\n\nPor favor ingresa al portal médico para comenzar a gestionar tus consultas.`;
                                window.open(`https://api.whatsapp.com/send?phone=${num}&text=${encodeURIComponent(texto)}`, '_blank');
                            }}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <MessageSquare className="mr-2 h-4 w-4" /> Enviar por WhatsApp
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Editar Doctor */}
            <Dialog open={modalEditar} onOpenChange={setModalEditar}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle>Editar Información del Médico</DialogTitle>
                        <DialogDescription>Modifica los datos personales y profesionales en la base de datos.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditarDoctor} className="space-y-4 py-2">
                        <div>
                            <Label>Cédula</Label>
                            <Input required value={formDoctor.cedula} onChange={e => setFormDoctor({...formDoctor, cedula: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Nombre</Label>
                                <Input required value={formDoctor.nombre} onChange={e => setFormDoctor({...formDoctor, nombre: e.target.value})} />
                            </div>
                            <div>
                                <Label>Apellido</Label>
                                <Input required value={formDoctor.apellido} onChange={e => setFormDoctor({...formDoctor, apellido: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <Label>Correo Electrónico</Label>
                            <Input type="email" required value={formDoctor.email} onChange={e => setFormDoctor({...formDoctor, email: e.target.value})} />
                        </div>
                        <div>
                            <Label>Teléfono</Label>
                            <Input required value={formDoctor.telefono} onChange={e => setFormDoctor({...formDoctor, telefono: e.target.value})} />
                        </div>
                        <div>
                            <Label>Especialidad</Label>
                            <select 
                                className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
                                value={formDoctor.especialidad_id}
                                onChange={e => setFormDoctor({...formDoctor, especialidad_id: e.target.value})}
                            >
                                {especialidades.map(esp => (
                                    <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                                ))} 
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Estado</Label>
                                <select 
                                    className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
                                    value={formDoctor.estado}
                                    onChange={e => setFormDoctor({...formDoctor, estado: e.target.value})}
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="De vacaciones">De vacaciones</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                            </div>
                            <div>
                                <Label>Años Experiencia</Label>
                                <Input type="number" required value={formDoctor.experiencia_anios} onChange={e => setFormDoctor({...formDoctor, experiencia_anios: e.target.value})} />
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setModalEditar(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Actualizar Cambios</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Ver Perfil */}
            <Dialog open={modalPerfil} onOpenChange={setModalPerfil}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle>Perfil Profesional del Médico</DialogTitle>
                        <DialogDescription>Información general y métricas de atención.</DialogDescription>
                    </DialogHeader>
                    {doctorSeleccionado && (
                        <div className="space-y-4 py-2">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="h-14 w-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                                    {(doctorSeleccionado.nombreCompleto || doctorSeleccionado.nombre || "D").charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{doctorSeleccionado.nombreCompleto || doctorSeleccionado.nombre}</h3>
                                    <p className="text-sm text-blue-600 font-medium">{doctorSeleccionado.especialidad}</p>
                                    <Badge variant="outline" className="mt-1">{doctorSeleccionado.estado}</Badge>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-3 border rounded-lg">
                                    <span className="text-slate-400 block text-xs">Experiencia</span>
                                    <span className="font-semibold">{doctorSeleccionado.experiencia}</span>
                                </div>
                                <div className="p-3 border rounded-lg">
                                    <span className="text-slate-400 block text-xs">Pacientes Totales</span>
                                    <span className="font-semibold">{doctorSeleccionado.pacientes} pacientes</span>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm pt-2">
                                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /> <span>{doctorSeleccionado.email}</span></div>
                                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> <span>{doctorSeleccionado.telefono}</span></div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button className="w-full" onClick={() => setModalPerfil(false)}>Cerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Gestionar Horario */}
            <Dialog open={modalHorario} onOpenChange={setModalHorario}>
                <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Gestionar Horario y Disponibilidad</DialogTitle>
                        <DialogDescription>Configura los días laborales, rango de horas y duración de turnos para {doctorSeleccionado?.nombreCompleto || doctorSeleccionado?.nombre}.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-2 text-sm">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg flex items-center justify-between">
                            <div>
                                <Label className="font-semibold text-blue-900 dark:text-blue-300">Duración por Cita (minutos)</Label>
                                <p className="text-xs text-blue-700 dark:text-blue-400">Intervalo de tiempo entre turnos generados.</p>
                            </div>
                            <select 
                                className="h-9 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium"
                                value={duracionCita}
                                onChange={e => setDuracionCita(Number(e.target.value))}
                            >
                                <option value={15}>15 minutos</option>
                                <option value={20}>20 minutos</option>
                                <option value={30}>30 minutos</option>
                                <option value={45}>45 minutos</option>
                                <option value={60}>1 hora (60 min)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-semibold text-slate-800 dark:text-slate-200">Días y Horarios de Atención</Label>
                            {horariosDoctor.map((h, idx) => (
                                <div key={h.dia_semana} className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${h.activo ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 opacity-60'}`}>
                                    <div className="flex items-center gap-2.5 w-28">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                            checked={h.activo}
                                            onChange={e => {
                                                const copia = [...horariosDoctor];
                                                copia[idx].activo = e.target.checked;
                                                setHorariosDoctor(copia);
                                            }}
                                        />
                                        <span className={`font-medium text-sm ${h.activo ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-400'}`}>
                                            {h.nombre}
                                        </span>
                                    </div>

                                    {h.activo ? (
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="time" 
                                                className="h-8 px-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                                value={h.hora_inicio}
                                                onChange={e => {
                                                    const copia = [...horariosDoctor];
                                                    copia[idx].hora_inicio = e.target.value;
                                                    setHorariosDoctor(copia);
                                                }}
                                            />
                                            <span className="text-slate-400 text-xs">hasta</span>
                                            <input 
                                                type="time" 
                                                className="h-8 px-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                                value={h.hora_fin}
                                                onChange={e => {
                                                    const copia = [...horariosDoctor];
                                                    copia[idx].hora_fin = e.target.value;
                                                    setHorariosDoctor(copia);
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <Badge variant="outline" className="text-slate-400 text-xs">Descanso</Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button variant="outline" onClick={() => setModalHorario(false)}>Cancelar</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleGuardarHorario}>Guardar Horario</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Desactivar/Activar */}
            <Dialog open={modalDesactivar} onOpenChange={setModalDesactivar}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="h-5 w-5" />
                            Confirmar Cambio de Estado
                        </DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas cambiar el estado de cuenta del doctor <strong>{doctorSeleccionado?.nombreCompleto || doctorSeleccionado?.nombre}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-4">
                        <Button variant="outline" onClick={() => setModalDesactivar(false)}>Cancelar</Button>
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleCambiarEstado}>
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Alerta / Información */}
            <Dialog open={alertaModal.open} onOpenChange={(open) => setAlertaModal({ ...alertaModal, open })}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-blue-600">
                            <AlertTriangle className="h-5 w-5" /> {alertaModal.titulo}
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-sm text-foreground">
                            {alertaModal.mensaje}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-3">
                        <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => setAlertaModal({ ...alertaModal, open: false })}>
                            Entendido
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Doctores;
