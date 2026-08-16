import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { DEFAULT_PLANS } from "../../data/sampleData";
import { PlanTier } from "../../types";
import {
  X,
  Check,
  ShieldCheck,
  CreditCard,
  Lock,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Building2,
  Smartphone,
  Wallet,
  MessageCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import { WhatsAppButton } from "../whatsapp/WhatsAppButton";

interface CheckoutModalProps {
  planId: PlanTier;
  memorialId?: string;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ planId, memorialId, onClose }) => {
  const { completePaymentSimulation, notify, currentUser } = useApp();
  
  const [paymentGateway, setPaymentGateway] = useState<"flow" | "card">("flow");
  
  // Card Form states (International / Simulation)
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExp, setCardExp] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("888");
  const [cardHolder, setCardHolder] = useState(currentUser?.name || "Familia Memora");
  
  // Flow State
  const [isFlowLoading, setIsFlowLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const plan = DEFAULT_PLANS.find((p) => p.id === planId) || DEFAULT_PLANS[1];

  const planPricesCLP: Record<string, number> = {
    esencial: 990,
    familia: 4900,
    legado: 14900,
    para_siempre: 4900,
    acompanado: 14900,
  };

  const amountCLP = planPricesCLP[planId] ?? (plan.price || 4900);

  // Handle Flow Real Checkout
  const handleFlowPayment = async () => {
    if (plan.price === 0) {
      // Free plan
      await completePaymentSimulation(planId, memorialId);
      setIsDone(true);
      return;
    }

    setIsFlowLoading(true);

    try {
      const res = await fetch("/api/payments/flow/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          memorialId: memorialId || "",
          userEmail: currentUser?.email || "contacto@memora.cl",
          userName: currentUser?.name || "Familia Memora",
        }),
      });

      const data = await res.json();

      if (data.success && data.redirectUrl) {
        notify("info", "Redirigiendo a Flow...", "Ingresando a la pasarela segura Webpay Plus.");
        // Redirect browser to Flow payment gateway
        window.location.href = data.redirectUrl;
      } else if (data.testUrl) {
        // Fallback demo redirect
        window.location.href = data.testUrl;
      } else {
        throw new Error(data.error || "No se pudo iniciar la pasarela de pagos.");
      }
    } catch (err: any) {
      setIsFlowLoading(false);
      console.warn("Flow payment initialization message:", err?.message);
      notify("warning", "Conectando con Flow", "Utilizando simulación segura para pruebas locales.");
      // Fallback to simulation
      setPaymentGateway("card");
    }
  };

  const handleCardPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      await completePaymentSimulation(planId, memorialId);
      setIsProcessing(false);
      setIsDone(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#C5A880", "#7A4E38", "#24201D"],
      });
      setTimeout(() => {
        onClose();
      }, 2200);
    } catch (err) {
      setIsProcessing(false);
      notify("error", "Error procesando el pago", "Intenta de nuevo.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D9] shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-[#24201D] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isDone ? (
          <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-serif text-2xl text-[#24201D] font-medium">
              ¡Gracias por confiar en MEMORA!
            </h3>
            <p className="text-xs sm:text-sm text-[#5C534B] max-w-sm mx-auto">
              Tu plan <strong>{plan.name}</strong> ha sido activado con éxito. Su historia y recuerdos permanecerán protegidos para siempre.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#7A4E38] block mb-1">
                Activación de Plan
              </span>
              <div className="flex items-baseline justify-between">
                <h3 className="font-serif text-2xl text-[#24201D] font-medium">{plan.name}</h3>
                <div className="text-right">
                  <span className="font-serif text-2xl font-bold text-[#24201D] block">
                    ${amountCLP.toLocaleString("es-CL")} CLP
                  </span>
                  <span className="text-[11px] text-[#7A4E38] font-medium">/ año (renovación: ${amountCLP.toLocaleString("es-CL")})</span>
                </div>
              </div>
              <p className="text-xs text-[#8C827A] mt-1">{plan.billingText}</p>
            </div>

            {/* Plan Highlights */}
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-1.5 text-xs text-[#5C534B]">
              {plan.features.slice(0, 4).map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#C5A880] flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            {/* Gateway Selection Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9] text-xs font-medium">
              <button
                type="button"
                onClick={() => setPaymentGateway("flow")}
                className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  paymentGateway === "flow"
                    ? "bg-white text-[#24201D] shadow-xs font-semibold"
                    : "text-[#8C827A] hover:text-[#24201D]"
                }`}
              >
                <span>🇨🇱 Flow (Webpay / Tarjetas)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentGateway("card")}
                className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  paymentGateway === "card"
                    ? "bg-white text-[#24201D] shadow-xs font-semibold"
                    : "text-[#8C827A] hover:text-[#24201D]"
                }`}
              >
                <span>🌐 Tarjeta Internacional</span>
              </button>
            </div>

            {/* FLOW PAYMENT OPTION */}
            {paymentGateway === "flow" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#24201D]">
                      Medios de pago habilitados por Flow:
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#24201D] text-white">
                      API Oficial
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5C534B]">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#EAE3D9]">
                      <CreditCard className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      <span>Webpay Plus (Débito/Crédito)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#EAE3D9]">
                      <Building2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Redcompra / Bancos</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#EAE3D9]">
                      <Smartphone className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span>MACH / Fpay</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#EAE3D9]">
                      <Wallet className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>Servipag / Klap</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#8C827A] leading-relaxed">
                    Al presionar el botón serás redirigido de forma segura a Flow para completar tu pago con cualquier banco chileno. Una vez aprobado, tu memorial y placa QR quedarán activos al instante.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleFlowPayment}
                  disabled={isFlowLoading}
                  className="w-full py-3.5 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {isFlowLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#C5A880]" />
                      <span>Conectando con Flow...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Pagar ${amountCLP.toLocaleString("es-CL")} CLP en Flow</span>
                      <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* INTERNATIONAL CARD FORM */}
            {paymentGateway === "card" && (
              <form onSubmit={handleCardPay} className="space-y-3 text-xs animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-3">
                  <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
                  <span>
                    <strong>Tarjetas Internacionales:</strong> Visa, Mastercard y American Express en USD.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-[#24201D] mb-1">Nombre del titular</label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#24201D] mb-1">Número de Tarjeta</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D] pl-10"
                    />
                    <CreditCard className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#24201D] mb-1">Vencimiento</label>
                    <input
                      type="text"
                      required
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#24201D] mb-1">CVC</label>
                    <input
                      type="text"
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 mt-4 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#C5A880]" />
                      <span>Verificando y activando...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Confirmar Pago de ${plan.price} USD</span>
                    </>
                  )}
                </button>
              </form>
            )}
            {/* Discrete WhatsApp Help for Payments */}
            <div className="pt-4 border-t border-[#EAE3D9] flex items-center justify-between text-xs">
              <span className="text-[#7A7067]">¿Dudas con el pago o necesitas asistencia?</span>
              <WhatsAppButton
                context="payment"
                label="Ayuda por WhatsApp"
                size="sm"
                variant="outline"
                id="checkout-whatsapp-btn"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

