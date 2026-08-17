import React from "react";
import { Users, PawPrint, Share2, QrCode } from "lucide-react";

export const UseCasesSection: React.FC = () => {
  const cases = [
    {
      icon: Users,
      text: "Para recordar a una madre, padre, abuelo o abuela.",
    },
    {
      icon: PawPrint,
      text: "Para conservar la historia de una mascota.",
    },
    {
      icon: Share2,
      text: "Para compartir recuerdos con familiares.",
    },
    {
      icon: QrCode,
      text: "Para incluir un QR en una urna, placa, cuadro o recuerdo impreso.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#FAF7F2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F4EFEA] border border-[#D8CEBE] text-xs font-semibold text-[#7A4E38] uppercase tracking-wider">
            Para quién es MEMORA
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#24201D] font-normal tracking-tight">
            Un espacio para cada historia
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cases.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 border border-[#EAE3D9] hover:border-[#C5A880] hover:shadow-md transition-all duration-300 flex flex-col items-center text-center gap-3"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-center text-[#7A4E38]">
                  <Icon className="w-5 h-5 text-[#C5A880]" />
                </div>
                <p className="text-sm text-[#24201D] leading-relaxed">{c.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
