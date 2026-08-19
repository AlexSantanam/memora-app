import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { getWhatsAppUrl, trackWhatsAppClick, WhatsAppContext } from "../../config/whatsapp";
import { useApp } from "../../context/AppContext";

export const WhatsAppFloatingWidget: React.FC = () => {
  const { currentView, selectedPlanForCheckout } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Determine current contextual message based on the active view
  let context: WhatsAppContext = "default";
  if (selectedPlanForCheckout) {
    context = "payment";
  } else if (currentView === "landing") {
    context = "landing";
  } else if (currentView === "wizard") {
    context = "create_memora";
  } else if (currentView === "dashboard") {
    context = "default";
  } else if (currentView === "contact") {
    context = "contact";
  }

  const url = getWhatsAppUrl(context);

  if (isDismissed) {
    return null;
  }

  // En el memorial hay una barra de acciones flotante (Homenaje/Compartir/Imprimir)
  // en la misma esquina — se sube el widget para que no la tape y bloquee sus clics.
  const bottomOffsetClass = currentView === "memorial-view" ? "bottom-24 sm:bottom-28" : "bottom-5";

  return (
    <div
      className={`fixed ${bottomOffsetClass} right-5 z-40 flex items-center gap-2 group print:hidden`}
      id="whatsapp-floating-widget"
    >
      {/* Tooltip on desktop hover */}
      <div
        className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-[#D8CEBE] shadow-md text-xs font-medium text-[#24201D] transition-all duration-200 transform ${
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>¿Necesitas ayuda? Escríbenos</span>
      </div>

      {/* Floating Action Button */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppClick(`floating_${context}`)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Contactar a MEMORA por WhatsApp"
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-3 focus:ring-emerald-400 focus:ring-offset-2 border-2 border-white/60"
        title="Hablar por WhatsApp con MEMORA"
      >
        <MessageCircle className="w-7 h-7 drop-shadow-xs" />
      </a>
    </div>
  );
};
