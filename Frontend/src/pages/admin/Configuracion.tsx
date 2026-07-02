import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
    Settings,
    User,
    Bell,
    Shield,
    Save,
    Building
} from "lucide-react";

const Configuracion = () => {
    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Configuración</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Administra las preferencias generales del sistema y tu cuenta.</p>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1">
                    <TabsTrigger value="general" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800">
                        <Building className="mr-2 h-4 w-4" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="cuenta" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800">
                        <User className="mr-2 h-4 w-4" />
                        Cuenta
                    </TabsTrigger>
                    <TabsTrigger value="notificaciones" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800">
                        <Bell className="mr-2 h-4 w-4" />
                        Notificaciones
                    </TabsTrigger>
                    <TabsTrigger value="seguridad" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800">
                        <Shield className="mr-2 h-4 w-4" />
                        Seguridad
                    </TabsTrigger>
                </TabsList>

                {/* Tab: General */}
                <TabsContent value="general">
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>Información del Hospital</CardTitle>
                            <CardDescription>Configura los detalles básicos que se muestran en los reportes y correos.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre-hospital">Nombre del Hospital</Label>
                                    <Input id="nombre-hospital" defaultValue="Hospital R" className="bg-slate-50 dark:bg-slate-950" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email-contacto">Email de Contacto</Label>
                                    <Input id="email-contacto" defaultValue="contacto@hospitalr.com" className="bg-slate-50 dark:bg-slate-950" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="telefono">Teléfono</Label>
                                    <Input id="telefono" defaultValue="+593 99 123 4567" className="bg-slate-50 dark:bg-slate-950" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="direccion">Dirección</Label>
                                    <Input id="direccion" defaultValue="Av. Principal 123 y Calle Secundaria" className="bg-slate-50 dark:bg-slate-950" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Save className="mr-2 h-4 w-4" />
                                Guardar Cambios
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Tab: Cuenta */}
                <TabsContent value="cuenta">
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>Perfil del Administrador</CardTitle>
                            <CardDescription>Actualiza tu información personal.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre Completo</Label>
                                <Input id="nombre" defaultValue="Administrador Principal" className="bg-slate-50 dark:bg-slate-950" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input id="email" defaultValue="admin@hospitalr.com" className="bg-slate-50 dark:bg-slate-950" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Save className="mr-2 h-4 w-4" />
                                Guardar Perfil
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Tab: Notificaciones */}
                <TabsContent value="notificaciones">
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>Preferencias de Notificación</CardTitle>
                            <CardDescription>Elige cómo y cuándo quieres recibir alertas.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Alertas por Correo</Label>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Recibe correos sobre nuevas citas y cancelaciones.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Resumen Semanal</Label>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Un reporte automático cada lunes con estadísticas.</p>
                                </div>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Notificaciones del Sistema</Label>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Avisos sobre mantenimiento o actualizaciones.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Seguridad */}
                <TabsContent value="seguridad">
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>Seguridad de la Cuenta</CardTitle>
                            <CardDescription>Gestiona tu contraseña y métodos de autenticación.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Contraseña Actual</Label>
                                <Input id="current-password" type="password" className="bg-slate-50 dark:bg-slate-950" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">Nueva Contraseña</Label>
                                <Input id="new-password" type="password" className="bg-slate-50 dark:bg-slate-950" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                                <Input id="confirm-password" type="password" className="bg-slate-50 dark:bg-slate-950" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                Actualizar Contraseña
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Configuracion;
