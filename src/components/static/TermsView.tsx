import React from "react";
import { useApp } from "../../context/AppContext";
import { FileText, ArrowLeft } from "lucide-react";

export const TermsView: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-12 border border-[#EAE3D9] shadow-xs space-y-8">
        
        <button
          onClick={() => setCurrentView("landing")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#7A4E38] hover:text-[#24201D] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al inicio</span>
        </button>

        <div className="border-b border-[#F4EFEA] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] text-xs font-semibold text-[#7A4E38] mb-3">
            <FileText className="w-3.5 h-3.5 text-[#C5A880]" />
            Términos y Condiciones de Uso
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#24201D] font-medium">
            Términos de Servicio y Respeto Comunitario
          </h1>
          <p className="text-xs text-[#8C827A] mt-2">
            Última actualización: Enero de 2025
          </p>
        </div>

        <div className="space-y-6 text-sm text-[#4A423B] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-xl text-[#24201D] font-medium">1. Finalidad del Servicio</h2>
            <p>
              MEMORA es una plataforma creada para la conmemoración respetuosa, la memoria familiar y la preservación del legado humano. Queda terminantemente prohibido el uso de la plataforma para fines difamatorios, de acoso, comerciales no autorizados o ilícitos.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl text-[#24201D] font-medium">2. Responsabilidad sobre los Contenidos</h2>
            <p>
              Los creadores del memorial declaran contar con el consentimiento moral y legítimo para compartir las fotografías e historias de la persona homenajeada. Los administradores disponen de herramientas de moderación activa para supervisar los comentarios recibidos.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl text-[#24201D] font-medium">3. Garantía de Permanencia (Plan Para Siempre)</h2>
            <p>
              El Plan Para Siempre garantiza el alojamiento indefinido del memorial sin cuotas de mantenimiento mensual o anual, respaldado por una reserva de infraestructura de datos a perpetuidad.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
};
