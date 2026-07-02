import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Heart, Users, Clock, Shield, Calendar, Star, Phone, 
    CheckCircle, ArrowRight, Stethoscope, Brain, Bone, 
    Eye, Baby, Microscope, Activity, FileText, Ambulance,
    Pill, Droplet, Scissors, Syringe, Thermometer, 
    Zap, Smile, Truck, Briefcase, LucideIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface ServiceCategory {
    id: string;
    title: string;
    icon: LucideIcon;
    description: string;
    longDescription: string;
    features: string[];
}

interface SpecialtyService {
    id: string;
    title: string;
    icon: LucideIcon;
    category: string;
    description: string;
    price?: string;
    duration?: string;
    available: boolean;
}

const Servicios = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState<string>("");

    const categories: ServiceCategory[] = [
        {
            id: "cardiologia",
            title: "Cardiología",
            icon: Heart,
            description: "Cuidado integral del corazón con tecnología de punta",
            longDescription: "Ofrecemos diagnósticos precisos y tratamientos avanzados para todas las condiciones cardíacas, desde arritmias hasta cirugía cardíaca.",
            features: [
                "Electrocardiogramas",
                "Ecocardiogramas",
                "Pruebas de esfuerzo",
                "Holter cardiaco"
            ]
        },
        {
            id: "neurologia",
            title: "Neurología",
            icon: Brain,
            description: "Especialistas en el sistema nervioso y cerebral",
            longDescription: "Diagnóstico y tratamiento de trastornos neurológicos con equipos de última generación.",
            features: [
                "Electroencefalogramas",
                "Resonancias magnéticas",
                "Terapia neurológica",
                "Tratamiento de migrañas"
            ]
        },
        {
            id: "ortopedia",
            title: "Ortopedia",
            icon: Bone,
            description: "Cuidado especializado del sistema musculoesquelético",
            longDescription: "Tratamientos integrales para fracturas, lesiones deportivas y cirugías ortopédicas.",
            features: [
                "Traumatología",
                "Cirugía de rodilla",
                "Lesiones deportivas",
                "Prótesis y órtesis"
            ]
        },
        {
            id: "pediatria",
            title: "Pediatría",
            icon: Baby,
            description: "Atención médica especializada para niños",
            longDescription: "Cuidado integral para tus hijos desde el nacimiento hasta la adolescencia.",
            features: [
                "Control de crecimiento",
                "Vacunación",
                "Nutrición infantil",
                "Desarrollo psicomotor"
            ]
        },
        {
            id: "oftalmologia",
            title: "Oftalmología",
            icon: Eye,
            description: "Salud visual de alta calidad",
            longDescription: "Exámenes visuales completos y tratamientos para enfermedades oculares.",
            features: [
                "Cirugía de cataratas",
                "Láser ocular",
                "Lentes de contacto",
                "Glaucoma"
            ]
        },
        {
            id: "ginecologia",
            title: "Ginecología",
            icon: Scissors,
            description: "Salud integral de la mujer",
            longDescription: "Atención especializada en todas las etapas de la vida femenina.",
            features: [
                "Chequeos ginecológicos",
                "Planificación familiar",
                "Embarazo y parto",
                "Menopausia"
            ]
        },
        {
            id: "dermatologia",
            title: "Dermatología",
            icon: Droplet,
            description: "Cuidado de la piel y tratamientos estéticos",
            longDescription: "Tratamiento de enfermedades de la piel y procedimientos cosméticos.",
            features: [
                "Acné y cicatrices",
                "Manchas y pecas",
                "Láser dermatológico",
                "Cirugía dermatológica"
            ]
        },
        {
            id: "psiquiatria",
            title: "Psiquiatría",
            icon: Smile,
            description: "Salud mental y bienestar emocional",
            longDescription: "Atención profesional para trastornos mentales y emocionales.",
            features: [
                "Terapia individual",
                "Psicofarmacología",
                "Trastornos de ansiedad",
                "Depresión"
            ]
        },
        {
            id: "urologia",
            title: "Urología",
            icon: Thermometer,
            description: "Salud del sistema urinario y reproductor",
            longDescription: "Diagnóstico y tratamiento de enfermedades urológicas.",
            features: [
                "Infecciones urinarias",
                "Cálculos renales",
                "Salud prostática",
                "Urología pediátrica"
            ]
        },
        {
            id: "alergia",
            title: "Alergología",
            icon: Pill,
            description: "Diagnóstico y tratamiento de alergias",
            longDescription: "Pruebas de alergia y tratamientos personalizados.",
            features: [
                "Pruebas cutáneas",
                "Inmunoterapia",
                "Alergias respiratorias",
                "Alimentos"
            ]
        }
    ];

    const specialties: SpecialtyService[] = [
        // Cardiología
        {
            id: "consulta-cardiologia",
            title: "Consulta de Cardiología",
            icon: Heart,
            category: "cardiologia",
            description: "Evaluación completa del sistema cardiovascular",
            price: "$80",
            duration: "45 min",
            available: true
        },
        {
            id: "electrocardiograma",
            title: "Electrocardiograma",
            icon: Activity,
            category: "cardiologia",
            description: "Registro de la actividad eléctrica del corazón",
            price: "$120",
            duration: "30 min",
            available: true
        },
        {
            id: "ecocardiograma",
            title: "Ecocardiograma",
            icon: Microscope,
            category: "cardiologia",
            description: "Ultrasonido del corazón para evaluar su estructura",
            price: "$200",
            duration: "60 min",
            available: true
        },
        // Neurología
        {
            id: "consulta-neurologia",
            title: "Consulta de Neurología",
            icon: Brain,
            category: "neurologia",
            description: "Evaluación de enfermedades del sistema nervioso",
            price: "$90",
            duration: "50 min",
            available: true
        },
        {
            id: "electroencefalograma",
            title: "Electroencefalograma",
            icon: Zap,
            category: "neurologia",
            description: "Registro de la actividad eléctrica cerebral",
            price: "$180",
            duration: "45 min",
            available: true
        },
        // Ortopedia
        {
            id: "consulta-ortopedia",
            title: "Consulta de Ortopedia",
            icon: Bone,
            category: "ortopedia",
            description: "Evaluación de lesiones y problemas musculoesqueléticos",
            price: "$85",
            duration: "45 min",
            available: true
        },
        {
            id: "fisioterapia",
            title: "Fisioterapia",
            icon: Activity,
            category: "ortopedia",
            description: "Rehabilitación y terapia física",
            price: "$70",
            duration: "60 min",
            available: true
        },
        // Pediatría
        {
            id: "consulta-pediatria",
            title: "Consulta de Pediatría",
            icon: Baby,
            category: "pediatria",
            description: "Atención médica integral para niños",
            price: "$75",
            duration: "40 min",
            available: true
        },
        {
            id: "vacunacion",
            title: "Vacunación Infantil",
            icon: Syringe,
            category: "pediatria",
            description: "Calendario completo de vacunación",
            price: "$50",
            duration: "20 min",
            available: true
        }
    ];

    const filteredCategories = selectedCategory === "all" 
        ? categories 
        : categories.filter(cat => cat.id === selectedCategory);

    const filteredSpecialties = specialties.filter(spec => {
        const matchesCategory = selectedCategory === "all" || spec.category === selectedCategory;
        const matchesSearch = spec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             spec.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative pt-20 pb-16 bg-gradient-to-r from-[hsl(var(--medical-blue))] to-blue-600 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container relative z-10">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <div className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-sm font-medium bg-white/10 backdrop-blur-sm mb-6">
                            <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                            Especialidades Médicas
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1]">
                            Nuestros Servicios <br />
                            <span className="text-blue-200">Médicos Especializados</span>
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            Contamos con más de 10 especialidades médicas y los mejores profesionales
                            para cuidar de tu salud y la de tu familia.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/agendar">
                                <Button size="xl" className="bg-white text-[hsl(var(--medical-blue))] hover:bg-blue-50 hover:text-blue-700 shadow-xl border-none">
                                    <Calendar className="mr-2 h-5 w-5" />
                                    Agendar Cita
                                </Button>
                            </Link>
                            <Link to="/contacto">
                                <Button variant="outline" size="xl" className="border-2 border-white text-white hover:bg-white/10 hover:text-white backdrop-blur-sm shadow-none">
                                    <Phone className="mr-2 h-5 w-5" />
                                    Contactar Ahora
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Search and Filter Section */}
            <section className="py-8 bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
                <div className="container">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Buscar servicios..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 focus:border-[hsl(var(--medical-blue))] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Activity className="h-5 w-5" />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-sm font-medium text-gray-600 mr-2 hidden md:inline">Categorías:</span>
                            <Button
                                variant={selectedCategory === "all" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedCategory("all")}
                                className={selectedCategory === "all" ? "bg-[hsl(var(--medical-blue))] text-white" : ""}
                            >
                                Todos
                            </Button>
                            {categories.slice(0, 6).map((cat) => (
                                <Button
                                    key={cat.id}
                                    variant={selectedCategory === cat.id ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={selectedCategory === cat.id ? "bg-[hsl(var(--medical-blue))] text-white" : ""}
                                >
                                    <cat.icon className="h-4 w-4 mr-1" />
                                    {cat.title}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Specialties Grid */}
            <section className="py-16 bg-gray-50">
                <div className="container">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[hsl(var(--medical-dark))]">
                            Especialidades Médicas
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Explora todas nuestras especialidades y encuentra el servicio que necesitas
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCategories.map((category) => {
                            const Icon = category.icon;
                            const hasSpecialties = specialties.some(s => s.category === category.id);
                            return (
                                <Card 
                                    key={category.id} 
                                    className="group hover:shadow-2xl transition-all duration-300 border-none shadow-md bg-white overflow-hidden cursor-pointer hover:-translate-y-1"
                                    onClick={() => setSelectedCategory(category.id)}
                                >
                                    <CardHeader className="pb-2">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[hsl(var(--medical-blue))] transition-all duration-300 group-hover:scale-110">
                                            <Icon className="h-7 w-7 text-[hsl(var(--medical-blue))] group-hover:text-white transition-colors duration-300" />
                                        </div>
                                        <CardTitle className="text-xl text-[hsl(var(--medical-dark))] group-hover:text-[hsl(var(--medical-blue))] transition-colors">
                                            {category.title}
                                        </CardTitle>
                                        <CardDescription className="text-sm text-gray-600 mt-1">
                                            {category.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-gray-500">
                                                {hasSpecialties ? `${specialties.filter(s => s.category === category.id).length} servicios` : 'Próximamente'}
                                            </span>
                                            <div className="flex items-center text-[hsl(var(--medical-blue))] font-medium text-sm opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                Ver servicios <ArrowRight className="ml-1 h-4 w-4" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Detailed Services Section */}
            <section className="py-16 bg-white">
                <div className="container">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[hsl(var(--medical-dark))]">
                            Servicios Detallados
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Conoce todos los servicios disponibles en nuestras especialidades
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSpecialties.map((spec) => {
                            const Icon = spec.icon;
                            return (
                                <Card key={spec.id} className="group hover:shadow-xl transition-all duration-300 border border-gray-100">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-[hsl(var(--medical-blue))] transition-colors duration-300">
                                                    <Icon className="h-5 w-5 text-[hsl(var(--medical-blue))] group-hover:text-white transition-colors duration-300" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg text-[hsl(var(--medical-dark))]">
                                                        {spec.title}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs">
                                                        {categories.find(c => c.id === spec.category)?.title}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${spec.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {spec.available ? 'Disponible' : 'Próximamente'}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 mb-3">
                                            {spec.description}
                                        </p>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-[hsl(var(--medical-blue))]">
                                                    {spec.price}
                                                </span>
                                                <span className="text-gray-400">|</span>
                                                <span className="text-gray-500 flex items-center">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {spec.duration}
                                                </span>
                                            </div>
                                            <Link to={`/agendar?service=${spec.id}`}>
                                                <Button size="sm" className="bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white">
                                                    Agendar
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {filteredSpecialties.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Activity className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-700 mb-2">No se encontraron servicios</h3>
                            <p className="text-gray-500">
                                No hay servicios disponibles en esta categoría. Por favor, selecciona otra.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Services / Packages */}
            <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="container">
                    <div className="text-center mb-12">
                        <span className="text-[hsl(var(--medical-blue))] font-semibold tracking-wider uppercase text-sm">Paquetes Especiales</span>
                        <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-[hsl(var(--medical-dark))]">
                            Planes de Salud Integral
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Combina varios servicios y obtén un plan completo para tu bienestar
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Chequeo Básico",
                                price: "$150",
                                description: "Evaluación general de salud",
                                features: [
                                    "Consulta médica general",
                                    "Análisis de sangre completo",
                                    "Electrocardiograma",
                                    "Informe de resultados"
                                ],
                                icon: FileText,
                                recommended: false
                            },
                            {
                                title: "Plan Familiar",
                                price: "$350",
                                description: "Cuidado integral para toda la familia",
                                features: [
                                    "4 consultas especializadas",
                                    "Vacunación completa",
                                    "Chequeos pediátricos",
                                    "Acompañamiento médico",
                                    "Descuentos en farmacia"
                                ],
                                icon: Users,
                                recommended: true
                            },
                            {
                                title: "Premium Salud",
                                price: "$500",
                                description: "Atención médica de primer nivel",
                                features: [
                                    "Consultas ilimitadas",
                                    "Especialistas certificados",
                                    "Atención prioritaria",
                                    "Telemedicina 24/7",
                                    "Emergencias incluidas"
                                ],
                                icon: Star,
                                recommended: false
                            }
                        ].map((plan, index) => {
                            const Icon = plan.icon;
                            return (
                                <Card key={index} className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${plan.recommended ? 'border-2 border-[hsl(var(--medical-blue))] shadow-xl' : 'border-none shadow-md'}`}>
                                    {plan.recommended && (
                                        <div className="absolute top-0 right-0 bg-[hsl(var(--medical-blue))] text-white px-4 py-1 rounded-bl-xl text-sm font-medium">
                                            Más Popular
                                        </div>
                                    )}
                                    <CardHeader className="text-center">
                                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Icon className="h-8 w-8 text-[hsl(var(--medical-blue))]" />
                                        </div>
                                        <CardTitle className="text-2xl text-[hsl(var(--medical-dark))]">
                                            {plan.title}
                                        </CardTitle>
                                        <CardDescription className="text-base">
                                            {plan.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center mb-6">
                                            <span className="text-4xl font-bold text-[hsl(var(--medical-dark))]">{plan.price}</span>
                                            <span className="text-gray-500 text-sm ml-1">/mes</span>
                                        </div>
                                        <ul className="space-y-3 mb-6">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-center text-sm text-gray-600">
                                                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <Button className={`w-full ${plan.recommended ? 'bg-[hsl(var(--medical-blue))] hover:bg-blue-700 text-white' : 'bg-gray-800 hover:bg-gray-900 text-white'}`}>
                                            Seleccionar Plan
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-[hsl(var(--medical-dark))] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container relative z-10 text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        ¿Necesitas una consulta especializada?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Agenda tu cita hoy mismo con nuestros especialistas y comienza tu camino hacia una mejor salud.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/agendar">
                            <Button size="xl" className="bg-white text-[hsl(var(--medical-dark))] hover:bg-gray-100 shadow-xl">
                                <Calendar className="mr-2 h-5 w-5" />
                                Agendar Cita Ahora
                            </Button>
                        </Link>
                        <Link to="/contacto">
                            <Button variant="outline" size="xl" className="border-2 border-white text-white hover:bg-white/10 hover:text-white">
                                <Phone className="mr-2 h-5 w-5" />
                                Contactar Soporte
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Servicios;