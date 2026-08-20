import React, { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle, Heart } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { WhatsAppButton } from "../whatsapp/WhatsAppButton";

export const FAQSection: React.FC = () => {
  const { setCurrentView } = useApp();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "¿Qué es MEMORA y en qué se diferencia de una red social tradicional?",
      a: "MEMORA es un santuario digital dedicado a la memoria, el homenaje y el legado permanente. A diferencia de las redes sociales convencionales, MEMORA no tiene publicidad, algoritmos de distracción ni contenido efímero. Es un espacio íntimo, respetuoso y diseñado para celebrar una vida con la solemnidad y belleza que merece.",
    },
    {
      q: "¿Es un pago único o tiene que renovarse?",
      a: "Todos los planes (Esencial, Familia y Legado) son de renovación anual, al mismo precio con el que contrataste — sin sorpresas ni alzas. Mientras el plan esté activo, el memorial permanece disponible, protegido y accesible para toda tu familia.",
    },
    {
      q: "¿Cómo funciona la privacidad y quién puede ver el memorial?",
      a: "Tú tienes el control absoluto. Puedes configurarlo como Público (visible para todos quienes tengan el link), Privado (solo personas con invitación por correo), Protegido (requiere ingresar una contraseña que tú elijas) u Oculto (no aparece en buscadores como Google). Puedes cambiar el nivel de privacidad cuando desees.",
    },
    {
      q: "¿Pueden otros familiares y amigos subir fotos y anécdotas?",
      a: "Sí. Puedes invitar a familiares como Colaboradores para que organicen álbumes y agreguen memorias, o simplemente compartir el enlace para que cualquier allegado deje condolencias, encienda una vela virtual o comparta una fotografía con su mensaje.",
    },
    {
      q: "¿Cómo funciona el asistente de biografía impulsado por IA?",
      a: "Entendemos que redactar una historia en momentos de duelo puede ser difícil. Puedes escribir notas breves o anécdotas simples, y nuestro asistente inteligente (basado en Gemini) te sugerirá una redacción emotiva, digna y estructurada cronológicamente. Tú siempre puedes editar, corregir o reemplazar el texto resultante.",
    },
    {
      q: "¿Cómo se utiliza el Código QR en ceremonias o en el cementerio?",
      a: "Cada memorial genera automáticamente un Código QR de alta resolución listo para imprimir en recordatorios funerarios, libros de firmas o placas conmemorativas. Cualquier persona puede escanearlo con la cámara de su teléfono para ingresar directamente al memorial digital sin necesidad de descargar ninguna aplicación.",
    },
    {
      q: "¿Puedo descargar las fotos que subí?",
      a: "Sí. Cada fotografía se puede descargar individualmente en su tamaño original desde el visualizador ampliado, con un solo clic — igual que en cualquier galería.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="preguntas-frecuentes" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF7F2] border border-[#D8CEBE] text-xs font-semibold text-[#7A4E38] uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Respuestas a tus dudas</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#24201D] font-normal tracking-tight">
            Preguntas Frecuentes
          </h2>
          <p className="text-base text-[#5C534B] leading-relaxed">
            Queremos que te sientas con total tranquilidad y confianza al crear tu memorial.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-[#FAF7F2] border-[#C5A880]/60 shadow-xs"
                    : "bg-white border-[#EAE3D9] hover:border-[#D8CEBE]"
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                >
                  <span className="font-serif text-lg text-[#24201D] font-medium leading-snug">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-[#C5A880]/20 text-[#7A4E38]" : "text-[#8C827A]"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-[#5C534B] leading-relaxed border-t border-[#EAE3D9]/40">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Assistance footer / WhatsApp Direct Help Block */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h3 className="font-serif text-lg sm:text-xl text-[#24201D] font-medium">
              ¿Necesitas ayuda?
            </h3>
            <p className="text-xs sm:text-sm text-[#5C534B] mt-1 leading-relaxed">
              Estamos aquí para ayudarte a crear y conservar tu MEMORA.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            <WhatsAppButton
              context="landing"
              label="Hablar por WhatsApp"
              size="md"
              variant="primary"
              id="landing-faq-whatsapp-btn"
            />
            <button
              onClick={() => setCurrentView("contact")}
              className="px-4 py-2.5 rounded-full bg-white hover:bg-[#F4EFEA] text-[#24201D] border border-[#D8CEBE] text-xs font-semibold transition-colors cursor-pointer"
            >
              Formulario de Contacto
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
