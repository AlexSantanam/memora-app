import React from "react";
import { useApp } from "../../context/AppContext";
import { Sparkles, Heart, Shield, ArrowRight, Play, QrCode } from "lucide-react";
import { HeroMemorialSearch } from "./HeroMemorialSearch";

export const HeroSection: React.FC = () => {
  const { setCurrentView, setIsAuthModalOpen, setAuthModalMode, isAuthenticated, openMemorialBySlug } = useApp();

  return (
    <section className="relative overflow-hidden bg-[#FAF7F2] pt-12 pb-20 lg:pt-16 lg:pb-28">
      {/* Delicate warm atmosphere background accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#EAE3D9]/50 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-12 right-10 w-72 h-72 bg-[#C5A880]/10 rounded-full blur-2xl pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Emotional Storytelling & CTAs */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">

            {/* Buscador — arriba de todo, visible sin scroll */}
            <HeroMemorialSearch />

            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F4EFEA] border border-[#D8CEBE] text-xs sm:text-sm font-medium text-[#7A4E38] shadow-xs">
              <Heart className="w-4 h-4 text-[#C5A880] fill-[#C5A880]/20" />
              <span>Un espacio creado para recordar, compartir y preservar</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#24201D] font-normal tracking-tight leading-[1.15]">
              Recuerdos <span className="italic font-medium text-[#7A4E38]">para siempre.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#5C534B] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              Crea un espacio digital íntimo para honrar, recordar y compartir la historia de quienes amas.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setCurrentView("wizard");
                  } else {
                    setAuthModalMode("register");
                    setIsAuthModalOpen(true);
                  }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-sm sm:text-base font-medium transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                id="hero-create-btn"
              >
                <Sparkles className="w-4 h-4 text-[#C5A880]" />
                <span>Crear mi MEMORA</span>
                <ArrowRight className="w-4 h-4 text-stone-300" />
              </button>

              <button
                onClick={() => openMemorialBySlug("maria-gonzalez-valparaiso")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-white/80 hover:bg-white text-[#24201D] border border-[#D8CEBE] text-sm sm:text-base font-medium transition-all shadow-xs hover:border-[#C5A880] cursor-pointer"
                id="hero-how-it-works-btn"
              >
                <span>Ver ejemplo</span>
              </button>
            </div>

            {/* Starting Price */}
            <p className="text-xs sm:text-sm text-[#7A4E38] font-medium -mt-1">
              Desde <span className="font-semibold">$990 al año</span>
            </p>

            {/* Reassurance Micro-items */}
            <div className="pt-6 border-t border-[#EAE3D9] flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-[#7A7067]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]"></span>
                Permanente y sin publicidad
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]"></span>
                Control total de privacidad
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]"></span>
                Colaboración familiar guiada
              </span>
            </div>
          </div>

          {/* Right Column: Visual Memorial Card Composition */}
          <div className="lg:col-span-5 relative">
            
            {/* Main Interactive Memorial Frame */}
            <div className="relative mx-auto max-w-md bg-white rounded-3xl p-4 sm:p-5 shadow-xl border border-[#EAE3D9] transition-transform hover:-translate-y-1 duration-300">
              
              {/* Photo Header */}
              <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-[#F4EFEA]">
                <img
                  src="/demo-maria-gonzalez.jpg"
                  alt="María González"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Memorial Badge */}
                <div className="absolute top-3 left-3 bg-[#24201D]/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[11px] text-[#FAF7F2] font-medium flex items-center gap-1.5">
                  <Heart className="w-3 h-3 text-[#C5A880]" />
                  <span>Memorial Activo</span>
                </div>

                {/* Name & Dates on Image */}
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <p className="font-serif text-xl sm:text-2xl font-medium leading-tight">
                    María González Henríquez
                  </p>
                  <p className="text-xs text-stone-200 font-light mt-0.5">
                    1942 — 2023 · Valparaíso
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3.5">
                <p className="font-serif italic text-sm text-[#5C534B] border-l-2 border-[#C5A880] pl-3 py-0.5">
                  "Los recuerdos que sembramos con amor son eternos en el jardín de la memoria."
                </p>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#F4EFEA] text-center text-xs">
                  <div>
                    <span className="block font-semibold text-[#24201D]">28</span>
                    <span className="text-[10px] text-[#8C827A]">Fotografías</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-[#24201D]">14</span>
                    <span className="text-[10px] text-[#8C827A]">Homenajes</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-[#24201D]">5</span>
                    <span className="text-[10px] text-[#8C827A]">Momentos</span>
                  </div>
                </div>

                {/* Explore Memorial Demo Button */}
                <button
                  onClick={() => openMemorialBySlug("maria-gonzalez-valparaiso")}
                  className="w-full py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F4EFEA] border border-[#D8CEBE] text-xs font-semibold text-[#24201D] flex items-center justify-center gap-2 transition-colors cursor-pointer group"
                >
                  <Heart className="w-3.5 h-3.5 text-[#C5A880] transition-transform group-hover:scale-110" />
                  <span>Explorar este Memorial de Ejemplo</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8C827A]" />
                </button>
              </div>

              {/* Floating Floating Badge 1: QR Plaque */}
              <div className="hidden sm:flex absolute -bottom-5 -left-6 bg-white rounded-2xl p-3 shadow-lg border border-[#EAE3D9] items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#7A4E38] border border-[#EAE3D9]">
                  <QrCode className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-semibold text-[#24201D]">Código QR Único</p>
                  <p className="text-[10px] text-[#8C827A]">Para ceremonias y lápidas</p>
                </div>
              </div>

              {/* Floating Floating Badge 2: Audio & Story */}
              <div className="hidden sm:flex absolute -top-4 -right-5 bg-white rounded-2xl p-3 shadow-lg border border-[#EAE3D9] items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#C5A880]/15 flex items-center justify-center text-[#7A4E38]">
                  <Sparkles className="w-4 h-4 text-[#C5A880]" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-semibold text-[#24201D]">Historia Asistida</p>
                  <p className="text-[10px] text-[#8C827A]">Redacción editorial con IA</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
