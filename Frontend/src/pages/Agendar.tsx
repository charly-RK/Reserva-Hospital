import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Stethoscope } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Servicios
import especialidadesService from "@/servicios/especialidades";
import doctoresService from "@/servicios/doctores";
import disponibilidadService from "@/servicios/disponibilidad";
import pacientesService from "@/servicios/pacientes";
import citasService from "@/servicios/citas";

const Agendar = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Datos del flujo
    const [especialidades, setEspecialidades] = useState<any[]>([]);
    const [doctores, setDoctores] = useState<any[]>([]);
    const [horarios, setHorarios] = useState<any[]>([]);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);

    // Selección del usuario
    const [selectedEspecialidad, setSelectedEspecialidad] = useState<string>("");
    const [selectedDoctor, setSelectedDoctor] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string>("");

    // Datos del paciente
    const [cedula, setCedula] = useState("");
    const [paciente, setPaciente] = useState<any>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [patientForm, setPatientForm] = useState({
        nombre: "",
        apellido: "",
        email: "",
        celular: "",
        fecha_nacimiento: "",
        direccion: ""
    });

    // Cargar especialidades al inicio
    useEffect(() => {
        const loadEspecialidades = async () => {
            try {
                const data = await especialidadesService.obtenerTodas();
                setEspecialidades(data);
            } catch (error) {
                toast({ title: "Error", description: "No se pudieron cargar las especialidades", variant: "destructive" });
            }
        };
        loadEspecialidades();
    }, []);

    // Cargar doctores cuando cambia especialidad
    useEffect(() => {
        if (selectedEspecialidad) {
            const loadDoctores = async () => {
                setIsLoading(true);
                try {
                    const data = await doctoresService.obtenerPorEspecialidad(Number(selectedEspecialidad));
                    setDoctores(data);
                    setSelectedDoctor(""); // Reset doctor
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsLoading(false);
                }
            };
            loadDoctores();
        }
    }, [selectedEspecialidad]);

    // Cargar disponibilidad cuando cambia doctor
    useEffect(() => {
        if (selectedDoctor) {
            const loadHorarios = async () => {
                try {
                    const data = await disponibilidadService.obtenerPorDoctor(Number(selectedDoctor));
                    setHorarios(data);
                } catch (error) {
                    console.error(error);
                }
            };
            loadHorarios();
        }
    }, [selectedDoctor]);

    // Cargar citas agendadas para filtrar horarios
    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            const loadBookedSlots = async () => {
                try {
                    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
                    const citas = await citasService.obtenerPorDoctorYFecha(Number(selectedDoctor), formattedDate);
                    // citas es un array de objetos { hora_cita: "HH:MM:SS" }
                    // Necesitamos extraer solo HH:MM
                    const slots = citas.map((c: any) => c.hora_cita.substring(0, 5));
                    setBookedSlots(slots);
                } catch (error) {
                    console.error("Error al cargar citas agendadas", error);
                }
            };
            loadBookedSlots();
        } else {
            setBookedSlots([]);
        }
    }, [selectedDoctor, selectedDate]);

    // --- Lógica de Pasos y Validaciones ---

    const validarCedula = (ced: string): boolean => {
        if (!/^\d{10}$/.test(ced)) return false;
        // Algoritmo Módulo 10 de Cédula Ecuatoriana
        const provincia = parseInt(ced.substring(0, 2), 10);
        if (provincia < 1 || (provincia > 24 && provincia !== 30)) return false;
        const tercerDigito = parseInt(ced.substring(2, 3), 10);
        if (tercerDigito >= 6) return false;

        const digitoVerificador = parseInt(ced.substring(9, 10), 10);
        let suma = 0;
        for (let i = 0; i < 9; i++) {
            let mult = parseInt(ced[i], 10) * (i % 2 === 0 ? 2 : 1);
            if (mult > 9) mult -= 9;
            suma += mult;
        }
        const decenaSuperior = Math.ceil(suma / 10) * 10;
        let resto = decenaSuperior - suma;
        if (resto === 10) resto = 0;
        return resto === digitoVerificador;
    };

    const nextStep = () => {
        if (step === 3 && !paciente) {
            toast({ title: "Atención", description: "Por favor verifique o registre sus datos del paciente antes de continuar.", variant: "destructive" });
            return;
        }
        setStep(s => s + 1);
    };
    const prevStep = () => setStep(s => s - 1);

    // Buscar Paciente
    const handleSearchPatient = async () => {
        if (!cedula.trim()) return;
        if (!validarCedula(cedula.trim())) {
            toast({
                title: "Cédula Inválida",
                description: "El número de cédula ingresado no es correcto. Por favor verifica e intenta de nuevo.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            const data = await pacientesService.buscarPorCedula(cedula.trim());
            if (data) {
                setPaciente(data);
                setIsRegistering(false);
                toast({ title: "Paciente encontrado", description: `Bienvenido/a ${data.nombre} ${data.apellido}` });
            } else {
                setPaciente(null);
                setIsRegistering(true);
                toast({ title: "Atención", description: "Por favor completa tus datos para registrarte." });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Registrar Paciente
    const handleRegisterPatient = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validarCedula(cedula.trim())) {
            toast({ title: "Cédula Inválida", description: "El número de cédula ingresado no es correcto.", variant: "destructive" });
            return;
        }

        const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
        if (!nombreRegex.test(patientForm.nombre.trim()) || !nombreRegex.test(patientForm.apellido.trim())) {
            toast({ title: "Datos incorrectos", description: "Los nombres y apellidos solo deben contener letras.", variant: "destructive" });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(patientForm.email)) {
            toast({ title: "Correo electrónico incorrecto", description: "Por favor ingresa una dirección de correo válida.", variant: "destructive" });
            return;
        }

        if (!/^\d{10}$/.test(patientForm.celular.trim())) {
            toast({ title: "Teléfono incorrecto", description: "El número celular debe tener 10 dígitos numéricos (ej. 0912345678).", variant: "destructive" });
            return;
        }

        if (!patientForm.fecha_nacimiento) {
            toast({ title: "Dato requerido", description: "Por favor selecciona tu fecha de nacimiento.", variant: "destructive" });
            return;
        }

        const fechaNac = new Date(patientForm.fecha_nacimiento);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (fechaNac >= hoy) {
            toast({ title: "Fecha inválida", description: "La fecha de nacimiento debe ser una fecha pasada.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const newPatient = await pacientesService.registrar({ ...patientForm, cedula: cedula.trim() });
            setPaciente(newPatient);
            setIsRegistering(false);
            toast({ title: "Registro exitoso", description: "Tus datos han sido registrados correctamente." });
        } catch (error) {
            toast({ title: "Error", description: "No se pudieron registrar tus datos en este momento.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    // Confirmar Cita
    const handleConfirmAppointment = async () => {
        if (!paciente || !selectedDoctor || !selectedDate || !selectedTime) return;

        setIsLoading(true);
        try {
            await citasService.agendar({
                paciente_id: paciente.id,
                doctor_id: Number(selectedDoctor),
                fecha_cita: format(selectedDate, 'yyyy-MM-dd'),
                hora_cita: selectedTime
            });

            toast({
                title: "¡Cita Agendada Exitosamente!",
                description: "Hemos enviado los detalles completos a tu correo y teléfono.",
                className: "bg-green-50 border-green-200"
            });

            setTimeout(() => navigate('/mis-citas'), 2000);
        } catch (error: any) {
            if (error?.response?.status === 409 || error?.response?.data?.error === 'CONFLICTO_HORARIO') {
                toast({
                    title: "Horario No Disponible",
                    description: "Ese horario acaba de ser ocupado. Por favor selecciona otra hora disponible.",
                    variant: "destructive"
                });
                setSelectedTime("");
            } else {
                toast({ title: "Error", description: "Ocurrió un problema al programar tu cita. Inténtalo de nuevo.", variant: "destructive" });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Generar slots de tiempo (filtrado exacto de horas pasadas y ocupadas)
    const getTimeSlots = () => {
        if (!selectedDate || !horarios.length) return [];

        const dayOfWeek = selectedDate.getDay(); // 0-6
        const schedule = horarios.find(h => h.dia_semana === dayOfWeek);

        if (!schedule) return [];

        const slots = [];
        let [h, m] = schedule.hora_inicio.split(':').map(Number);
        const [endH, endM] = schedule.hora_fin.split(':').map(Number);

        const current = new Date();
        current.setHours(h, m, 0);
        const end = new Date();
        end.setHours(endH, endM, 0);

        const now = new Date();
        const isToday = selectedDate.getDate() === now.getDate() &&
                        selectedDate.getMonth() === now.getMonth() &&
                        selectedDate.getFullYear() === now.getFullYear();

        while (current < end) {
            const timeString = current.toTimeString().slice(0, 5);
            
            // Si la fecha seleccionada es hoy, comparar estrictamente los minutos del ordenador con la hora del turno
            let esPasado = false;
            if (isToday) {
                const nowMinutes = now.getHours() * 60 + now.getMinutes();
                const slotMinutes = current.getHours() * 60 + current.getMinutes();
                if (slotMinutes <= nowMinutes) {
                    esPasado = true;
                }
            }

            // Filtrar si ya está reservado o si es una hora que ya pasó el día de hoy
            if (!bookedSlots.includes(timeString) && !esPasado) {
                slots.push(timeString);
            }
            current.setMinutes(current.getMinutes() + (Number(schedule.duracion_cita_minutos) || 30));
        }
        return slots;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-center text-[hsl(var(--medical-blue))] mb-8">Agendar Cita Médica</h1>

                {/* Progress Bar */}
                <div className="flex justify-between mb-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10"></div>
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-[hsl(var(--medical-blue))] text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {s}
                        </div>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {step === 1 && "Seleccionar Especialidad y Doctor"}
                            {step === 2 && "Seleccionar Fecha y Hora"}
                            {step === 3 && "Datos del Paciente"}
                            {step === 4 && "Confirmación"}
                        </CardTitle>
                        <CardDescription>Paso {step} de 4</CardDescription>
                    </CardHeader>

                    <CardContent>
                        {/* PASO 1: Especialidad y Doctor */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Especialidad</Label>
                                    <Select onValueChange={setSelectedEspecialidad} value={selectedEspecialidad}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione una especialidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {especialidades.map(esp => (
                                                <SelectItem key={esp.id} value={String(esp.id)}>{esp.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedEspecialidad && (
                                    <div className="space-y-2">
                                        <Label>Doctor</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {doctores.map(doc => (
                                                <div
                                                    key={doc.id}
                                                    className={`border p-4 rounded-lg cursor-pointer transition-all ${selectedDoctor === String(doc.id) ? 'border-[hsl(var(--medical-blue))] bg-blue-50 ring-2 ring-blue-200' : 'hover:bg-gray-50'}`}
                                                    onClick={() => setSelectedDoctor(String(doc.id))}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-blue-100 p-2 rounded-full">
                                                            <Stethoscope className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">Dr. {doc.nombre} {doc.apellido}</p>
                                                            <p className="text-sm text-gray-500">{doc.email}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PASO 2: Fecha y Hora (Rediseñado) */}
                        {step === 2 && (
                            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="text-center space-y-2">
                                    <h2 className="text-xl font-semibold text-gray-800">¿Cuándo te gustaría venir?</h2>
                                    <p className="text-gray-500 text-sm">Selecciona una fecha y luego un horario disponible.</p>
                                </div>

                                <div className="grid lg:grid-cols-2 gap-8 items-start">
                                    {/* Calendar Section */}
                                    <div className="flex flex-col items-center">
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full max-w-sm">
                                            <div className="flex items-center gap-2 mb-4 text-[hsl(var(--medical-blue))] font-medium">
                                                <CalendarIcon className="h-5 w-5" />
                                                <span>1. Selecciona el Día</span>
                                            </div>
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={setSelectedDate}
                                                className="rounded-md border-none w-full flex justify-center"
                                                classNames={{
                                                    head_cell: "text-gray-500 font-normal text-sm w-9",
                                                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-[hsl(var(--medical-blue))] first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-full transition-colors",
                                                    day_selected: "bg-[hsl(var(--medical-blue))] text-white hover:bg-[hsl(var(--medical-blue))] hover:text-white focus:bg-[hsl(var(--medical-blue))] focus:text-white",
                                                    day_today: "bg-gray-100 text-gray-900",
                                                }}
                                                locale={es}
                                                disabled={(date) => date < new Date()}
                                            />
                                        </div>
                                    </div>

                                    {/* Time Slots Section */}
                                    <div className="flex flex-col w-full">
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                                            <div className="flex items-center gap-2 mb-6 text-[hsl(var(--medical-blue))] font-medium">
                                                <Clock className="h-5 w-5" />
                                                <span>2. Selecciona la Hora</span>
                                            </div>

                                            {!selectedDate ? (
                                                <div className="flex flex-col items-center justify-center h-48 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                                    <CalendarIcon className="h-12 w-12 mb-3 opacity-20" />
                                                    <p>Por favor, selecciona una fecha<br />en el calendario primero.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <p className="text-sm text-gray-600 font-medium">
                                                        Horarios para el {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}:
                                                    </p>

                                                    {getTimeSlots().length > 0 ? (
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                            {getTimeSlots().map((time) => (
                                                                <Button
                                                                    key={time}
                                                                    variant={selectedTime === time ? "default" : "outline"}
                                                                    className={`h-12 text-base transition-all duration-200 ${selectedTime === time
                                                                            ? "bg-[hsl(var(--medical-blue))] text-white shadow-md scale-105"
                                                                            : "hover:border-[hsl(var(--medical-blue))] hover:text-[hsl(var(--medical-blue))] hover:bg-blue-50"
                                                                        }`}
                                                                    onClick={() => setSelectedTime(time)}
                                                                >
                                                                    {time}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center h-40 text-center text-amber-600 bg-amber-50 rounded-xl border border-amber-100 p-4">
                                                            <p className="font-medium">No hay turnos disponibles</p>
                                                            <p className="text-sm mt-1 opacity-80">Por favor intenta con otra fecha.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PASO 3: Paciente */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="flex gap-4 items-end">
                                    <div className="flex-1 space-y-2">
                                        <Label>Número de Cédula</Label>
                                        <Input
                                            value={cedula}
                                            onChange={(e) => setCedula(e.target.value)}
                                            placeholder="Ingrese su cédula"
                                        />
                                    </div>
                                    <Button onClick={handleSearchPatient} disabled={isLoading}>
                                        {isLoading ? "Buscando..." : "Buscar"}
                                    </Button>
                                </div>

                                {paciente && !isRegistering && (
                                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center gap-4">
                                        <div className="bg-green-100 p-2 rounded-full">
                                            <User className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-green-800">{paciente.nombre} {paciente.apellido}</p>
                                            <p className="text-sm text-green-700">{paciente.email}</p>
                                        </div>
                                        <Button variant="ghost" className="ml-auto text-green-700" onClick={() => setPaciente(null)}>Cambiar</Button>
                                    </div>
                                )}

                                {isRegistering && (
                                    <form id="register-form" onSubmit={handleRegisterPatient} className="space-y-4 border p-4 rounded-lg bg-gray-50">
                                        <h3 className="font-medium text-gray-900">Registro de Nuevo Paciente</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nombre</Label>
                                                <Input required value={patientForm.nombre} onChange={e => setPatientForm({ ...patientForm, nombre: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Apellido</Label>
                                                <Input required value={patientForm.apellido} onChange={e => setPatientForm({ ...patientForm, apellido: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Email</Label>
                                                <Input type="email" required value={patientForm.email} onChange={e => setPatientForm({ ...patientForm, email: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Celular (WhatsApp)</Label>
                                                <Input required value={patientForm.celular} onChange={e => setPatientForm({ ...patientForm, celular: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Fecha Nacimiento</Label>
                                                <Input type="date" required value={patientForm.fecha_nacimiento} onChange={e => setPatientForm({ ...patientForm, fecha_nacimiento: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Dirección</Label>
                                                <Input value={patientForm.direccion} onChange={e => setPatientForm({ ...patientForm, direccion: e.target.value })} />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading ? "Registrando..." : "Registrar Paciente"}
                                        </Button>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* PASO 4: Confirmación */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 space-y-4">
                                    <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2">
                                        <CalendarIcon className="h-5 w-5" /> Resumen de la Cita
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Doctor</p>
                                            <p className="font-medium">Dr. {doctores.find(d => String(d.id) === selectedDoctor)?.nombre} {doctores.find(d => String(d.id) === selectedDoctor)?.apellido}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Especialidad</p>
                                            <p className="font-medium">{especialidades.find(e => String(e.id) === selectedEspecialidad)?.nombre}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Fecha</p>
                                            <p className="font-medium">{selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Hora</p>
                                            <p className="font-medium">{selectedTime}</p>
                                        </div>
                                        <div className="col-span-2 pt-2 border-t border-blue-200">
                                            <p className="text-gray-500">Paciente</p>
                                            <p className="font-medium">{paciente?.nombre} {paciente?.apellido}</p>
                                            <p className="text-xs text-gray-500">{paciente?.cedula}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex justify-between">
                        {step > 1 && (
                            <Button variant="outline" onClick={prevStep}>
                                <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                            </Button>
                        )}

                        {step < 4 && (
                            <Button
                                className="ml-auto"
                                onClick={nextStep}
                                disabled={
                                    (step === 1 && !selectedDoctor) ||
                                    (step === 2 && (!selectedDate || !selectedTime)) ||
                                    (step === 3 && !paciente)
                                }
                            >
                                Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}

                        {step === 4 && (
                            <Button className="ml-auto bg-green-600 hover:bg-green-700" onClick={handleConfirmAppointment} disabled={isLoading}>
                                {isLoading ? "Confirmando..." : "Confirmar Cita"} <Check className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Agendar;