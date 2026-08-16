import React from "react";
import {
  BookOpen,
  Image as ImageIcon,
  Video,
  FileText,
  Heart,
  Clock,
  Users2,
  Calendar,
} from "lucide-react";

export const ValueBentoSection: React.FC = () => {
  const cards = [
    {
      title: "Historia de vida",
      description: "Construye una biografía cronológica, profunda y digna que relate su origen, sus pasiones y sus enseñanzas.",
      icon: BookOpen,
      tag: "Biografía",
    },
    {
      title: "Fotografías en alta calidad",
      description: "Organiza fotografías en galerías temáticas y álbumes familiares con títulos, fechas y anécdotas.",
      icon: ImageIcon,
      tag: "Galerías",
    },
    {
      title: "Videos y momentos",
      description: "Conserva grabaciones familiares, videos de momentos especiales y testimonios de voz para volver a escuchar su risa.",
      icon: Video,
      tag: "Multimedia",
    },
    {
      title: "Recuerdos y cartas",
      description: "Guarda textos manuscritos, cartas atesoradas durante años, recetas familiares y anécdotas inolvidables.",
      icon: FileText,
      tag: "Escritos",
    },
    {
      title: "Homenajes y condolencias",
      description: "Permite que familiares y amigos enciendan una vela virtual, envíen flores digitales y compartan su gratitud.",
      icon: Heart,
      tag: "Comunidad",
    },
    {
      title: "Línea de tiempo interactiva",
      description: "Visualiza los hitos y acontecimientos más importantes de su vida ordenados cronológicamente.",
      icon: Clock,
      tag: "Cronología",
    },
    {
      title: "Árbol familiar y vínculos",
      description: "Conecta a las personas que formaron parte de su camino: padres, hermanos, pareja, hijos y amistades entrañables.",
      icon: Users2,
      tag: "Vínculos",
    },
    {
      title: "Ceremonias y eventos",
      description: "Crea convocatorias para misas, funerales, reuniones conmemorativas y homenajes virtuales con mapa y RSVP.",
      icon: Calendar,
      tag: "Convocatorias",
    },
  ];

  return (
    <section id="caracteristicas" className="py-20 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F4EFEA] border border-[#D8CEBE] text-xs font-semibold text-[#7A4E38] uppercase tracking-wider">
            Propuesta de valor
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#24201D] font-normal tracking-tight">
            Todo lo que importa, en un solo lugar.
          </h2>
          <p className="text-base text-[#5C534B] leading-relaxed">
            MEMORA reúne cada dimensión de una vida en un entorno digital armonioso, sobrio y libre de distracciones comerciales.
          </p>
        </div>

        {/* 8 Cards Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                className="group rounded-3xl p-6 bg-white border border-[#EAE3D9] hover:border-[#C5A880] transition-all duration-300 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#FAF7F2] group-hover:bg-[#F4EFEA] border border-[#EAE3D9] flex items-center justify-center text-[#7A4E38] transition-colors">
                      <Icon className="w-5 h-5 text-[#C5A880] group-hover:text-[#7A4E38] transition-colors" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C827A] px-2.5 py-1 rounded-full bg-[#FAF7F2]">
                      {c.tag}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl text-[#24201D] font-medium mb-2 group-hover:text-[#7A4E38] transition-colors">
                    {c.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5C534B] leading-relaxed">
                    {c.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
