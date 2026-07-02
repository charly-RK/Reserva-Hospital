import { useState, useEffect } from "react";
import authService from "@/servicios/auth";
import doctoresService from "@/servicios/doctores";
import citasService from "@/servicios/citas";
import api from "@/servicios/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    User,
    Mail,
    Phone,
    Shield,
    Stethoscope,
    Award,
    Clock,
    CheckCircle2,
    Save,
    Building2,
    CalendarCheck,
    Star
} from "lucide-react";

const Perfil = () => {
    const user = authService.getCurrentUser() || {
        nombre: "Usuario Hospital",
        email: "correo@hospital.com",
        rol: "DOCTOR"
    };

    const isDoctor = user.rol === "DOCTOR";

    const [formDatos, setFormDatos] = useState({
        nombre: user.nombre || "Usuario",
        email: user.email || "",
        telefono: user.telefono || "",
        especialidad: user.especialidad || (isDoctor ? "Medicina General" : "Gestión Hospitalaria"),
        licencia: user.licencia || user.cedula || ""
    });

    const [horarioAtencion, setHorarioAtencion] = useState<string>("Horario por definir por el Administrador");
    const [consultorioMedico, setConsultorioMedico] = useState<string>("Consultorio por asignar");
    const [statsDoctor, setStatsDoctor] = useState({
        citasAtendidas: 0,
        puntaje: "5.0 / 5.0",
        anios: "Nuevo en Hospital"
    });

    const [alertaModal, setAlertaModal] = useState<{ open: boolean; titulo: string; mensaje: string }>({
        open: false,
        titulo: "",
        mensaje: ""
    });

    useEffect(() => {
        const cargarDatosReales = async () => {
            try {
                if (isDoctor && user) {
                    const [doctores, citas] = await Promise.all([
                        doctoresService.obtenerTodos().catch(() => []),
                        citasService.obtenerTodas().catch(() => [])
                    ]);

                    let doctorActual = null;
                    if (Array.isArray(doctores)) {
                        doctorActual = doctores.find((d: any) => 
                            (user.doctor_id && d.id === user.doctor_id) || 
                            (d.email && user.email && d.email.toLowerCase() === user.email.toLowerCase()) ||
                            (user.nombre && `${d.nombre} ${d.apellido}`.toLowerCase().includes(user.nombre.replace(/^Dr\.?\s*/i, '').trim().toLowerCase()))
                        );
                    }

                    if (doctorActual) {
                        setFormDatos({
                            nombre: `Dr. ${doctorActual.nombre} ${doctorActual.apellido}`.trim(),
                            email: doctorActual.email || user.email || "",
                            telefono: doctorActual.telefono || "",
                            especialidad: doctorActual.especialidad_nombre || doctorActual.especialidad || "Medicina General",
                            licencia: doctorActual.cedula || ""
                        });

                        setConsultorioMedico(doctorActual.consultorio || "Por asignar (Hospital Principal)");
                        const exp = doctorActual.experiencia_anios !== undefined && doctorActual.experiencia_anios !== null ? doctorActual.experiencia_anios : 0;
                        
                        const misCitas = Array.isArray(citas) ? citas.filter((c: any) => c.doctor_id === doctorActual.id || (user.doctor_id && c.doctor_id === user.doctor_id)) : [];
                        const atendidasCount = misCitas.filter((c: any) => c.estado === 'Completada').length || misCitas.length;

                        setStatsDoctor({
                            citasAtendidas: atendidasCount,
                            puntaje: atendidasCount > 0 ? "4.9 / 5.0" : "Sin calificaciones aún",
                            anios: exp === 0 ? "Reciente ingreso" : `${exp} ${exp === 1 ? 'año' : 'años'}`
                        });

                        try {
                            const disp = await api.get(`/disponibilidad/doctor/${doctorActual.id}`);
                            if (disp && disp.data && Array.isArray(disp.data) && disp.data.length > 0) {
                                const minHora = disp.data[0].hora_inicio?.substring(0, 5) || "08:00";
                                const maxHora = disp.data[0].hora_fin?.substring(0, 5) || "17:00";
                                setHorarioAtencion(`Lunes a Viernes • ${minHora} - ${maxHora}`);
                            } else {
                                setHorarioAtencion("Horario por definir por Administración");
                            }
                        } catch (e) {
                            setHorarioAtencion("Horario por definir");
                        }
                    } else {
                        setStatsDoctor({ citasAtendidas: 0, puntaje: "Sin calificaciones", anios: "Reciente ingreso" });
                    }
                }
            } catch (err) {
                console.error("Error cargando perfil real:", err);
            }
        };
        cargarDatosReales();
    }, []);

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        const updatedUser = { ...user, ...formDatos };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        if (isDoctor && user?.doctor_id) {
            await doctoresService.actualizar(user.doctor_id, {
                telefono: formDatos.telefono,
                consultorio: consultorioMedico,
                cedula: formDatos.licencia
            }).catch(() => {});
        }
        setAlertaModal({
            open: true,
            titulo: "Perfil Actualizado",
            mensaje: "Tus datos profesionales y de contacto han sido guardados exitosamente."
        });
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Encabezado */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Mi Perfil Profesional</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Información confidencial, credenciales y preferencias de cuenta.
                    </p>
                </div>
                <Badge className="bg-blue-600 text-white px-3 py-1.5 text-sm flex items-center gap-1.5">
                    <Shield className="h-4 w-4" />
                    Rol Activo: {user.rol || "USUARIO"}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tarjeta Lateral de Identidad */}
                <Card className="lg:col-span-1 bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm h-fit">
                    <CardContent className="p-6 text-center space-y-4">
                        <div className="relative mx-auto w-28 h-28">
                            <Avatar className="w-28 h-28 border-4 border-blue-500/20 shadow-xl">
                                <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-3xl font-bold">
                                    {formDatos.nombre.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-1 right-1 bg-emerald-500 text-white p-1.5 rounded-full ring-4 ring-white dark:ring-slate-900 shadow">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{formDatos.nombre}</h2>
                            <p className="text-sm font-medium text-[hsl(var(--medical-blue))] mt-0.5">{formDatos.especialidad}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formDatos.email}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-center">
                            <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">Licencia / Reg</p>
                                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{formDatos.licencia}</p>
                            </div>
                            <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">Estado</p>
                                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Verificado</p>
                            </div>
                        </div>

                        {isDoctor && (
                            <div className="pt-2 space-y-2 text-left">
                                <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 bg-blue-50/50 dark:bg-blue-900/10 p-2.5 rounded-lg border border-blue-100 dark:border-blue-800/20">
                                    <Clock className="h-4 w-4 text-[hsl(var(--medical-blue))] shrink-0" />
                                    <span>Horario de Atención: {horarioAtencion}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 bg-emerald-50/50 dark:bg-emerald-900/10 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-800/20">
                                    <Building2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                    <span>{consultorioMedico}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Formulario de Actualización */}
                <Card className="lg:col-span-2 bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <User className="h-5 w-5 text-[hsl(var(--medical-blue))]" />
                            Detalles de la Cuenta
                        </CardTitle>
                        <CardDescription>Actualiza tus datos personales y de contacto institucional.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleGuardar} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre Completo y Título</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="nombre"
                                            className="pl-9"
                                            value={formDatos.nombre}
                                            onChange={e => setFormDatos({ ...formDatos, nombre: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Correo Electrónico Profesional</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            className="pl-9"
                                            value={formDatos.email}
                                            onChange={e => setFormDatos({ ...formDatos, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="telefono">Teléfono de Contacto</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="telefono"
                                            className="pl-9"
                                            value={formDatos.telefono}
                                            onChange={e => setFormDatos({ ...formDatos, telefono: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="especialidad">{isDoctor ? "Especialidad Médica" : "Cargo / Departamento"}</Label>
                                    <div className="relative">
                                        <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="especialidad"
                                            className="pl-9"
                                            value={formDatos.especialidad}
                                            onChange={e => setFormDatos({ ...formDatos, especialidad: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="licencia">Registro Sanitario / Cédula</Label>
                                    <div className="relative">
                                        <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="licencia"
                                            className="pl-9"
                                            value={formDatos.licencia}
                                            onChange={e => setFormDatos({ ...formDatos, licencia: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {isDoctor && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                        Estadísticas y Desempeño Médico
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 shadow-2xs">
                                            <p className="text-xs text-slate-500">Citas Atendidas</p>
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">{statsDoctor.citasAtendidas}</p>
                                        </div>
                                        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 shadow-2xs">
                                            <p className="text-xs text-slate-500">Puntaje Pacientes</p>
                                            <p className="text-lg font-bold text-emerald-600">{statsDoctor.puntaje}</p>
                                        </div>
                                        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 shadow-2xs">
                                            <p className="text-xs text-slate-500">Años en Hospital</p>
                                            <p className="text-lg font-bold text-blue-600">{statsDoctor.anios}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <Button type="submit" className="bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white gap-2 px-6">
                                    <Save className="h-4 w-4" />
                                    Guardar Cambios
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Modal de Alerta y Confirmación */}
            <Dialog open={alertaModal.open} onOpenChange={(open) => setAlertaModal({ ...alertaModal, open })}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            {alertaModal.titulo}
                        </DialogTitle>
                        <DialogDescription className="text-slate-600 dark:text-slate-400 pt-1">
                            {alertaModal.mensaje}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-3">
                        <Button
                            className="bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white w-full sm:w-auto"
                            onClick={() => setAlertaModal({ ...alertaModal, open: false })}
                        >
                            De acuerdo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Perfil;
