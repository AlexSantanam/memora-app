import React from "react";
import { Sparkles, Image as ImageIcon, Users, HeartHandshake, ArrowRight } from "lucide-react";
import { useApp } from "../../context/AppContext";

export const HowItWorksSection: React.FC = () => {
  const { setCurrentView, setIsAuthModalOpen, setAuthModalMode, isAuthenticated } = useApp();

  const steps = [
    {
      number: "01",
      tag: "Crea",
      title: "Crea tu espacio MEMORA en pocos minutos",
      description:
        "Introduce la información básica de tu ser querido: su nombre, fechas significativas, su fotografía principal y la cita que mejor representa su esencia.",
      icon: Sparkles,
      accentBg: "bg-[#F4EFEA]",
      borderColor: "border-[#EAE3D9]",
    },
    {
      number: "02",
      tag: "Reúne",
      title: "Agrega fotografías, videos, historias y recuerdos",
      description:
        "Organiza álbumes temáticos, construye su línea de tiempo cronológica y redacta su biografía con la ayuda de nuestro asistente editorial inteligente.",
      icon: ImageIcon,
      accentBg: "bg-[#FAF7F2]",
      borderColor: "border-[#D8CEBE]",
    },
    {
      number: "03",
      tag: "Comparte",
      title: "Invita a familiares y amigos para construir juntos",
      description:
        "Comparte un enlace privado o código QR para que familiares y amigos enciendan velas virtuales, dejen homenajes y aporten sus propias anécdotas.",
      icon: Users,
      accentBg: "bg-[#F4EFEA]",
      borderColor: "border-[#EAE3D9]",
    },
  ];

  return (
    <section id="como-funciona" className="py-20 bg-white border-y border-[#EAE3D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF7F2] border border-[#D8CEBE] text-xs font-semibold text-[#7A4E38] uppercase tracking-wider">
            <span>Paso a paso</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#24201D] font-normal tracking-tight">
            ¿Cómo funciona MEMORA?
          </h2>
          <p className="text-base text-[#5C534B] leading-relaxed">
            Hemos diseñado un proceso guiado, delicado y sencillo para transformar recuerdos dispersos en un memorial digital permanente y significativo.
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className={`relative rounded-3xl p-8 bg-[#FAF7F2] border ${step.borderColor} transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col justify-between`}
              >
                {/* Step Header */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-serif text-3xl font-light text-[#C5A880] tracking-wider">
                      {step.number}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#EAE3D9] flex items-center justify-center text-[#7A4E38] shadow-xs">
                      <Icon className="w-5 h-5 text-[#C5A880]" />
                    </div>
                  </div>

                  <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#7A4E38] mb-2">
                    {step.tag}
                  </span>

                  <h3 className="font-serif text-xl sm:text-2xl text-[#24201D] font-medium leading-snug mb-3">
                    {step.title}
                  </h3>

                  <p className="text-sm text-[#5C534B] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#EAE3D9]/60 flex items-center gap-2 text-xs text-[#8C827A]">
                  <HeartHandshake className="w-4 h-4 text-[#C5A880]" />
                  <span>Proceso guiado y respetuoso</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA trigger */}
        <div className="mt-14 text-center">
          <button
            onClick={() => {
              if (isAuthenticated) {
                setCurrentView("wizard");
              } else {
                setAuthModalMode("register");
                setIsAuthModalOpen(true);
              }
            }}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-sm font-medium transition-all shadow-sm active:scale-[0.98] cursor-pointer"
          >
            <span>Comenzar mi memorial ahora</span>
            <ArrowRight className="w-4 h-4 text-[#C5A880]" />
          </button>
        </div>

      </div>
    </section>
  );
};
