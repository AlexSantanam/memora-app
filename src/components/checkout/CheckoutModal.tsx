import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { DEFAULT_PLANS } from "../../data/sampleData";
import { PlanTier } from "../../types";
import {
  X,
  Check,
  CreditCard,
  Lock,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Building2,
  Smartphone,
  Wallet,
  Globe2,
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

  const [paymentGateway, setPaymentGateway] = useState<"flow" | "mercadopago" | "paypal">("flow");

  // Flow State
  const [isFlowLoading, setIsFlowLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Mercado Pago State
  const [isMercadoPagoLoading, setIsMercadoPagoLoading] = useState(false);

  // PayPal State
  const [paypalClientId, setPaypalClientId] = useState<string | null>(null);
  const [paypalPriceUSD, setPaypalPriceUSD] = useState<string | null>(null);
  const paypalButtonMounted = useRef(false);
  const paypalContainerRef = useRef<HTMLDivElement>(null);

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
      console.error("Flow payment initialization failed:", err?.message);
      notify("error", "No se pudo conectar con Flow", "Intenta nuevamente en unos minutos o contáctanos por WhatsApp.");
    }
  };

  // Handle Mercado Pago Checkout Pro (redirect-based, same shape as Flow)
  const handleMercadoPagoPayment = async () => {
    setIsMercadoPagoLoading(true);
    try {
      const res = await fetch("/api/payments/mercadopago/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          memorialId: memorialId || "",
          userEmail: currentUser?.email || "",
          userName: currentUser?.name || "Cliente Memora",
        }),
      });
      const data = await res.json();

      if (data.success && data.redirectUrl) {
        notify("info", "Redirigiendo a Mercado Pago...", "Ingresando a la pasarela segura.");
        window.location.href = data.redirectUrl;
      } else {
        throw new Error(data.error || "No se pudo iniciar la pasarela de pagos.");
      }
    } catch (err: any) {
      setIsMercadoPagoLoading(false);
      console.error("Mercado Pago payment initialization failed:", err?.message);
      notify("error", "No se pudo conectar con Mercado Pago", "Intenta nuevamente en unos minutos o contáctanos por WhatsApp.");
    }
  };

  // Fetch PayPal config (client id + USD prices) once the PayPal tab is opened.
  useEffect(() => {
    if (paymentGateway !== "paypal" || paypalClientId) return;
    fetch("/api/payments/paypal/config")
      .then((r) => r.json())
      .then((cfg) => {
        if (cfg.configured) {
          setPaypalClientId(cfg.clientId);
          setPaypalPriceUSD(cfg.prices?.[planId] || null);
        } else {
          notify("warning", "PayPal no disponible", "Este método de pago aún no está configurado.");
        }
      })
      .catch(() => notify("error", "No se pudo cargar PayPal", "Intenta nuevamente."));
  }, [paymentGateway, paypalClientId, planId]);

  // Load the PayPal JS SDK and render its Buttons once we have a client id.
  useEffect(() => {
    if (!paypalClientId || paypalButtonMounted.current || !paypalContainerRef.current) return;

    const mount = () => {
      const paypalSdk = (window as any).paypal;
      if (!paypalSdk || paypalButtonMounted.current || !paypalContainerRef.current) return;
      paypalSdk
        .Buttons({
          style: { layout: "vertical", color: "black", shape: "pill", label: "paypal" },
          createOrder: async () => {
            const res = await fetch("/api/payments/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                planId,
                memorialId: memorialId || "",
                userEmail: currentUser?.email || "",
                userName: currentUser?.name || "Cliente",
              }),
            });
            const data = await res.json();
            if (!data.success) {
              notify("error", "No se pudo iniciar el pago con PayPal", data.error || "Intenta nuevamente.");
              throw new Error(data.error || "create-order failed");
            }
            return data.orderId;
          },
          onApprove: async (data: any) => {
            const res = await fetch("/api/payments/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderID }),
            });
            const result = await res.json();
            if (result.success) {
              setIsDone(true);
              confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ["#C5A880", "#7A4E38", "#24201D"] });
            } else {
              notify("error", "No se pudo completar el pago", result.error || "Contáctanos por WhatsApp.");
            }
          },
          onError: (err: any) => {
            console.error("PayPal error:", err);
            notify("error", "Error con PayPal", "Intenta nuevamente o contáctanos por WhatsApp.");
          },
        })
        .render(paypalContainerRef.current);
      paypalButtonMounted.current = true;
    };

    if ((window as any).paypal) {
      mount();
      return;
    }
    const scriptId = "paypal-sdk-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD`;
      script.addEventListener("load", mount);
      document.body.appendChild(script);
    } else {
      script.addEventListener("load", mount);
    }
  }, [paypalClientId, planId, memorialId, currentUser, notify]);

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
            <div className="grid grid-cols-3 p-1 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9] text-xs font-medium">
              <button
                type="button"
                onClick={() => setPaymentGateway("flow")}
                className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentGateway === "flow" ? "bg-white text-[#24201D] shadow-xs font-semibold" : "text-[#8C827A] hover:text-[#24201D]"
                }`}
              >
                <span>🇨🇱 Flow</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentGateway("mercadopago")}
                className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentGateway === "mercadopago" ? "bg-white text-[#24201D] shadow-xs font-semibold" : "text-[#8C827A] hover:text-[#24201D]"
                }`}
              >
                <span>💙 Mercado Pago</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentGateway("paypal")}
                className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentGateway === "paypal" ? "bg-white text-[#24201D] shadow-xs font-semibold" : "text-[#8C827A] hover:text-[#24201D]"
                }`}
              >
                <span>🌎 PayPal</span>
              </button>
            </div>

            {/* FLOW PAYMENT (Webpay / Redcompra / MACH / Servipag — Chile) */}
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

            {/* MERCADO PAGO PAYMENT (Chile + Latam) */}
            {paymentGateway === "mercadopago" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#24201D]">
                      Medios de pago habilitados por Mercado Pago:
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#00B1EA] text-white">
                      API Oficial
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5C534B]">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#EAE3D9]">
                      <CreditCard className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      <span>Tarjetas de débito/crédito</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#EAE3D9]">
                      <Wallet className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>Saldo Mercado Pago</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#8C827A] leading-relaxed">
                    Al presionar el botón serás redirigido de forma segura a Mercado Pago para completar tu pago. Una vez aprobado, tu memorial y placa QR quedarán activos al instante.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleMercadoPagoPayment}
                  disabled={isMercadoPagoLoading}
                  className="w-full py-3.5 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {isMercadoPagoLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#C5A880]" />
                      <span>Conectando con Mercado Pago...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Pagar ${amountCLP.toLocaleString("es-CL")} CLP en Mercado Pago</span>
                      <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* PAYPAL PAYMENT (International) */}
            {paymentGateway === "paypal" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#24201D]">Pago internacional con PayPal:</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#003087] text-white">API Oficial</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#EAE3D9] text-[11px] text-[#5C534B]">
                    <Globe2 className="w-4 h-4 text-sky-700 flex-shrink-0" />
                    <span>Visa, Mastercard, American Express y saldo PayPal, en cualquier país.</span>
                  </div>
                  {paypalPriceUSD && (
                    <p className="text-sm font-semibold text-[#24201D]">
                      Total: US${paypalPriceUSD} <span className="text-[11px] font-normal text-[#8C827A]">/ año</span>
                    </p>
                  )}
                  <p className="text-[11px] text-[#8C827A] leading-relaxed">
                    El precio en dólares es distinto al de Chile para cubrir la conversión de moneda y las comisiones de PayPal. Tu memorial y placa QR quedan activos apenas se aprueba el pago.
                  </p>
                </div>

                {!paypalClientId ? (
                  <div className="flex items-center justify-center py-6 text-xs text-[#8C827A] gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cargando PayPal...</span>
                  </div>
                ) : (
                  <div ref={paypalContainerRef} />
                )}
              </div>
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

