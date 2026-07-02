import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    Shield,
    UserCheck,
    Trash2,
    Edit3,
    KeyRound,
    AlertTriangle
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import usuariosService, { Usuario } from "@/servicios/usuarios";

const Usuarios = () => {
    const [busqueda, setBusqueda] = useState("");
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [cargando, setCargando] = useState(true);

    // Estados para Modales
    const [modalNuevo, setModalNuevo] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
    const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);
    const [alertaModal, setAlertaModal] = useState<{ open: boolean; titulo: string; mensaje: string }>({
        open: false,
        titulo: "",
        mensaje: ""
    });

    // Formulario de Usuario
    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        password: "",
        rol: "DOCTOR" as Usuario["rol"],
        doctor_id: ""
    });

    const cargarUsuarios = async () => {
        setCargando(true);
        try {
            const data = await usuariosService.obtenerTodos();
            setUsuarios(data || []);
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const handleCrearUsuario = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await usuariosService.crear({
                nombre: formData.nombre,
                email: formData.email,
                password: formData.password || "123456",
                rol: formData.rol,
                doctor_id: formData.doctor_id ? Number(formData.doctor_id) : null
            });
            setModalNuevo(false);
            setFormData({ nombre: "", email: "", password: "", rol: "DOCTOR", doctor_id: "" });
            cargarUsuarios();
        } catch (error) {
            console.error("Error creando usuario:", error);
            setAlertaModal({
                open: true,
                titulo: "Error al crear usuario",
                mensaje: "Verifica que el correo electrónico no esté registrado o duplicado en el sistema."
            });
        }
    };

    const handleActualizarUsuario = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usuarioSeleccionado) return;
        try {
            await usuariosService.actualizar(usuarioSeleccionado.id, {
                nombre: formData.nombre,
                email: formData.email,
                rol: formData.rol
            });
            setModalEditar(false);
            cargarUsuarios();
        } catch (error) {
            console.error("Error actualizando usuario:", error);
        }
    };

    const handleConfirmarEliminar = async () => {
        if (!usuarioAEliminar) return;
        try {
            await usuariosService.eliminar(usuarioAEliminar.id);
            setUsuarioAEliminar(null);
            cargarUsuarios();
        } catch (error) {
            console.error("Error eliminando usuario:", error);
            setUsuarioAEliminar(null);
        }
    };

    const abrirEditar = (u: Usuario) => {
        setUsuarioSeleccionado(u);
        setFormData({
            nombre: u.nombre,
            email: u.email,
            password: "",
            rol: u.rol,
            doctor_id: u.doctor_id ? String(u.doctor_id) : ""
        });
        setModalEditar(true);
    };

    const getRolBadge = (rol: string) => {
        switch (rol) {
            case "ADMIN":
                return <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-medium">Administrador</Badge>;
            case "DOCTOR":
                return <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-medium">Médico</Badge>;
            case "RECEPCIONISTA":
                return <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-medium">Recepcionista</Badge>;
            default:
                return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">Paciente</Badge>;
        }
    };

    const usuariosFiltrados = usuarios.filter((u) =>
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.rol.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Gestión de Usuarios y Roles (RBAC)
                    </h1>
                    
                </div>
                <Button 
                    onClick={() => {
                        setFormData({ nombre: "", email: "", password: "", rol: "DOCTOR", doctor_id: "" });
                        setModalNuevo(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 shadow-md transition-all hover:scale-[1.02]"
                >
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
                </Button>
            </div>

            {/* Barra de Búsqueda y Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="col-span-1 md:col-span-3 border shadow-sm">
                    <CardContent className="p-4 flex items-center">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar usuario por nombre, correo o rol..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="pl-9 w-full"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border shadow-sm bg-blue-50/50 dark:bg-blue-950/20">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Total Cuentas</p>
                            <p className="text-2xl font-bold text-blue-600">{usuarios.length}</p>
                        </div>
                        <Shield className="h-8 w-8 text-blue-600/60" />
                    </CardContent>
                </Card>
            </div>

            {/* Grid de Usuarios */}
            {cargando ? (
                <div className="text-center py-12 text-muted-foreground">Cargando usuarios del sistema...</div>
            ) : usuariosFiltrados.length === 0 ? (
                <div className="text-center py-12 border rounded-xl bg-card text-muted-foreground">
                    No se encontraron usuarios que coincidan con la búsqueda.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {usuariosFiltrados.map((u) => (
                        <Card key={u.id} className="overflow-hidden border shadow-sm hover:shadow-md transition-all">
                            <CardHeader className="pb-3 bg-muted/30">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            {u.nombre}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-1.5 mt-1 text-xs">
                                            <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {u.email}
                                        </CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => abrirEditar(u)}>
                                                <Edit3 className="mr-2 h-4 w-4 text-blue-600" /> Editar Rol/Datos
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setUsuarioAEliminar(u)} className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar Cuenta
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Rol Asignado:</span>
                                    {getRolBadge(u.rol)}
                                </div>
                                {u.doctor_nombre && (
                                    <div className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-2 rounded-md flex items-center gap-1.5">
                                        <UserCheck className="h-3.5 w-3.5" />
                                        Médico vinculado: Dr. {u.doctor_nombre} {u.doctor_apellido}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal Nuevo Usuario */}
            <Dialog open={modalNuevo} onOpenChange={setModalNuevo}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-blue-600" /> Crear Nuevo Usuario
                        </DialogTitle>
                        <DialogDescription>
                            Registra una nueva cuenta y asígnales credenciales y permisos de acceso (RBAC).
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCrearUsuario} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre Completo</Label>
                            <Input 
                                id="nombre" 
                                required 
                                placeholder="Ej. Dr. Carlos Rodríguez"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                required 
                                placeholder="usuario@hospital.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña temporal</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                placeholder="Por defecto: 123456"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rol">Rol en el Sistema</Label>
                            <select 
                                id="rol" 
                                className="w-full h-10 px-3 py-2 border rounded-md bg-background text-sm"
                                value={formData.rol}
                                onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                            >
                                <option value="ADMIN">Administrador</option>
                                <option value="DOCTOR">Médico</option>
                                <option value="RECEPCIONISTA">Recepcionista</option>
                                <option value="PACIENTE">Paciente</option>
                            </select>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setModalNuevo(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Crear Cuenta</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Editar Usuario */}
            <Dialog open={modalEditar} onOpenChange={setModalEditar}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>Editar Permisos y Rol</DialogTitle>
                        <DialogDescription>
                            Modifica la información o el nivel de acceso (RBAC) para el usuario seleccionado.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleActualizarUsuario} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Nombre Completo</Label>
                            <Input 
                                required 
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Correo Electrónico</Label>
                            <Input 
                                type="email" 
                                required 
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Rol en el Sistema</Label>
                            <select 
                                className="w-full h-10 px-3 py-2 border rounded-md bg-background text-sm"
                                value={formData.rol}
                                onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                            >
                                <option value="ADMIN">Administrador</option>
                                <option value="DOCTOR">Médico</option>
                                <option value="RECEPCIONISTA">Recepcionista</option>
                                <option value="PACIENTE">Paciente</option>
                            </select>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setModalEditar(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Guardar Cambios</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Confirmación de Eliminación */}
            <Dialog open={!!usuarioAEliminar} onOpenChange={() => setUsuarioAEliminar(null)}>
                <DialogContent className="sm:max-w-[420px] border-red-200 dark:border-red-900/40">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" /> Confirmar Eliminación
                        </DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de eliminar al usuario <strong>{usuarioAEliminar?.nombre}</strong> del sistema? Esta acción revocará de inmediato todos sus accesos.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-4">
                        <Button variant="outline" onClick={() => setUsuarioAEliminar(null)}>Cancelar</Button>
                        <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleConfirmarEliminar}>
                            Eliminar Cuenta
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Informativo / Error */}
            <Dialog open={alertaModal.open} onOpenChange={(open) => setAlertaModal({ ...alertaModal, open })}>
                <DialogContent className="sm:max-w-[400px]">
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

export default Usuarios;
