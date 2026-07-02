import { Heart, Phone, Mail, MapPin, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[hsl(var(--medical-dark))] text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-[hsl(var(--medical-blue))]" />
              <span className="font-bold text-xl">MediCenter</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Tu centro de salud de confianza. Brindamos atención médica de calidad 
              con tecnología avanzada y profesionales especializados.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Servicios</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Medicina General</li>
              <li>Cardiología</li>
              <li>Dermatología</li>
              <li>Pediatría</li>
              <li>Ginecología</li>
              <li>Traumatología</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contacto</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-[hsl(var(--medical-blue))]" />
                <span>+593 2 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-[hsl(var(--medical-blue))]" />
                <span>info@medicenter.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-[hsl(var(--medical-blue))]" />
                <span>Av. Principal 123, Quito</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Horarios</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-[hsl(var(--medical-blue))]" />
                <div>
                  <p>Lun - Vie: 8:00 - 18:00</p>
                  <p>Sábados: 8:00 - 14:00</p>
                  <p>Emergencias: 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 MediCenter. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;