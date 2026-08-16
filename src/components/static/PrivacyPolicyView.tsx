import React from "react";
import { useApp } from "../../context/AppContext";
import { Shield, ArrowLeft, Lock, FileText, CheckCircle2 } from "lucide-react";

export const PrivacyPolicyView: React.FC = () => {
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
            <Shield className="w-3.5 h-3.5 text-[#C5A880]" />
            Política de Privacidad y Custodia
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#24201D] font-medium">
            Tu Privacidad y la de tu Familia es Sagrada
          </h1>
          <p className="text-xs text-[#8C827A] mt-2">
            Última actualización: Enero de 2025 · Cumplimiento de estándares éticos y de confidencialidad
          </p>
        </div>

        <div className="space-y-6 text-sm text-[#4A423B] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-xl text-[#24201D] font-medium">1. Nuestro Compromiso Ético</h2>
            <p>
              En <strong>MEMORA</strong> entendemos que cada memorial digital alberga recuerdos íntimos, fotografías familiares y momentos de vulnerabilidad. Nuestro compromiso inquebrantable es resguardar esta información con el más alto rigor de confidencialidad, sin comercializar datos ni exhibir publicidad de terceros.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl text-[#24201D] font-medium">2. Datos que Custodiamos</h2>
            <p>
              Recopilamos únicamente la información necesaria para el funcionamiento del memorial: nombres, fechas de nacimiento y defunción, biografías redactadas o aprobadas por la familia, archivos multimedia (fotos y videos) subidos por los administradores o allegados, y mensajes de homenaje.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl text-[#24201D] font-medium">3. Niveles de Control y Visibilidad</h2>
            <p>
              El propietario del memorial posee absoluto control sobre la visibilidad del espacio:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong>Público:</strong> Accesible mediante enlace directo para allegados y comunidad.</li>
              <li><strong>Protegido por Clave:</strong> Requiere una contraseña elegida por la familia para desbloquear las memorias.</li>
              <li><strong>Privado:</strong> Restringido exclusivamente a usuarios invitados por correo electrónico.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl text-[#24201D] font-medium">4. Permanencia y Derecho de Supresión</h2>
            <p>
              Los administradores autorizados pueden exportar, editar o eliminar de forma definitiva el memorial y todos sus contenidos en cualquier momento desde su panel de control.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
};
