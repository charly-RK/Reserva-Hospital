import { useState, useEffect } from "react";
import facturacionService from "@/servicios/facturacion";
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
} from "@/components/ui/dropdown-menu";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Search,
    Plus,
    MoreHorizontal,
    User,
    Mail,
    Phone,
    Calendar,
    DollarSign,
    Clock,
    FileText,
    Download,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowRight,
    CreditCard,
    Printer,
    FileDown,
    FileUp,
    Filter,
    BarChart3,
    TrendingUp,
    TrendingDown,
    PiggyBank,
    Receipt,
    Wallet,
    Building2,
    Users
} from "lucide-react";

const Facturacion = () => {
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("Todos");
    const [facturaSeleccionada, setFacturaSeleccionada] = useState<number | null>(null);
    const [tabActivo, setTabActivo] = useState("lista");
    const [listaFacturas, setListaFacturas] = useState<any[]>([]);

    useEffect(() => {
        const cargarFacturas = async () => {
            try {
                const data = await facturacionService.obtenerTodas();
                if (data && Array.isArray(data)) {
                    setListaFacturas(data.map((f: any) => {
                        const servicioStr = Array.isArray(f.detalles) && f.detalles.length > 0
                            ? f.detalles.map((d: any) => d.concepto || "Servicio").join(', ')
                            : (typeof f.detalles === 'string' ? f.detalles : "Atención Médica / Hospitalaria");
                        return {
                            id: f.id,
                            paciente: `${f.paciente_nombre || ''} ${f.paciente_apellido || ''}`.trim() || "Paciente",
                            email: f.paciente_email || "correo@email.com",
                            telefono: f.paciente_telefono || "+593 99 000 0000",
                            servicio: servicioStr,
                            detallesArray: Array.isArray(f.detalles) ? f.detalles : [],
                            monto: parseFloat(f.monto_a_pagar || f.total || 0),
                            fecha: f.fecha_emision ? f.fecha_emision.split('T')[0] : "2026-06-15",
                            estado: f.estado ? (f.estado.toLowerCase() === 'pagado' ? "Pagado" : "Pendiente") : "Pendiente",
                            metodoPago: f.metodo_pago || "-",
                            numeroFactura: `FAC-${String(f.id).padStart(4, '0')}`,
                            doctor: f.doctor_nombre ? `Dr. ${f.doctor_nombre}` : "Médico Asignado"
                        };
                    }));
                }
            } catch (err) {
                console.error("Error al cargar facturas desde PostgreSQL:", err);
            }
        };
        cargarFacturas();
    }, []);

    const facturasFiltradas = listaFacturas.filter(factura => {
        const matchBusqueda = (factura.paciente || "").toLowerCase().includes(busqueda.toLowerCase()) ||
                             (factura.servicio || "").toLowerCase().includes(busqueda.toLowerCase()) ||
                             (factura.numeroFactura || "").toLowerCase().includes(busqueda.toLowerCase()) ||
                             (factura.doctor || "").toLowerCase().includes(busqueda.toLowerCase());
        const matchEstado = filtroEstado === "Todos" || factura.estado === filtroEstado;
        return matchBusqueda && matchEstado;
    });

    const factura = facturaSeleccionada ? listaFacturas.find(f => f.id === facturaSeleccionada) : null;
    const detalle = factura
        ? (Array.isArray(factura.detallesArray) && factura.detallesArray.length > 0
            ? factura.detallesArray.map((d: any) => ({
                concepto: d.concepto || factura.servicio || "Servicio",
                cantidad: d.cantidad || 1,
                precio: parseFloat(d.precio_unitario || d.subtotal || factura.monto || 0),
                subtotal: parseFloat(d.subtotal || factura.monto || 0)
            }))
            : [{ concepto: factura.servicio, cantidad: 1, precio: factura.monto, subtotal: factura.monto }])
        : null;

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case "Pagado": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
            case "Pendiente": return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
            case "Vencido": return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20";
            default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
        }
    };

    // Estadísticas
    const totalFacturas = listaFacturas.length;
    const totalPagado = listaFacturas.filter(f => f.estado === "Pagado").reduce((sum, f) => sum + f.monto, 0);
    const totalPendiente = listaFacturas.filter(f => f.estado === "Pendiente" || f.estado === "Vencido").reduce((sum, f) => sum + f.monto, 0);
    const totalGeneral = listaFacturas.reduce((sum, f) => sum + f.monto, 0);

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Facturación en Línea</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Generación y gestión de facturas médicas.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-slate-200 dark:border-slate-800">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                    <Button className="bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Factura
                    </Button>
                </div>
            </div>

            {/* Resumen Financiero */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total Facturado</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">${totalGeneral.toFixed(2)}</p>
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-lg">
                                <Receipt className="h-5 w-5 text-[hsl(var(--medical-blue))]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Pagado</p>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${totalPagado.toFixed(2)}</p>
                            </div>
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Pendiente</p>
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">${totalPendiente.toFixed(2)}</p>
                            </div>
                            <div className="p-3 bg-amber-100 dark:bg-amber-500/10 rounded-lg">
                                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Facturas</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalFacturas}</p>
                            </div>
                            <div className="p-3 bg-purple-100 dark:bg-purple-500/10 rounded-lg">
                                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lista de Facturas */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">Facturas</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{facturasFiltradas.length} registros</p>
                            </div>
                            <div className="flex gap-2">
                                <select 
                                    className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    value={filtroEstado}
                                    onChange={(e) => setFiltroEstado(e.target.value)}
                                >
                                    <option>Todos</option>
                                    <option>Pagado</option>
                                    <option>Pendiente</option>
                                    <option>Vencido</option>
                                </select>
                            </div>
                        </div>
                        <div className="relative mt-3">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar factura..."
                                className="pl-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-[hsl(var(--medical-blue))] text-sm"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                    </div>
                    <ScrollArea className="h-[500px]">
                        {facturasFiltradas.map((f) => (
                            <div
                                key={f.id}
                                className={`p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                                    facturaSeleccionada === f.id ? 'bg-blue-50 dark:bg-blue-500/10 border-l-4 border-[hsl(var(--medical-blue))]' : ''
                                }`}
                                onClick={() => {
                                    setFacturaSeleccionada(f.id);
                                    setTabActivo("detalle");
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-slate-900 dark:text-white truncate text-sm">{f.paciente}</p>
                                            <Badge variant="outline" className={`${getEstadoColor(f.estado)} border text-xs`}>
                                                {f.estado}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                            <span>{f.numeroFactura}</span>
                                            <span>•</span>
                                            <span>{f.servicio}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">${f.monto.toFixed(2)}</span>
                                            <span className="text-xs text-slate-400">{f.fecha}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {facturasFiltradas.length === 0 && (
                            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                No se encontraron facturas en la base de datos.
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Detalle de Factura */}
                <div className="lg:col-span-2">
                    {factura ? (
                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <CardTitle className="text-slate-900 dark:text-white text-xl">
                                                {factura.numeroFactura}
                                            </CardTitle>
                                            <Badge variant="outline" className={`${getEstadoColor(factura.estado)} border`}>
                                                {factura.estado}
                                            </Badge>
                                        </div>
                                        <CardDescription className="mt-1">
                                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                                <span>{factura.fecha}</span>
                                                <span>•</span>
                                                <span>{factura.doctor}</span>
                                            </div>
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline">
                                            <Printer className="h-4 w-4 mr-2" />
                                            Imprimir
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            <Download className="h-4 w-4 mr-2" />
                                            PDF
                                        </Button>
                                        <Button size="sm" className="bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Editar
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6">
                                <Tabs value={tabActivo} onValueChange={setTabActivo} className="w-full">
                                    <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full justify-start">
                                        <TabsTrigger value="detalle" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                                            <FileText className="h-4 w-4 mr-2" />
                                            Detalle
                                        </TabsTrigger>
                                        <TabsTrigger value="paciente" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                                            <User className="h-4 w-4 mr-2" />
                                            Paciente
                                        </TabsTrigger>
                                        <TabsTrigger value="pago" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            Pago
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Detalle de Factura */}
                                    <TabsContent value="detalle" className="pt-4">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Conceptos</h4>
                                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Subtotal</span>
                                            </div>
                                            <div className="space-y-2">
                                                {detalle?.map((item, index) => (
                                                    <div key={index} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-800">
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-white">{item.concepto}</p>
                                                            <p className="text-xs text-slate-500">{item.cantidad} x ${item.precio.toFixed(2)}</p>
                                                        </div>
                                                        <span className="font-semibold text-slate-900 dark:text-white">${item.subtotal.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-slate-500">Subtotal</span>
                                                    <span className="text-sm text-slate-900 dark:text-white">${factura.monto.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-sm text-slate-500">IVA (0%)</span>
                                                    <span className="text-sm text-slate-900 dark:text-white">$0.00</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                                    <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
                                                    <span className="text-xl font-bold text-[hsl(var(--medical-blue))]">${factura.monto.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-4">
                                                <Button className="flex-1 bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white">
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Marcar como Pagado
                                                </Button>
                                                <Button variant="outline" className="flex-1">
                                                    <FileDown className="h-4 w-4 mr-2" />
                                                    Descargar
                                                </Button>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Información del Paciente */}
                                    <TabsContent value="paciente" className="pt-4">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-800">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarFallback className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-lg">
                                                        {factura.paciente.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h4 className="font-semibold text-slate-900 dark:text-white">{factura.paciente}</h4>
                                                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                                        <div className="flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {factura.email}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {factura.telefono}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">Servicio</p>
                                                    <p className="font-medium text-slate-900 dark:text-white">{factura.servicio}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">Doctor</p>
                                                    <p className="font-medium text-slate-900 dark:text-white">{factura.doctor}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">Fecha</p>
                                                    <p className="font-medium text-slate-900 dark:text-white">{factura.fecha}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">Monto</p>
                                                    <p className="font-medium text-[hsl(var(--medical-blue))] text-lg">${factura.monto.toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" className="w-full">
                                                <ArrowRight className="h-4 w-4 mr-2" />
                                                Ver Perfil Completo
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    {/* Información de Pago */}
                                    <TabsContent value="pago" className="pt-4">
                                        <div className="space-y-4">
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-800">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Estado</p>
                                                        <Badge variant="outline" className={`${getEstadoColor(factura.estado)} border mt-1`}>
                                                            {factura.estado}
                                                        </Badge>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Método de Pago</p>
                                                        <p className="font-medium text-slate-900 dark:text-white">{factura.metodoPago}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Monto</p>
                                                        <p className="font-bold text-[hsl(var(--medical-blue))] text-lg">${factura.monto.toFixed(2)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Fecha de Emisión</p>
                                                        <p className="font-medium text-slate-900 dark:text-white">{factura.fecha}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {factura.estado === "Pendiente" || factura.estado === "Vencido" ? (
                                                <div className="space-y-3">
                                                    <div className="p-4 bg-amber-50 dark:bg-amber-500/5 rounded-lg border border-amber-200 dark:border-amber-500/20">
                                                        <div className="flex items-center gap-2">
                                                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                                                Esta factura está pendiente de pago. Por favor, procesa el pago para completar la transacción.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button className="flex-1 bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white">
                                                            <CreditCard className="h-4 w-4 mr-2" />
                                                            Procesar Pago
                                                        </Button>
                                                        <Button variant="outline" className="flex-1">
                                                            <Mail className="h-4 w-4 mr-2" />
                                                            Enviar Recordatorio
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/5 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                        <p className="text-sm text-emerald-700 dark:text-emerald-400">
                                                            Esta factura ha sido pagada exitosamente.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardContent className="py-16 text-center">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Receipt className="h-10 w-10 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2">Selecciona una factura</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Haz clic en una factura de la lista para ver su información completa
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Facturacion;