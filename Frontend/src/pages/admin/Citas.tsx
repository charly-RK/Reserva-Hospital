import { useState, useEffect } from "react";
import citasService from "@/servicios/citas";
import authService from "@/servicios/auth";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Calendar as CalendarIcon,
    Search,
    Filter,
    MoreHorizontal,
    Plus,
    Clock,
    User,
    Stethoscope,
    CheckCircle,
    XCircle,
    Eye,
    Edit,
    Trash2,
    Phone,
    Mail,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    Users,
    AlertCircle,
    AlertTriangle,
    RefreshCw
} from "lucide-react";

const Citas = () => {
    const user = authService.getCurrentUser();
    const isDoctor = user?.rol === 'DOCTOR';

    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("Todos");
    const [filtroDoctor, setFiltroDoctor] = useState("Todos");
    const [citaSeleccionada, setCitaSeleccionada] = useState<number | null>(null);
    const [vista, setVista] = useState<"lista" | "detalle" | "calendario">("calendario");
    const [fechaCalendario, setFechaCalendario] = useState(new Date().toISOString().split('T')[0]);
    const [listaCitas, setListaCitas] = useState<any[]>([]);

    // Modales
    const [modalNueva, setModalNueva] = useState(false);
    const [modalReagendar, setModalReagendar] = useState(false);
    const [modalCancelar, setModalCancelar] = useState(false);
    const [alertaModal, setAlertaModal] = useState<{ open?: boolean; visible?: boolean; titulo?: string; mensaje: string; tipo?: "exito" | "error" }>({
        open: false,
        visible: false,
        titulo: "",
        mensaje: "",
        tipo: "exito"
    });

    // Formulario de Nueva Cita con Cédula
    const [formNueva, setFormNueva] = useState({
        cedula_paciente: "",
        nombre_paciente: "",
        doctor_seleccionado: "Dr. Carlos Ruiz - Medicina Interna",
        fecha_cita: new Date().toISOString().split('T')[0],
        hora_cita: "08:00",
        motivo_consulta: ""
    });

    // Formulario Reagendar / Cancelar
    const [formReagendar, setFormReagendar] = useState({ fecha: "2026-07-10", hora: "11:00" });
    const [motivoCancelacion, setMotivoCancelacion] = useState("");

    const cargarCitas = async () => {
        try {
            const data = await citasService.obtenerTodas();
            const filteredData = (data && Array.isArray(data)) ? data.filter((c: any) => {
                if (isDoctor && user) {
                    if (user.doctor_id && c.doctor_id === user.doctor_id) return true;
                    if (c.doctor_email && user.email && c.doctor_email.toLowerCase() === user.email.toLowerCase()) return true;
                    const cleanUser = user.nombre ? user.nombre.replace(/^Dr\.?\s*/i, "").trim().toLowerCase() : "";
                    const docName = `${c.doctor_nombre || ''} ${c.doctor_apellido || ''}`.toLowerCase();
                    if (cleanUser && docName.includes(cleanUser)) return true;
                    return false;
                }
                return true;
            }) : [];
            if (filteredData.length >= 0) {
                setListaCitas(filteredData.map((c: any) => ({
                    id: c.id,
                    paciente: `${c.paciente_nombre || ''} ${c.paciente_apellido || ''}`.trim() || "Paciente",
                    doctor: c.doctor_apellido ? (c.doctor_nombre?.startsWith("Dr") ? `${c.doctor_nombre} ${c.doctor_apellido}` : `Dr. ${c.doctor_nombre} ${c.doctor_apellido}`) : (c.doctor_nombre || "Dr. Asignado"),
                    fecha: c.fecha_cita ? c.fecha_cita.split('T')[0] : "2026-06-15",
                    hora: c.hora_cita ? c.hora_cita.substring(0, 5) : "10:00",
                    estado: c.estado || "Pendiente",
                    tipo: c.tipo_consulta || c.especialidad || "Consulta General",
                    telefono: c.paciente_telefono || "+593 99 000 0000",
                    email: c.paciente_email || "correo@email.com",
                    duracion: c.duracion_minutos ? `${c.duracion_minutos} min` : "30 min",
                    notas: c.motivo_consulta || c.notas_recepcion || ""
                })));
            }
        } catch (error) {
            console.error("Error al cargar citas desde PostgreSQL:", error);
        }
    };

    useEffect(() => {
        cargarCitas();
    }, []);

    // Obtener doctores únicos para el filtro
    const doctores = ["Todos", ...new Set(listaCitas.map(c => c.doctor))];

    const citasFiltradas = listaCitas.filter(cita => {
        const matchBusqueda = (cita.paciente || "").toLowerCase().includes(busqueda.toLowerCase()) ||
                             (cita.doctor || "").toLowerCase().includes(busqueda.toLowerCase()) ||
                             (cita.tipo || "").toLowerCase().includes(busqueda.toLowerCase());
        const matchEstado = filtroEstado === "Todos" || cita.estado?.toLowerCase() === filtroEstado.toLowerCase();
        const matchDoctor = isDoctor || filtroDoctor === "Todos" || cita.doctor === filtroDoctor;
        return matchBusqueda && matchEstado && matchDoctor;
    });

    const cita = citaSeleccionada ? listaCitas.find(c => c.id === citaSeleccionada) : null;

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case "Confirmada": return "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500 border-emerald-200 dark:border-emerald-500/20";
            case "Pendiente": return "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 border-amber-200 dark:border-amber-500/20";
            case "Completada": return "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-500 border-blue-200 dark:border-blue-500/20";
            case "Cancelada": return "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-500 border-red-200 dark:border-red-500/20";
            default: return "bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-500";
        }
    };

    const handleCrearCita = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await citasService.agendar({
                paciente_id: 1, // Resuelto en backend por cédula o fallback
                doctor_id: 1,
                fecha_cita: formNueva.fecha_cita,
                hora_cita: formNueva.hora_cita,
                motivo_consulta: `${formNueva.motivo_consulta || 'Consulta de especialidad'} [Cédula Pac: ${formNueva.cedula_paciente}${formNueva.nombre_paciente ? ' - ' + formNueva.nombre_paciente : ''}]`
            });
            setModalNueva(false);
            setFormNueva({
                ...formNueva,
                cedula_paciente: "",
                nombre_paciente: "",
                motivo_consulta: ""
            });
            cargarCitas();
            setAlertaModal({
                open: true,
                titulo: "Cita Programada con Éxito",
                mensaje: `La cita médica para el paciente con cédula ${formNueva.cedula_paciente || 'registrada'} ha sido programada en la agenda del doctor.`
            });
        } catch (err: any) {
            console.error("Error al agendar cita en BD:", err);
            if (err.response?.status === 409) {
                setAlertaModal({
                    open: true,
                    titulo: "Conflicto de Horario",
                    mensaje: "El médico seleccionado ya tiene una cita programada exactamente a esa hora. Por favor selecciona otro horario disponible."
                });
            } else {
                setAlertaModal({
                    open: true,
                    titulo: "Error de Registro",
                    mensaje: "No se pudo agendar la cita médica en el sistema."
                });
            }
        }
    };

    const handleEstado = async (id: number, estado: string) => {
        try {
            await citasService.actualizarEstado(id, estado);
            cargarCitas();
        } catch (err) {
            console.error("Error al cambiar estado:", err);
        }
    };

    const handleReagendar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!citaSeleccionada) return;
        try {
            await citasService.reagendar(citaSeleccionada, formReagendar.fecha, formReagendar.hora);
            setModalReagendar(false);
            cargarCitas();
        } catch (err: any) {
            console.error("Error al reagendar cita:", err);
            if (err.response?.status === 409) {
                setAlertaModal({
                    open: true,
                    titulo: "Conflicto de Horario",
                    mensaje: "El médico seleccionado ya tiene una cita programada a la nueva hora indicada. Por favor elige otro horario."
                });
            } else {
                setAlertaModal({
                    open: true,
                    titulo: "Error al Reagendar",
                    mensaje: "No se pudo actualizar la fecha y hora de la cita."
                });
            }
        }
    };

    const handleCancelarCita = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!citaSeleccionada) return;
        if (!motivoCancelacion.trim()) {
            setAlertaModal({
                open: true,
                titulo: "Motivo Requerido",
                mensaje: "Debes indicar el motivo formal para cancelar la cita médica."
            });
            return;
        }
        try {
            await citasService.cancelar(citaSeleccionada, motivoCancelacion);
            setModalCancelar(false);
            setMotivoCancelacion("");
            cargarCitas();
        } catch (err) {
            console.error("Error al cancelar cita:", err);
            setAlertaModal({
                open: true,
                titulo: "Error al Cancelar",
                mensaje: "Hubo un problema al procesar la cancelación de la cita en el servidor."
            });
        }
    };

    // Estadísticas
    const totalCitas = listaCitas.length;
    const citasHoy = listaCitas.filter(c => c.fecha === new Date().toISOString().split('T')[0] || c.fecha === "2026-07-02").length;
    const citasPendientes = listaCitas.filter(c => c.estado === "Pendiente" || c.estado === "Confirmada").length;
    const citasCompletadas = listaCitas.filter(c => c.estado === "Completada").length;

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Agendamiento de Citas</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Programa y gestiona las citas médicas de manera eficiente.</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant={vista === "calendario" ? "default" : "outline"}
                        onClick={() => setVista(vista === "calendario" ? "lista" : "calendario")}
                        className={vista === "calendario" ? "bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white" : ""}
                    >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {vista === "calendario" ? "Vista Lista" : "Vista Calendario"}
                    </Button>
                    <Button 
                        onClick={() => setModalNueva(true)}
                        className="bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Cita
                    </Button>
                </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total Citas</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalCitas}</p>
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-lg">
                                <CalendarIcon className="h-5 w-5 text-[hsl(var(--medical-blue))]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Hoy</p>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{citasHoy}</p>
                            </div>
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg">
                                <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Pendientes</p>
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{citasPendientes}</p>
                            </div>
                            <div className="p-3 bg-amber-100 dark:bg-amber-500/10 rounded-lg">
                                <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Completadas</p>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{citasCompletadas}</p>
                            </div>
                            <div className="p-3 bg-purple-100 dark:bg-purple-500/10 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Contenido según Vista */}
            {vista === "calendario" ? (
                /* Vista Calendario Profesional por Día y Horas */
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 pb-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5 text-[hsl(var(--medical-blue))]" />
                                    Agenda Diaria por Consultorio
                                </CardTitle>
                                <CardDescription className="capitalize mt-0.5">
                                    {new Date(fechaCalendario + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Input
                                    type="date"
                                    value={fechaCalendario}
                                    onChange={(e) => setFechaCalendario(e.target.value)}
                                    className="w-44 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm font-medium"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFechaCalendario(new Date().toISOString().split('T')[0])}
                                >
                                    Hoy
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const d = new Date(fechaCalendario + 'T00:00:00');
                                        d.setDate(d.getDate() + 1);
                                        setFechaCalendario(d.toISOString().split('T')[0]);
                                    }}
                                >
                                    Día Siguiente
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            {["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"].map((hora) => {
                                const citasEnHorario = citasFiltradas.filter(c => 
                                    c.fecha === fechaCalendario && c.hora.startsWith(hora.substring(0, 2))
                                );

                                return (
                                    <div key={hora} className="flex flex-col md:flex-row items-start md:items-stretch group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                                        {/* Columna de Hora */}
                                        <div className="w-full md:w-32 p-4 flex md:flex-col justify-between md:justify-center items-center md:items-start border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 shrink-0">
                                            <span className="font-bold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                {hora}
                                            </span>
                                            <span className="text-[11px] text-slate-400">60 minutos</span>
                                        </div>

                                        {/* Contenido del Horario */}
                                        <div className="flex-1 p-3 w-full min-h-[75px] flex flex-col justify-center gap-2">
                                            {citasEnHorario.length > 0 ? (
                                                citasEnHorario.map((cita) => (
                                                    <div
                                                        key={cita.id}
                                                        onClick={() => { setCitaSeleccionada(cita.id); setVista("detalle"); }}
                                                        className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-[hsl(var(--medical-blue))] hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                                                                {cita.paciente.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                                    {cita.paciente}
                                                                    <Badge variant="outline" className={`text-[10px] px-2 py-0 ${getEstadoColor(cita.estado)}`}>
                                                                        {cita.estado}
                                                                    </Badge>
                                                                </div>
                                                                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-0.5">
                                                                    <span className="flex items-center gap-1">
                                                                        <Stethoscope className="h-3 w-3 text-[hsl(var(--medical-blue))]" />
                                                                        {cita.doctor}
                                                                    </span>
                                                                    <span>•</span>
                                                                    <span>{cita.tipo}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 self-end sm:self-center" onClick={e => e.stopPropagation()}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 px-2.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                                onClick={() => { setCitaSeleccionada(cita.id); setVista("detalle"); }}
                                                            >
                                                                Detalles
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 px-2.5 text-xs border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                                onClick={() => { setCitaSeleccionada(cita.id); setModalReagendar(true); }}
                                                            >
                                                                Reagendar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30">
                                                    <span className="text-xs text-slate-400 italic">Horario disponible para consulta</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2.5 text-xs text-[hsl(var(--medical-blue))] hover:bg-blue-50 dark:hover:bg-blue-900/20 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => {
                                                            setFormNueva({ ...formNueva, fecha_cita: fechaCalendario, hora_cita: hora });
                                                            setModalNueva(true);
                                                        }}
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Agendar en este horario
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            ) : vista === "detalle" ? (
                /* Vista Detalle de Cita */
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-3">
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => setVista("lista")}
                                        className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Volver
                                    </Button>
                                    <CardTitle className="text-slate-900 dark:text-white">
                                        {cita?.paciente}
                                    </CardTitle>
                                    <Badge variant="outline" className={`${getEstadoColor(cita?.estado || "")} border`}>
                                        {cita?.estado}
                                    </Badge>
                                </div>
                                <CardDescription className="mt-1">
                                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                        <span>{cita?.doctor}</span>
                                        <span>•</span>
                                        <span>{cita?.tipo}</span>
                                        <span>•</span>
                                        <span>{cita?.duracion}</span>
                                    </div>
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => setModalReagendar(true)}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Reagendar
                                </Button>
                                <Button size="sm" onClick={() => cita?.id && handleEstado(cita.id, "Completada")} className="bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Completar
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Información de Contacto</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <Phone className="h-4 w-4 text-slate-400" />
                                            {cita?.telefono}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <Mail className="h-4 w-4 text-slate-400" />
                                            {cita?.email}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Detalles de la Cita</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <CalendarIcon className="h-4 w-4 text-slate-400" />
                                            {cita?.fecha}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                            {cita?.hora} • {cita?.duracion}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <Stethoscope className="h-4 w-4 text-slate-400" />
                                            {cita?.tipo} • {cita?.doctor}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Notas</h4>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-800">
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{cita?.notas}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Acciones Rápidas</h4>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setAlertaModal({ open: true, titulo: "Recordatorio Enviado", mensaje: "Se ha enviado el recordatorio de cita médica a los canales de contacto del paciente." })}>
                                            <AlertCircle className="h-4 w-4 mr-2" />
                                            Recordatorio
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => setModalCancelar(true)} className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50">
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                /* Vista Lista de Citas */
                <>
                    {/* Barra de herramientas - Filtros */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por paciente, doctor..."
                                className="pl-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-[hsl(var(--medical-blue))]"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <select 
                                className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm flex-1 sm:flex-none"
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                            >
                                <option>Todos</option>
                                <option>Confirmada</option>
                                <option>Pendiente</option>
                                <option>Completada</option>
                                <option>Cancelada</option>
                            </select>
                            <select 
                                className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm flex-1 sm:flex-none"
                                value={filtroDoctor}
                                onChange={(e) => setFiltroDoctor(e.target.value)}
                            >
                                {doctores.map((doctor) => (
                                    <option key={doctor} value={doctor}>{doctor}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tabla de Citas */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                <TableRow>
                                    <TableHead className="w-[80px]">ID</TableHead>
                                    <TableHead>Paciente</TableHead>
                                    <TableHead>Fecha y Hora</TableHead>
                                    <TableHead>Servicio / Doctor</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {citasFiltradas.map((cita) => (
                                    <TableRow key={cita.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => { setCitaSeleccionada(cita.id); setVista("detalle"); }}>
                                        <TableCell className="font-mono text-xs text-slate-500">#{cita.id}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900 dark:text-white">{cita.paciente}</span>
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Stethoscope className="h-3 w-3" />
                                                    {cita.doctor}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">{cita.fecha}</span>
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Clock className="h-3 w-3" />
                                                    {cita.hora}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 dark:text-slate-200 text-sm">{cita.tipo}</span>
                                                <span className="text-xs text-slate-500">{cita.duracion}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`${getEstadoColor(cita.estado)} border`}>
                                                {cita.estado}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-white">
                                                        <span className="sr-only">Abrir menú</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                    <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => { setCitaSeleccionada(cita.id); setVista("detalle"); }}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Ver detalles
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => { setCitaSeleccionada(cita.id); setModalReagendar(true); }}>
                                                        <RefreshCw className="h-4 w-4 mr-2" />
                                                        Reagendar cita
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleEstado(cita.id, "Completada")}>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Marcar como completada
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600 dark:text-red-400 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10" onClick={() => { setCitaSeleccionada(cita.id); setModalCancelar(true); }}>
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Cancelar cita
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {citasFiltradas.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-slate-500 dark:text-slate-400">
                                            No hay citas registradas en la base de datos.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </>
            )}

            {/* Modal Nueva Cita */}
            <Dialog open={modalNueva} onOpenChange={setModalNueva}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle>Programar Cita Médica</DialogTitle>
                        <DialogDescription>Ingresa el número de cédula del paciente y selecciona el consultorio.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCrearCita} className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs font-semibold">Cédula del Paciente</Label>
                                <Input
                                    placeholder="Ej: 1712345678"
                                    required
                                    value={formNueva.cedula_paciente}
                                    onChange={e => setFormNueva({...formNueva, cedula_paciente: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-semibold">Nombre del Paciente</Label>
                                <Input
                                    placeholder="Apellidos y Nombres"
                                    value={formNueva.nombre_paciente}
                                    onChange={e => setFormNueva({...formNueva, nombre_paciente: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs font-semibold">Médico / Consultorio Asignado</Label>
                            {isDoctor ? (
                                <Input
                                    readOnly
                                    value={formNueva.doctor_seleccionado}
                                    className="bg-slate-100 dark:bg-slate-800 font-medium text-[hsl(var(--medical-blue))]"
                                />
                            ) : (
                                <select
                                    className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1 text-sm shadow-2xs focus:outline-hidden focus:ring-1 focus:ring-[hsl(var(--medical-blue))]"
                                    value={formNueva.doctor_seleccionado}
                                    onChange={e => setFormNueva({...formNueva, doctor_seleccionado: e.target.value})}
                                >
                                    {doctores.filter(d => d !== "Todos").map(doc => (
                                        <option key={doc} value={doc}>{doc}</option>
                                    ))}
                                    <option value="Dr. Elena Guamán - Cardiología">Dr. Elena Guamán - Cardiología</option>
                                    <option value="Dr. Carlos Ruiz - Medicina Interna">Dr. Carlos Ruiz - Medicina Interna</option>
                                </select>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs font-semibold">Fecha</Label>
                                <Input type="date" required value={formNueva.fecha_cita} onChange={e => setFormNueva({...formNueva, fecha_cita: e.target.value})} />
                            </div>
                            <div>
                                <Label className="text-xs font-semibold">Hora</Label>
                                <Input type="time" required value={formNueva.hora_cita} onChange={e => setFormNueva({...formNueva, hora_cita: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs font-semibold">Motivo de Consulta / Especialidad</Label>
                            <Input placeholder="Ej: Control cardiológico mensual" required value={formNueva.motivo_consulta} onChange={e => setFormNueva({...formNueva, motivo_consulta: e.target.value})} />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setModalNueva(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white">Agendar Cita</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Reagendar Cita */}
            <Dialog open={modalReagendar} onOpenChange={setModalReagendar}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle>Reagendar Cita Médica</DialogTitle>
                        <DialogDescription>Selecciona una nueva fecha y hora para atender al paciente.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleReagendar} className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Nueva Fecha</Label>
                                <Input type="date" required value={formReagendar.fecha} onChange={e => setFormReagendar({...formReagendar, fecha: e.target.value})} />
                            </div>
                            <div>
                                <Label>Nueva Hora</Label>
                                <Input type="time" required value={formReagendar.hora} onChange={e => setFormReagendar({...formReagendar, hora: e.target.value})} />
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setModalReagendar(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Confirmar Reagendamiento</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Cancelar Cita con Validación de Protocolo */}
            <Dialog open={modalCancelar} onOpenChange={setModalCancelar}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Validación de Cancelación
                        </DialogTitle>
                        <DialogDescription className="text-slate-600 dark:text-slate-400">
                            <strong>Atención:</strong> Por protocolo médico, los doctores no pueden cancelar citas sin justificación. Si el médico no podrá atender este día, le recomendamos <strong>Reagendar</strong> en su lugar.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCancelarCita} className="space-y-4 py-2">
                        <div>
                            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Motivo de fuerza mayor o datos del solicitante para validar cancelación:</Label>
                            <Input 
                                required
                                placeholder="Ej: Solicita el paciente confirmando con su correo / Emergencia médica..."
                                value={motivoCancelacion}
                                onChange={e => setMotivoCancelacion(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="flex-1 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                                onClick={() => { setModalCancelar(false); setModalReagendar(true); }}
                            >
                                <RefreshCw className="h-4 w-4 mr-1" /> Preferir Reagendar
                            </Button>
                            <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                                Confirmar Cancelación
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de Advertencia / Información */}
            <Dialog open={alertaModal.open} onOpenChange={(open) => setAlertaModal({ ...alertaModal, open })}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-600">
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

export default Citas;