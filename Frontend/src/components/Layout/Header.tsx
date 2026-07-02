import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X, Calendar, User, LogIn } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Servicios", href: "/servicios" },
    { name: "Agendar", href: "/agendar" },
    { name: "Mis Citas", href: "/mis-citas" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Detect scroll for styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b"
          : "bg-white border-b border-transparent"
        }`}
    >
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="bg-[hsl(var(--medical-blue))] p-2 rounded-xl transition-transform group-hover:scale-105">
            <Heart className="h-6 w-6 text-white fill-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-[hsl(var(--medical-dark))] group-hover:text-[hsl(var(--medical-blue))] transition-colors">
            MediCenter
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-sm font-medium transition-all hover:text-[hsl(var(--medical-blue))] relative py-1 ${isActive(item.href)
                  ? "text-[hsl(var(--medical-blue))]"
                  : "text-gray-600"
                }`}
            >
              {item.name}
              {isActive(item.href) && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[hsl(var(--medical-blue))] rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost" className="text-gray-600 hover:text-[hsl(var(--medical-blue))] hover:bg-blue-50">
              Iniciar Sesión
            </Button>
          </Link>
          <Link to="/registro">
            <Button className="bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all">
              Registrarse
            </Button>
          </Link>
        </div>

        {/* Mobile Menu (Sheet) */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-600">
                <Menu className="h-7 w-7" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col">
              <SheetHeader className="text-left border-b pb-4 mb-4">
                <SheetTitle className="flex items-center space-x-2">
                  <div className="bg-[hsl(var(--medical-blue))] p-1.5 rounded-lg">
                    <Heart className="h-5 w-5 text-white fill-white" />
                  </div>
                  <span className="font-bold text-xl text-[hsl(var(--medical-dark))]">
                    MediCenter
                  </span>
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col space-y-4 flex-1">
                {navigation.map((item) => (
                  <SheetClose asChild key={item.name}>
                    <Link
                      to={item.href}
                      className={`text-lg font-medium px-4 py-3 rounded-lg transition-colors ${isActive(item.href)
                          ? "bg-blue-50 text-[hsl(var(--medical-blue))]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-[hsl(var(--medical-blue))]"
                        }`}
                    >
                      {item.name}
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              <div className="border-t pt-6 mt-auto space-y-4">
                <SheetClose asChild>
                  <Link to="/login" className="block">
                    <Button variant="outline" className="w-full justify-start h-12 text-base font-medium border-gray-200">
                      <LogIn className="mr-3 h-5 w-5 text-gray-500" />
                      Iniciar Sesión
                    </Button>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/registro" className="block">
                    <Button className="w-full justify-start h-12 text-base font-medium bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white">
                      <User className="mr-3 h-5 w-5" />
                      Registrarse
                    </Button>
                  </Link>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;