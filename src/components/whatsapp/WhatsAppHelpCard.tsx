import React from "react";
import { MessageCircle, HeartHandshake } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";
import { WhatsAppContext } from "../../config/whatsapp";

interface WhatsAppHelpCardProps {
  title?: string;
  subtitle?: string;
  context?: WhatsAppContext;
  buttonLabel?: string;
  variant?: "card" | "banner" | "compact";
  className?: string;
  id?: string;
}

export const WhatsAppHelpCard: React.FC<WhatsAppHelpCardProps> = ({
  title = "¿Necesitas ayuda?",
  subtitle = "Estamos aquí para acompañarte en cada paso.",
  context = "default",
  buttonLabel = "Hablar por WhatsApp",
  variant = "card",
  className = "",
  id,
}) => {
  if (variant === "compact") {
    return (
      <div
        id={id}
        className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] ${className}`}
      >
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#24201D]">{title}</p>
            <p className="text-[11px] text-[#7A7067]">{subtitle}</p>
          </div>
        </div>
        <WhatsAppButton
          context={context}
          label={buttonLabel}
          size="sm"
          variant="primary"
          className="flex-shrink-0"
        />
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div
        id={id}
        className={`p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col md:flex-row items-center justify-between gap-6 ${className}`}
      >
        <div className="flex items-start gap-4 text-center md:text-left">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#EAE3D9] flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-xs">
            <HeartHandshake className="w-6 h-6 text-[#7A4E38]" />
          </div>
          <div>
            <h4 className="font-serif text-lg sm:text-xl text-[#24201D] font-medium">
              {title}
            </h4>
            <p className="text-xs sm:text-sm text-[#5C534B] mt-1 max-w-xl leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>
        <WhatsAppButton
          context={context}
          label={buttonLabel}
          size="md"
          variant="primary"
          className="flex-shrink-0"
        />
      </div>
    );
  }

  // Default card style
  return (
    <div
      id={id}
      className={`rounded-3xl p-6 sm:p-8 bg-white border border-[#EAE3D9] shadow-xs text-center space-y-4 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-center text-emerald-600 mx-auto">
        <MessageCircle className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-serif text-lg sm:text-xl text-[#24201D] font-medium">
          {title}
        </h4>
        <p className="text-xs sm:text-sm text-[#5C534B] mt-1.5 max-w-md mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>
      <div>
        <WhatsAppButton
          context={context}
          label={buttonLabel}
          size="md"
          variant="primary"
        />
      </div>
    </div>
  );
};
