import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, User, Stethoscope, Trash2, FileDown, Phone, Search, ShieldCheck, ChevronLeft, ChevronRight, History, AlertCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import citasService from "@/servicios/citas";
import pacientesService from "@/servicios/pacientes";
import { format } from "date-fns";
import jsPDF from "jspdf";

interface Appointment {
  id: number;
  fecha_cita: string;
  hora_cita: string;
  especialidad: string;
  doctor_nombre: string;
  doctor_apellido: string;
  estado: string;
  codigo_cita?: string;
  paciente_nombre?: string;
  paciente_apellido?: string;
  paciente_cedula?: string;
}

const MyAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cedula, setCedula] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  // Estados para cancelación segura por OTP
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSentInfo, setOtpSentInfo] = useState<{ email?: string; telefono?: string; demoCode?: string }>({});

  // Estados para paginación de citas canceladas (1 por página)
  const [showCancelledSection, setShowCancelledSection] = useState(false);
  const [cancelledPage, setCancelledPage] = useState(1);

  const handleSearch = async () => {
    if (!cedula.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      // 1. Buscar paciente por cédula
      const paciente = await pacientesService.buscarPorCedula(cedula.trim());

      if (!paciente) {
        setAppointments([]);
        toast({
          title: "Paciente no encontrado",
          description: "No existe un paciente registrado con esa cédula.",
          variant: "destructive"
        });
        return;
      }

      // 2. Buscar citas del paciente
      const citas = await citasService.obtenerPorPaciente(paciente.id);
      setAppointments(citas);
      setCancelledPage(1);

      if (citas.length === 0) {
        toast({
          title: "Sin citas",
          description: "No tienes citas programadas en nuestro sistema.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Hubo un problema al consultar tus citas.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 1 de cancelación: Solicitar código OTP al backend
  const handleInitiateCancel = async (appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);
    setOtpCode("");
    setIsVerifyingOtp(true);
    try {
      const response = await citasService.solicitarCancelacion(appointmentId);
      setOtpSentInfo({
        email: response.email,
        telefono: response.telefono,
        demoCode: response.demoCode
      });
      setIsCancelModalOpen(true);
      toast({
        title: "Código de verificación enviado",
        description: `Hemos enviado un código a tu correo y teléfono para confirmar la cancelación.`,
      });
    } catch (error) {
      toast({
        title: "No se pudo solicitar la cancelación",
        description: "Ocurrió un error temporal. Por favor intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Paso 2 de cancelación: Confirmar código OTP
  const handleConfirmCancelOtp = async () => {
    if (!selectedAppointmentId || !otpCode.trim()) {
      toast({
        title: "Código incompleto",
        description: "Por favor ingresa los 6 dígitos del código.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await citasService.confirmarCancelacionOTP(selectedAppointmentId, otpCode.trim());

      // Actualizar lista localmente
      setAppointments(appointments.map(apt =>
        apt.id === selectedAppointmentId ? { ...apt, estado: 'Cancelada' } : apt
      ));

      setIsCancelModalOpen(false);
      setSelectedAppointmentId(null);
      setOtpCode("");

      toast({
        title: "Cita cancelada",
        description: "Tu cita médica ha sido cancelada correctamente.",
      });
    } catch (error: any) {
      const msj = error?.response?.data?.mensaje || "El código ingresado es incorrecto o ha expirado.";
      toast({
        title: "Error de verificación",
        description: msj,
        variant: "destructive"
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Descarga de Cita en PDF con diseño profesional de alta estética
  const handleDownloadReceipt = (appointment: Appointment) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const primaryColor = [2, 132, 199]; // Azul médico #0284c7
      const darkColor = [15, 23, 42]; // Slate 900
      const grayColor = [100, 116, 139]; // Slate 500

      // Cabecera / Membrete
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 38, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("MEDICENTER HOSPITAL", 20, 18);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("Comprobante Oficial de Reserva Médica & Admisión", 20, 27);

      // Título de Sección
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("DATOS DE LA CONSULTA PROGRAMADA", 20, 52);

      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.8);
      doc.line(20, 55, 190, 55);

      // Tarjeta de información de la consulta
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(20, 62, 170, 75, 4, 4, 'FD');

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Paciente / Cédula:", 28, 74);
      doc.setFont("helvetica", "normal");
      doc.text(`${appointment.paciente_nombre || 'Paciente'} ${appointment.paciente_apellido || ''} (${cedula})`, 75, 74);

      doc.setFont("helvetica", "bold");
      doc.text("Especialidad Médica:", 28, 85);
      doc.setFont("helvetica", "normal");
      doc.text(`${appointment.especialidad}`, 75, 85);

      doc.setFont("helvetica", "bold");
      doc.text("Médico Especialista:", 28, 96);
      doc.setFont("helvetica", "normal");
      doc.text(`Dr/a. ${appointment.doctor_nombre} ${appointment.doctor_apellido}`, 75, 96);

      doc.setFont("helvetica", "bold");
      doc.text("Fecha Asignada:", 28, 107);
      doc.setFont("helvetica", "normal");
      doc.text(`${format(new Date(appointment.fecha_cita), 'dd/MM/yyyy')}`, 75, 107);

      doc.setFont("helvetica", "bold");
      doc.text("Hora de Turno:", 28, 118);
      doc.setFont("helvetica", "normal");
      doc.text(`${appointment.hora_cita} hrs`, 75, 118);

      doc.setFont("helvetica", "bold");
      doc.text("Código de Cita:", 28, 129);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text(`${appointment.codigo_cita || `CIT-${appointment.id}-MC`}`, 75, 129);

      // Recomendaciones
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Instrucciones Importantes para el Paciente", 20, 155);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text("• Preséntese en recepción al menos 15 minutos antes del horario programado.", 25, 166);
      doc.text("• Presente este comprobante impreso o desde su teléfono celular junto a su cédula.", 25, 174);
      doc.text("• Si cuenta con exámenes de laboratorio o imágenes de radiología previos, tráigalos consigo.", 25, 182);
      doc.text("• En caso de no poder asistir, cancele desde la web o llame con 2 horas de anticipación.", 25, 190);

      // Cuadro de contacto
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(20, 202, 170, 24, 3, 3, 'F');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text("Atención Telefónica & Reprogramación: +593 2 123-4567 / info@medicenter.ec", 28, 216);

      // Línea de firma digital
      doc.setLineWidth(0.3);
      doc.setDrawColor(203, 213, 225);
      doc.line(20, 250, 190, 250);

      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text("Documento electrónico validado digitalmente por el Sistema Hospitalario MediCenter.", 20, 256);
      doc.text(`Fecha y hora de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, 20, 261);

      doc.save(`Recibo_Cita_MediCenter_${appointment.id}.pdf`);

      toast({
        title: "📄 Comprobante descargado",
        description: `El PDF profesional para ${appointment.especialidad} está listo en tus descargas.`,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error al generar PDF",
        description: "Ocurrió un error al compilar el documento.",
        variant: "destructive"
      });
    }
  };

  // Filtrado de citas activas vs canceladas
  const activeAppointments = appointments.filter(
    apt => apt.estado?.toUpperCase() !== 'CANCELADA'
  );
  const cancelledAppointments = appointments.filter(
    apt => apt.estado?.toUpperCase() === 'CANCELADA'
  );

  // Lógica de paginación para citas canceladas (1 por página)
  const currentCancelledApt = cancelledAppointments[cancelledPage - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--medical-light))] via-white to-[hsl(var(--medical-light))] py-12">
      <div className="container max-w-4xl px-4">
        <div className="text-center mb-12 animate-fade-in">
          <Badge className="mb-3 bg-blue-100 text-[hsl(var(--medical-blue))] hover:bg-blue-200 px-4 py-1 text-sm rounded-full">
            <Sparkles className="h-4 w-4 mr-1.5 inline" /> Portal de Pacientes
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-[hsl(var(--medical-dark))] tracking-tight">
            Mis Citas Médicas
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Consulta y administra tus citas médicas en tiempo real ingresando tu número de cédula de identidad.
          </p>
        </div>

        {/* Buscador */}
        <Card className="mb-8 shadow-xl border-t-4 border-t-[hsl(var(--medical-blue))]">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2 w-full">
                <Label className="text-sm font-semibold text-[hsl(var(--medical-dark))]">Número de Cédula de Identidad</Label>
                <div className="relative">
                  <Input
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    placeholder="Ej. 1753654043"
                    className="pl-4 pr-10 text-lg py-6 rounded-xl border-gray-300 focus:ring-2 focus:ring-[hsl(var(--medical-blue))]"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isLoading} 
                className="bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white font-semibold py-6 px-8 rounded-xl shadow-md w-full sm:w-auto transition-all duration-200"
              >
                {isLoading ? "Buscando..." : "Consultar Citas"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {hasSearched && appointments.length === 0 && !isLoading && (
          <Card className="text-center py-12 border-dashed border-2 shadow-sm animate-fade-in">
            <CardContent>
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-10 w-10 text-[hsl(var(--medical-blue))]" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-[hsl(var(--medical-dark))]">
                No se encontraron citas programadas
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                No dispones de citas médicas registradas actualmente con este número de cédula.
              </p>
              <Link to="/agendar">
                <Button className="bg-[hsl(var(--medical-blue))] hover:bg-blue-700 px-8 py-6 rounded-xl shadow-lg text-base">
                  <Calendar className="mr-2 h-5 w-5" />
                  Agendar Nueva Cita
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Citas Activas / Programadas */}
        {activeAppointments.length > 0 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-[hsl(var(--medical-dark))] flex items-center gap-2 mb-4">
              <Stethoscope className="h-6 w-6 text-[hsl(var(--medical-blue))]" />
              Citas Activas y Programadas ({activeAppointments.length})
            </h2>

            {activeAppointments.map((appointment) => (
              <Card key={appointment.id} className="shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <div className="h-2 bg-gradient-to-r from-[hsl(var(--medical-blue))] to-cyan-500" />
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-2xl font-bold text-[hsl(var(--medical-dark))] flex items-center gap-2">
                        <span>{appointment.especialidad}</span>
                      </CardTitle>
                      <CardDescription className="text-gray-500 font-medium mt-1">
                        Código: <span className="text-[hsl(var(--medical-blue))] font-semibold">{appointment.codigo_cita || `CIT-${appointment.id}-MC`}</span>
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={`px-3 py-1 text-sm font-semibold rounded-full w-fit ${
                        appointment.estado?.toUpperCase() === 'PENDIENTE' || appointment.estado?.toUpperCase() === 'CONFIRMADA' ? 'bg-blue-50 border-blue-300 text-[hsl(var(--medical-blue))]' : ''
                      } ${appointment.estado?.toUpperCase() === 'COMPLETADA' ? 'bg-green-50 border-green-300 text-green-700' : ''}`}
                    >
                      ● {appointment.estado}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-100">
                      <div className="flex items-center space-x-3.5">
                        <div className="p-2.5 bg-white rounded-lg shadow-sm text-[hsl(var(--medical-blue))]">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Doctor/a Tratante</div>
                          <div className="font-bold text-gray-800 text-base">Dr/a. {appointment.doctor_nombre} {appointment.doctor_apellido}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3.5">
                        <div className="p-2.5 bg-white rounded-lg shadow-sm text-[hsl(var(--medical-blue))]">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Fecha Asignada</div>
                          <div className="font-bold text-gray-800 text-base">{format(new Date(appointment.fecha_cita), 'dd/MM/yyyy')}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3.5">
                        <div className="p-2.5 bg-white rounded-lg shadow-sm text-[hsl(var(--medical-blue))]">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Hora Programada</div>
                          <div className="font-bold text-gray-800 text-base">{appointment.hora_cita} hrs</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 flex flex-col justify-between">
                      <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl">
                        <h4 className="font-bold text-sm mb-1.5 text-[hsl(var(--medical-dark))] flex items-center gap-1.5">
                          <Phone className="h-4 w-4 text-[hsl(var(--medical-blue))]" />
                          Soporte & Asistencia Hospitalaria:
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Si requieres cambiar tu cita por motivos de fuerza mayor comunícate de inmediato al <strong>+593 2 123-4567</strong>.
                        </p>
                      </div>

                      {(appointment.estado?.toUpperCase() === 'PENDIENTE' || appointment.estado?.toUpperCase() === 'CONFIRMADA') && (
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <Button
                            variant="outline"
                            onClick={() => handleDownloadReceipt(appointment)}
                            className="flex-1 border-2 border-[hsl(var(--medical-blue))] text-[hsl(var(--medical-blue))] hover:bg-blue-50 font-semibold py-5 rounded-xl shadow-sm"
                          >
                            <FileDown className="mr-2 h-5 w-5" />
                            Descargar PDF
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleInitiateCancel(appointment.id)}
                            disabled={isVerifyingOtp}
                            className="flex-1 bg-red-600 hover:bg-red-700 font-semibold py-5 rounded-xl shadow-sm"
                          >
                            <Trash2 className="mr-2 h-5 w-5" />
                            Cancelar Cita
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-gray-600 mb-2">
                        Recomendaciones para el día de tu cita:
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>• Llega con 15 minutos de anticipación</div>
                        <div>• Presenta tu cédula de identidad en recepción</div>
                        <div>• Trae exámenes o radiografías previas</div>
                        <div>• Cancelaciones verificadas por código OTP</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Sección Colapsable / Acordeón para Citas Canceladas (Paginación 1 en 1) */}
        {cancelledAppointments.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div 
              onClick={() => setShowCancelledSection(!showCancelledSection)}
              className="flex items-center justify-between p-5 bg-gray-100/80 hover:bg-gray-200/70 rounded-2xl cursor-pointer transition-all duration-200 border border-gray-300/50 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-300/60 rounded-xl text-gray-700">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    Historial de Citas Canceladas
                  </h3>
                  
                </div>
              </div>
              <Badge variant="secondary" className="bg-gray-300 text-gray-800 font-bold px-3 py-1">
                {cancelledAppointments.length} {cancelledAppointments.length === 1 ? 'cita cancelada' : 'citas canceladas'}
              </Badge>
            </div>

            {showCancelledSection && currentCancelledApt && (
              <div className="mt-6 animate-fade-in space-y-4">
                <Card className="border-red-200 bg-red-50/30 rounded-2xl overflow-hidden shadow-md">
                  <div className="h-1.5 bg-red-400" />
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 mb-2">
                          CITA CANCELADA
                        </Badge>
                        <CardTitle className="text-xl font-bold text-gray-800">
                          {currentCancelledApt.especialidad}
                        </CardTitle>
                      </div>
                      <span className="text-xs font-semibold text-gray-400">
                        #{currentCancelledApt.codigo_cita || currentCancelledApt.id}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-200/70 text-sm">
                      <div>
                        <span className="text-xs text-gray-400 block font-semibold">Doctor/a</span>
                        <strong className="text-gray-700">Dr/a. {currentCancelledApt.doctor_nombre} {currentCancelledApt.doctor_apellido}</strong>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block font-semibold">Fecha</span>
                        <strong className="text-gray-700">{format(new Date(currentCancelledApt.fecha_cita), 'dd/MM/yyyy')}</strong>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block font-semibold">Hora</span>
                        <strong className="text-gray-700">{currentCancelledApt.hora_cita} hrs</strong>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Control de Paginación para Canceladas (Anterior - Siguiente) */}
                {cancelledAppointments.length > 1 && (
                  <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCancelledPage(prev => Math.max(prev - 1, 1))}
                      disabled={cancelledPage === 1}
                      className="rounded-lg font-medium"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                    </Button>
                    <span className="text-sm font-semibold text-gray-600">
                      Cita cancelada <span className="text-[hsl(var(--medical-blue))] font-bold">{cancelledPage}</span> de <span className="font-bold">{cancelledAppointments.length}</span>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCancelledPage(prev => Math.min(prev + 1, cancelledAppointments.length))}
                      disabled={cancelledPage === cancelledAppointments.length}
                      className="rounded-lg font-medium"
                    >
                      Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-16">
          <Link to="/agendar">
            <Button className="bg-[hsl(var(--medical-blue))] hover:bg-blue-700 px-8 py-6 rounded-xl shadow-lg text-base font-semibold">
              <Calendar className="mr-2 h-5 w-5" />
              Agendar Nueva Cita
            </Button>
          </Link>
        </div>
      </div>

      {/* MODAL DE VERIFICACIÓN DE CANCELACIÓN POR OTP */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader className="text-center sm:text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Protección y Verificación de Cita
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 leading-relaxed">
              Para evitar cancelaciones malintencionadas de terceros, hemos enviado un código de seguridad de 6 dígitos al correo y celular del titular de la cita:
              <span className="block mt-2 font-bold text-gray-800 bg-gray-100 p-2 rounded-lg">
                ✉ {otpSentInfo.email || 'Correo registrado'}<br />
                📱 {otpSentInfo.telefono || 'Teléfono registrado'}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-xs uppercase font-bold text-gray-500 block text-center">
                Ingresa el Código de Verificación
              </Label>
              <Input
                id="otp"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="• • • • • •"
                className="text-center text-2xl tracking-widest font-extrabold py-6 rounded-xl border-2 focus:border-red-500"
              />
            </div>

            {otpSentInfo.demoCode && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5 text-xs text-blue-900">
                <AlertCircle className="h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <span>Tu código temporal de verificación es:</span>{' '}
                  <code className="bg-blue-200 px-2 py-0.5 rounded font-bold text-sm ml-1">{otpSentInfo.demoCode}</code>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setIsCancelModalOpen(false)}
              className="flex-1 py-5 rounded-xl font-semibold"
            >
              Volver atrás
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancelOtp}
              disabled={isVerifyingOtp || otpCode.length < 4}
              className="flex-1 py-5 rounded-xl font-semibold bg-red-600 hover:bg-red-700 shadow-md"
            >
              {isVerifyingOtp ? "Verificando..." : "Confirmar Cancelación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyAppointments;