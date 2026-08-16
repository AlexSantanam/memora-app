/**
 * Centralized WhatsApp Configuration for MEMORA
 * 
 * To update the WhatsApp support number or default messages, modify this file.
 * The phone number must be stored in international format without '+', spaces, or dashes.
 * Example: 56990387414
 */

export const WHATSAPP_CONFIG = {
  // Official WhatsApp Support Number in international format (Chile: 56 + 9 + 8 digits)
  number: "56990387414",

  // Context-specific predefined messages
  messages: {
    landing: "Hola, quiero conocer más sobre MEMORA.",
    plans: "Hola, necesito ayuda para elegir un plan de MEMORA.",
    create_memora: "Hola, necesito ayuda para crear una MEMORA.",
    payment: "Hola, necesito ayuda con el proceso de pago de MEMORA.",
    technical: "Hola, necesito ayuda con un problema en MEMORA.",
    contact: "Hola, me gustaría comunicarme con el equipo de MEMORA.",
    default: "Hola, necesito ayuda con MEMORA ❤️",
  },
} as const;

export type WhatsAppContext = keyof typeof WHATSAPP_CONFIG.messages;

/**
 * Generates the official WhatsApp web/app link with a predefined message.
 * @param contextOrMessage - Either a predefined context key ('landing', 'plans', etc.) or custom string message
 * @returns The formatted URL (e.g., https://wa.me/56990387414?text=...)
 */
export function getWhatsAppUrl(contextOrMessage?: WhatsAppContext | string): string {
  const number = WHATSAPP_CONFIG.number.replace(/[^0-9]/g, "");

  let messageText: string = WHATSAPP_CONFIG.messages.default;

  if (contextOrMessage) {
    if (contextOrMessage in WHATSAPP_CONFIG.messages) {
      messageText = WHATSAPP_CONFIG.messages[contextOrMessage as WhatsAppContext];
    } else {
      messageText = contextOrMessage;
    }
  }

  const encodedText = encodeURIComponent(messageText);
  return `https://wa.me/${number}?text=${encodedText}`;
}

/**
 * Optional analytics event tracking hook for WhatsApp interactions
 * @param context - Context where the WhatsApp button was clicked
 */
export function trackWhatsAppClick(context: string) {
  try {
    // If window.dataLayer exists or custom analytics is attached
    if (typeof window !== "undefined") {
      const win = window as any;
      if (typeof win.gtag === "function") {
        win.gtag("event", "whatsapp_click", {
          event_category: "contact",
          event_label: context,
        });
      }
      if (win.dataLayer && Array.isArray(win.dataLayer)) {
        win.dataLayer.push({
          event: "whatsapp_click",
          context,
          timestamp: new Date().toISOString(),
        });
      }
    }
    // Also record in internal console for observability
    console.info(`[MEMORA Analytics] WhatsApp click event registered from: ${context}`);
  } catch {
    // Silent fail if analytics is not configured
  }
}
