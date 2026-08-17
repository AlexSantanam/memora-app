import React from "react";
import { Image as ImageIcon, PawPrint, QrCode } from "lucide-react";

export const ValueMessageSection: React.FC = () => {
  const points = [
    {
      icon: ImageIcon,
      text: "Un lugar para guardar fotos, videos, mensajes y momentos importantes.",
    },
    {
      icon: PawPrint,
      text: "Para personas y mascotas.",
    },
    {
      icon: QrCode,
      text: "Comparte el recuerdo mediante un código QR único.",
    },
  ];

  return (
    <section className="bg-white border-y border-[#EAE3D9] py-10 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs sm:text-sm text-[#8C827A] max-w-2xl mx-auto mb-8">
          MEMORA no es solo un obituario en línea: es un espacio digital permanente para conservar historias, recuerdos y vínculos familiares.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {points.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="flex items-start sm:flex-col sm:items-center gap-3 sm:gap-3 sm:text-center">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-center text-[#7A4E38] flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#C5A880]" />
                </div>
                <p className="text-sm text-[#24201D] leading-snug font-medium">{p.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
