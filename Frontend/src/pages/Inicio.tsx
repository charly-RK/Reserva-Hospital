import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Clock, Shield, Calendar, Star, Phone, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import hospitalHero from "@/assets/hospital-hero.jpg";

const Home = () => {
    const services = [
        {
            icon: Heart,
            title: "Cardiología",
            description: "Atención especializada del corazón con tecnología avanzada"
        },
        {
            icon: Users,
            title: "Medicina General",
            description: "Consultas médicas generales y chequeos preventivos"
        },
        {
            icon: Shield,
            title: "Pediatría",
            description: "Cuidado especializado para niños y adolescentes"
        },
        {
            icon: Star,
            title: "Dermatología",
            description: "Tratamientos especializados para la piel"
        }
    ];

    const stats = [
        { number: "15+", label: "Años de experiencia" },
        { number: "50+", label: "Médicos especialistas" },
        { number: "10k+", label: "Pacientes atendidos" },
        { number: "24/7", label: "Atención de emergencias" }
    ];

    const features = [
        "Turnos online las 24 horas",
        "Especialistas certificados",
        "Tecnología médica avanzada",
        "Atención personalizada",
        "Seguimiento post-consulta",
        "Emergencias 24/7"
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
                <div className="container relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium text-[hsl(var(--medical-blue))] bg-blue-50 mb-6">
                                <span className="flex h-2 w-2 rounded-full bg-[hsl(var(--medical-blue))] mr-2"></span>
                                Disponible 24/7
                            </div>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[hsl(var(--medical-dark))] mb-6 leading-[1.1]">
                                Tu Salud es <br />
                                <span className="text-[hsl(var(--medical-blue))]">Nuestra Prioridad</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                                Centro médico de vanguardia con los mejores especialistas.
                                Agenda tu cita online de manera rápida y segura.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/agendar">
                                    <Button size="xl" className="min-w-[200px] bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all">
                                        <Calendar className="mr-2 h-5 w-5" />
                                        Agendar Cita
                                    </Button>
                                </Link>
                                <Link to="/servicios">
                                    <Button variant="outline" size="xl" className="min-w-[200px] border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-[hsl(var(--medical-blue))]">
                                        Ver Servicios
                                    </Button>
                                </Link>
                            </div>

                            <div className="mt-10 flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold">
                                            {i}
                                        </div>
                                    ))}
                                </div>
                                <p>Más de <span className="font-bold text-[hsl(var(--medical-dark))]">10k+ pacientes</span> confían en nosotros</p>
                            </div>
                        </div>

                        <div className="relative lg:h-[600px] w-full hidden md:block">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-transparent rounded-[3rem] transform rotate-3 scale-95 opacity-50"></div>
                            <img
                                src={hospitalHero}
                                alt="Hospital Team"
                                className="relative rounded-[2.5rem] shadow-2xl object-cover w-full h-full transform -rotate-2 hover:rotate-0 transition-transform duration-500"
                            />

                            {/* Floating Card */}
                            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl max-w-xs animate-bounce-slow hidden lg:block">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Citas Confirmadas</p>
                                        <p className="text-xs text-gray-500">Respuesta inmediata</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white border-y border-gray-100">
                <div className="container">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center group cursor-default">
                                <div className="text-4xl md:text-5xl font-bold text-[hsl(var(--medical-blue))] mb-2 group-hover:scale-110 transition-transform duration-300">
                                    {stat.number}
                                </div>
                                <div className="text-gray-600 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-24 bg-gray-50">
                <div className="container">
                    <div className="text-center mb-16">
                        <span className="text-[hsl(var(--medical-blue))] font-semibold tracking-wider uppercase text-sm">Especialidades</span>
                        <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4 text-[hsl(var(--medical-dark))]">
                            Nuestros Servicios Médicos
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Ofrecemos atención integral con tecnología de última generación
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.map((service, index) => (
                            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-none shadow-sm bg-white overflow-hidden">
                                <CardHeader className="pb-4">
                                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[hsl(var(--medical-blue))] transition-colors duration-300">
                                        <service.icon className="h-7 w-7 text-[hsl(var(--medical-blue))] group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <CardTitle className="text-xl text-[hsl(var(--medical-dark))] group-hover:text-[hsl(var(--medical-blue))] transition-colors">
                                        {service.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base leading-relaxed">
                                        {service.description}
                                    </CardDescription>
                                    <div className="mt-4 flex items-center text-[hsl(var(--medical-blue))] font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                        Saber más <ArrowRight className="ml-1 h-4 w-4" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[hsl(var(--medical-dark))] leading-tight">
                                ¿Por qué elegir <br />
                                <span className="text-[hsl(var(--medical-blue))]">MediCenter?</span>
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Nos dedicamos a proporcionar la mejor atención médica posible,
                                combinando experiencia clínica con un trato humano y personalizado.
                            </p>

                            <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 mb-10">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                        <span className="text-gray-700 font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Link to="/agendar">
                                <Button size="lg" className="bg-[hsl(var(--medical-dark))] hover:bg-gray-800 text-white">
                                    <Calendar className="mr-2 h-5 w-5" />
                                    Agenda tu Cita Ahora
                                </Button>
                            </Link>
                        </div>

                        <div className="relative order-1 lg:order-2">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30"></div>
                            <div className="relative bg-gradient-to-br from-[hsl(var(--medical-blue))] to-[hsl(var(--secondary))] rounded-3xl p-10 text-white shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                                <h3 className="text-3xl font-bold mb-6">Atención de Emergencias</h3>
                                <p className="mb-8 text-blue-100 text-lg leading-relaxed">
                                    Nuestro equipo de emergencias está preparado para atenderte
                                    las 24 horas del día, los 7 días de la semana, con la rapidez
                                    que tu salud merece.
                                </p>
                                <div className="flex items-center space-x-6 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                    <div className="bg-white p-3 rounded-full">
                                        <Phone className="h-6 w-6 text-[hsl(var(--medical-blue))]" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-blue-200 uppercase tracking-wider font-semibold">Llama ahora</div>
                                        <div className="text-3xl font-bold tracking-tight">+593 2 123-4567</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[hsl(var(--medical-blue))]"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                        Comienza a cuidar tu salud hoy
                    </h2>
                    <p className="text-xl mb-10 text-blue-100 max-w-2xl mx-auto">
                        Únete a miles de pacientes que confían en nosotros.
                        Regístrate y agenda tu primera consulta en menos de 2 minutos.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/registro">
                            <Button size="xl" className="min-w-[200px] bg-white text-[hsl(var(--medical-blue))] hover:bg-blue-50 hover:text-blue-700 shadow-xl border-none">
                                Crear Cuenta
                            </Button>
                        </Link>
                        <Link to="/agendar">
                            <Button variant="outline" size="xl" className="min-w-[200px] bg-transparent border-2 border-white text-white hover:bg-white/10 hover:text-white backdrop-blur-sm shadow-none">
                                <Calendar className="mr-2 h-5 w-5" />
                                Agendar Cita
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;