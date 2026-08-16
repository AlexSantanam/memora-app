import React from "react";
import { Check, Sparkles, QrCode, ArrowRight, Printer, Shield, FileDown, Heart, UserCheck } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { CENTRALIZED_PLANS } from "../../data/plansConfig";
import { PlanTier } from "../../types";
import { WhatsAppButton } from "../whatsapp/WhatsAppButton";

export const PricingSection: React.FC = () => {
  const {
    setCurrentView,
    setSelectedPlanForCheckout,
    setIsAuthModalOpen,
    setAuthModalMode,
    isAuthenticated,
  } = useApp();

  const handleSelectPlan = (planId: PlanTier) => {
    setSelectedPlanForCheckout(planId);
    if (!isAuthenticated) {
      setAuthModalMode("register");
      setIsAuthModalOpen(true);
    } else {
      setCurrentView("checkout");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const planList = [
    CENTRALIZED_PLANS.esencial,
    CENTRALIZED_PLANS.familia,
    CENTRALIZED_PLANS.legado,
  ];

  return (
    <section id="planes" className="py-20 sm:py-28 bg-[#FAF7F2] border-b border-[#EAE3D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F4EFEA] border border-[#D8CEBE] text-xs font-semibold text-[#7A4E38] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Planes Anuales MEMORA</span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#24201D] font-normal tracking-tight">
            Conservar su memoria no debería ser inaccesible
          </h2>
          
          <p className="text-base sm:text-lg text-[#5C534B] leading-relaxed">
            Todos nuestros planes son anuales y se renuevan por el mismo valor. Sin sorpresas.
          </p>

          <p className="text-xs sm:text-sm text-[#8C827A] font-serif italic">
            "Un año de MEMORA. Un año más para conservar su historia."
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
          {planList.map((plan) => {
            const isPopular = plan.isPopular;
            const isEsencial = plan.id === "esencial";
            const isLegado = plan.id === "legado";

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-7 sm:p-9 transition-all duration-300 flex flex-col justify-between ${
                  isPopular
                    ? "bg-[#24201D] text-white shadow-2xl scale-[1.02] border-2 border-[#C5A880] z-10"
                    : "bg-white text-[#24201D] border border-[#EAE3D9] hover:border-[#C5A880] shadow-sm hover:shadow-md"
                }`}
              >
                {/* Popular Pill */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#C5A880] text-[#1F1B18] text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                    <Sparkles className="w-3.5 h-3.5 text-[#7A4E38]" />
                    <span>{plan.popularBadgeText || "Recomendado para familias"}</span>
                  </div>
                )}

                <div>
                  {/* Plan Header */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h3
                        className={`font-serif text-2xl sm:text-3xl font-medium ${
                          isPopular ? "text-white" : "text-[#24201D]"
                        }`}
                      >
                        {plan.name}
                      </h3>
                    </div>

                    <p
                      className={`text-xs sm:text-sm leading-relaxed mb-3 ${
                        isPopular ? "text-[#D8CEBE]" : "text-[#5C534B]"
                      }`}
                    >
                      {plan.tagline}
                    </p>

                    {/* Personas & Mascotas Badges */}
                    <div className="flex items-center gap-2 text-[11px] font-medium">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${
                        isPopular ? "bg-white/10 text-stone-200" : "bg-[#FAF7F2] text-[#7A4E38] border border-[#EAE3D9]"
                      }`}>
                        👤 Personas
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${
                        isPopular ? "bg-white/10 text-stone-200" : "bg-[#FAF7F2] text-[#7A4E38] border border-[#EAE3D9]"
                      }`}>
                        🐾 Mascotas
                      </span>
                    </div>
                  </div>

                  {/* Price Box */}
                  <div className={`mb-6 pb-6 border-b ${isPopular ? "border-stone-700" : "border-[#EAE3D9]"}`}>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
                        ${plan.priceAnnualCLP.toLocaleString("es-CL")}
                      </span>
                      <span
                        className={`text-xs uppercase font-semibold ${
                          isPopular ? "text-stone-300" : "text-[#8C827A]"
                        }`}
                      >
                        CLP / año
                      </span>
                    </div>

                    <div className="mt-2 space-y-0.5">
                      <p
                        className={`text-xs font-medium ${
                          isPopular ? "text-[#C5A880]" : "text-[#7A4E38]"
                        }`}
                      >
                        {plan.renewalText}
                      </p>
                      <p className={`text-[11px] italic ${isPopular ? "text-stone-400" : "text-[#8C827A]"}`}>
                        "{plan.commercialMessage}"
                      </p>
                    </div>
                  </div>

                  {/* Limits summary callout */}
                  <div className={`p-3 rounded-2xl mb-5 text-xs ${
                    isPopular ? "bg-white/5 border border-white/10" : "bg-[#FAF7F2] border border-[#EAE3D9]"
                  }`}>
                    <p className={`font-semibold mb-1 ${isPopular ? "text-white" : "text-[#24201D]"}`}>
                      Capacidad total por plan:
                    </p>
                    <div className={`space-y-0.5 text-[11px] ${isPopular ? "text-stone-300" : "text-[#5C534B]"}`}>
                      <p>• {plan.maxMemoras === 1 ? "1 MEMORA" : `Hasta ${plan.maxMemoras} MEMORAs`}</p>
                      <p>• {plan.maxPhotosTotal.toLocaleString("es-CL")} fotografías (bolsa compartida)</p>
                      <p>• {plan.maxVideosTotal === 0 ? "0 videos (exclusivo fotos)" : `${plan.maxVideosTotal} videos (bolsa compartida)`}</p>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="mb-8">
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                      isPopular ? "text-stone-300" : "text-[#7A4E38]"
                    }`}>
                      Incluye:
                    </p>
                    <ul className="space-y-2.5 text-xs sm:text-[13px]">
                      {plan.features.map((feat, i) => {
                        const isPrintableFeat = feat.includes("Recuerdo para imprimir") || feat.includes("PDF");
                        return (
                          <li key={i} className="flex items-start gap-2.5">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isPopular
                                  ? "bg-[#C5A880]/20 text-[#C5A880]"
                                  : "bg-[#FAF7F2] text-[#7A4E38] border border-[#D8CEBE]"
                              }`}
                            >
                              <Check className="w-2.5 h-2.5" />
                            </div>
                            <span
                              className={`${
                                isPopular ? "text-stone-200" : "text-[#5C534B]"
                              } ${isPrintableFeat ? "font-medium" : ""}`}
                            >
                              {feat}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                {/* Action CTA Button */}
                <div className="pt-2">
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-3.5 px-6 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
                      isPopular
                        ? "bg-[#C5A880] text-[#1F1B18] hover:bg-[#D4BC97]"
                        : "bg-[#24201D] text-white hover:bg-[#3D3530]"
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p
                    className={`text-[10px] text-center mt-3 ${
                      isPopular ? "text-stone-400" : "text-[#8C827A]"
                    }`}
                  >
                    Pago anual seguro vía Flow (Webpay, Redcompra, Tarjetas)
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* COMPARISON TABLE */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EAE3D9] shadow-xs mb-14 overflow-hidden">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A4E38] block mb-1">
              Comparativa Detallada
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#24201D] font-normal">
              Compara las características de cada plan
            </h3>
            <p className="text-xs sm:text-sm text-[#8C827A] mt-1">
              Los límites de fotografías y videos son por plan (bolsa total compartida entre tus MEMORAs), no por MEMORA.
            </p>
          </div>

          <div className="overflow-x-auto -mx-6 sm:mx-0 px-6 sm:px-0">
            <table className="w-full text-left text-xs sm:text-sm min-w-[620px]">
              <thead>
                <tr className="border-b border-[#EAE3D9] text-[#24201D]">
                  <th className="py-4 pr-4 font-serif text-base font-semibold w-1/3">Características</th>
                  <th className="py-4 px-3 text-center w-1/5 font-semibold">
                    <span className="block text-sm sm:text-base font-serif">MEMORA Esencial</span>
                    <span className="text-xs text-[#7A4E38] font-bold block">$990 CLP / año</span>
                  </th>
                  <th className="py-4 px-3 text-center w-1/5 font-semibold bg-[#FAF7F2] rounded-t-2xl">
                    <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#7A4E38] bg-[#F4EFEA] px-2 py-0.5 rounded-full mb-1">
                      <Sparkles className="w-2.5 h-2.5 text-[#C5A880]" />
                      Recomendado
                    </div>
                    <span className="block text-sm sm:text-base font-serif">MEMORA Familia</span>
                    <span className="text-xs text-[#7A4E38] font-bold block">$4.900 CLP / año</span>
                  </th>
                  <th className="py-4 pl-3 text-center w-1/5 font-semibold">
                    <span className="block text-sm sm:text-base font-serif">MEMORA Legado</span>
                    <span className="text-xs text-[#7A4E38] font-bold block">$14.900 CLP / año</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EFEA] text-[#5C534B]">
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#24201D]">Precio Anual</td>
                  <td className="py-3.5 px-3 text-center font-bold text-[#24201D]">$990 CLP</td>
                  <td className="py-3.5 px-3 text-center font-bold text-[#24201D] bg-[#FAF7F2]">$4.900 CLP</td>
                  <td className="py-3.5 pl-3 text-center font-bold text-[#24201D]">$14.900 CLP</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#24201D]">Renovación Anual (mismo precio)</td>
                  <td className="py-3.5 px-3 text-center text-[#7A4E38] font-semibold">$990 CLP</td>
                  <td className="py-3.5 px-3 text-center text-[#7A4E38] font-semibold bg-[#FAF7F2]">$4.900 CLP</td>
                  <td className="py-3.5 pl-3 text-center text-[#7A4E38] font-semibold">$14.900 CLP</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#24201D]">Cantidad de MEMORAs (Espacios)</td>
                  <td className="py-3.5 px-3 text-center font-semibold text-[#24201D]">1</td>
                  <td className="py-3.5 px-3 text-center font-semibold text-[#24201D] bg-[#FAF7F2]">Hasta 3</td>
                  <td className="py-3.5 pl-3 text-center font-semibold text-[#24201D]">Hasta 10</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#24201D]">Fotografías (bolsa compartida por plan)</td>
                  <td className="py-3.5 px-3 text-center font-semibold text-[#24201D]">10 fotos</td>
                  <td className="py-3.5 px-3 text-center font-semibold text-[#24201D] bg-[#FAF7F2]">100 fotos</td>
                  <td className="py-3.5 pl-3 text-center font-semibold text-[#24201D]">1.000 fotos</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#24201D]">Videos (bolsa compartida por plan)</td>
                  <td className="py-3.5 px-3 text-center text-[#8C827A]">—</td>
                  <td className="py-3.5 px-3 text-center font-semibold text-[#24201D] bg-[#FAF7F2]">10 videos</td>
                  <td className="py-3.5 pl-3 text-center font-semibold text-[#24201D]">50 videos</td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#24201D]">Personas y Mascotas</td>
                  <td className="py-3.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 px-3 text-center bg-[#FAF7F2]"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 pl-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#24201D]">Código QR único permanente</td>
                  <td className="py-3.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 px-3 text-center bg-[#FAF7F2]"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 pl-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#24201D]">Recuerdo imprimible incluido (Sin costo)</td>
                  <td className="py-3.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 px-3 text-center bg-[#FAF7F2]"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 pl-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#24201D]">Descarga en PDF de alta resolución</td>
                  <td className="py-3.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 px-3 text-center bg-[#FAF7F2]"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 pl-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#24201D]">Herramientas de IA (Gemini)</td>
                  <td className="py-3.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 px-3 text-center bg-[#FAF7F2]"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 pl-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#24201D]">Ayuda y soporte mediante WhatsApp</td>
                  <td className="py-3.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 px-3 text-center bg-[#FAF7F2]"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 pl-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#24201D]">Funciones familiares avanzadas</td>
                  <td className="py-3.5 px-3 text-center text-[#8C827A]">—</td>
                  <td className="py-3.5 px-3 text-center bg-[#FAF7F2]"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3.5 pl-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3.5 pr-4 font-medium text-[#24201D]">Funciones premium prioritarias</td>
                  <td className="py-3.5 px-3 text-center text-[#8C827A]">—</td>
                  <td className="py-3.5 px-3 text-center text-[#8C827A] bg-[#FAF7F2]">—</td>
                  <td className="py-3.5 pl-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Printable Memorial & QR Callout Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE3D9] flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-center text-[#7A4E38] flex-shrink-0">
              <Printer className="w-6 h-6 text-[#C5A880]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-serif text-lg sm:text-xl text-[#24201D] font-medium">
                  Recuerdo imprimible incluido en todos los planes
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  Sin costo adicional
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#5C534B] mt-1 max-w-2xl leading-relaxed">
                Cada MEMORA incluye su diseño de recuerdo conmemorativo listo para imprimir en alta resolución (para cuadros, urnas o placas con código QR). No existe ningún cobro adicional por generar, personalizar o descargar este diseño en PDF.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSelectPlan("familia")}
            className="px-6 py-3 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-xs font-semibold flex-shrink-0 transition-colors cursor-pointer whitespace-nowrap"
          >
            Elegir Plan Familia
          </button>
        </div>

        {/* Questions About Plans / WhatsApp Help Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#F4EFEA] border border-[#D8CEBE] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#D8CEBE] flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg sm:text-xl text-[#24201D] font-medium">
                ¿Necesitas ayuda? Estamos aquí para ayudarte
              </h4>
              <p className="text-xs sm:text-sm text-[#5C534B] mt-1 max-w-2xl leading-relaxed">
                Todos los planes incluyen asistencia humana mediante WhatsApp. Escríbenos directamente y te asesoramos con dedicación y calidez.
              </p>
            </div>
          </div>
          <WhatsAppButton
            context="plans"
            label="Hablar por WhatsApp"
            size="md"
            variant="primary"
            className="flex-shrink-0"
            id="pricing-whatsapp-btn"
          />
        </div>

      </div>
    </section>
  );
};

