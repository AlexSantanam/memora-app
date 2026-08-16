import { PlanTier } from "../types";

export interface PlanLimitConfig {
  id: PlanTier;
  name: string;
  shortName: string;
  tagline: string;
  commercialMessage: string;
  priceAnnualCLP: number;
  priceMonthlyCLP: number; // Backwards compatible alias
  renewalPriceCLP: number;
  isFreeTrialAvailable: boolean;
  freeTrialDays: number;
  maxMemoras: number;
  maxPhotosTotal: number;
  maxVideosTotal: number;
  billingText: string;
  subText: string;
  renewalText: string;
  isPopular?: boolean;
  popularBadgeText?: string;
  ctaText: string;
  features: string[];
  comparativeRows: {
    priceLabel: string;
    renewalLabel: string;
    memorasLabel: string;
    photosLabel: string;
    videosLabel: string;
    hasQR: boolean;
    hasPrintable: boolean;
    hasPdf: boolean;
    hasAI: boolean;
    hasWhatsApp: boolean;
    hasPersons: boolean;
    hasPets: boolean;
  };
}

export const CENTRALIZED_PLANS: Record<"esencial" | "familia" | "legado", PlanLimitConfig> = {
  esencial: {
    id: "esencial",
    name: "MEMORA Esencial",
    shortName: "Esencial",
    tagline: "Para personas que quieren conservar un recuerdo de forma sencilla, accesible y permanente.",
    commercialMessage: "Todo lo esencial para conservar su memoria.",
    priceAnnualCLP: 990,
    priceMonthlyCLP: 990,
    renewalPriceCLP: 990,
    isFreeTrialAvailable: false,
    freeTrialDays: 0,
    maxMemoras: 1,
    maxPhotosTotal: 10,
    maxVideosTotal: 0,
    billingText: "$990 CLP / año",
    subText: "Pago anual",
    renewalText: "Renovación anual: $990 CLP",
    isPopular: false,
    ctaText: "Elegir Plan Esencial",
    features: [
      "1 MEMORA (Persona o Mascota)",
      "10 fotografías en total",
      "0 videos (exclusivo fotos)",
      "Página pública de la MEMORA",
      "Código QR único permanente",
      "Compartir mediante enlace",
      "Muro de homenajes y condolencias",
      "Historia y recuerdos",
      "Recuerdo para imprimir incluido",
      "Descarga del recuerdo imprimible en PDF",
      "Herramientas de IA disponibles en MEMORA",
      "Ayuda mediante WhatsApp",
    ],
    comparativeRows: {
      priceLabel: "$990",
      renewalLabel: "$990",
      memorasLabel: "1",
      photosLabel: "10",
      videosLabel: "—",
      hasQR: true,
      hasPrintable: true,
      hasPdf: true,
      hasAI: true,
      hasWhatsApp: true,
      hasPersons: true,
      hasPets: true,
    },
  },
  familia: {
    id: "familia",
    name: "MEMORA Familia",
    shortName: "Familia",
    tagline: "Para familias que quieren conservar y compartir varias historias.",
    commercialMessage: "Para conservar más historias y compartirlas con quienes más quieres.",
    priceAnnualCLP: 4900,
    priceMonthlyCLP: 4900,
    renewalPriceCLP: 4900,
    isFreeTrialAvailable: false,
    freeTrialDays: 0,
    maxMemoras: 3,
    maxPhotosTotal: 100,
    maxVideosTotal: 10,
    billingText: "$4.900 CLP / año",
    subText: "Pago anual",
    renewalText: "Renovación anual: $4.900 CLP",
    isPopular: true,
    popularBadgeText: "Recomendado para familias",
    ctaText: "Elegir Plan Familia",
    features: [
      "Hasta 3 MEMORAs (Personas o Mascotas)",
      "100 fotografías TOTALES POR PLAN",
      "10 videos TOTALES POR PLAN",
      "Página pública para cada MEMORA",
      "Código QR individual para cada MEMORA",
      "Compartir mediante enlace",
      "Muro de homenajes y condolencias",
      "Historias y recuerdos",
      "Recuerdo para imprimir para cada MEMORA",
      "Descarga en PDF de alta resolución",
      "Herramientas de IA disponibles en MEMORA",
      "Ayuda mediante WhatsApp",
    ],
    comparativeRows: {
      priceLabel: "$4.900",
      renewalLabel: "$4.900",
      memorasLabel: "3",
      photosLabel: "100",
      videosLabel: "10",
      hasQR: true,
      hasPrintable: true,
      hasPdf: true,
      hasAI: true,
      hasWhatsApp: true,
      hasPersons: true,
      hasPets: true,
    },
  },
  legado: {
    id: "legado",
    name: "MEMORA Legado",
    shortName: "Legado",
    tagline: "Para familias que quieren preservar un legado más completo.",
    commercialMessage: "Para preservar el legado de toda una familia.",
    priceAnnualCLP: 14900,
    priceMonthlyCLP: 14900,
    renewalPriceCLP: 14900,
    isFreeTrialAvailable: false,
    freeTrialDays: 0,
    maxMemoras: 10,
    maxPhotosTotal: 1000,
    maxVideosTotal: 50,
    billingText: "$14.900 CLP / año",
    subText: "Pago anual",
    renewalText: "Renovación anual: $14.900 CLP",
    isPopular: false,
    ctaText: "Elegir Plan Legado",
    features: [
      "Hasta 10 MEMORAs (Personas o Mascotas)",
      "1.000 fotografías TOTALES POR PLAN",
      "50 videos TOTALES POR PLAN",
      "Página pública individual para cada MEMORA",
      "Código QR individual para cada MEMORA",
      "Compartir mediante enlace",
      "Muro de homenajes y condolencias",
      "Historias y recuerdos",
      "Recuerdo para imprimir para cada MEMORA",
      "Descarga en PDF de alta resolución",
      "Herramientas de IA disponibles en MEMORA",
      "Ayuda mediante WhatsApp",
      "Funciones premium disponibles en MEMORA",
    ],
    comparativeRows: {
      priceLabel: "$14.900",
      renewalLabel: "$14.900",
      memorasLabel: "10",
      photosLabel: "1.000",
      videosLabel: "50",
      hasQR: true,
      hasPrintable: true,
      hasPdf: true,
      hasAI: true,
      hasWhatsApp: true,
      hasPersons: true,
      hasPets: true,
    },
  },
};

/**
 * Normalizes legacy plan IDs (e.g. 'para_siempre' -> 'familia', 'acompanado' -> 'legado')
 */
export function normalizePlanId(planId?: string | null): "esencial" | "familia" | "legado" {
  if (!planId) return "esencial";
  if (planId === "para_siempre") return "familia";
  if (planId === "acompanado") return "legado";
  if (planId === "familia") return "familia";
  if (planId === "legado") return "legado";
  return "esencial";
}

/**
 * Returns the centralized plan limit configuration
 */
export function getPlanConfig(planId?: string | null): PlanLimitConfig {
  const normalized = normalizePlanId(planId);
  return CENTRALIZED_PLANS[normalized];
}

/**
 * Calculates current global resource usage across all user's MEMORAs
 */
export function calculateUserGlobalUsage(
  userId: string | undefined,
  allMemorials: Array<any>,
  userPlanId?: string | null
) {
  const plan = getPlanConfig(userPlanId);

  if (!userId) {
    return {
      plan,
      memorasUsed: 0,
      memorasMax: plan.maxMemoras,
      memorasRemaining: plan.maxMemoras,
      canCreateMemora: true,
      photosUsed: 0,
      photosMax: plan.maxPhotosTotal,
      photosRemaining: plan.maxPhotosTotal,
      canUploadPhotos: (count = 1) => count <= plan.maxPhotosTotal,
      videosUsed: 0,
      videosMax: plan.maxVideosTotal,
      videosRemaining: plan.maxVideosTotal,
      canUploadVideos: (count = 1) => count <= plan.maxVideosTotal,
    };
  }

  // Filter memorials owned by this user
  const userMemorials = allMemorials.filter(
    (m) => m.ownerId === userId || m.collaborators?.some((c: any) => c.userId === userId && c.role === "owner")
  );

  const memorasUsed = userMemorials.length;
  const memorasRemaining = Math.max(0, plan.maxMemoras - memorasUsed);
  const canCreateMemora = memorasUsed < plan.maxMemoras;

  let photosUsed = 0;
  let videosUsed = 0;

  userMemorials.forEach((m) => {
    // Count main photo if present
    if (m.mainPhoto) photosUsed += 1;
    // Count cover photo if present
    if (m.coverPhoto) photosUsed += 1;

    // Count gallery media
    if (Array.isArray(m.media)) {
      m.media.forEach((item: any) => {
        if (item.type === "video") {
          videosUsed += 1;
        } else {
          photosUsed += 1;
        }
      });
    }

    // Count timeline event photos
    if (Array.isArray(m.timeline)) {
      m.timeline.forEach((t: any) => {
        if (t.photoUrl) photosUsed += 1;
      });
    }

    // Count family photos
    if (Array.isArray(m.family)) {
      m.family.forEach((f: any) => {
        if (f.photoUrl) photosUsed += 1;
      });
    }
  });

  const photosRemaining = Math.max(0, plan.maxPhotosTotal - photosUsed);
  const videosRemaining = Math.max(0, plan.maxVideosTotal - videosUsed);

  return {
    plan,
    memorasUsed,
    memorasMax: plan.maxMemoras,
    memorasRemaining,
    canCreateMemora,
    photosUsed,
    photosMax: plan.maxPhotosTotal,
    photosRemaining,
    canUploadPhotos: (count = 1) => photosUsed + count <= plan.maxPhotosTotal,
    videosUsed,
    videosMax: plan.maxVideosTotal,
    videosRemaining,
    canUploadVideos: (count = 1) => videosUsed + count <= plan.maxVideosTotal,
  };
}
