import React from "react";
import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl, trackWhatsAppClick, WhatsAppContext } from "../../config/whatsapp";

interface WhatsAppButtonProps {
  context?: WhatsAppContext;
  customMessage?: string;
  className?: string;
  variant?: "primary" | "secondary" | "subtle" | "dark" | "outline";
  size?: "sm" | "md" | "lg";
  label?: string;
  showIcon?: boolean;
  id?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  context = "default",
  customMessage,
  className = "",
  variant = "primary",
  size = "md",
  label = "Hablar por WhatsApp",
  showIcon = true,
  id,
}) => {
  const url = getWhatsAppUrl(customMessage || context);

  const handleClick = () => {
    trackWhatsAppClick(context);
  };

  // Base sizing
  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-xs sm:text-sm gap-2",
    lg: "px-7 py-3.5 text-sm sm:text-base gap-2.5",
  }[size];

  // Visual variants harmonized with MEMORA's warm stone, gold and charcoal palette
  const variantClasses = {
    primary:
      "bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-sm hover:shadow active:scale-[0.98] border border-[#1eb556]",
    secondary:
      "bg-[#FAF7F2] text-[#24201D] hover:bg-[#F4EFEA] border border-[#D8CEBE] hover:border-[#C5A880] shadow-xs active:scale-[0.98]",
    subtle:
      "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 active:scale-[0.98]",
    dark:
      "bg-[#24201D] text-white hover:bg-[#3D3530] border border-[#3D3530] shadow-sm active:scale-[0.98]",
    outline:
      "bg-transparent text-[#7A4E38] hover:text-[#24201D] hover:bg-[#F4EFEA]/80 border border-[#D8CEBE] active:scale-[0.98]",
  }[variant];

  return (
    <a
      id={id}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      aria-label="Contactar a MEMORA por WhatsApp"
      className={`inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C5A880] focus:ring-offset-2 select-none cursor-pointer ${sizeClasses} ${variantClasses} ${className}`}
    >
      {showIcon && <MessageCircle className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4 flex-shrink-0"} />}
      <span className="whitespace-nowrap">{label}</span>
    </a>
  );
};
