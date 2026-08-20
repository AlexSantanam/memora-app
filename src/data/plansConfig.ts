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
    tagline: "Para comenzar a recordar.",
    commercialMessage: "Todo lo esencial para conservar su memoria.",
    priceAnnualCLP: 990,
    priceMonthlyCLP: 990,
    renewalPriceCLP: 990,
    isFreeTrialAvailable: false,
    freeTrialDays: 0,
    maxMemoras: 1,
    maxPhotosTotal: 10,
    maxVideosTotal: 3,
    billingText: "$990 CLP / año",
    subText: "Pago anual",
    renewalText: "Renovación anual: $990 CLP",
    isPopular: false,
    ctaText: "Elegir Plan Esencial",
    features: [
      "1 espacio MEMORA",
      "10 fotografías",
      "3 videos (enlace de YouTube)",
      "Código QR único",
      "Recuerdo imprimible",
      "PDF en alta resolución",
      "Herramientas de IA",
      "Soporte por WhatsApp",
    ],
    comparativeRows: {
      priceLabel: "$990",
      renewalLabel: "$990",
      memorasLabel: "1",
      photosLabel: "10",
      videosLabel: "3 (enlace)",
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
    tagline: "Para conservar más historias juntos.",
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
    popularBadgeText: "Más elegido",
    ctaText: "Elegir Plan Familia",
    features: [
      "Hasta 3 espacios MEMORA",
      "100 fotografías",
      "10 videos",
      "Código QR único",
      "Recuerdo imprimible",
      "PDF en alta resolución",
      "Herramientas de IA",
      "Soporte por WhatsApp",
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
    tagline: "Para preservar una historia completa.",
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
      "Hasta 10 espacios MEMORA",
      "1.000 fotografías",
      "50 videos",
      "Código QR único",
      "Recuerdo imprimible",
      "PDF en alta resolución",
      "Herramientas de IA",
      "Soporte por WhatsApp",
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
  userPlanId?: string | null,
  subscriptionStatus?: string | null,
  userRole?: string | null
) {
  const plan = getPlanConfig(userPlanId);
  // Only an actually-paid (or legitimately trialing) subscription unlocks quota.
  // A freshly registered account with no completed payment gets zero capacity
  // until it goes through Flow checkout — the base Esencial plan is $990, not free.
  const isPaid = subscriptionStatus === "active" || subscriptionStatus === "free_trial";

  // Admins can create and manage MEMORAs without plan limits — e.g. to help a
  // client quickly in a specific case without forcing them through checkout.
  if (userRole === "admin" && userId) {
    const userMemorials = allMemorials.filter(
      (m) => m.ownerId === userId || m.collaborators?.some((c: any) => c.userId === userId && c.role === "owner")
    );
    return {
      plan,
      isPaid: true,
      memorasUsed: userMemorials.length,
      memorasMax: Infinity,
      memorasRemaining: Infinity,
      canCreateMemora: true,
      photosUsed: 0,
      photosMax: Infinity,
      photosRemaining: Infinity,
      canUploadPhotos: () => true,
      videosUsed: 0,
      videosMax: Infinity,
      videosRemaining: Infinity,
      canUploadVideos: () => true,
    };
  }

  if (!userId) {
    return {
      plan,
      isPaid: false,
      memorasUsed: 0,
      memorasMax: 0,
      memorasRemaining: 0,
      canCreateMemora: false,
      photosUsed: 0,
      photosMax: 0,
      photosRemaining: 0,
      canUploadPhotos: () => false,
      videosUsed: 0,
      videosMax: 0,
      videosRemaining: 0,
      canUploadVideos: () => false,
    };
  }

  if (!isPaid) {
    const userMemorials = allMemorials.filter(
      (m) => m.ownerId === userId || m.collaborators?.some((c: any) => c.userId === userId && c.role === "owner")
    );
    return {
      plan,
      isPaid: false,
      memorasUsed: userMemorials.length,
      memorasMax: 0,
      memorasRemaining: 0,
      canCreateMemora: false,
      photosUsed: 0,
      photosMax: 0,
      photosRemaining: 0,
      canUploadPhotos: () => false,
      videosUsed: 0,
      videosMax: 0,
      videosRemaining: 0,
      canUploadVideos: () => false,
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
    isPaid: true,
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
