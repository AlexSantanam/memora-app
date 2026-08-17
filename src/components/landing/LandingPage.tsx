import React from "react";
import { HeroSection } from "./HeroSection";
import { ValueMessageSection } from "./ValueMessageSection";
import { UseCasesSection } from "./UseCasesSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { GalleryPreviewSection } from "./GalleryPreviewSection";
import { PetsLandingSection } from "./PetsLandingSection";
import { StoryCompositionSection } from "./StoryCompositionSection";
import { TributesPreviewSection } from "./TributesPreviewSection";
import { ValueBentoSection } from "./ValueBentoSection";
import { SecurityTrustSection } from "./SecurityTrustSection";
import { PrivacyTrustSection } from "./PrivacyTrustSection";
import { PricingSection } from "./PricingSection";
import { FAQSection } from "./FAQSection";

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-0">
      <HeroSection />
      <ValueMessageSection />
      <UseCasesSection />
      <div id="como-funciona">
        <HowItWorksSection />
      </div>
      <div id="ejemplo-memorial">
        <GalleryPreviewSection />
      </div>
      <PetsLandingSection />
      <StoryCompositionSection />
      <TributesPreviewSection />
      <div id="caracteristicas">
        <ValueBentoSection />
      </div>
      <SecurityTrustSection />
      <PrivacyTrustSection />
      <div id="planes">
        <PricingSection />
      </div>
      <div id="preguntas-frecuentes">
        <FAQSection />
      </div>
    </div>
  );
};

