import { useState, useEffect } from "react";
import notificacionesService from "@/servicios/notificaciones";
import pacientesService from "@/servicios/pacientes";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Bell,
    BellOff,
    AlertCircle,
    AlertTriangle,
    CheckCircle,
    Info,
    XCircle,
    User,
    Stethoscope,
    Pill,
    Mail,
    MessageCircle,
    Phone,
    Settings,
    Check,
    Trash2,
    Eye,
    EyeOff,
    Clock as ClockIcon,
    Search,
    MoreHorizontal,
    Edit,
    Flag,
    Shield,
    BellPlus,
    Megaphone,
    Calendar as CalendarIcon,
    Microscope,
    RefreshCw,
    CheckCheck,
    Server,
    DollarSign,
    Archive,
    ArrowRight,
} from "lucide-react";

// Tipos de notificaciones
type NotificationType = "info" | "success" | "warning" | "error" | "alert";

interface Notification {
    id: number;
    titulo: string;
    mensaje: string;
    tipo: NotificationType;
    fecha: string;
    hora: string;
    leido: boolean;
    archivado: boolean;
    importante: boolean;
    paciente?: string;
    pacienteId?: number;
    doctor?: string;
    accion?: string;
    enlace?: string;
    icono?: React.ReactNode;
}

// Preferencias de notificación
const preferenciasNotificacion = [
    { id: "citas", label: "Citas y recordatorios", enabled: true },
    { id: "resultados", label: "Resultados de laboratorio", enabled: true },
    { id: "mensajes", label: "Mensajes de pacientes", enabled: true },
    { id: "facturacion", label: "Facturación y pagos", enabled: false },
    { id: "medicacion", label: "Alertas de medicación", enabled: true },
    { id: "seguridad", label: "Alertas de seguridad", enabled: true },
    { id: "sistema", label: "Actualizaciones del sistema", enabled: true },
    { id: "promociones", label: "Promociones y novedades", enabled: false },
];

// Canales de notificación
const canalesNotificacion = [
    { id: "email", label: "Correo electrónico", enabled: true, icon: Mail },
    { id: "sms", label: "SMS", enabled: false, icon: Phone },
    { id: "push", label: "Push notifications", enabled: true, icon: Bell },
    { id: "whatsapp", label: "WhatsApp", enabled: false, icon: MessageCircle },
];

const AlertasNotificaciones = () => {
    const [notificaciones, setNotificaciones] = useState<Notification[]>([]);
    const [alertasSistema, setAlertasSistema] = useState<any[]>([]);
    const [pacientesRecientes, setPacientesRecientes] = useState<any[]>([]);
    const [notificacionesSeleccionadas, setNotificacionesSeleccionadas] = useState<number[]>([]);
    const [notificacionSeleccionada, setNotificacionSeleccionada] = useState<Notification | null>(null);
    const [modalNueva, setModalNueva] = useState(false);
    const [formNueva, setFormNueva] = useState({
        titulo: "",
        mensaje: "",
        canal_envio: "WHATSAPP",
        tipo: "info"
    });
    const [alertaModal, setAlertaModal] = useState<{ open: boolean; titulo: string; mensaje: string }>({
        open: false,
        titulo: "",
        mensaje: ""
    });

    const handleCrearAlerta = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await notificacionesService.crear({
                titulo: formNueva.titulo,
                mensaje: formNueva.mensaje,
                canal_envio: formNueva.canal_envio,
                tipo: formNueva.tipo
            });
            setModalNueva(false);
            setFormNueva({ titulo: "", mensaje: "", canal_envio: "WHATSAPP", tipo: "info" });
            setAlertaModal({
                open: true,
                titulo: "Recordatorio Programado",
                mensaje: `La notificación ha sido registrada y procesada para despacho mediante el canal: ${formNueva.canal_envio}.`
            });
        } catch (error) {
            console.error("Error al crear alerta:", error);
            setAlertaModal({
                open: true,
                titulo: "Error al generar recordatorio",
                mensaje: "Hubo un problema al registrar la alerta en el servidor."
            });
        }
    };

    useEffect(() => {
        const cargarNotificaciones = async () => {
            try {
                const [notifs, pacs] = await Promise.all([
                    notificacionesService.obtenerTodas().catch(() => []),
                    pacientesService.obtenerTodos().catch(() => [])
                ]);

                if (Array.isArray(notifs)) {
                    setNotificaciones(notifs.map((n: any) => ({
                        id: n.id,
                        titulo: n.titulo || "Notificación",
                        mensaje: n.mensaje || "",
                        tipo: n.tipo === "alerta" || n.tipo === "error" ? "error" : (n.tipo === "éxito" ? "success" : "info"),
                        fecha: n.fecha_creacion ? n.fecha_creacion.split('T')[0] : "2026-06-30",
                        hora: n.fecha_creacion ? new Date(n.fecha_creacion).toTimeString().substring(0, 5) : "10:00",
                        leido: Boolean(n.leido || n.leida),
                        archivado: Boolean(n.archivado),
                        importante: Boolean(n.importante || n.tipo === "alerta" || n.tipo === "error"),
                        paciente: n.paciente_nombre ? `${n.paciente_nombre} ${n.paciente_apellido || ''}`.trim() : (n.doctor_nombre ? `Dr. ${n.doctor_nombre}` : "General")
                    })));

                    setAlertasSistema(notifs.filter((n: any) => n.tipo === "alerta" || n.tipo === "error").map((n: any) => ({
                        id: n.id,
                        titulo: n.titulo || "Alerta",
                        descripcion: n.mensaje || "",
                        tipo: "warning",
                        fecha: n.fecha_creacion ? n.fecha_creacion.split('T')[0] : "2026-06-30",
                        gravedad: "Alta",
                        estado: "Activa"
                    })));
                }

                if (Array.isArray(pacs)) {
                    setPacientesRecientes(pacs.slice(0, 5).map((p: any) => ({
                        id: p.id,
                        nombre: p.apellido ? `${p.nombre} ${p.apellido}` : p.nombre,
                        avatar: p.nombre ? p.nombre.substring(0, 2).toUpperCase() : "PA"
                    })));
                }
            } catch (err) {
                console.error("Error al cargar notificaciones desde PostgreSQL:", err);
            }
        };
        cargarNotificaciones();
    }, []);
    const [tabActivo, setTabActivo] = useState("todas");
    const [busquedaNotificaciones, setBusquedaNotificaciones] = useState("");
    const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
    const [filtroPaciente, setFiltroPaciente] = useState<string | null>(null);
    const [mostrarLeidas, setMostrarLeidas] = useState(true);
    const [modoSeleccion, setModoSeleccion] = useState(false);
    const [ordenFecha, setOrdenFecha] = useState<"reciente" | "antiguo">("reciente");

    // Filtrar notificaciones
    const notificacionesFiltradas = notificaciones.filter(n => {
        const coincideBusqueda = n.titulo.toLowerCase().includes(busquedaNotificaciones.toLowerCase()) ||
            n.mensaje.toLowerCase().includes(busquedaNotificaciones.toLowerCase()) ||
            (n.paciente && n.paciente.toLowerCase().includes(busquedaNotificaciones.toLowerCase()));
        
        const coincideTipo = filtroTipo ? n.tipo === filtroTipo : true;
        const coincidePaciente = filtroPaciente ? n.pacienteId === parseInt(filtroPaciente) : true;
        const coincideLeido = mostrarLeidas ? true : !n.leido;
        const coincideTab = tabActivo === "todas" ? !n.archivado : 
                          tabActivo === "no-leidas" ? (!n.leido && !n.archivado) :
                          tabActivo === "importantes" ? (n.importante && !n.archivado) :
                          tabActivo === "archivadas" ? n.archivado : true;
        
        return coincideBusqueda && coincideTipo && coincidePaciente && coincideLeido && coincideTab;
    });

    // Ordenar notificaciones
    const notificacionesOrdenadas = [...notificacionesFiltradas].sort((a, b) => {
        if (ordenFecha === "reciente") {
            return new Date(b.fecha + "T" + b.hora).getTime() - new Date(a.fecha + "T" + a.hora).getTime();
        } else {
            return new Date(a.fecha + "T" + a.hora).getTime() - new Date(b.fecha + "T" + b.hora).getTime();
        }
    });

    // Contadores
    const totalNoLeidas = notificaciones.filter(n => !n.leido && !n.archivado).length;
    const totalImportantes = notificaciones.filter(n => n.importante && !n.archivado).length;
    const totalArchivadas = notificaciones.filter(n => n.archivado).length;

    // Acciones
    const marcarComoLeido = async (id: number) => {
        setNotificaciones(prev => prev.map(n => 
            n.id === id ? { ...n, leido: true } : n
        ));
        await notificacionesService.marcarLeida(id).catch(() => {});
    };

    const marcarComoNoLeido = (id: number) => {
        setNotificaciones(prev => prev.map(n => 
            n.id === id ? { ...n, leido: false } : n
        ));
    };

    const marcarComoImportante = async (id: number) => {
        const noti = notificaciones.find(n => n.id === id);
        const nuevoImp = noti ? !noti.importante : true;
        setNotificaciones(prev => prev.map(n => 
            n.id === id ? { ...n, importante: nuevoImp } : n
        ));
        await notificacionesService.importante(id, nuevoImp).catch(() => {});
    };

    const archivarNotificacion = async (id: number) => {
        setNotificaciones(prev => prev.map(n => 
            n.id === id ? { ...n, archivado: true } : n
        ));
        await notificacionesService.archivar(id, true).catch(() => {});
    };

    const desarchivarNotificacion = async (id: number) => {
        setNotificaciones(prev => prev.map(n => 
            n.id === id ? { ...n, archivado: false } : n
        ));
        await notificacionesService.archivar(id, false).catch(() => {});
    };

    const eliminarNotificacion = (id: number) => {
        setNotificaciones(prev => prev.filter(n => n.id !== id));
    };

    const marcarTodasLeidas = async () => {
        setNotificaciones(prev => prev.map(n => 
            !n.leido ? { ...n, leido: true } : n
        ));
        await notificacionesService.marcarTodasLeidas().catch(() => {});
    };

    const archivarTodas = () => {
        setNotificaciones(prev => prev.map(n => 
            !n.archivado ? { ...n, archivado: true } : n
        ));
    };

    const seleccionarNotificacion = (id: number) => {
        if (modoSeleccion) {
            setNotificacionesSeleccionadas(prev =>
                prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
            );
        }
    };

    const accionesSeleccionadas = {
        marcarLeidas: () => {
            setNotificaciones(prev => prev.map(n =>
                notificacionesSeleccionadas.includes(n.id) ? { ...n, leido: true } : n
            ));
            setNotificacionesSeleccionadas([]);
        },
        archivar: () => {
            setNotificaciones(prev => prev.map(n =>
                notificacionesSeleccionadas.includes(n.id) ? { ...n, archivado: true } : n
            ));
            setNotificacionesSeleccionadas([]);
        },
        eliminar: () => {
            setNotificaciones(prev => prev.filter(n => !notificacionesSeleccionadas.includes(n.id)));
            setNotificacionesSeleccionadas([]);
        }
    };

    const getTipoIcon = (tipo: NotificationType) => {
        switch (tipo) {
            case "success": return <CheckCircle className="h-5 w-5 text-emerald-500" />;
            case "warning": return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case "error": return <XCircle className="h-5 w-5 text-red-500" />;
            case "alert": return <AlertCircle className="h-5 w-5 text-orange-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getTipoColor = (tipo: NotificationType) => {
        switch (tipo) {
            case "success": return "border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5";
            case "warning": return "border-amber-500/20 bg-amber-50 dark:bg-amber-500/5";
            case "error": return "border-red-500/20 bg-red-50 dark:bg-red-500/5";
            case "alert": return "border-orange-500/20 bg-orange-50 dark:bg-orange-500/5";
            default: return "border-blue-500/20 bg-blue-50 dark:bg-blue-500/5";
        }
    };

    const getGravedadColor = (gravedad: string) => {
        switch (gravedad) {
            case "Crítica": return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/10";
            case "Alta": return "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-500/10";
            case "Media": return "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/10";
            default: return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10";
        }
    };

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Bell className="h-8 w-8 text-[hsl(var(--medical-blue))]" />
                        Alertas y Notificaciones
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Gestiona todas tus notificaciones y alertas del sistema.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 px-3 py-1">
                        <Bell className="h-4 w-4 mr-1" />
                        {totalNoLeidas} no leídas
                    </Badge>
                    <Button onClick={() => setModalNueva(true)} className="bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
                        <BellPlus className="mr-2 h-4 w-4" />
                        Nueva Notificación
                    </Button>
                </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Notificaciones</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{notificaciones.length}</p>
                            </div>
                            <Bell className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">No leídas</p>
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{totalNoLeidas}</p>
                            </div>
                            <BellOff className="h-8 w-8 text-amber-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Importantes</p>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{totalImportantes}</p>
                            </div>
                            <Flag className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Archivadas</p>
                                <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">{totalArchivadas}</p>
                            </div>
                            <Archive className="h-8 w-8 text-slate-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={tabActivo} onValueChange={setTabActivo} className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <TabsTrigger value="todas" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                            Todas
                            <Badge variant="secondary" className="ml-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {notificaciones.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="no-leidas" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                            No leídas
                            {totalNoLeidas > 0 && (
                                <Badge className="ml-2 bg-blue-500 text-white">{totalNoLeidas}</Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="importantes" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                            Importantes
                            {totalImportantes > 0 && (
                                <Badge className="ml-2 bg-red-500 text-white">{totalImportantes}</Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="archivadas" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                            Archivadas
                        </TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className={`${modoSeleccion ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' : ''}`}
                            onClick={() => setModoSeleccion(!modoSeleccion)}
                        >
                            {modoSeleccion ? 'Cancelar' : 'Seleccionar'}
                        </Button>
                        {modoSeleccion && notificacionesSeleccionadas.length > 0 && (
                            <>
                                <Button size="sm" variant="outline" onClick={accionesSeleccionadas.marcarLeidas}>
                                    <Check className="h-4 w-4 mr-1" />
                                    Leídas
                                </Button>
                                <Button size="sm" variant="outline" onClick={accionesSeleccionadas.archivar}>
                                    <Archive className="h-4 w-4 mr-1" />
                                    Archivar
                                </Button>
                                <Button size="sm" variant="destructive" onClick={accionesSeleccionadas.eliminar}>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Eliminar
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Lista de notificaciones para todas las pestañas */}
                <div className="space-y-4">
                    {/* Barra de búsqueda y filtros */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar notificaciones..."
                                className="pl-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                value={busquedaNotificaciones}
                                onChange={(e) => setBusquedaNotificaciones(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                            <Select value={filtroTipo || "todos"} onValueChange={(val) => setFiltroTipo(val === "todos" ? null : val)}>
                                <SelectTrigger className="w-[130px] bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                    <SelectItem value="todos">Todos</SelectItem>
                                    <SelectItem value="info">Info</SelectItem>
                                    <SelectItem value="success">Éxito</SelectItem>
                                    <SelectItem value="warning">Advertencia</SelectItem>
                                    <SelectItem value="error">Error</SelectItem>
                                    <SelectItem value="alert">Alerta</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filtroPaciente || "todos"} onValueChange={(val) => setFiltroPaciente(val === "todos" ? null : val)}>
                                <SelectTrigger className="w-[140px] bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                    <SelectValue placeholder="Paciente" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                    <SelectItem value="todos">Todos</SelectItem>
                                    {pacientesRecientes.map(p => (
                                        <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                size="sm"
                                variant="outline"
                                className={`${mostrarLeidas ? 'border-blue-500/50 bg-blue-50 dark:bg-blue-500/10' : ''}`}
                                onClick={() => setMostrarLeidas(!mostrarLeidas)}
                            >
                                {mostrarLeidas ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                                {mostrarLeidas ? 'Mostrar leídas' : 'Ocultar leídas'}
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setOrdenFecha(ordenFecha === "reciente" ? "antiguo" : "reciente")}
                            >
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {ordenFecha === "reciente" ? "Reciente" : "Antiguo"}
                            </Button>
                        </div>
                    </div>

                    {/* Acciones rápidas */}
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={marcarTodasLeidas}>
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Marcar todas como leídas
                        </Button>
                        <Button size="sm" variant="outline" onClick={archivarTodas}>
                            <Archive className="h-4 w-4 mr-2" />
                            Archivar todas
                        </Button>
                        <Button size="sm" variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Actualizar
                        </Button>
                    </div>

                    {/* Lista de notificaciones */}
                    <ScrollArea className="h-[600px]">
                        <div className="space-y-3">
                            {notificacionesOrdenadas.length > 0 ? (
                                notificacionesOrdenadas.map((notificacion) => (
                                    <div
                                        key={notificacion.id}
                                        className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                                            notificacion.leido 
                                                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800' 
                                                : 'bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20'
                                        } ${notificacion.archivado ? 'opacity-60' : ''}`}
                                        onClick={() => { if (!modoSeleccion) { marcarComoLeido(notificacion.id); setNotificacionSeleccionada(notificacion); } }}
                                    >
                                        <div className="flex items-start gap-4">
                                            {modoSeleccion && (
                                                <div className="pt-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={notificacionesSeleccionadas.includes(notificacion.id)}
                                                        onChange={() => seleccionarNotificacion(notificacion.id)}
                                                        className="w-4 h-4 rounded border-slate-300 text-[hsl(var(--medical-blue))] focus:ring-[hsl(var(--medical-blue))]"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-shrink-0">
                                                {getTipoIcon(notificacion.tipo)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="font-semibold text-slate-900 dark:text-white">
                                                                {notificacion.titulo}
                                                            </h4>
                                                            {notificacion.importante && (
                                                                <Badge className="bg-red-500 text-white">
                                                                    <Flag className="h-3 w-3 mr-1 fill-current" />
                                                                    Importante
                                                                </Badge>
                                                            )}
                                                            {!notificacion.leido && (
                                                                <Badge className="bg-blue-500 text-white">
                                                                    Nuevo
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                            {notificacion.mensaje}
                                                        </p>
                                                        {notificacion.paciente && (
                                                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                                                <User className="h-3 w-3" />
                                                                <span>{notificacion.paciente}</span>
                                                                {notificacion.doctor && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <Stethoscope className="h-3 w-3" />
                                                                        <span>{notificacion.doctor}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <div className="text-xs text-slate-400 text-right">
                                                            <div>{notificacion.fecha}</div>
                                                            <div>{notificacion.hora}</div>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                                                {notificacion.leido ? (
                                                                    <DropdownMenuItem onClick={() => marcarComoNoLeido(notificacion.id)}>
                                                                        <BellOff className="h-4 w-4 mr-2" />
                                                                        Marcar como no leído
                                                                    </DropdownMenuItem>
                                                                ) : (
                                                                    <DropdownMenuItem onClick={() => marcarComoLeido(notificacion.id)}>
                                                                        <Check className="h-4 w-4 mr-2" />
                                                                        Marcar como leído
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem onClick={() => marcarComoImportante(notificacion.id)}>
                                                                    {notificacion.importante ? (
                                                                        <>
                                                                            <Flag className="h-4 w-4 mr-2 fill-current text-red-500" />
                                                                            Quitar importante
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Flag className="h-4 w-4 mr-2" />
                                                                            Marcar importante
                                                                        </>
                                                                    )}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => archivarNotificacion(notificacion.id)}>
                                                                    <Archive className="h-4 w-4 mr-2" />
                                                                    Archivar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-red-600" onClick={() => eliminarNotificacion(notificacion.id)}>
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Eliminar
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                                {notificacion.accion && (
                                                    <div className="mt-3">
                                                        <Button size="sm" variant="outline" className="text-xs">
                                                            {notificacion.accion}
                                                            <ArrowRight className="h-3 w-3 ml-1" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <BellOff className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
                                    <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mt-4">No hay notificaciones</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">No se encontraron notificaciones con los filtros aplicados</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </Tabs>

            {/* Modal Ver Detalle de la Notificación */}
            <Dialog open={!!notificacionSeleccionada} onOpenChange={() => setNotificacionSeleccionada(null)}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Megaphone className="h-5 w-5" />
                            {notificacionSeleccionada?.titulo || "Detalle de Notificación"}
                        </DialogTitle>
                        <DialogDescription>
                            Fecha: {notificacionSeleccionada?.fecha} - Hora: {notificacionSeleccionada?.hora}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                            <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                                {notificacionSeleccionada?.mensaje}
                            </p>
                        </div>
                        {notificacionSeleccionada?.paciente && (
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                <span className="font-semibold">Paciente asociado:</span> {notificacionSeleccionada.paciente}
                            </p>
                        )}
                        {notificacionSeleccionada?.doctor && (
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                <span className="font-semibold">Médico asignado:</span> {notificacionSeleccionada.doctor}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNotificacionSeleccionada(null)}>Cerrar</Button>
                        <Button className="bg-[hsl(var(--medical-blue))] text-white hover:bg-blue-700" onClick={() => { setNotificacionSeleccionada(null); setAlertaModal({ open: true, titulo: "Acción Completada", mensaje: "La notificación ha sido marcada como procesada en el sistema." }); }}>
                            {notificacionSeleccionada?.accion || "Marcar / Procesar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Nueva Notificación / Recordatorio multicanal */}
            <Dialog open={modalNueva} onOpenChange={setModalNueva}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Bell className="h-5 w-5" /> Emitir Nueva Notificación o Recordatorio
                        </DialogTitle>
                        <DialogDescription>
                            Envía un aviso clínico o recordatorio de cita a través de los canales del hospital.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCrearAlerta} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="titulo">Título de la Alerta</Label>
                            <Input 
                                id="titulo"
                                required
                                placeholder="Ej: Recordatorio de Cita Médica"
                                value={formNueva.titulo}
                                onChange={e => setFormNueva({ ...formNueva, titulo: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mensaje">Contenido del Mensaje</Label>
                            <Input 
                                id="mensaje"
                                required
                                placeholder="Le recordamos su consulta mañana a las 10:00 AM..."
                                value={formNueva.mensaje}
                                onChange={e => setFormNueva({ ...formNueva, mensaje: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="canal">Canal de Envío</Label>
                            <select 
                                id="canal"
                                className="w-full h-10 px-3 py-2 border rounded-md bg-background text-sm"
                                value={formNueva.canal_envio}
                                onChange={e => setFormNueva({ ...formNueva, canal_envio: e.target.value })}
                            >
                                <option value="WHATSAPP">WhatsApp Business (Inmediato)</option>
                                <option value="EMAIL">Correo Electrónico</option>
                                <option value="SISTEMA">Notificación Interna del Hospital</option>
                            </select>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setModalNueva(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Enviar Recordatorio</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Informativo */}
            <Dialog open={alertaModal.open} onOpenChange={(open) => setAlertaModal({ ...alertaModal, open })}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-blue-600">
                            <Info className="h-5 w-5" /> {alertaModal.titulo}
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

export default AlertasNotificaciones;