import React from "react";
import { useApp } from "../../context/AppContext";
import { Sparkles, Heart, ArrowRight, Flame, Image as ImageIcon } from "lucide-react";

export const PetsLandingSection: React.FC = () => {
  const { setCurrentView, setIsAuthModalOpen, setAuthModalMode, isAuthenticated, openMemorialBySlug } = useApp();

  return (
    <section className="py-20 lg:py-28 bg-[#F4EFEA]/60 border-y border-[#EAE3D9] relative overflow-hidden" id="memora-mascotas">
      {/* Decorative subtle backdrop elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-[#EAE3D9] rounded-full blur-2xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Dignified Pet Storytelling */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D8CEBE] text-xs font-semibold text-[#7A4E38] shadow-xs">
              <span className="text-sm">🐾</span>
              <span>MEMORA Mascotas</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#24201D] font-normal tracking-tight leading-tight">
              Para quienes dejaron <br />
              <span className="italic font-medium text-[#7A4E38]">huellas eternas en el corazón.</span>
            </h2>

            <p className="text-sm sm:text-base text-[#5C534B] leading-relaxed">
              Los animales de compañía no son solo mascotas: son familia, lealtad incondicional y alegría pura. MEMORA Mascotas ofrece un espacio sobrio, cálido y respetuoso para reunir sus recuerdos, fotografías de sus mejores días, sus costumbres favoritas y las anécdotas que llenaron tu hogar de amor.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#EAE3D9] flex items-center justify-center text-[#7A4E38] flex-shrink-0 mt-0.5">
                  <span className="text-xs">✨</span>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#24201D]">
                    Semblanza y Biografía Asistida con IA
                  </h4>
                  <p className="text-xs text-[#8C827A] mt-0.5">
                    Redacta con sensibilidad su historia de llegada a casa, su personalidad, sus rincones preferidos y sus travesuras inolvidables.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#EAE3D9] flex items-center justify-center text-[#7A4E38] flex-shrink-0 mt-0.5">
                  <span className="text-xs">📸</span>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#24201D]">
                    Galerías de Momentos Inolvidables
                  </h4>
                  <p className="text-xs text-[#8C827A] mt-0.5">
                    Organiza álbumes con fotos en alta resolución de sus paseos, siestas al sol y momentos en familia.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#EAE3D9] flex items-center justify-center text-[#7A4E38] flex-shrink-0 mt-0.5">
                  <span className="text-xs">🕯️</span>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#24201D]">
                    Velas Virtuales y Homenajes Familiares
                  </h4>
                  <p className="text-xs text-[#8C827A] mt-0.5">
                    Toda la familia y amigos cercanos pueden dejar mensajes de gratitud, flores y encender una luz en su memoria.
                  </p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setCurrentView("wizard");
                  } else {
                    setAuthModalMode("register");
                    setIsAuthModalOpen(true);
                  }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-[0.98] cursor-pointer"
                id="pets-create-btn"
              >
                <span>🐾 Crear MEMORA para mi Mascota</span>
                <ArrowRight className="w-4 h-4 text-stone-300" />
              </button>

              <button
                onClick={() => openMemorialBySlug("mateo-golden-retriever")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-white text-[#24201D] border border-[#D8CEBE] hover:border-[#C5A880] text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
                id="pets-view-sample-btn"
              >
                <span>Ver Memorial de Ejemplo (Mateo)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Pet Memorial Showcase Card */}
          <div className="lg:col-span-6 relative">
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-[#EAE3D9] space-y-4 max-w-md mx-auto relative transition-transform hover:-translate-y-1 duration-300">
              
              {/* Pet Card Header Image */}
              <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-[#FAF7F2]">
                <img
                  src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80"
                  alt="Mateo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                {/* Top Badge */}
                <div className="absolute top-3 left-3 bg-[#24201D]/75 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[11px] text-[#FAF7F2] font-semibold flex items-center gap-1.5">
                  <span>🐾 MEMORA Mascotas</span>
                </div>

                {/* Pet Name & Breed on Cover */}
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30 inline-block mb-1">
                    Golden Retriever · Perro
                  </span>
                  <p className="font-serif text-2xl font-medium leading-tight">
                    Mateo "Teíto"
                  </p>
                  <p className="text-xs text-stone-200 font-light mt-0.5">
                    2011 — 2024 · Santiago, Chile
                  </p>
                </div>
              </div>

              {/* Memory Highlight Bento */}
              <div className="p-1 space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-xs text-[#4A423B] leading-relaxed italic">
                  "El compañero más noble y alegre que una familia pudo haber soñado. Corredor incansable de la playa de Zapallar y guardián amoroso de cada siesta."
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-white border border-[#EAE3D9] space-y-0.5">
                    <span className="text-[#8C827A] block font-medium">☀️ Rincón favorito</span>
                    <span className="font-semibold text-[#24201D] text-xs">Junto al gran ventanal</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#EAE3D9] space-y-0.5">
                    <span className="text-[#8C827A] block font-medium">🎾 Su pasión</span>
                    <span className="font-semibold text-[#24201D] text-xs">Su pelota amarilla de tenis</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#F4EFEA] text-center text-xs">
                  <div>
                    <span className="block font-bold text-[#24201D]">34</span>
                    <span className="text-[10px] text-[#8C827A]">Fotografías</span>
                  </div>
                  <div>
                    <span className="block font-bold text-[#24201D]">21</span>
                    <span className="text-[10px] text-[#8C827A]">Velas encendidas</span>
                  </div>
                  <div>
                    <span className="block font-bold text-[#24201D]">18</span>
                    <span className="text-[10px] text-[#8C827A]">Recuerdos</span>
                  </div>
                </div>

                <button
                  onClick={() => openMemorialBySlug("mateo-golden-retriever")}
                  className="w-full py-2.5 rounded-xl bg-[#24201D] text-white hover:bg-[#3D3530] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Explorar Memorial de Mateo</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
