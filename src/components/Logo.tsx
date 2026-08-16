import React from "react";

interface LogoProps {
  variant?: "light" | "dark" | "gold" | "white";
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = "dark",
  size = "md",
  className = "",
  iconOnly = false,
}) => {
  // Height sizing for the full logo
  const logoHeights = {
    sm: "h-10 sm:h-12",
    md: "h-16 sm:h-20 md:h-24",
    lg: "h-24 sm:h-28",
    xl: "h-32 sm:h-40",
  };

  // Sizing for icon-only (heart favicon)
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  // Determine image source based on variant & display mode
  // Using direct uploaded files from user
  let imageSrc = "/Logo Principal Transparente.png";
  if (iconOnly) {
    imageSrc = variant === "white" ? "/favicon-heart-white.png" : "/favicon-heart-dark.png";
  } else if (variant === "dark" || variant === "light") {
    imageSrc = "/logo-principal-dark.png";
  } else {
    // white or default
    imageSrc = "/Logo Principal Transparente.png";
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={imageSrc}
        alt="MEMORA — Recuerdos Para Siempre"
        className={`w-auto object-contain transition-opacity duration-200 hover:opacity-95 ${
          iconOnly ? iconSizes[size] : logoHeights[size]
        }`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
