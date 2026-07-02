import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, Loader2, Eye, EyeOff, ShieldCheck, KeyRound } from "lucide-react";
import authService from "@/servicios/auth";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para Cambio Obligatorio de Contraseña
  const [modalCambioClave, setModalCambioClave] = useState<{ open: boolean; user: any | null }>({ open: false, user: null });
  const [nuevaClave, setNuevaClave] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [actualizandoClave, setActualizandoClave] = useState(false);

  const redirigirUsuario = (user: any) => {
    if (user.rol === 'ADMIN') {
      navigate('/admin/dashboard');
    } else if (user.rol === 'DOCTOR') {
      navigate('/admin/citas');
    } else {
      navigate('/');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await authService.login({ email, password });

      // Verificar si requiere cambio de clave por ser primer ingreso o clave temporal
      const yaCambio = localStorage.getItem(`cambio_clave_${user.id}`);
      if ((user.requiere_cambio || user.rol === 'DOCTOR') && !yaCambio) {
        setModalCambioClave({ open: true, user });
        toast({
          title: "Cambio de Contraseña Requerido",
          description: "Por seguridad en tu primer acceso, debes cambiar la contraseña temporal.",
        });
        return;
      }

      toast({
        title: "Bienvenido",
        description: `Has iniciado sesión como ${user.nombre}`,
      });

      redirigirUsuario(user);
    } catch (error: any) {
      const mensajeError = error?.response?.data?.error || "Credenciales incorrectas. Por favor intenta de nuevo.";
      toast({
        title: "Error de acceso",
        description: mensajeError,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCambiarClave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaClave || nuevaClave.length < 6) {
      toast({ title: "Contraseña insegura", description: "Debe tener al menos 6 caracteres.", variant: "destructive" });
      return;
    }
    if (nuevaClave !== confirmarClave) {
      toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
      return;
    }

    setActualizandoClave(true);
    try {
      if (modalCambioClave.user?.email) {
        await authService.cambiarClave({ email: modalCambioClave.user.email, nuevaPassword: nuevaClave });
      }
      if (modalCambioClave.user?.id) {
        localStorage.setItem(`cambio_clave_${modalCambioClave.user.id}`, 'true');
      }
      toast({
        title: "¡Contraseña actualizada!",
        description: "Tu nueva contraseña personal ha sido guardada exitosamente."
      });
      const u = modalCambioClave.user;
      setModalCambioClave({ open: false, user: null });
      if (u) redirigirUsuario(u);
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar la contraseña en el servidor.", variant: "destructive" });
    } finally {
      setActualizandoClave(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <Card className={`w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-2xl border-slate-200/50 dark:border-slate-800/50 transition-all duration-300 ${modalCambioClave.open ? "blur-md pointer-events-none select-none scale-95" : ""}`}>
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-blue-600/30">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Ingresa tus credenciales para acceder al portal médico
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@hospital.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 shadow-lg shadow-blue-600/20" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Modal de Cambio de Contraseña Obligatorio en Primer Ingreso */}
      <Dialog open={modalCambioClave.open} onOpenChange={() => {}}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-2xl [&>button]:hidden">
          <DialogHeader>
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-2">
              <ShieldCheck className="w-6 h-6 text-amber-500" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Cambio de Contraseña Requerido</DialogTitle>
            <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
              ¡Hola <strong>{modalCambioClave.user?.nombre}</strong>! Has ingresado con una contraseña temporal. Por motivos de seguridad y confidencialidad médica, es obligatorio establecer una nueva clave antes de continuar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCambiarClave} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nueva Contraseña</Label>
              <div className="relative mt-1">
                <Input
                  type={mostrarNueva ? "text" : "password"}
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={nuevaClave}
                  onChange={e => setNuevaClave(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setMostrarNueva(!mostrarNueva)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {mostrarNueva ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Confirmar Nueva Contraseña</Label>
              <Input
                type={mostrarNueva ? "text" : "password"}
                required
                placeholder="Repite la nueva contraseña"
                value={confirmarClave}
                onChange={e => setConfirmarClave(e.target.value)}
                className="mt-1"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="submit" disabled={actualizandoClave} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                {actualizandoClave ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                Actualizar e Ingresar al Portal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;