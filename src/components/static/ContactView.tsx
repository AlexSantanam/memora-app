import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Mail, Phone, MessageSquare, Sparkles, Send, CheckCircle2, ArrowLeft, MessageCircle } from "lucide-react";
import { WhatsAppButton } from "../whatsapp/WhatsAppButton";

export const ContactView: React.FC = () => {
  const { setCurrentView, notify } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("editorial");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, topic, message }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "No se pudo enviar el mensaje.");
      setSubmitted(true);
      notify("success", "Mensaje enviado", "Nuestro equipo de acompañamiento se comunicará contigo prontamente.");
    } catch (err: any) {
      notify("error", "No se pudo enviar tu mensaje", "Intenta nuevamente o escríbenos por WhatsApp.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-12 border border-[#EAE3D9] shadow-xs space-y-8">
        
        <button
          onClick={() => setCurrentView("landing")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#7A4E38] hover:text-[#24201D] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al inicio</span>
        </button>

        <div className="border-b border-[#F4EFEA] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] text-xs font-semibold text-[#7A4E38] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            Acompañamiento Humano MEMORA
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#24201D] font-medium">
            Estamos para Acompañarte
          </h1>
          <p className="text-xs sm:text-sm text-[#5C534B] mt-2 leading-relaxed">
            Si necesitas ayuda para redactar la semblanza, digitalizar fotos antiguas, configurar el plan corporativo o resolver cualquier duda, nuestro equipo responde con calidez y prontitud.
          </p>
        </div>

        {/* Direct WhatsApp Fast Track Box */}
        <div className="p-6 rounded-2xl bg-[#F4EFEA] border border-[#D8CEBE] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white border border-[#D8CEBE] flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-xs">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-[#24201D]">
                Atención Inmediata por WhatsApp
              </h4>
              <p className="text-[11px] text-[#5C534B]">
                Conversa directamente con un especialista del equipo MEMORA.
              </p>
            </div>
          </div>
          <WhatsAppButton
            context="contact"
            label="Hablar por WhatsApp"
            size="md"
            variant="primary"
            className="flex-shrink-0"
            id="contact-view-whatsapp-btn"
          />
        </div>

        {submitted ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-serif text-2xl text-[#24201D] font-medium">
              Mensaje recibido con aprecio
            </h3>
            <p className="text-xs sm:text-sm text-[#5C534B] max-w-md mx-auto">
              Te contactaremos a <strong>{email}</strong> en las próximas horas.
            </p>
            <button
              onClick={() => setCurrentView("landing")}
              className="mt-4 px-6 py-2.5 rounded-full bg-[#24201D] text-white text-xs font-semibold hover:bg-[#3D3530]"
            >
              Volver a la portada
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#24201D] mb-1">Tu Nombre *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Rodrigo Morales"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24201D] mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rodrigo@ejemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#24201D] mb-1">¿En qué podemos ayudarte?</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
              >
                <option value="editorial">Ayuda con la redacción de la biografía</option>
                {/* Placas físicas de bronce: oculto hasta que se venda de verdad. */}
                <option value="billing">Consultas sobre planes y facturación</option>
                <option value="general">Otra consulta o sugerencia</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#24201D] mb-1">Mensaje o Detalle *</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Cuéntanos sobre tu necesidad o la persona querida a quien deseas conmemorar..."
                className="w-full p-3.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3.5 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-[#C5A880]" />
              <span>{isSending ? "Enviando..." : "Enviar Mensaje al Equipo MEMORA"}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
