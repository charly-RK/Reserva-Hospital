import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Heart, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import authService from "@/servicios/auth";
import pacientesService from "@/servicios/pacientes";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    cedula: "",
    nombre: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateCedula = (cedula: string) => {
    return cedula.length === 10 && /^\d+$/.test(cedula);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validaciones
    if (!validateCedula(formData.cedula)) {
      toast({
        title: "Error",
        description: "La cédula debe tener exactamente 10 dígitos.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Registrar al paciente en la tabla de pacientes si no existe
      const pacienteCreado = await pacientesService.registrar({
        cedula: formData.cedula,
        nombre: formData.nombre,
        apellido: "Paciente",
        celular: "+593 99 000 0000",
        email: formData.email,
        fecha_nacimiento: "1990-01-01",
        direccion: "No especificada"
      });

      // Registrar usuario para login
      await authService.register({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        rol: "PACIENTE",
        paciente_id: pacienteCreado?.id || null
      });

      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta y perfil de paciente han sido creados en la base de datos.",
      });
      navigate("/login");
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error en el registro",
        description: error.response?.data?.error || "No se pudo completar el registro.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--medical-light))] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-10 w-10 text-[hsl(var(--medical-blue))]" />
            <span className="font-bold text-2xl bg-gradient-to-r from-[hsl(var(--medical-blue))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
              MediCenter
            </span>
          </div>
          <p className="text-gray-600">Crea tu cuenta para agendar citas</p>
        </div>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-[hsl(var(--medical-dark))]">
              Crear Cuenta
            </CardTitle>
            <CardDescription className="text-center">
              Completa tus datos para registrarte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cedula">Cédula de Identidad</Label>
                <Input
                  id="cedula"
                  name="cedula"
                  type="text"
                  placeholder="1234567890"
                  value={formData.cedula}
                  onChange={handleChange}
                  required
                  maxLength={10}
                  className="h-11"
                />
                {formData.cedula && validateCedula(formData.cedula) && (
                  <div className="flex items-center text-[hsl(var(--secondary))] text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Cédula válida
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="flex items-center text-[hsl(var(--secondary))] text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Las contraseñas coinciden
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                variant="medical" 
                className="w-full h-11" 
                disabled={isLoading}
              >
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">¿Ya tienes cuenta? </span>
              <Link 
                to="/login" 
                className="text-sm text-[hsl(var(--medical-blue))] hover:underline font-medium"
              >
                Inicia sesión aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;