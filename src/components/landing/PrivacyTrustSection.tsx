import React from "react";
import { Globe, Lock, KeyRound, EyeOff, ShieldCheck } from "lucide-react";

export const PrivacyTrustSection: React.FC = () => {
  const privacyLevels = [
    {
      level: "Público",
      title: "Espacio Abierto",
      description: "Cualquier persona que tenga el enlace puede visitar el memorial, encender velas y compartir su homenaje.",
      icon: Globe,
      badge: "Recomendado para homenajes comunitarios",
    },
    {
      level: "Privado",
      title: "Círculo Íntimo",
      description: "Acceso reservado exclusivamente a los familiares y amigos a quienes invites formalmente por correo electrónico.",
      icon: Lock,
      badge: "Máxima reserva familiar",
    },
    {
      level: "Protegido",
      title: "Clave de Acceso",
      description: "Se solicita una contraseña personalizada antes de permitir la entrada al memorial y a las fotografías.",
      icon: KeyRound,
      badge: "Control por contraseña",
    },
    {
      level: "Oculto",
      title: "No Indexable",
      description: "El memorial nunca aparecerá en buscadores (Google, Bing). Solo se accede mediante el link directo privado.",
      icon: EyeOff,
      badge: "Privacidad en buscadores",
    },
  ];

  return (
    <section className="py-24 bg-[#FAF7F2] border-b border-[#EAE3D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F4EFEA] border border-[#D8CEBE] text-xs font-semibold text-[#7A4E38] uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Privacidad y Confianza</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#24201D] font-normal tracking-tight">
            Tus recuerdos. Tu decisión.
          </h2>
          <p className="text-base text-[#5C534B] leading-relaxed">
            Cada familia vive el recuerdo a su propio ritmo. En MEMORA tú decides exactamente quién tiene acceso al memorial y cómo se comparte cada historia.
          </p>
        </div>

        {/* 4 Levels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {privacyLevels.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl p-6 bg-white border border-[#EAE3D9] hover:border-[#C5A880] transition-all duration-300 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-center text-[#7A4E38] mb-5">
                    <Icon className="w-6 h-6 text-[#C5A880]" />
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#7A4E38] block mb-1">
                    {p.level}
                  </span>

                  <h3 className="font-serif text-xl text-[#24201D] font-medium mb-2">
                    {p.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5C534B] leading-relaxed mb-4">
                    {p.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F4EFEA]">
                  <span className="inline-block text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#FAF7F2] text-[#8C827A]">
                    {p.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-[#8C827A] mt-10">
          Puedes cambiar la configuración de privacidad en cualquier momento desde tu panel de administración.
        </p>

      </div>
    </section>
  );
};
