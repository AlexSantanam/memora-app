import React from "react";
import { Logo } from "./Logo";
import { useApp } from "../context/AppContext";
import { Heart, Shield, Lock, Globe, Mail, Sparkles, MessageCircle } from "lucide-react";
import { getWhatsAppUrl, trackWhatsAppClick } from "../config/whatsapp";

export const Footer: React.FC = () => {
  const { setCurrentView, setIsAuthModalOpen, setAuthModalMode, isAuthenticated } = useApp();

  return (
    <footer className="bg-[#24201D] text-[#EAE3D9] border-t border-[#3D3530] pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Callout Box */}
        <div className="rounded-3xl bg-[#2D2824] border border-[#4A423B]/60 p-8 sm:p-10 mb-16 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A880]/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="space-y-2 text-center md:text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3D3530] border border-[#C5A880]/30 text-xs text-[#E7D7C1]">
              <Heart className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Un legado que perdura en el tiempo</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-white tracking-wide">
              Comienza hoy a preservar su historia
            </h3>
            <p className="text-sm text-[#A89F95] max-w-xl">
              Crea un espacio cálido, respetuoso e íntimo donde toda la familia pueda reunirse para recordar y agradecer.
            </p>
          </div>
          <button
            onClick={() => {
              if (isAuthenticated) {
                setCurrentView("wizard");
              } else {
                setAuthModalMode("register");
                setIsAuthModalOpen(true);
              }
            }}
            className="group flex-shrink-0 inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#C5A880] text-[#1F1B18] hover:bg-[#D4BC97] text-sm font-semibold transition-all shadow-md active:scale-[0.98] cursor-pointer relative z-10"
            id="footer-cta-btn"
          >
            <Sparkles className="w-4 h-4 text-[#7A4E38]" />
            <span>Crear mi MEMORA</span>
          </button>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-12 pb-12 border-b border-[#3D3530]">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Logo variant="white" size="lg" showTagline={true} />
            <p className="text-sm text-[#A89F95] leading-relaxed max-w-sm pt-2">
              MEMORA es la plataforma digital dedicada a la memoria, la reconciliación y el homenaje permanente de las personas que amamos. Diseñada con calidez, reverencia y confianza.
            </p>
            <div className="flex items-center gap-4 text-xs text-[#8C827A] pt-2">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
                Privacidad garantizada
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#C5A880]" />
                Almacenamiento seguro
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-serif text-base text-white font-medium mb-4 tracking-wider">
              Plataforma
            </h4>
            <ul className="space-y-2.5 text-sm text-[#A89F95]">
              <li>
                <button
                  onClick={() => setCurrentView("landing")}
                  className="hover:text-white transition-colors"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView("landing");
                    setTimeout(() => {
                      document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="hover:text-white transition-colors"
                >
                  Cómo funciona
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView("landing");
                    setTimeout(() => {
                      document.getElementById("caracteristicas")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="hover:text-white transition-colors"
                >
                  Características
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView("landing");
                    setTimeout(() => {
                      document.getElementById("planes")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="hover:text-white transition-colors"
                >
                  Planes y Precios
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView("landing");
                    setTimeout(() => {
                      document.getElementById("ejemplo-memorial")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="hover:text-white transition-colors"
                >
                  Memorial de Ejemplo
                </button>
              </li>
            </ul>
          </div>

          {/* Assistance & Services */}
          <div>
            <h4 className="font-serif text-base text-white font-medium mb-4 tracking-wider">
              Acompañamiento
            </h4>
            <ul className="space-y-2.5 text-sm text-[#A89F95]">
              <li>
                <button
                  onClick={() => setCurrentView("contact")}
                  className="hover:text-white transition-colors text-left"
                >
                  Servicio Concierge
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView("contact")}
                  className="hover:text-white transition-colors text-left"
                >
                  Ayuda editorial y biografías
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView("landing");
                    setTimeout(() => {
                      document.getElementById("preguntas-frecuentes")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Preguntas Frecuentes
                </button>
              </li>
              <li>
                <a
                  href={getWhatsAppUrl("contact")}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick("footer")}
                  aria-label="Contactar a MEMORA por WhatsApp"
                  className="hover:text-emerald-400 text-[#A89F95] transition-colors inline-flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp de Ayuda</span>
                </a>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView("contact")}
                  className="hover:text-white transition-colors text-left"
                >
                  Contacto directo
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-serif text-base text-white font-medium mb-4 tracking-wider">
              Transparencia y Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-[#A89F95]">
              <li>
                <button
                  onClick={() => setCurrentView("privacy-policy")}
                  className="hover:text-white transition-colors"
                >
                  Política de Privacidad
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView("terms")}
                  className="hover:text-white transition-colors"
                >
                  Términos del Servicio
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView("privacy-policy")}
                  className="hover:text-white transition-colors text-left"
                >
                  Tratamiento de Datos
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView("privacy-policy")}
                  className="hover:text-white transition-colors text-left"
                >
                  Derecho al olvido y eliminación
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits and Disclaimers */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C827A]">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#A89F95]" />
            <span>Español (Latinoamérica) · Precios en USD</span>
          </div>
          <p className="text-center sm:text-right">
            © {new Date().getFullYear()} MEMORA. Recuerdos Para Siempre. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
