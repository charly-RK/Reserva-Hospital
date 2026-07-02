import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    Calendar,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    ChevronLeft,
    ChevronRight,
    User,
    Sun,
    Moon,
    DollarSign,
    Shield
} from "lucide-react";
import authService from "@/servicios/auth";
import notificacionesService from "@/servicios/notificaciones";
import { useTheme } from "@/hooks/useTheme";

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [alertasHeader, setAlertasHeader] = useState<any[]>([]);
    const user = authService.getCurrentUser();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        notificacionesService.obtenerTodas()
            .then((data: any) => {
                if (Array.isArray(data)) {
                    setAlertasHeader(data.filter((n: any) => !n.archivado).slice(0, 5));
                }
            })
            .catch(() => {});
    }, [location.pathname]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const allMenuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard", roles: ["ADMIN"] },
        { icon: Calendar, label: "Citas", path: "/admin/citas", roles: ["ADMIN", "DOCTOR", "RECEPCIONISTA"] },
        { icon: Stethoscope, label: "Doctores", path: "/admin/doctores", roles: ["ADMIN"] },
        { icon: Users, label: "Pacientes", path: "/admin/pacientes", roles: ["ADMIN", "DOCTOR", "RECEPCIONISTA"] },
        /* { icon: Shield, label: "Usuarios (RBAC)", path: "/admin/usuarios", roles: ["ADMIN"] }, */
        { icon: Bell, label: "Notificaciones", path: "/admin/notificaciones", roles: ["ADMIN", "DOCTOR", "RECEPCIONISTA"] },
        { icon: DollarSign, label: "Facturación", path: "/admin/facturacion", roles: ["ADMIN"] },
        { icon: Settings, label: "Configuración", path: "/admin/configuracion", roles: ["ADMIN", "DOCTOR"] },
        { icon: User, label: "Mi Perfil", path: "/admin/perfil", roles: ["DOCTOR", "ADMIN", "RECEPCIONISTA"] }
    ];

    const menuItems = allMenuItems.filter(item => {
        if (!user || !user.rol) return true; // Por defecto o Admin completo
        return item.roles.includes(user.rol);
    });

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
            {/* Menú Lateral (Sidebar) */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out 
      ${isSidebarOpen ? "w-64" : "w-20"} 
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
    `}
            >
                <div className={`h-16 flex items-center ${isSidebarOpen ? "justify-between px-6" : "justify-center"} border-b border-slate-200 dark:border-slate-800`}>
                    {isSidebarOpen ? (
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-500 truncate">Hospital R</span>
                    ) : (
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-500">HR</span>
                    )}
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-4 flex flex-col h-[calc(100vh-4rem)] justify-between relative">
                    <nav className="space-y-2 flex-1">
                        {menuItems.map((item) => {
                            const LinkContent = (
                                <Link
                                    to={item.path}
                                    className={`flex items-center ${isSidebarOpen ? "gap-3" : "gap-0"} px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
                  ${location.pathname === item.path
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                        }
                  ${!isSidebarOpen && "justify-center"}
                `}
                                >
                                    <item.icon className={`h-5 w-5 flex-shrink-0 ${location.pathname === item.path ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"}`} />
                                    {/* Solo mostrar texto si el sidebar está abierto */}
                                    <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? "opacity-100 translate-x-0 w-auto" : "opacity-0 -translate-x-10 w-0 overflow-hidden hidden"}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            );

                            if (isSidebarOpen) {
                                return <div key={item.path}>{LinkContent}</div>;
                            }

                            return (
                                <Tooltip key={item.path} delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        {LinkContent}
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 ml-2 font-medium shadow-md rounded-md">
                                        {item.label}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </nav>

                    {/* Botón de Colapsar (Posicionado en el borde) */}
                    <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 z-50 hidden lg:block">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-blue-600 hover:border-blue-200 dark:hover:border-blue-600 shadow-xl transition-all duration-300"
                            onClick={toggleSidebar}
                        >
                            {isSidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </Button>
                    </div>

                    {/* Sección de Perfil y Salir */}
                    <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800/60">
                        {isSidebarOpen ? (
                            <div className="flex items-center justify-between px-2 animate-in fade-in duration-300">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex-shrink-0 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white dark:ring-slate-800">
                                        {user?.nombre?.charAt(0) || 'A'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium truncate text-slate-900 dark:text-white">{user?.nombre || 'Admin'}</p>
                                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 h-8 w-8 transition-colors"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-red-50 dark:bg-red-900/90 text-red-600 dark:text-red-100 border-red-200 dark:border-red-800">
                                        Cerrar Sesión
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white dark:ring-slate-800 cursor-pointer">
                                            {user?.nombre?.charAt(0) || 'A'}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                                        <p className="font-medium">{user?.nombre}</p>
                                        <p className="text-xs text-slate-500">{user?.email}</p>
                                    </TooltipContent>
                                </Tooltip>

                                <div className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800 my-1"></div>

                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 h-8 w-8"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="bg-red-50 dark:bg-red-900/90 text-red-600 dark:text-red-100 border-red-200 dark:border-red-800">
                                        Cerrar Sesión
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Contenedor Principal */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : "lg:ml-20"} bg-white dark:bg-slate-900`}>
                <div className="flex-1 flex flex-col bg-gray-50 dark:bg-slate-950 lg:rounded-tl-3xl border-l border-t border-slate-200 dark:border-slate-800/50 shadow-2xl overflow-hidden transition-colors duration-300">
                    {/* Cabecera (Header) */}
                    <header className="h-16 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 transition-colors duration-300">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)}>
                                <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </Button>

                            {/* Barra de búsqueda */}
                            <div className="hidden md:flex items-center relative">
                                <Search className="absolute left-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                <Input
                                    placeholder="Buscar..."
                                    className="pl-9 w-64 bg-slate-100 dark:bg-slate-900 border-transparent focus:border-transparent focus-visible:ring-1 focus-visible:ring-blue-600 shadow-sm transition-all rounded-full h-9 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Botón de Tema */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                onClick={toggleTheme}
                            >
                                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 relative rounded-lg transition-colors">
                                        <Bell className="h-5 w-5" />
                                        {alertasHeader.filter(a => !a.leido && !a.archivado).length > 0 && (
                                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-80 p-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl" align="end">
                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Notificaciones Recientes</span>
                                        <Link to="/admin/notificaciones" className="text-xs text-blue-600 hover:underline font-semibold">Ver todas</Link>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto space-y-2">
                                        {alertasHeader.length === 0 ? (
                                            <p className="text-xs text-slate-400 text-center py-4">No tienes notificaciones recientes.</p>
                                        ) : (
                                            alertasHeader.map((a, idx) => (
                                                <Link key={idx} to="/admin/notificaciones" className={`block p-2.5 rounded-lg text-xs transition-colors border ${a.leido ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-100' : 'bg-blue-50/70 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/40 text-slate-800 dark:text-slate-200 hover:bg-blue-100/70'}`}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-bold text-blue-600 dark:text-blue-400 truncate">{a.titulo}</span>
                                                        {!a.leido && <span className="h-1.5 w-1.5 bg-blue-600 rounded-full"></span>}
                                                    </div>
                                                    <p className="line-clamp-2 text-slate-600 dark:text-slate-300">{a.mensaje}</p>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                                        <div className="h-full w-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                                            {user?.nombre?.charAt(0) || 'A'}
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none text-slate-900 dark:text-white">{user?.nombre}</p>
                                            <p className="text-xs leading-none text-slate-500">{user?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                                    <DropdownMenuItem className="focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white cursor-pointer" onClick={() => navigate('/admin/perfil')}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Perfil</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white cursor-pointer" onClick={() => navigate('/admin/configuracion')}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Configuración</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                                    <DropdownMenuItem className="text-red-500 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-600 dark:focus:text-red-300 cursor-pointer" onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Cerrar Sesión</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    {/* Contenido de la página */}
                    <main className="flex-1 p-4 lg:p-8 overflow-auto">
                        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
