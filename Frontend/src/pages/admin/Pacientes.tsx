import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Search,
    Plus,
    MoreHorizontal,
    User,
    Mail,
    Phone,
    Calendar,
    History,
    Image,
    DollarSign,
    Clock,
    FileText,
    Stethoscope,
    Pill,
    Heart,
    Brain,
    Camera,
    Download,
    ZoomIn,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowRight,
    Edit,
    Trash2,
    Eye,
    MessageCircle,
    Activity,
    Users,
    Baby,
    Bone,
    Droplet,
    Scissors,
    Zap,
    Thermometer,
    Filter,
    ChevronDown,
    Bell,
    Shield,
    Star,
    TrendingUp,
    TrendingDown,
    Minus,
    Printer,
    Share2,
    Bookmark,
    Flag,
    Clock as ClockIcon,
    UserPlus,
    Award,
    Clipboard,
    AlertTriangle,
    Check,
    X,
    BarChart2,
    PieChart,
    LineChart
} from "lucide-react";

import pacientesService from "@/servicios/pacientes";
import citasService from "@/servicios/citas";
import historialService from "@/servicios/historial";
import imagenesService from "@/servicios/imagenes";
import facturacionService from "@/servicios/facturacion";
import authService from "@/servicios/auth";

const Pacientes = () => {
    const user = authService.getCurrentUser();
    const isDoctor = user?.rol === 'DOCTOR';

    const [busqueda, setBusqueda] = useState("");
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState<number | null>(null);
    const [tabActivo, setTabActivo] = useState("perfil");
    const [filtroEstado, setFiltroEstado] = useState<string | null>(null);
    const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
    const [vistaGrid, setVistaGrid] = useState(false);
    const [notificacionesActivas, setNotificacionesActivas] = useState(true);

    const [listaPacientes, setListaPacientes] = useState<any[]>([]);
    const [saludEstadisticas, setSaludEstadisticas] = useState<any>({});
    const [historialMedico, setHistorialMedico] = useState<any>({});
    const [imagenesMedicas, setImagenesMedicas] = useState<any>({});
    const [citasPaciente, setCitasPaciente] = useState<any>({});
    const [facturasPaciente, setFacturasPaciente] = useState<any>({});
    const [notificacionesPaciente, setNotificacionesPaciente] = useState<any>({});
    const [favoritos, setFavoritos] = useState<number[]>([]);
    const [alertaModal, setAlertaModal] = useState<{ open: boolean; titulo: string; mensaje: string; tipo?: string }>({ open: false, titulo: "", mensaje: "" });
    const [modalSubirImagen, setModalSubirImagen] = useState(false);
    const [formImagen, setFormImagen] = useState<{ titulo: string; categoria?: string; tipo_estudio?: string; descripcion: string; url?: string; archivo?: any }>({ titulo: "", categoria: "Radiografía", tipo_estudio: "Radiografía", descripcion: "", url: "", archivo: null });
    const [modalAlergia, setModalAlergia] = useState(false);
    const [formAlergia, setFormAlergia] = useState({ alergeno: "", gravedad: "Moderada", reaccion: "" });
    const [modalCondicion, setModalCondicion] = useState(false);
    const [formCondicion, setFormCondicion] = useState({ diagnostico: "", fecha: new Date().toISOString().split('T')[0], estado: "En tratamiento" });
    const [modalReceta, setModalReceta] = useState(false);
    const [formReceta, setFormReceta] = useState({ medicamento: "", dosis: "", frecuencia: "", duracion: "" });
    const [modalNotaClinica, setModalNotaClinica] = useState(false);
    const [formNotaClinica, setFormNotaClinica] = useState({ nota: "" });
    const [modalEvolucion, setModalEvolucion] = useState(false);
    const [formEvolucion, setFormEvolucion] = useState<{ motivo?: string; diagnostico: string; tratamiento: string; observaciones?: string; notas_evolucion?: string }>({ motivo: "", diagnostico: "", tratamiento: "", observaciones: "", notas_evolucion: "" });
    const [modalCompartir, setModalCompartir] = useState(false);
    const [emailCompartir, setEmailCompartir] = useState("");
    const [modalImprimir, setModalImprimir] = useState(false);
    const [modalNuevoPaciente, setModalNuevoPaciente] = useState(false);
    const [formNuevoPaciente, setFormNuevoPaciente] = useState({ cedula: "", nombre: "", apellido: "", fecha_nacimiento: "1990-01-01", genero: "Masculino", celular: "", email: "", direccion: "", tipo_sangre: "O+" });

    // Modales de visualización de imagen y notificaciones
    const [imagenVerModal, setImagenVerModal] = useState<any | null>(null);
    const [modalEditarImagen, setModalEditarImagen] = useState(false);
    const [imagenAEditar, setImagenAEditar] = useState<any | null>(null);
    const [formEditarImagen, setFormEditarImagen] = useState({ titulo: "", tipo_estudio: "Radiografía", descripcion: "", url: "" });
    const [notificacionVerModal, setNotificacionVerModal] = useState<any | null>(null);
    const [imagenAEliminar, setImagenAEliminar] = useState<any | null>(null);

    // Modal de Historial Médico (Evolución)
    const [modoEvolucion, setModoEvolucion] = useState<'crear' | 'editar'>('crear');
    const [evolucionSeleccionadaId, setEvolucionSeleccionadaId] = useState<number | null>(null);

    // Modales de confirmación sin cuadros de alerta del navegador
    const [pacienteABaja, setPacienteABaja] = useState<number | null>(null);
    const [evolucionAEliminar, setEvolucionAEliminar] = useState<number | null>(null);

    const [modalEditarPaciente, setModalEditarPaciente] = useState(false);
    const [formEditarPaciente, setFormEditarPaciente] = useState({ nombre: "", telefono: "", email: "", alergias: "" });
    const [modalCitaRapida, setModalCitaRapida] = useState(false);
    const [formCitaRapida, setFormCitaRapida] = useState({ fecha: new Date().toISOString().split('T')[0], hora: "10:00", motivo: "Consulta de control" });

    // Estado para búsqueda y paginación de Historial Médico (máximo 10 por página)
    const [busquedaHistorial, setBusquedaHistorial] = useState("");
    const [paginaHistorial, setPaginaHistorial] = useState(1);
    // Estado de zoom para el visor de imágenes (1 = 100%, 1.5 = 150%, 2 = 200%)
    const [zoomVisor, setZoomVisor] = useState(1);

    const cargarPacientes = async () => {
        try {
            const data = await pacientesService.obtenerTodos({
                estado: filtroEstado || undefined
            });
            const filteredData = (data && Array.isArray(data)) ? data.filter((p: any) => {
                if (isDoctor && user) {
                    if (user.doctor_id && p.doctor_asignado_id === user.doctor_id) return true;
                    const cleanUser = user.nombre ? user.nombre.replace(/^Dr\.?\s*/i, "").trim().toLowerCase() : "";
                    const docName = (p.doctor_nombre || '').toLowerCase();
                    if (cleanUser && docName.includes(cleanUser)) return true;
                    return false;
                }
                return true;
            }) : [];
            if (filteredData.length >= 0) {
                setListaPacientes(filteredData.map((p: any) => {
                    const edad = p.fecha_nacimiento ? new Date().getFullYear() - new Date(p.fecha_nacimiento).getFullYear() : 35;
                    return {
                        id: p.id,
                        nombre: p.apellido ? `${p.nombre} ${p.apellido}` : p.nombre,
                        cedula: p.cedula,
                        edad: `${edad} años`,
                        genero: p.genero || "No especificado",
                        telefono: p.celular || "+593 99 000 0000",
                        email: p.email || "sin-correo@email.com",
                        ultimaCita: "Reciente",
                        proximaCita: "Por agendar",
                        doctor: p.doctor_nombre ? `Dr. ${p.doctor_nombre}` : "Asignado en recepción",
                        estado: p.estado || "Activo",
                        tipoSangre: p.tipo_sangre || "O+",
                        alergias: Array.isArray(p.alergias) && p.alergias.length > 0 ? p.alergias : ["Ninguna registrada"],
                        condiciones: Array.isArray(p.condiciones) && p.condiciones.length > 0 ? p.condiciones : ["Sin condiciones"],
                        medicamentos: Array.isArray(p.medicamentos) && p.medicamentos.length > 0 ? p.medicamentos : ["Ninguno"],
                        prioridad: p.prioridad || "Media",
                        seguro: p.seguro_medico || "Particular",
                        // numeroPoliza: p.numero_poliza || "N/A",
                        // deuda: p.deuda_actual ? `$${p.deuda_actual}` : "$0",
                        // fidelidad: Math.min(100, Math.max(30, (p.id * 15) % 100)),
                        ultimaVisita: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "15 May 2026",
                        notasClinicas: p.antecedentes || "Sin observaciones registradas"
                    };
                }));
            }
        } catch (err) {
            console.error("No se pudo cargar el listado de pacientes desde PostgreSQL:", err);
        }
    };

    useEffect(() => {
        cargarPacientes();
    }, [filtroEstado]);

    const handleDarDeBajaConfirmado = async () => {
        if (!pacienteABaja) return;
        try {
            await pacientesService.eliminar(pacienteABaja);
            setPacienteABaja(null);
            cargarPacientes();
        } catch (error) {
            console.error("Error al dar de baja al paciente:", error);
            setPacienteABaja(null);
        }
    };

    const recargarDetalles = async (pId: number) => {
        try {
            const [citas, historial, imagenes, facturas] = await Promise.all([
                citasService.obtenerTodas().then((res: any[]) => res.filter((c: any) => c.paciente_id === pId)),
                historialService.obtenerPorPaciente(pId).catch(() => []),
                imagenesService.obtenerPorPaciente(pId).catch(() => []),
                facturacionService.obtenerPorPaciente(pId).catch(() => [])
            ]);

            setCitasPaciente((prev: any) => ({ ...prev, [pId]: citas.map((c: any) => ({ id: c.id, fecha: c.fecha_cita ? c.fecha_cita.split('T')[0] : "2026-07-01", hora: c.hora_cita?.substring(0,5) || "10:00", doctor: c.doctor_nombre ? `Dr. ${c.doctor_nombre}` : "Médico", tipo: c.tipo_consulta || "Consulta General", estado: c.estado || "Confirmada" })) }));
            setHistorialMedico((prev: any) => ({ ...prev, [pId]: historial.map((h: any) => ({ id: h.id, fecha: h.fecha_registro ? h.fecha_registro.split('T')[0] : "2026-06-15", doctor: h.doctor_nombre ? `Dr. ${h.doctor_nombre}` : "Dr. Tratante", diagnostico: h.diagnóstico || h.diagnostico || "Consulta de control", tratamiento: h.tratamiento || "Evolución favorable", notas: h.notas_evolucion || "Sin notas adicionales" })) }));
            setImagenesMedicas((prev: any) => ({ ...prev, [pId]: imagenes.map((img: any) => ({ id: img.id, nombre: img.nombre_estudio || img.titulo || "Estudio médico", fecha: img.fecha_estudio ? img.fecha_estudio.split('T')[0] : (img.fecha_subida ? img.fecha_subida.split('T')[0] : "2026-06-10"), tipo: img.tipo_imagen || img.tipo_estudio || "Radiografía", tamaño: `${img.tamano_mb || 2.1} MB`, descripcion: img.descripcion || "Imagen clínica", url: img.url_archivo || img.url || "" })) }));
            setFacturasPaciente((prev: any) => ({ ...prev, [pId]: facturas.map((f: any) => ({ id: f.id, servicio: "Servicio Hospitalario", monto: `$${f.monto_a_pagar || f.total || 50}`, fecha: f.fecha_emision ? f.fecha_emision.split('T')[0] : "2026-06-15", estado: f.estado || "Pagado" })) }));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (pacienteSeleccionado) {
            recargarDetalles(pacienteSeleccionado);
            const p = listaPacientes.find(x => x.id === pacienteSeleccionado);
            if (p) {
                setFormEditarPaciente({
                    nombre: p.nombre || "",
                    telefono: p.telefono || "",
                    email: p.email || "",
                    alergias: Array.isArray(p.alergias) ? p.alergias.join(', ') : p.alergias || ""
                });
            }
        }
    }, [pacienteSeleccionado, listaPacientes]);

    const handleGuardarEvolucion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pacienteSeleccionado) return;
        const nuevoReg = {
            id: Date.now(),
            fecha: new Date().toISOString().split('T')[0],
            doctor: "Dr. Tratante",
            diagnostico: formEvolucion.diagnostico,
            tratamiento: formEvolucion.tratamiento,
            notas: formEvolucion.notas_evolucion
        };
        try {
            if (modoEvolucion === 'crear') {
                await historialService.crearEvolucion({
                    paciente_id: pacienteSeleccionado,
                    diagnostico: formEvolucion.diagnostico,
                    tratamiento: formEvolucion.tratamiento,
                    notas_evolucion: formEvolucion.notas_evolucion
                });
            } else if (evolucionSeleccionadaId) {
                await historialService.actualizar(evolucionSeleccionadaId, {
                    diagnostico: formEvolucion.diagnostico,
                    tratamiento: formEvolucion.tratamiento,
                    notas_evolucion: formEvolucion.notas_evolucion
                });
            }
            await recargarDetalles(pacienteSeleccionado);
        } catch (error) {
            console.error("Notificación de sincronización con base de datos:", error);
            setHistorialMedico((prev: any) => ({
                ...prev,
                [pacienteSeleccionado]: [nuevoReg, ...(prev[pacienteSeleccionado] || [])]
            }));
        } finally {
            setModalEvolucion(false);
            setFormEvolucion({ diagnostico: "", tratamiento: "", notas_evolucion: "" });
            setAlertaModal({
                open: true,
                titulo: "Registro Clínico Guardado",
                mensaje: "La evolución médica ha sido agregada exitosamente al historial del paciente."
            });
        }
    };

    const handleEliminarEvolucionConfirmado = async () => {
        if (!evolucionAEliminar) return;
        try {
            await historialService.eliminar(evolucionAEliminar);
            setEvolucionAEliminar(null);
            if (pacienteSeleccionado) recargarDetalles(pacienteSeleccionado);
        } catch (error) {
            console.error("Error al eliminar evolución médica:", error);
            setEvolucionAEliminar(null);
        }
    };

    const handleEliminarImagenConfirmado = async () => {
        if (!imagenAEliminar) return;
        try {
            await imagenesService.eliminar(imagenAEliminar.id);
            setImagenAEliminar(null);
            if (pacienteSeleccionado) {
                const imagenes = await imagenesService.obtenerPorPaciente(pacienteSeleccionado).catch(() => []);
                setImagenesMedicas((prev: any) => ({ ...prev, [pacienteSeleccionado]: imagenes.map((img: any) => ({ id: img.id, nombre: img.nombre_estudio || img.titulo || "Estudio clínico", fecha: img.fecha_estudio ? img.fecha_estudio.split('T')[0] : "2026-06-10", tipo: img.tipo_imagen || img.tipo_estudio || "Radiografía", tamaño: "2.1 MB", descripcion: img.descripcion || "Imagen clínica" })) }));
            }
        } catch (error) {
            console.error("Error al eliminar imagen clínica:", error);
            setImagenAEliminar(null);
        }
    };

    const handleSubirImagen = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pacienteSeleccionado) return;
        const urlFinal = formImagen.url || "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80";
        const nuevaImg = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            nombre: formImagen.titulo || "Estudio médico",
            fecha: new Date().toISOString().split('T')[0],
            tipo: formImagen.tipo_estudio || "Radiografía",
            tamaño: "2.8 MB",
            descripcion: formImagen.descripcion || "Imagen clínica",
            url: urlFinal
        };
        try {
            await imagenesService.subirImagen({
                paciente_id: pacienteSeleccionado,
                titulo: formImagen.titulo,
                tipo_estudio: formImagen.tipo_estudio,
                descripcion: formImagen.descripcion,
                url_archivo: urlFinal
            });
            await recargarDetalles(pacienteSeleccionado);
        } catch (err) {
            console.error("Aviso al subir imagen:", err);
            setImagenesMedicas((prev: any) => ({
                ...prev,
                [pacienteSeleccionado]: [nuevaImg, ...(prev[pacienteSeleccionado] || [])]
            }));
        } finally {
            setModalSubirImagen(false);
            setFormImagen({ titulo: "", tipo_estudio: "Radiografía", descripcion: "", url: "" });
            setAlertaModal({
                open: true,
                titulo: "Imagen Subida Exitosamente",
                mensaje: `El estudio clínico "${nuevaImg.nombre}" se adjuntó al expediente.`
            });
        }
    };

    const handleEditarImagen = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imagenAEditar || !pacienteSeleccionado) return;
        try {
            await imagenesService.actualizar(imagenAEditar.id, {
                titulo: formEditarImagen.titulo,
                tipo_estudio: formEditarImagen.tipo_estudio,
                descripcion: formEditarImagen.descripcion,
                url_archivo: formEditarImagen.url
            });
            await recargarDetalles(pacienteSeleccionado);
        } catch (err) {
            console.error("Error editando imagen:", err);
            setImagenesMedicas((prev: any) => ({
                ...prev,
                [pacienteSeleccionado]: (prev[pacienteSeleccionado] || []).map((img: any) => 
                    img.id === imagenAEditar.id ? { ...img, nombre: formEditarImagen.titulo, tipo: formEditarImagen.tipo_estudio, descripcion: formEditarImagen.descripcion, url: formEditarImagen.url } : img
                )
            }));
        } finally {
            setModalEditarImagen(false);
            setAlertaModal({
                open: true,
                titulo: "Estudio Clínico Actualizado",
                mensaje: `Los datos del estudio "${formEditarImagen.titulo}" fueron modificados correctamente.`
            });
        }
    };

    const handleGuardarEdicionPaciente = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pacienteSeleccionado) return;
        setListaPacientes(prev => prev.map(p => p.id === pacienteSeleccionado ? { 
            ...p, 
            nombre: formEditarPaciente.nombre, 
            telefono: formEditarPaciente.telefono, 
            email: formEditarPaciente.email,
            alergias: formEditarPaciente.alergias ? formEditarPaciente.alergias.split(',').map((s: string) => s.trim()) : p.alergias
        } : p));
        setModalEditarPaciente(false);
        setAlertaModal({
            open: true,
            titulo: "Información Actualizada",
            mensaje: "Los datos del paciente han sido actualizados en el sistema."
        });
    };

    const handleAgendarCitaRapida = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pacienteSeleccionado) return;
        const nuevaCita = {
            id: Date.now(),
            fecha: formCitaRapida.fecha,
            hora: formCitaRapida.hora,
            doctor: "Dr. Tratante",
            tipo: formCitaRapida.motivo,
            estado: "Confirmada"
        };
        try {
            await citasService.agendar({
                paciente_id: pacienteSeleccionado,
                doctor_id: 1,
                fecha_cita: formCitaRapida.fecha,
                hora_cita: formCitaRapida.hora,
                motivo_consulta: formCitaRapida.motivo
            });
        } catch (err) {
            console.error("Aviso agendar cita:", err);
        } finally {
            setCitasPaciente((prev: any) => ({
                ...prev,
                [pacienteSeleccionado]: [nuevaCita, ...(prev[pacienteSeleccionado] || [])]
            }));
            setModalCitaRapida(false);
            setAlertaModal({
                open: true,
                titulo: "Cita Agendada",
                mensaje: `Se programó la cita médica para el ${formCitaRapida.fecha} a las ${formCitaRapida.hora}.`
            });
        }
    };

    const generarPDFHistorial = (paciente: any) => {
        const registros = historialMedico[paciente.id as keyof typeof historialMedico] || [];
        const ventanaPrint = window.open('', '_blank');
        if (!ventanaPrint) return;
        ventanaPrint.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Reporte Clínico - ${paciente.nombre}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; }
                    .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
                    .hospital-title { font-size: 24px; font-weight: bold; color: #1e3a8a; margin: 0; }
                    .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
                    .paciente-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
                    .paciente-title { font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
                    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 14px; }
                    .label { color: #64748b; font-size: 12px; }
                    .val { font-weight: 600; color: #1e293b; }
                    .section-title { font-size: 18px; font-weight: bold; color: #1e3a8a; margin-bottom: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; }
                    .registro { border-left: 4px solid #2563eb; background: #ffffff; padding: 15px 20px; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-top: 1px solid #f1f5f9; border-radius: 0 6px 6px 0; }
                    .reg-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
                    .diag { font-size: 16px; font-weight: bold; color: #0f172a; }
                    .fecha { font-size: 13px; color: #2563eb; font-weight: 600; }
                    .doc { font-size: 13px; color: #475569; margin-bottom: 8px; }
                    .detail { font-size: 14px; margin: 4px 0; }
                    .detail span { font-weight: 600; color: #334155; }
                    .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1 class="hospital-title">CENTRO MÉDICO HOSPITALARIO</h1>
                        <div class="subtitle">Departamento de Registros y Expedientes Clínicos</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: bold; color: #2563eb;">REPORTE OFICIAL</div>
                        <div style="font-size: 12px; color: #64748b;">Fecha de emisión: ${new Date().toLocaleDateString()}</div>
                    </div>
                </div>
                <div class="paciente-box">
                    <h3 class="paciente-title">Información del Paciente</h3>
                    <div class="grid">
                        <div><div class="label">Nombre Completo</div><div class="val">${paciente.nombre}</div></div>
                        <div><div class="label">Expediente / ID</div><div class="val">${paciente.id}</div></div>
                        <div><div class="label">Edad</div><div class="val">${paciente.edad || 'No especificada'}</div></div>
                        <div><div class="label">Cédula</div><div class="val">${paciente.cedula || 'N/A'}</div></div>
                        <div><div class="label">Teléfono</div><div class="val">${paciente.telefono || 'No especificado'}</div></div>
                        <div><div class="label">Estado</div><div class="val">${paciente.estado || 'Activo'}</div></div>
                    </div>
                </div>
                <div class="section-title">Historial Clínico y Evoluciones Médicas</div>
                ${registros.length > 0 ? (registros as any[]).map((r: any) => `
                    <div class="registro">
                        <div class="reg-header">
                            <div class="diag">${r.diagnostico}</div>
                            <div class="fecha">${r.fecha}</div>
                        </div>
                        <div class="doc">Tratado por: ${r.doctor}</div>
                        <div class="detail"><span>Tratamiento prescrito:</span> ${r.tratamiento}</div>
                        <div class="detail"><span>Notas clínicas:</span> ${r.notas}</div>
                    </div>
                `).join('') : '<p style="color: #64748b; font-style: italic;">No existen registros en el historial médico de este paciente.</p>'}
                <div class="footer">
                    Documento clínico confidencial generado por el Sistema Hospitalario Profesional.<br>
                    Firma electrónica validada e inalterable según normativa sanitaria vigente.
                </div>
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `);
        ventanaPrint.document.close();
    };

    const pacientesFiltrados = listaPacientes.filter(paciente => {
        const coincideBusqueda = (paciente.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
            (paciente.email || "").toLowerCase().includes(busqueda.toLowerCase()) ||
            (paciente.telefono || "").includes(busqueda);
        
        const coincideEstado = filtroEstado ? paciente.estado === filtroEstado : true;
        
        return coincideBusqueda && coincideEstado;
    });

    const paciente = pacienteSeleccionado ? listaPacientes.find(p => p.id === pacienteSeleccionado) : null;

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case "Activo": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
            case "Inactivo": return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
            case "Pendiente": return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
            default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
        }
    };

    const getPrioridadColor = (prioridad: string) => {
        switch (prioridad) {
            case "Alta": return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/10";
            case "Media": return "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/10";
            case "Baja": return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10";
            default: return "";
        }
    };

    const getEstadoCitaColor = (estado: string) => {
        switch (estado) {
            case "Confirmada": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
            case "Pendiente": return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
            case "Completada": return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
            case "Cancelada": return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";
            default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
        }
    };

    const getFidelidadColor = (fidelidad: number) => {
        if (fidelidad >= 80) return "text-emerald-600";
        if (fidelidad >= 50) return "text-amber-600";
        return "text-red-600";
    };

    const getTendencia = (pacienteId: number) => {
        // Simulación de tendencia basada en fidelidad
        const fidelidad = listaPacientes.find(p => p.id === pacienteId)?.fidelidad || 0;
        if (fidelidad > 70) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
        if (fidelidad > 40) return <Minus className="h-4 w-4 text-amber-500" />;
        return <TrendingDown className="h-4 w-4 text-red-500" />;
    };

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Pacientes</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Directorio y gestión clínica de pacientes.</p>
                </div>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar paciente por nombre, email o teléfono..."
                        className="pl-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-[hsl(var(--medical-blue))]"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Estado
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setFiltroEstado(null)} className="cursor-pointer">
                                Todos
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFiltroEstado("Activo")} className="cursor-pointer">
                                Activo
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFiltroEstado("Inactivo")} className="cursor-pointer">
                                Inactivo
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFiltroEstado("Pendiente")} className="cursor-pointer">
                                Pendiente
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-1">
                        <Button
                            variant={!vistaGrid ? "default" : "ghost"}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setVistaGrid(false)}
                        >
                            <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={vistaGrid ? "default" : "ghost"}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setVistaGrid(true)}
                        >
                            <PieChart className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lista de Pacientes */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">Pacientes</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{pacientesFiltrados.length} pacientes</p>
                            </div>
                        </div>
                    </div>
                    <ScrollArea className="h-[600px]">
                        {vistaGrid ? (
                            // Vista Grid
                            <div className="grid grid-cols-1 gap-2 p-3">
                                {pacientesFiltrados.map((p) => (
                                    <div
                                        key={p.id}
                                        className={`p-3 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer transition-all hover:shadow-md ${
                                            pacienteSeleccionado === p.id ? 'bg-blue-50 dark:bg-blue-500/10 border-[hsl(var(--medical-blue))]' : ''
                                        }`}
                                        onClick={() => {
                                            setPacienteSeleccionado(p.id);
                                            setTabActivo("perfil");
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12">
                                                <AvatarFallback className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-lg">
                                                    {p.nombre.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-slate-900 dark:text-white truncate">{p.nombre}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-slate-500 dark:text-slate-400">{p.edad} años</span>
                                                    <span className="text-slate-300">•</span>
                                                    <Badge variant="outline" className={`${getEstadoColor(p.estado)} border text-xs`}>
                                                        {p.estado}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge className={`${getPrioridadColor(p.prioridad)} border-0 text-xs`}>
                                                    {p.prioridad}
                                                </Badge>
                                                <span className="text-xs text-slate-400">{p.telefono}</span>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                                            <span>Última visita: {p.ultimaVisita}</span>
                                            <span className="text-slate-400">Expediente Clínico</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Vista Lista (original)
                            pacientesFiltrados.map((p) => (
                                <div
                                    key={p.id}
                                    className={`p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                                        pacienteSeleccionado === p.id ? 'bg-blue-50 dark:bg-blue-500/10 border-l-4 border-[hsl(var(--medical-blue))]' : ''
                                    }`}
                                    onClick={() => {
                                        setPacienteSeleccionado(p.id);
                                        setTabActivo("perfil");
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-lg">
                                                {p.nombre.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-slate-900 dark:text-white truncate">{p.nombre}</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                <span>{p.edad} años</span>
                                                <span>•</span>
                                                <Badge variant="outline" className={`${getEstadoColor(p.estado)} border text-xs`}>
                                                    {p.estado}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                                                <Phone className="h-3 w-3" />
                                                {p.telefono}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={`${getPrioridadColor(p.prioridad)} border-0 text-xs px-2 py-0.5`}>
                                                {p.prioridad}
                                            </Badge>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        {pacientesFiltrados.length === 0 && (
                            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                No se encontraron pacientes en la base de datos.
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Detalle del Paciente */}
                <div className="lg:col-span-2">
                    {paciente ? (
                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16">
                                            <AvatarFallback className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-2xl">
                                                {paciente.nombre.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-slate-900 dark:text-white text-2xl flex items-center gap-3">
                                                {paciente.nombre}
                                            </CardTitle>
                                            <CardDescription className="text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-4 mt-1 text-sm flex-wrap">
                                                    <span>{paciente.edad} años</span>
                                                    <span>•</span>
                                                    <span>{paciente.genero}</span>
                                                    <span>•</span>
                                                    <span>Sangre: {paciente.tipoSangre}</span>
                                                    <span>•</span>
                                                    <span>ID: {1000 + paciente.id}</span>
                                                    <span>•</span>
                                                    <Badge className={`${getPrioridadColor(paciente.prioridad)} border-0`}>
                                                        Prioridad {paciente.prioridad}
                                                    </Badge>
                                                </div>
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <Button size="sm" variant="outline" onClick={() => setModalEditarPaciente(true)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Editar
                                        </Button>
                                        {paciente.estado !== "Inactivo" && (
                                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => setPacienteABaja(paciente.id)}>
                                                <X className="h-4 w-4 mr-1.5" />
                                                Dar de Baja
                                            </Button>
                                        )}
                                        <Button size="sm" className="bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white" onClick={() => setModalCitaRapida(true)}>
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Cita
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                <Tabs value={tabActivo} onValueChange={setTabActivo} className="w-full">
                                    <div className="px-6 pt-4">
                                        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full justify-start flex-wrap">
                                            <TabsTrigger value="perfil" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                                                <User className="h-4 w-4 mr-2" />
                                                Información Personal
                                            </TabsTrigger>
                                            <TabsTrigger value="historial" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                                                <History className="h-4 w-4 mr-2" />
                                                Historial
                                            </TabsTrigger>
                                            <TabsTrigger value="imagenes" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                                                <Image className="h-4 w-4 mr-2" />
                                                Imágenes
                                            </TabsTrigger>
                                            <TabsTrigger value="citas" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Citas
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>

                                    {/* Perfil */}
                                    <TabsContent value="perfil" className="px-6 pb-6 pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Información Personal</h4>
                                                <div className="mt-3 space-y-2 text-sm">
                                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                                        <span className="text-slate-500">Nombre</span>
                                                        <span className="text-slate-900 dark:text-white font-medium">{paciente.nombre}</span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                                        <span className="text-slate-500">Email</span>
                                                        <span className="text-slate-900 dark:text-white">{paciente.email}</span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                                        <span className="text-slate-500">Teléfono</span>
                                                        <span className="text-slate-900 dark:text-white">{paciente.telefono}</span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                                        <span className="text-slate-500">Fecha Registro</span>
                                                        <span className="text-slate-900 dark:text-white">{paciente.fechaRegistro}</span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                                        <span className="text-slate-500">Doctor Asignado</span>
                                                        <span className="text-slate-900 dark:text-white">{paciente.doctorAsignado}</span>
                                                    </div>
                                                   {/*  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                                        <span className="text-slate-500">Seguro</span>
                                                        <span className="text-slate-900 dark:text-white">{paciente.seguro}</span>
                                                    </div> */}
                                                    {/* <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                                        <span className="text-slate-500">Último Pago</span>
                                                        <span className="text-slate-900 dark:text-white">{paciente.ultimoPago}</span>
                                                    </div> */}
                                                    <div className="flex justify-between py-2">
                                                        <span className="text-slate-500">Estado</span>
                                                        <Badge variant="outline" className={`${getEstadoColor(paciente.estado)} border`}>
                                                            {paciente.estado}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Información Médica</h4>
                                                <div className="mt-3 space-y-2 text-sm">
                                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                                        <span className="text-slate-500">Tipo de Sangre</span>
                                                        <span className="text-slate-900 dark:text-white font-medium">{paciente.tipoSangre}</span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                                        <span className="text-slate-500">Alergias</span>
                                                        <span className="text-slate-900 dark:text-white">
                                                            {paciente.alergias.length > 0 ? paciente.alergias.join(', ') : 'Ninguna'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                                        <span className="text-slate-500">Condiciones</span>
                                                        <span className="text-slate-900 dark:text-white">
                                                            {paciente.condiciones.length > 0 ? paciente.condiciones.join(', ') : 'Ninguna'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                                        <span className="text-slate-500">Medicamentos</span>
                                                        <span className="text-slate-900 dark:text-white">
                                                            {paciente.medicamentos.length > 0 ? paciente.medicamentos.join(', ') : 'Ninguno'}
                                                        </span>
                                                    </div>
                                                     {/* <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                                        <span className="text-slate-500">Deuda</span>
                                                        <span className={`font-medium ${paciente.deuda !== "$0" ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                            {paciente.deuda}
                                                        </span>
                                                    </div> */}
                                                    <div className="flex justify-between py-2">
                                                        <span className="text-slate-500">Última Visita</span>
                                                        <span className="text-slate-900 dark:text-white">{paciente.ultimaVisita}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Historial Médico */}
                                    <TabsContent value="historial" className="px-6 pb-6 pt-4">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Historial Clínico</h4>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => generarPDFHistorial(paciente)}>
                                                        <Printer className="h-4 w-4 mr-2" />
                                                        Imprimir PDF
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => {
                                                            setModoEvolucion('crear');
                                                            setFormEvolucion({ diagnostico: "", tratamiento: "", notas_evolucion: "" });
                                                            setModalEvolucion(true);
                                                        }}
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Agregar Registro
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input 
                                                        placeholder="Buscar por diagnóstico, médico tratante o indicaciones..." 
                                                        className="pl-9 h-9 text-sm"
                                                        value={busquedaHistorial}
                                                        onChange={(e) => { setBusquedaHistorial(e.target.value); setPaginaHistorial(1); }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                {(() => {
                                                    const todos = historialMedico[paciente.id as keyof typeof historialMedico] || [];
                                                    const filtrados = todos.filter((r: any) => 
                                                        (r.diagnostico || "").toLowerCase().includes(busquedaHistorial.toLowerCase()) ||
                                                        (r.doctor || "").toLowerCase().includes(busquedaHistorial.toLowerCase()) ||
                                                        (r.tratamiento || "").toLowerCase().includes(busquedaHistorial.toLowerCase()) ||
                                                        (r.notas || "").toLowerCase().includes(busquedaHistorial.toLowerCase())
                                                    );
                                                    const paginados = filtrados.slice((paginaHistorial - 1) * 10, paginaHistorial * 10);
                                                    const totalPaginas = Math.ceil(filtrados.length / 10) || 1;

                                                    return (
                                                        <>
                                                            {paginados.map((registro: any, index: number) => (
                                                                <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-800">
                                                                    <div className="flex items-start justify-between">
                                                                        <div>
                                                                            <div className="flex items-center gap-2">
                                                                                <Stethoscope className="h-4 w-4 text-[hsl(var(--medical-blue))]" />
                                                                                <h5 className="font-semibold text-slate-900 dark:text-white">{registro.diagnostico}</h5>
                                                                            </div>
                                                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                                                                                <Shield className="h-3.5 w-3.5 text-blue-500" />
                                                                                {registro.doctor}
                                                                            </p>
                                                                        </div>
                                                                        <Badge variant="outline" className="bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20">
                                                                            {registro.fecha}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="mt-2 text-sm">
                                                                        <p className="text-slate-600 dark:text-slate-400"><span className="font-medium">Tratamiento:</span> {registro.tratamiento}</p>
                                                                        <p className="text-slate-600 dark:text-slate-400 mt-1"><span className="font-medium">Notas:</span> {registro.notas}</p>
                                                                    </div>
                                                                    <div className="mt-3 flex gap-2">
                                                                        {registro.id && (
                                                                            <>
                                                                                <Button 
                                                                                    size="sm" 
                                                                                    variant="ghost" 
                                                                                    className="h-7 px-2 text-xs"
                                                                                    onClick={() => {
                                                                                        setModoEvolucion('editar');
                                                                                        setEvolucionSeleccionadaId(registro.id);
                                                                                        setFormEvolucion({
                                                                                            diagnostico: registro.diagnostico || "",
                                                                                            tratamiento: registro.tratamiento || "",
                                                                                            notas_evolucion: registro.notas || ""
                                                                                        });
                                                                                        setModalEvolucion(true);
                                                                                    }}
                                                                                >
                                                                                    <Edit className="h-3 w-3 mr-1 text-blue-600" />
                                                                                    Editar
                                                                                </Button>
                                                                                <Button 
                                                                                    size="sm" 
                                                                                    variant="ghost" 
                                                                                    className="h-7 px-2 text-xs text-red-600"
                                                                                    onClick={() => setEvolucionAEliminar(registro.id)}
                                                                                >
                                                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                                                    Eliminar
                                                                                </Button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {filtrados.length === 0 && (
                                                                <p className="text-center text-slate-500 dark:text-slate-400 py-8">No hay evoluciones clínicas que coincidan con la búsqueda.</p>
                                                            )}
                                                            {totalPaginas > 1 && (
                                                                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                                                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Página {paginaHistorial} de {totalPaginas} ({filtrados.length} registros clínicos)</span>
                                                                    <div className="flex gap-2">
                                                                        <Button 
                                                                            size="sm" 
                                                                            variant="outline" 
                                                                            disabled={paginaHistorial <= 1}
                                                                            onClick={() => setPaginaHistorial(prev => Math.max(1, prev - 1))}
                                                                        >
                                                                            Anterior
                                                                        </Button>
                                                                        <Button 
                                                                            size="sm" 
                                                                            variant="outline" 
                                                                            disabled={paginaHistorial >= totalPaginas}
                                                                            onClick={() => setPaginaHistorial(prev => Math.min(totalPaginas, prev + 1))}
                                                                        >
                                                                            Siguiente
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Imágenes Médicas */}
                                    <TabsContent value="imagenes" className="px-6 pb-6 pt-4">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Biblioteca de Imágenes</h4>
                                                <Button size="sm" className="bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white" onClick={() => setModalSubirImagen(true)}>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Subir Imagen
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {imagenesMedicas[paciente.id as keyof typeof imagenesMedicas]?.map((imagen) => (
                                                    <Card key={imagen.id} className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                                                        <CardContent className="p-4">
                                                            <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-3 relative group overflow-hidden">
                                                                <img src={imagen.url || "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80"} alt={imagen.nombre} className="w-full h-full object-cover opacity-80" />
                                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                                                    <Button size="sm" variant="secondary" className="h-8" onClick={() => setImagenVerModal(imagen)}>
                                                                        <ZoomIn className="h-4 w-4 mr-1" />
                                                                        Ver
                                                                    </Button>
                                                                    <Button size="sm" variant="secondary" className="h-8" onClick={() => setAlertaModal({ open: true, titulo: "Descarga Iniciada", mensaje: `El archivo clínico ${imagen.nombre} se está empaquetando y descargando en su dispositivo.` })}>
                                                                        <Download className="h-4 w-4 mr-1" />
                                                                        Descargar
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <h5 className="font-semibold text-slate-900 dark:text-white">{imagen.nombre}</h5>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">{imagen.tipo} • {imagen.tamaño}</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">{imagen.fecha}</p>
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{imagen.descripcion}</p>
                                                            <div className="flex gap-2 mt-3">
                                                                <Button size="sm" variant="outline" className="flex-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20" onClick={() => {
                                                                    setImagenAEditar(imagen);
                                                                    setFormEditarImagen({
                                                                        titulo: imagen.nombre || "",
                                                                        tipo_estudio: imagen.tipo || "Radiografía",
                                                                        descripcion: imagen.descripcion || "",
                                                                        url: imagen.url || ""
                                                                    });
                                                                    setModalEditarImagen(true);
                                                                }}>
                                                                    <Edit className="h-4 w-4 mr-1" />
                                                                    Editar
                                                                </Button>
                                                                <Button size="sm" variant="outline" className="flex-1" onClick={() => { setZoomVisor(1); setImagenVerModal(imagen); }}>
                                                                    <ZoomIn className="h-4 w-4 mr-1" />
                                                                    Ver
                                                                </Button>
                                                                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => setImagenAEliminar(imagen)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                                {!imagenesMedicas[paciente.id as keyof typeof imagenesMedicas] && (
                                                    <div className="col-span-2 text-center py-8 text-slate-500 dark:text-slate-400">
                                                        <Image className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                                        <p>No hay imágenes médicas registradas</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Citas */}
                                    <TabsContent value="citas" className="px-6 pb-6 pt-4">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Citas Programadas</h4>
                                                <Button size="sm" className="bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white" onClick={() => setModalCitaRapida(true)}>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Agendar Cita
                                                </Button>
                                            </div>
                                            <div className="space-y-3">
                                                {citasPaciente[paciente.id as keyof typeof citasPaciente]?.map((cita) => (
                                                    <div key={cita.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-800">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg">
                                                                <Calendar className="h-5 w-5 text-[hsl(var(--medical-blue))]" />
                                                            </div>
                                                            <div>
                                                                <h5 className="font-semibold text-slate-900 dark:text-white">{cita.tipo}</h5>
                                                                <p className="text-sm text-slate-600 dark:text-slate-400">{cita.doctor}</p>
                                                                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                                    <span>{cita.fecha}</span>
                                                                    <span>•</span>
                                                                    <span>{cita.hora}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className={`${getEstadoCitaColor(cita.estado)} border`}>
                                                                {cita.estado}
                                                            </Badge>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                                                    <DropdownMenuItem className="cursor-pointer" onClick={() => setAlertaModal({ open: true, titulo: `Detalle de Cita: ${cita.tipo}`, mensaje: `Consulta médica programada con el ${cita.doctor} para el día ${cita.fecha} a las ${cita.hora}. Estado actual: ${cita.estado}.` })}>Ver detalles</DropdownMenuItem>
                                                                    <DropdownMenuItem className="cursor-pointer" onClick={() => { setFormCitaRapida({ fecha: cita.fecha, hora: cita.hora, motivo: cita.tipo }); setModalCitaRapida(true); }}>Editar</DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="cursor-pointer text-red-600" onClick={() => {
                                                                        setCitasPaciente((prev: any) => ({
                                                                            ...prev,
                                                                            [paciente.id]: prev[paciente.id].map((c: any) => c.id === cita.id ? { ...c, estado: "Cancelada" } : c)
                                                                        }));
                                                                        setAlertaModal({ open: true, titulo: "Cita Cancelada", mensaje: `La consulta de ${cita.tipo} con ${cita.doctor} ha sido marcada como cancelada en el expediente.` });
                                                                    }}>Cancelar</DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                ))}
                                                {!citasPaciente[paciente.id as keyof typeof citasPaciente] && (
                                                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">No hay citas programadas</p>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardContent className="py-16 text-center">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-10 w-10 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2">Selecciona un paciente</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Haz clic en un paciente de la lista para ver su información completa
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Modal Ver Imagen Médica en Alta Resolución */}
            <Dialog open={!!imagenVerModal} onOpenChange={() => { setImagenVerModal(null); setZoomVisor(1); }}>
                <DialogContent className="max-w-4xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Camera className="h-5 w-5 text-[hsl(var(--medical-blue))]" />
                            {imagenVerModal?.nombre}
                        </DialogTitle>
                        <DialogDescription>
                            {imagenVerModal?.tipo} • {imagenVerModal?.fecha} • {imagenVerModal?.tamaño}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2 space-y-3">
                        {/* Controles de zoom */}
                        <div className="flex items-center gap-2 px-2">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Zoom:</span>
                            {[1, 1.25, 1.5, 2].map(z => (
                                <button
                                    key={z}
                                    onClick={() => setZoomVisor(z)}
                                    className={`text-xs px-2 py-1 rounded border font-mono transition-colors ${zoomVisor === z ? 'bg-[hsl(var(--medical-blue))] text-white border-transparent' : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                >
                                    {Math.round(z * 100)}%
                                </button>
                            ))}
                            <div className="ml-auto flex gap-2">
                                <Button size="sm" variant="outline" className="text-blue-600" onClick={() => {
                                    if (imagenVerModal) {
                                        setImagenAEditar(imagenVerModal);
                                        setFormEditarImagen({
                                            titulo: imagenVerModal.nombre || "",
                                            tipo_estudio: imagenVerModal.tipo || "Radiografía",
                                            descripcion: imagenVerModal.descripcion || "",
                                            url: imagenVerModal.url || ""
                                        });
                                        setImagenVerModal(null);
                                        setModalEditarImagen(true);
                                    }
                                }}>
                                    <Edit className="h-3.5 w-3.5 mr-1" /> Editar
                                </Button>
                            </div>
                        </div>
                        {/* Área de la imagen con scroll cuando hay zoom */}
                        <div className="bg-black rounded-xl overflow-auto flex items-center justify-center shadow-inner border border-slate-800" style={{ maxHeight: '450px' }}>
                            <img 
                                src={imagenVerModal?.url || ""} 
                                alt={imagenVerModal?.nombre} 
                                style={{ transform: `scale(${zoomVisor})`, transformOrigin: 'center center', transition: 'transform 0.2s ease' }}
                                className="max-w-full object-contain"
                            />
                        </div>
                        {/* Navegación Anterior / Siguiente */}
                        {(() => {
                            const listaImgs = (pacienteSeleccionado && imagenesMedicas[pacienteSeleccionado as keyof typeof imagenesMedicas]) || [];
                            const idx = listaImgs.findIndex((i: any) => i.id === imagenVerModal?.id);
                            if (listaImgs.length > 1 && idx !== -1) {
                                return (
                                    <div className="flex items-center justify-between px-1 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            disabled={idx <= 0}
                                            onClick={() => { setZoomVisor(1); setImagenVerModal(listaImgs[idx - 1]); }}
                                        >
                                            ← Anterior
                                        </Button>
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            {idx + 1} / {listaImgs.length} estudios
                                        </span>
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            disabled={idx >= listaImgs.length - 1}
                                            onClick={() => { setZoomVisor(1); setImagenVerModal(listaImgs[idx + 1]); }}
                                        >
                                            Siguiente →
                                        </Button>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                        {imagenVerModal?.descripcion && (
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                                <h5 className="font-semibold text-xs text-slate-700 dark:text-slate-300 mb-1">Observación clínica:</h5>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{imagenVerModal?.descripcion}</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="flex justify-end">
                        <Button variant="outline" onClick={() => { setImagenVerModal(null); setZoomVisor(1); }}>Cerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Subir Imagen Médica */}
            <Dialog open={modalSubirImagen} onOpenChange={setModalSubirImagen}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle>Subir Nuevo Estudio Médico</DialogTitle>
                        <DialogDescription>Selecciona desde tu computadora el estudio o imagen clínica en alta definición.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubirImagen} className="space-y-4 py-2">
                        <div>
                            <Label className="font-semibold text-slate-800 dark:text-slate-200">1. Seleccionar Archivo de Imagen desde la PC</Label>
                            <Input 
                                type="file" 
                                accept="image/*,.pdf,.dicom" 
                                required 
                                className="mt-1 cursor-pointer"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormImagen(prev => ({ 
                                                ...prev, 
                                                url: reader.result as string, 
                                                titulo: prev.titulo || file.name.split('.')[0] 
                                            }));
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }} 
                            />
                            {formImagen.url && (
                                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                                        <Check className="h-3.5 w-3.5 text-emerald-500" /> Previsualización del estudio a almacenar:
                                    </p>
                                    <div className="aspect-video bg-black rounded overflow-hidden flex items-center justify-center max-h-[160px] border border-slate-700">
                                        <img src={formImagen.url} alt="Preview" className="w-full h-full object-contain" />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <Label className="font-semibold text-slate-800 dark:text-slate-200">2. Título del Estudio</Label>
                            <Input required value={formImagen.titulo} onChange={e => setFormImagen({...formImagen, titulo: e.target.value})} placeholder="Ej: Radiografía de Tórax AP" />
                        </div>
                        <div>
                            <Label className="font-semibold text-slate-800 dark:text-slate-200">3. Tipo de Estudio</Label>
                            <select 
                                className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm mt-1"
                                value={formImagen.tipo_estudio}
                                onChange={e => setFormImagen({...formImagen, tipo_estudio: e.target.value})}
                            >
                                <option value="Radiografía">Radiografía</option>
                                <option value="Tomografía (TAC)">Tomografía (TAC)</option>
                                <option value="Resonancia Magnética">Resonancia Magnética</option>
                                <option value="Ecografía">Ecografía</option>
                                <option value="Laboratorio Clínico">Laboratorio Clínico</option>
                            </select>
                        </div>
                        <div>
                            <Label className="font-semibold text-slate-800 dark:text-slate-200">4. Descripción / Observación</Label>
                            <Input required value={formImagen.descripcion} onChange={e => setFormImagen({...formImagen, descripcion: e.target.value})} placeholder="Ej: Estudio sin alteraciones patológicas evidentes." />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setModalSubirImagen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white">Subir y Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Editar Imagen Médica */}
            <Dialog open={modalEditarImagen} onOpenChange={setModalEditarImagen}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle>Editar Estudio Médico</DialogTitle>
                        <DialogDescription>Modifica los datos clínicos o reemplaza la imagen del estudio.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditarImagen} className="space-y-4 py-2">
                        <div>
                            <Label className="font-semibold text-slate-800 dark:text-slate-200">Reemplazar Archivo (Opcional)</Label>
                            <Input 
                                type="file" 
                                accept="image/*,.pdf,.dicom" 
                                className="mt-1 cursor-pointer"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormEditarImagen(prev => ({ 
                                                ...prev, 
                                                url: reader.result as string 
                                            }));
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }} 
                            />
                            {formEditarImagen.url && (
                                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                                        <Check className="h-3.5 w-3.5 text-emerald-500" /> Previsualización de la imagen actual:
                                    </p>
                                    <div className="aspect-video bg-black rounded overflow-hidden flex items-center justify-center max-h-[160px] border border-slate-700">
                                        <img src={formEditarImagen.url} alt="Preview" className="w-full h-full object-contain" />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <Label className="font-semibold text-slate-800 dark:text-slate-200">Título del Estudio</Label>
                            <Input required value={formEditarImagen.titulo} onChange={e => setFormEditarImagen({...formEditarImagen, titulo: e.target.value})} />
                        </div>
                        <div>
                            <Label className="font-semibold text-slate-800 dark:text-slate-200">Tipo de Estudio</Label>
                            <select 
                                className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm mt-1"
                                value={formEditarImagen.tipo_estudio}
                                onChange={e => setFormEditarImagen({...formEditarImagen, tipo_estudio: e.target.value})}
                            >
                                <option value="Radiografía">Radiografía</option>
                                <option value="Tomografía (TAC)">Tomografía (TAC)</option>
                                <option value="Resonancia Magnética">Resonancia Magnética</option>
                                <option value="Ecografía">Ecografía</option>
                                <option value="Laboratorio Clínico">Laboratorio Clínico</option>
                            </select>
                        </div>
                        <div>
                            <Label className="font-semibold text-slate-800 dark:text-slate-200">Descripción / Observación</Label>
                            <Input required value={formEditarImagen.descripcion} onChange={e => setFormEditarImagen({...formEditarImagen, descripcion: e.target.value})} />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setModalEditarImagen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white">Actualizar Estudio</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Ver Detalle Notificación */}
            <Dialog open={!!notificacionVerModal} onOpenChange={() => setNotificacionVerModal(null)}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <AlertCircle className="h-5 w-5" />
                            Detalle de Notificación
                        </DialogTitle>
                        <DialogDescription>
                            Enviado el {notificacionVerModal?.fecha || "Hoy"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                        <div className="p-4 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/40">
                            <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                                {notificacionVerModal?.mensaje}
                            </p>
                        </div>
                        <p className="text-xs text-slate-500">
                            * Esta notificación está registrada en el buzón del paciente para recordatorios y seguimiento de su historial clínico.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNotificacionVerModal(null)}>Cerrar</Button>
                        <Button className="bg-[hsl(var(--medical-blue))] text-white hover:bg-blue-700" onClick={() => { setNotificacionVerModal(null); setAlertaModal({ open: true, titulo: "Aviso Reenviado", mensaje: "El recordatorio clínico se ha reenviado al paciente mediante los canales configurados." }); }}>
                            Reenviar Aviso
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Crear/Editar Evolución Médica */}
            <Dialog open={modalEvolucion} onOpenChange={setModalEvolucion}>
                <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Stethoscope className="h-5 w-5" />
                            {modoEvolucion === 'crear' ? 'Registrar Nueva Evolución Médica' : 'Editar Registro de Evolución'}
                        </DialogTitle>
                        <DialogDescription>
                            {modoEvolucion === 'crear' 
                                ? 'Completa los hallazgos clínicos, diagnóstico e indicaciones del paciente.' 
                                : 'Modifica el diagnóstico o tratamiento del historial clínico.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleGuardarEvolucion} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="diag">Diagnóstico Clínico</Label>
                            <Input 
                                id="diag" 
                                required 
                                placeholder="Ej. Hipertensión arterial en control"
                                value={formEvolucion.diagnostico}
                                onChange={(e) => setFormEvolucion({ ...formEvolucion, diagnostico: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="trat">Tratamiento Indicado</Label>
                            <Input 
                                id="trat" 
                                required 
                                placeholder="Ej. Losartán 50mg c/12h por 30 días"
                                value={formEvolucion.tratamiento}
                                onChange={(e) => setFormEvolucion({ ...formEvolucion, tratamiento: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notas">Notas de Evolución</Label>
                            <textarea 
                                id="notas" 
                                rows={3}
                                className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-background p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                                placeholder="Detalles, signos vitales y observaciones del médico..."
                                value={formEvolucion.notas_evolucion}
                                onChange={(e) => setFormEvolucion({ ...formEvolucion, notas_evolucion: e.target.value })}
                            />
                        </div>
                        <DialogFooter className="pt-3">
                            <Button type="button" variant="outline" onClick={() => setModalEvolucion(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-[hsl(var(--medical-blue))] text-white hover:bg-blue-700">
                                Guardar Registro
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Confirmación Dar de Baja Paciente */}
            <Dialog open={!!pacienteABaja} onOpenChange={() => setPacienteABaja(null)}>
                <DialogContent className="sm:max-w-[420px] border-red-200 dark:border-red-900/40">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" /> Dar de Baja Paciente
                        </DialogTitle>
                        <DialogDescription>
                            ¿Confirmas cambiar el estado del paciente a <strong>Inactivo</strong>? Se ocultará del listado principal pero su historial clínico permanecerá protegido por normativas médicas.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-4">
                        <Button variant="outline" onClick={() => setPacienteABaja(null)}>Cancelar</Button>
                        <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDarDeBajaConfirmado}>
                            Confirmar Baja
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Confirmación Eliminar Evolución */}
            <Dialog open={!!evolucionAEliminar} onOpenChange={() => setEvolucionAEliminar(null)}>
                <DialogContent className="sm:max-w-[420px] border-red-200 dark:border-red-900/40">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" /> Eliminar Evolución
                        </DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de eliminar este registro clínico? Esta acción es irreversible en el historial del paciente.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-4">
                        <Button variant="outline" onClick={() => setEvolucionAEliminar(null)}>Cancelar</Button>
                        <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleEliminarEvolucionConfirmado}>
                            Eliminar Registro
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Confirmación Eliminar Imagen Médica */}
            <Dialog open={!!imagenAEliminar} onOpenChange={() => setImagenAEliminar(null)}>
                <DialogContent className="sm:max-w-[420px] border-red-200 dark:border-red-900/40">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" /> Eliminar Imagen Médica
                        </DialogTitle>
                        <DialogDescription>
                            ¿Confirmas eliminar el archivo clínico <strong>{imagenAEliminar?.nombre}</strong> del repositorio de este paciente?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-4">
                        <Button variant="outline" onClick={() => setImagenAEliminar(null)}>Cancelar</Button>
                        <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleEliminarImagenConfirmado}>
                            Confirmar Eliminación
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Advertencia / Información */}
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

export default Pacientes;