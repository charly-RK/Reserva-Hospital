import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import Inicio from "@/pages/Inicio";
import Servicios from "@/pages/Servicios";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Agendar from "@/pages/Agendar";
import Citas from "@/pages/Citas";
import Facturacion from "@/pages/admin/Facturacion";
import NotFound from "@/pages/NotFound";
import AdminLayout from "@/layouts/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import CitasAdmin from "@/pages/admin/Citas";
import Doctores from "@/pages/admin/Doctores";
import Pacientes from "@/pages/admin/Pacientes";
import Notificaciones from "@/pages/admin/Notificaciones";
import Configuracion from "@/pages/admin/Configuracion";
import Usuarios from "@/pages/admin/Usuarios";
import Perfil from "@/pages/admin/Perfil";

const queryClient = new QueryClient();

// Layout para la parte pública
const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/agendar" element={<Agendar />} />
            <Route path="/mis-citas" element={<Citas />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/registro" element={<Register />} />
          </Route>

          {/* Ruta de Login (Sin Header/Footer) */}
          <Route path="/login" element={<Login />} />

          {/* Rutas de Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="citas" element={<CitasAdmin />} />
            <Route path="doctores" element={<Doctores />} />
            <Route path="pacientes" element={<Pacientes />} />
            {/* <Route path="usuarios" element={<Usuarios />} /> */}
            <Route path="notificaciones" element={<Notificaciones />} />
            <Route path="configuracion" element={<Configuracion />} />
            <Route path="facturacion" element={<Facturacion />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>

          {/* Rutas de Doctor (Mismo layout con permisos filtrados) */}
          <Route path="/doctor" element={<AdminLayout />}>
            <Route path="dashboard" element={<CitasAdmin />} />
            <Route path="citas" element={<CitasAdmin />} />
            <Route path="pacientes" element={<Pacientes />} />
            <Route path="notificaciones" element={<Notificaciones />} />
            <Route path="configuracion" element={<Configuracion />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
