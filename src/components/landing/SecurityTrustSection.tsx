import React from "react";
import { Shield, Lock, Download, Trash2, Ban, Server } from "lucide-react";

export const SecurityTrustSection: React.FC = () => {
  const securityPillars = [
    {
      icon: Ban,
      title: "Cero Publicidad",
      description: "Jamás mostraremos anuncios publicitarios ni comercializaremos los datos o recuerdos de tu familia.",
    },
    {
      icon: Server,
      title: "Almacenamiento Seguro",
      description: "Fotografías y videos preservados en infraestructura cloud redundante y de alta disponibilidad.",
    },
    {
      icon: Lock,
      title: "Cifrado y Enlaces Seguros",
      description: "Toda la navegación y transmisión de datos viaja bajo protocolos HTTPS y cifrado de punta a punta.",
    },
    {
      icon: Download,
      title: "Exportación de Contenido",
      description: "Descarga un archivo digital completo con todas las fotos, cartas y tributos en cualquier momento.",
    },
    {
      icon: Trash2,
      title: "Control y Eliminación Total",
      description: "Derecho al olvido: si decides borrar un memorial o tu cuenta, se eliminará de forma irreversible.",
    },
    {
      icon: Shield,
      title: "Moderación de Colaboradores",
      description: "Asigna roles diferenciados: Administrador familiar, Editor de recuerdos o Visitante con comentarios.",
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-[#EAE3D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF7F2] border border-[#D8CEBE] text-xs font-semibold text-[#7A4E38] uppercase tracking-wider">
            Compromiso ético
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#24201D] font-normal tracking-tight">
            Diseñado para proteger lo que más importa.
          </h2>
          <p className="text-base text-[#5C534B] leading-relaxed">
            Tratamos cada memoria con la solemnidad, seguridad y respeto ético que merece un legado familiar.
          </p>
        </div>

        {/* 6 Security Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityPillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-start gap-4 transition-all duration-300 hover:shadow-sm"
              >
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#EAE3D9] flex items-center justify-center text-[#7A4E38] flex-shrink-0 shadow-xs">
                  <Icon className="w-5 h-5 text-[#C5A880]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#24201D] font-medium mb-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#5C534B] leading-relaxed">
                    {p.description}
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
