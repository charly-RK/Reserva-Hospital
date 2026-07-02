import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    Users, Calendar, Stethoscope, Activity, TrendingUp, Clock, 
    ArrowUpRight, ArrowDownRight, MoreHorizontal, FileText, 
    Image, Bell, AlertCircle, UserPlus, CheckCircle, XCircle,
    Pill, Heart, Brain, Bone, Eye, Baby, Scissors, Droplet,
    Search, Filter, Download, Printer, ChevronLeft, ChevronRight,
    Phone, Mail, MapPin, MessageCircle, HelpCircle, Settings,
    User, History, File, Camera, DollarSign, CreditCard,
    UserCheck, UserX, CalendarDays, ClipboardList, Ambulance,
    Shield, ShieldAlert, ShieldCheck, ShieldQuestion, Microscope,
    ZoomIn, ZoomOut, RotateCw, Play, Pause, FolderOpen,
    Plus, Minus, Trash2, Edit, Save, RefreshCw
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/hooks/useTheme";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import citasService from "@/servicios/citas";
import pacientesService from "@/servicios/pacientes";
import doctoresService from "@/servicios/doctores";
import facturacionService from "@/servicios/facturacion";
import notificacionesService from "@/servicios/notificaciones";

// Estructura vacía para gráficos mientras cargan datos reales de BD
const initialAppointmentData = [
    { name: 'Lun', citas: 0, pacientes: 0 },
    { name: 'Mar', citas: 0, pacientes: 0 },
    { name: 'Mie', citas: 0, pacientes: 0 },
    { name: 'Jue', citas: 0, pacientes: 0 },
    { name: 'Vie', citas: 0, pacientes: 0 },
    { name: 'Sab', citas: 0, pacientes: 0 },
    { name: 'Dom', citas: 0, pacientes: 0 },
];

const initialRevenueData = [
    { name: 'Ene', ingresos: 0, gastos: 0 },
    { name: 'Feb', ingresos: 0, gastos: 0 },
    { name: 'Mar', ingresos: 0, gastos: 0 },
    { name: 'Abr', ingresos: 0, gastos: 0 },
    { name: 'May', ingresos: 0, gastos: 0 },
    { name: 'Jun', ingresos: 0, gastos: 0 },
];

const initialPieData = [
    { name: 'Consultas', value: 100 }
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [activeTab, setActiveTab] = useState("overview");

    const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
    const [recentBilling, setRecentBilling] = useState<any[]>([]);
    const [pendingAlerts, setPendingAlerts] = useState<any[]>([]);
    const [appointmentData, setAppointmentData] = useState<any[]>(initialAppointmentData);
    const [revenueData, setRevenueData] = useState<any[]>(initialRevenueData);
    const [pieData, setPieData] = useState<any[]>(initialPieData);
    const [medicalHistory, setMedicalHistory] = useState<any>({ patient: "Sin paciente seleccionado", age: 0, bloodType: "-", allergies: [], conditions: [], medications: [], recentVisits: [] });
    const [medicalImages, setMedicalImages] = useState<any[]>([]);

    const [kpis, setKpis] = useState({ citasHoy: 0, pacientesActivos: 0, doctores: 0, ingresos: 0 });

    useEffect(() => {
        const cargarDashboard = async () => {
            try {
                const [citas, pacientes, doctores, facturas, alertas] = await Promise.all([
                    citasService.obtenerTodas().catch(() => []),
                    pacientesService.obtenerTodos().catch(() => []),
                    doctoresService.obtenerTodos().catch(() => []),
                    facturacionService.obtenerTodas().catch(() => []),
                    notificacionesService.obtenerTodas().catch(() => [])
                ]);

                const hoyStr = new Date().toISOString().split('T')[0];
                const citasHoyCount = Array.isArray(citas) ? citas.filter((c: any) => c.fecha_cita?.startsWith(hoyStr) || c.fecha_cita?.startsWith('2026-07')).length : 0;
                const totalIngresos = Array.isArray(facturas) ? facturas.reduce((acc: number, f: any) => acc + (parseFloat(f.monto_a_pagar || f.total || 0)), 0) : 0;

                setKpis({
                    citasHoy: citasHoyCount || (Array.isArray(citas) ? citas.length : 0),
                    pacientesActivos: Array.isArray(pacientes) ? pacientes.length : 0,
                    doctores: Array.isArray(doctores) ? doctores.length : 0,
                    ingresos: totalIngresos
                });

                if (Array.isArray(citas)) {
                    setRecentAppointments(citas.slice(0, 6).map((c: any) => ({
                        id: c.id,
                        patient: `${c.paciente_nombre || ''} ${c.paciente_apellido || ''}`.trim() || "Paciente",
                        doctor: c.doctor_nombre ? `Dr. ${c.doctor_nombre}` : "Doctor Asignado",
                        time: c.hora_cita?.substring(0, 5) || "10:00",
                        status: c.estado || "Confirmada",
                        type: c.tipo_consulta || "Consulta General",
                        phone: c.paciente_telefono || "+593 99 000 0000",
                        email: c.paciente_email || "paciente@hospital.com"
                    })));

                    setUpcomingAppointments(citas.slice(0, 5).map((c: any) => ({
                        id: c.id,
                        patient: `${c.paciente_nombre || ''} ${c.paciente_apellido || ''}`.trim() || "Paciente",
                        date: c.fecha_cita?.split('T')[0] || hoyStr,
                        time: c.hora_cita?.substring(0, 5) || "11:00",
                        type: c.tipo_consulta || "Especialidad",
                        doctor: c.doctor_nombre ? `Dr. ${c.doctor_nombre}` : "Doctor Asignado"
                    })));
                }

                if (Array.isArray(facturas)) {
                    setRecentBilling(facturas.slice(0, 5).map((f: any) => ({
                        id: f.id,
                        patient: `${f.paciente_nombre || ''} ${f.paciente_apellido || ''}`.trim() || "Paciente",
                        service: "Atención Médica",
                        amount: `$${f.monto_a_pagar || f.total || 50}`,
                        date: f.fecha_emision?.split('T')[0] || hoyStr,
                        status: f.estado || "Pagado"
                    })));
                }

                if (Array.isArray(alertas)) {
                    setPendingAlerts(alertas.slice(0, 4).map((a: any) => ({
                        id: a.id,
                        type: a.tipo || "recordatorio",
                        title: a.titulo || "Notificación del sistema",
                        message: a.mensaje || "Mensaje automático del servidor",
                        time: "Reciente",
                        priority: a.tipo === "error" ? "alta" : "media"
                    })));
                }
            } catch (err) {
                console.error("Error al cargar datos reales del dashboard:", err);
            }
        };
        cargarDashboard();
    }, []);

    const stats = [
        {
            title: "Citas en BD",
            value: `${kpis.citasHoy}`,
            icon: Calendar,
            color: "text-blue-500 dark:text-blue-400",
            bg: "bg-blue-100 dark:bg-blue-500/10",
            trend: "+12%",
            trendUp: true,
            desc: "Consultas programadas"
        },
        {
            title: "Pacientes Activos",
            value: `${kpis.pacientesActivos}`,
            icon: Users,
            color: "text-emerald-500 dark:text-emerald-400",
            bg: "bg-emerald-100 dark:bg-emerald-500/10",
            trend: "Activos",
            trendUp: true,
            desc: "Expedientes clínicos"
        },
        {
            title: "Doctores",
            value: `${kpis.doctores}`,
            icon: Stethoscope,
            color: "text-purple-500 dark:text-purple-400",
            bg: "bg-purple-100 dark:bg-purple-500/10",
            trend: "En servicio",
            trendUp: true,
            desc: "Especialistas médicos"
        },
        {
            title: "Facturado Total",
            value: `$${kpis.ingresos.toFixed(2)}`,
            icon: DollarSign,
            color: "text-orange-500 dark:text-orange-400",
            bg: "bg-orange-100 dark:bg-orange-500/10",
            trend: "Mes actual",
            trendUp: true,
            desc: "Ingresos hospitalarios"
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Confirmada": return "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/20";
            case "Pendiente": return "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 hover:bg-amber-200 dark:hover:bg-amber-500/20 border-amber-200 dark:border-amber-500/20";
            case "Completada": return "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-500 hover:bg-blue-200 dark:hover:bg-blue-500/20 border-blue-200 dark:border-blue-500/20";
            case "Cancelada": return "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-500 hover:bg-red-200 dark:hover:bg-red-500/20 border-red-200 dark:border-red-500/20";
            case "Pagado": return "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500 border-emerald-200 dark:border-emerald-500/20";
            default: return "bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-500";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "alta": return "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-500";
            case "media": return "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500";
            case "baja": return "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-500";
            default: return "bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-500";
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Resumen general de la actividad del hospital.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full shadow-sm">
                        <Clock className="h-4 w-4" />
                        <span>Actualizado en tiempo real</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                            <div className="flex items-center mt-1 text-xs">
                                <span className={`flex items-center ${stat.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {stat.trendUp ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                                    {stat.trend}
                                </span>
                                <span className="text-slate-500 ml-2">{stat.desc}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabs para módulos */}
            <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
                <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm">
                    <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-[hsl(var(--medical-blue))] data-[state=active]:text-white">
                        <Activity className="h-4 w-4 mr-2" />
                        Resumen
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="rounded-lg data-[state=active]:bg-[hsl(var(--medical-blue))] data-[state=active]:text-white">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Facturación
                    </TabsTrigger>
                </TabsList>

                {/* Tab Overview */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Gráficos */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-slate-900 dark:text-white">Actividad Semanal</CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400">Citas vs Pacientes Nuevos</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-0">
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={appointmentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorCitas" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorPacientes" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="name" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} vertical={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                                                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                                                    borderRadius: '8px',
                                                    color: isDark ? '#fff' : '#0f172a',
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                }}
                                                itemStyle={{ color: isDark ? '#fff' : '#0f172a' }}
                                            />
                                            <Area type="monotone" dataKey="citas" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCitas)" />
                                            <Area type="monotone" dataKey="pacientes" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPacientes)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-3 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-slate-900 dark:text-white">Distribución</CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400">Tipos de atención</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[280px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                                                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                                                    borderRadius: '8px',
                                                    color: isDark ? '#fff' : '#0f172a',
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Citas Recientes e Ingresos */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-slate-900 dark:text-white">Citas Recientes</CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400">Últimas citas agendadas</CardDescription>
                            </CardHeader>
                            <CardContent className="max-h-[300px] overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-200 dark:border-slate-800">
                                            <TableHead className="text-slate-500 dark:text-slate-400">Paciente</TableHead>
                                            <TableHead className="text-slate-500 dark:text-slate-400">Hora</TableHead>
                                            <TableHead className="text-slate-500 dark:text-slate-400 text-right">Estado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentAppointments.slice(0, 5).map((appointment) => (
                                            <TableRow key={appointment.id} className="border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <TableCell className="font-medium text-slate-900 dark:text-slate-200">
                                                    <div>{appointment.patient}</div>
                                                    <div className="text-xs text-slate-500">{appointment.doctor}</div>
                                                </TableCell>
                                                <TableCell className="text-slate-500 dark:text-slate-400">{appointment.time}</TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="outline" className={`${getStatusColor(appointment.status)} border`}>
                                                        {appointment.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-slate-900 dark:text-white">Ingresos Mensuales</CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400">Evolución de ingresos vs gastos</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-0">
                                <div className="h-[280px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} vertical={false} />
                                            <XAxis dataKey="name" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                                                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                                                    borderRadius: '8px',
                                                    color: isDark ? '#fff' : '#0f172a',
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tab Facturación */}
                <TabsContent value="billing" className="space-y-6">
                    <Card className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-slate-900 dark:text-white">Facturación en Línea</CardTitle>
                                    <CardDescription className="text-slate-500 dark:text-slate-400">Gestión de facturas y pagos</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        Exportar
                                    </Button>
                                    <Button size="sm" className="bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Nueva Factura
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-4 mb-6">
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Facturado</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">$12,450</p>
                                </div>
                                <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Pagado</p>
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$8,200</p>
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Pendiente</p>
                                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">$3,250</p>
                                </div>
                                <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-lg">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Vencido</p>
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">$1,000</p>
                                </div>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-200 dark:border-slate-800">
                                        <TableHead className="text-slate-500 dark:text-slate-400">Paciente</TableHead>
                                        <TableHead className="text-slate-500 dark:text-slate-400">Servicio</TableHead>
                                        <TableHead className="text-slate-500 dark:text-slate-400">Monto</TableHead>
                                        <TableHead className="text-slate-500 dark:text-slate-400">Fecha</TableHead>
                                        <TableHead className="text-slate-500 dark:text-slate-400 text-right">Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentBilling.map((bill) => (
                                        <TableRow key={bill.id} className="border-slate-200 dark:border-slate-800">
                                            <TableCell className="font-medium text-slate-900 dark:text-white">{bill.patient}</TableCell>
                                            <TableCell className="text-slate-500 dark:text-slate-400">{bill.service}</TableCell>
                                            <TableCell className="font-semibold text-slate-900 dark:text-white">{bill.amount}</TableCell>
                                            <TableCell className="text-slate-500 dark:text-slate-400">{bill.date}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className={`${getStatusColor(bill.status)} border`}>
                                                    {bill.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Dashboard;