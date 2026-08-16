import React from "react";
import { Heart, Flame, Flower2, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { useApp } from "../../context/AppContext";

export const TributesPreviewSection: React.FC = () => {
  const { openMemorialBySlug } = useApp();

  const previewTributes = [
    {
      author: "Patricia Henríquez",
      relationship: "Hermana",
      message: "Hermana querida, gracias por haber sido mi guía y mi mayor apoyo en cada etapa de la vida. Guardo en mi alma cada conversación frente al mar. Tu amor nos sostiene a todos.",
      candle: true,
      flower: true,
      hearts: 14,
      replies: 1,
    },
    {
      author: "Diego Morales",
      relationship: "Ex-alumno (Generación 1982)",
      message: "Profesora María, nunca olvidaré cómo me enseñó a creer en mí mismo cuando todo parecía difícil. Fue la mejor maestra que un niño pudo tener. Descanse en paz.",
      candle: true,
      flower: false,
      hearts: 9,
      replies: 0,
    },
    {
      author: "Joaquín Valenzuela",
      relationship: "Nieto",
      message: "Abuelita, prometo cuidar tu jardín y seguir haciendo las galletas de canela como me enseñaste. Te extraño infinito cada domingo.",
      candle: true,
      flower: true,
      hearts: 22,
      replies: 2,
    },
  ];

  return (
    <section className="py-24 bg-white border-b border-[#EAE3D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF7F2] border border-[#D8CEBE] text-xs font-semibold text-[#7A4E38] uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Muro de condolencias y tributos</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#24201D] font-normal tracking-tight">
            Deja unas palabras.
          </h2>
          <p className="text-base text-[#5C534B] leading-relaxed">
            Un espacio reconfortante donde familiares, amigos y conocidos pueden encender una vela, expresar su gratitud y compartir anécdotas que abrazan el corazón.
          </p>
        </div>

        {/* Tributes Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {previewTributes.map((tr, idx) => (
            <div
              key={idx}
              className="rounded-3xl p-6 sm:p-7 bg-[#FAF7F2] border border-[#EAE3D9] hover:border-[#C5A880] transition-all duration-300 hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Author info */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-lg text-[#24201D] font-medium">
                      {tr.author}
                    </h4>
                    <span className="text-xs text-[#8C827A]">
                      {tr.relationship}
                    </span>
                  </div>

                  {/* Virtual symbols */}
                  <div className="flex items-center gap-1.5">
                    {tr.candle && (
                      <span className="p-1.5 rounded-full bg-amber-100 text-amber-800 text-xs title" title="Vela encendida">
                        <Flame className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {tr.flower && (
                      <span className="p-1.5 rounded-full bg-rose-100 text-rose-800 text-xs" title="Ofrenda floral">
                        <Flower2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Message */}
                <p className="text-xs sm:text-sm text-[#4A423B] leading-relaxed italic">
                  "{tr.message}"
                </p>
              </div>

              {/* Interactions footer */}
              <div className="pt-5 mt-5 border-t border-[#EAE3D9] flex items-center justify-between text-xs text-[#8C827A]">
                <span className="flex items-center gap-1.5 text-[#7A4E38] font-medium">
                  <Heart className="w-3.5 h-3.5 text-[#C5A880] fill-[#C5A880]" />
                  {tr.hearts} personas agradecen
                </span>
                {tr.replies > 0 && (
                  <span className="flex items-center gap-1 text-[#8C827A]">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {tr.replies} respuesta(s)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Owner Moderation Reassurance */}
        <div className="mt-12 max-w-2xl mx-auto rounded-2xl bg-[#FAF7F2] p-5 border border-[#D8CEBE] flex items-start gap-4 text-xs text-[#5C534B]">
          <div className="w-8 h-8 rounded-xl bg-white border border-[#EAE3D9] flex items-center justify-center text-[#7A4E38] flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
          </div>
          <div>
            <p className="font-semibold text-[#24201D] mb-0.5">
              Control y Moderación de Homenajes
            </p>
            <p className="leading-relaxed">
              Como administrador del memorial, tú decides si los mensajes se publican inmediatamente o si requieren tu aprobación previa para garantizar un entorno siempre respetuoso y armónico.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
