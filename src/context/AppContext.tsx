import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import { supabase } from "../lib/supabaseClient";
import { uploadAvatar } from "../lib/uploadFile";
import {
  User,
  Memorial,
  MemorialType,
  Tribute,
  MediaItem,
  Album,
  TimelineEvent,
  FamilyMember,
  MemorialEvent,
  Collaborator,
  PlanTier,
  PrivacyLevel,
  PaymentTransaction,
  PlatformMetric,
  UserSubscription,
} from "../types";

import { DEFAULT_PLANS } from "../data/sampleData";
import {
  CENTRALIZED_PLANS,
  getPlanConfig,
  normalizePlanId,
  calculateUserGlobalUsage,
  PlanLimitConfig,
} from "../data/plansConfig";

export type AppView =
  | "landing"
  | "dashboard"
  | "wizard"
  | "memorial-view"
  | "memorial-edit"
  | "pricing"
  | "checkout"
  | "admin"
  | "privacy-policy"
  | "terms"
  | "contact";

interface ToastNotification {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message?: string;
}

export interface UserUsageInfo {
  plan: PlanLimitConfig;
  isPaid: boolean;
  memorasUsed: number;
  memorasMax: number;
  memorasRemaining: number;
  canCreateMemora: boolean;
  photosUsed: number;
  photosMax: number;
  photosRemaining: number;
  canUploadPhotos: (count?: number) => boolean;
  videosUsed: number;
  videosMax: number;
  videosRemaining: number;
  canUploadVideos: (count?: number) => boolean;
}

interface AppContextType {
  // Navigation & Routing
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedMemorialSlug: string | null;
  selectedMemorialId: string | null;
  activeEditTab: "general" | "story" | "media" | "timeline" | "family" | "events" | "collaborators" | "tributes" | "privacy" | "qr";
  setActiveEditTab: (tab: "general" | "story" | "media" | "timeline" | "family" | "events" | "collaborators" | "tributes" | "privacy" | "qr") => void;
  openMemorialBySlug: (slug: string) => void;
  openMemorialById: (id: string) => void;
  isResolvingMemorial: boolean;
  openMemorialEdit: (id: string, tab?: "general" | "story" | "media" | "timeline" | "family" | "events" | "collaborators" | "tributes" | "privacy" | "qr") => void;
  dashboardTab: "memorials" | "billing" | "security";
  setDashboardTab: (tab: "memorials" | "billing" | "security") => void;
  openMyProfile: () => void;

  // Authentication & Subscription
  currentUser: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  userUsage: UserUsageInfo;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password?: string, avatarFile?: File) => Promise<{ success: boolean; error?: string }>;
  googleLogin: () => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  confirmPasswordReset: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (updates: Partial<User>) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: "login" | "register" | "forgot" | "reset-confirm";
  setAuthModalMode: (mode: "login" | "register" | "forgot" | "reset-confirm") => void;

  // Memorials
  memorials: Memorial[];
  memorialsLoading: boolean;
  currentMemorial: Memorial | null;
  createMemorial: (memorialData: Partial<Memorial>) => Promise<Memorial>;
  updateMemorial: (id: string, updates: Partial<Memorial>) => void;
  deleteMemorial: (id: string) => void;
  publishMemorial: (id: string) => void;

  // Sub-resource helpers
  addTribute: (memorialId: string, tributeData: Omit<Tribute, "id" | "createdAt" | "status">) => Promise<void>;
  moderateTribute: (memorialId: string, tributeId: string, status: "approved" | "rejected" | "deleted") => void;
  addTributeReaction: (memorialId: string, tributeId: string, type: "heart" | "candle" | "flower") => void;
  addMediaItem: (memorialId: string, mediaData: Omit<MediaItem, "id" | "uploadedAt" | "status">) => boolean;
  deleteMediaItem: (memorialId: string, mediaId: string) => void;
  createAlbum: (memorialId: string, title: string, description?: string, coverUrl?: string) => void;
  addTimelineEvent: (memorialId: string, eventData: Omit<TimelineEvent, "id">) => void;
  deleteTimelineEvent: (memorialId: string, eventId: string) => void;
  addFamilyMember: (memorialId: string, memberData: Omit<FamilyMember, "id">) => void;
  deleteFamilyMember: (memorialId: string, memberId: string) => void;
  addEvent: (memorialId: string, eventData: Omit<MemorialEvent, "id" | "rsvpCount">) => void;
  updateEvent: (memorialId: string, eventId: string, updates: Omit<MemorialEvent, "id" | "memorialId" | "rsvpCount">) => void;
  deleteEvent: (memorialId: string, eventId: string) => void;
  rsvpToEvent: (memorialId: string, eventId: string) => void;
  inviteCollaborator: (memorialId: string, name: string, email: string, role: any) => void;
  removeCollaborator: (memorialId: string, collaboratorId: string) => void;

  // Modals & Popups
  activeShareMemorial: Memorial | null;
  setActiveShareMemorial: (m: Memorial | null) => void;
  activeQRMemorial: Memorial | null;
  setActiveQRMemorial: (m: Memorial | null) => void;
  activePrintableMemorial: Memorial | null;
  setActivePrintableMemorial: (m: Memorial | null) => void;

  // Payments & Plans
  selectedPlanForCheckout: PlanTier | null;
  setSelectedPlanForCheckout: (plan: PlanTier | null) => void;
  goToPlanSelection: () => void;
  targetMemorialForCheckout: string | null;
  setTargetMemorialForCheckout: (id: string | null) => void;
  transactions: PaymentTransaction[];
  completePaymentSimulation: (planId: PlanTier, memorialId?: string) => Promise<PaymentTransaction>;

  // AI Story Assistant
  generateStoryWithAI: (params: {
    personName: string;
    memorialType?: MemorialType;
    species?: string;
    breed?: string;
    birthDate?: string;
    passingDate?: string;
    birthPlace?: string;
    notes?: string;
    passions?: string;
    familyDetails?: string;
    personality?: string;
    favoriteThings?: string;
    favoritePlace?: string;
    anecdote?: string;
    arrivalStory?: string;
    specialTrait?: string;
    tone?: string;
  }) => Promise<{
    biography: string;
    shortSummary: string;
    memorialQuote: string;
    suggestedMilestones?: Array<{ year: string; title: string; description: string }>;
  }>;

  // Notifications
  notifications: ToastNotification[];
  notify: (type: "success" | "info" | "warning" | "error", title: string, message?: string) => void;
  dismissNotification: (id: string) => void;

  // Admin Metrics
  metrics: PlatformMetric;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_TRANSACTIONS = "memora_app_transactions_v1";
const OAUTH_STASH_KEY = "memora_pre_oauth_view_v1";

function mapAuthError(error: { message?: string } | null | undefined): string {
  const msg = error?.message || "";
  if (/invalid login credentials/i.test(msg)) return "Correo o contraseña incorrectos.";
  if (/already registered|user already exists/i.test(msg)) return "Ya existe una cuenta con este correo electrónico. Por favor inicia sesión.";
  if (/password.*(at least|6)/i.test(msg)) return "La contraseña debe tener al menos 6 caracteres.";
  if (/rate limit|too many/i.test(msg)) return "Demasiados intentos. Espera un momento antes de volver a intentar.";
  if (/invalid.*email|unable to validate email/i.test(msg)) return "Por favor ingresa un correo electrónico válido.";
  return msg || "Ocurrió un error inesperado. Intenta nuevamente.";
}

// ── Memorial <-> Postgres row mapping (snake_case columns -> camelCase app shape) ──
function mapTimelineRow(r: any): TimelineEvent {
  return {
    id: r.id, memorialId: r.memorial_id, year: r.year, date: r.date || undefined,
    title: r.title, description: r.description, category: r.category,
    photoUrl: r.photo_url || undefined, location: r.location || undefined,
  };
}
function mapMediaRow(r: any): MediaItem {
  return {
    id: r.id, memorialId: r.memorial_id, type: r.type, url: r.url,
    thumbnailUrl: r.thumbnail_url || undefined, title: r.title || "", description: r.description || undefined,
    date: r.date || undefined, albumId: r.album_id || undefined, albumTitle: r.album_title || undefined,
    tags: r.tags || undefined, uploaderName: r.uploader_name, uploaderEmail: r.uploader_email || undefined,
    status: r.status, uploadedAt: r.uploaded_at,
  };
}
function mapAlbumRow(r: any): Album {
  return { id: r.id, memorialId: r.memorial_id, title: r.title, description: r.description || undefined, coverUrl: r.cover_url || undefined, itemCount: r.item_count };
}
function mapTributeRow(r: any, replies: any[]): Tribute {
  return {
    id: r.id, memorialId: r.memorial_id, authorName: r.author_name, authorEmail: r.author_email || undefined,
    relationship: r.relationship || undefined, message: r.message, photoUrl: r.photo_url || undefined,
    candleLit: r.candle_lit, flowerPlaced: r.flower_placed, heartCount: r.heart_count,
    status: r.status, createdAt: r.created_at,
    replies: replies.filter((rep) => rep.tribute_id === r.id).map((rep) => ({ id: rep.id, authorName: rep.author_name, message: rep.message, createdAt: rep.created_at })),
  };
}
function mapFamilyRow(r: any): FamilyMember {
  return { id: r.id, memorialId: r.memorial_id, name: r.name, relationship: r.relationship, photoUrl: r.photo_url || undefined, birthYear: r.birth_year || undefined, generation: r.generation || undefined, notes: r.notes || undefined };
}
function mapEventRow(r: any): MemorialEvent {
  return { id: r.id, memorialId: r.memorial_id, title: r.title, type: r.type, date: r.date, time: r.time, locationName: r.location_name, address: r.address || undefined, virtualLink: r.virtual_link || undefined, description: r.description || undefined, rsvpCount: r.rsvp_count };
}
function mapCollaboratorRow(r: any): Collaborator {
  return { id: r.id, memorialId: r.memorial_id, userId: r.user_id || undefined, name: r.name, email: r.email, role: r.role, status: r.status, invitedAt: r.invited_at };
}
function mapMemorialRow(row: any, children: { timeline: any[]; media: any[]; albums: any[]; tributes: any[]; tributeReplies: any[]; family: any[]; events: any[]; collaborators: any[] }): Memorial {
  return {
    id: row.id, slug: row.slug, type: row.type, personName: row.person_name,
    preferredName: row.preferred_name || undefined, birthDate: row.birth_date || "", passingDate: row.passing_date || "",
    birthPlace: row.birth_place || undefined, restingPlace: row.resting_place || undefined,
    mainPhoto: row.main_photo || "", coverPhoto: row.cover_photo || undefined, quote: row.quote || undefined,
    summary: row.summary || "", biography: row.biography || "", privacy: row.privacy,
    password: undefined, // password_hash never leaves the server
    status: row.status, ownerId: row.owner_id, ownerName: row.owner_name, ownerEmail: row.owner_email,
    planId: row.plan_id, enableTributeAutoApproval: row.enable_tribute_auto_approval,
    backgroundMusicTitle: row.background_music_title || undefined, backgroundMusicUrl: row.background_music_url || undefined,
    qrCodeUrl: row.qr_code_url || undefined, createdAt: row.created_at, updatedAt: row.updated_at,
    species: row.species || undefined, breed: row.breed || undefined, personality: row.personality || undefined,
    favoriteThings: row.favorite_things || undefined, favoritePlace: row.favorite_place || undefined,
    anecdote: row.anecdote || undefined, arrivalStory: row.arrival_story || undefined,
    specialTrait: row.special_trait || undefined, petMemoryQuote: row.pet_memory_quote || undefined,
    timeline: children.timeline.map(mapTimelineRow),
    media: children.media.map(mapMediaRow),
    albums: children.albums.map(mapAlbumRow),
    tributes: children.tributes.map((t) => mapTributeRow(t, children.tributeReplies)),
    family: children.family.map(mapFamilyRow),
    events: children.events.map(mapEventRow),
    collaborators: children.collaborators.map(mapCollaboratorRow),
  };
}

// Fetches one or more memorial rows plus all their child tables in parallel and
// assembles each into the app's nested Memorial shape.
async function fetchMemorialsByFilter(filter: { ownerIds?: string[]; ids?: string[]; slug?: string }): Promise<Memorial[]> {
  let query = supabase.from("memorials").select("*");
  if (filter.ownerIds?.length) query = query.in("owner_id", filter.ownerIds);
  if (filter.ids?.length) query = query.in("id", filter.ids);
  if (filter.slug) query = query.eq("slug", filter.slug);
  const { data: rows, error } = await query;
  if (error || !rows || rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const [timeline, media, albums, tributes, family, events, collaborators] = await Promise.all([
    supabase.from("timeline_events").select("*").in("memorial_id", ids),
    supabase.from("media_items").select("*").in("memorial_id", ids),
    supabase.from("albums").select("*").in("memorial_id", ids),
    supabase.from("tributes").select("*").in("memorial_id", ids),
    supabase.from("family_members").select("*").in("memorial_id", ids),
    supabase.from("memorial_events").select("*").in("memorial_id", ids),
    supabase.from("collaborators").select("*").in("memorial_id", ids),
  ]);
  const tributeIds = (tributes.data || []).map((t: any) => t.id);
  const { data: tributeReplies } = tributeIds.length
    ? await supabase.from("tribute_replies").select("*").in("tribute_id", tributeIds)
    : { data: [] as any[] };

  return rows.map((row) =>
    mapMemorialRow(row, {
      timeline: (timeline.data || []).filter((r: any) => r.memorial_id === row.id),
      media: (media.data || []).filter((r: any) => r.memorial_id === row.id),
      albums: (albums.data || []).filter((r: any) => r.memorial_id === row.id),
      tributes: (tributes.data || []).filter((r: any) => r.memorial_id === row.id),
      tributeReplies: tributeReplies || [],
      family: (family.data || []).filter((r: any) => r.memorial_id === row.id),
      events: (events.data || []).filter((r: any) => r.memorial_id === row.id),
      collaborators: (collaborators.data || []).filter((r: any) => r.memorial_id === row.id),
    })
  );
}

async function fetchUserProfile(authUser: { id: string } | null | undefined): Promise<User | null> {
  if (!authUser) return null;
  const [{ data: profile }, { data: ent }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle(),
    supabase.from("account_entitlements").select("*").eq("user_id", authUser.id).maybeSingle(),
  ]);
  if (!profile || !ent) return null;

  const subscription: UserSubscription = {
    planId: ent.current_plan,
    status: ent.subscription_status,
    startDate: ent.subscription_start_date,
    freeTrialEndDate: ent.free_trial_end_date || undefined,
    nextRenewalDate: ent.next_renewal_date || undefined,
    priceCLP: ent.price_clp,
  };

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatarUrl: profile.avatar_url || undefined,
    role: ent.role,
    currentPlan: ent.current_plan,
    subscription,
    authProvider: (profile.auth_provider as "email" | "google") || "email",
    createdAt: profile.created_at,
    lastLoginAt: profile.last_login_at || undefined,
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<AppView>("landing");
  const [selectedMemorialSlug, setSelectedMemorialSlug] = useState<string | null>(null);
  const [selectedMemorialId, setSelectedMemorialId] = useState<string | null>(null);
  // True while a memorial not yet in local state is being fetched by slug —
  // lets MemorialView show a loading state instead of flashing "not found"
  // during the fetch (currentMemorial resolves to undefined until it lands).
  const [isResolvingMemorial, setIsResolvingMemorial] = useState(false);
  const [activeEditTab, setActiveEditTab] = useState<"general" | "story" | "media" | "timeline" | "family" | "events" | "collaborators" | "tributes" | "privacy" | "qr">("general");
  const [dashboardTab, setDashboardTab] = useState<"memorials" | "billing" | "security">("memorials");

  // Jumps straight to the "Mi Perfil" tab in the dashboard — used by the
  // navbar shortcut so editing your name/photo doesn't require hunting for it.
  const openMyProfile = () => {
    setDashboardTab("security");
    setCurrentView("dashboard");
  };

  // Auth User Session — sourced from Supabase Auth, not localStorage. Hydrated
  // by the session-sync effect further below (getSession + onAuthStateChange).
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register" | "forgot" | "reset-confirm">("login");

  // Memorials Data — loaded from Supabase (own memorials for a regular user,
  // all memorials for admins), not localStorage. Individual public memorials
  // opened by slug (not owned by the viewer) are fetched on-demand and merged
  // in by openMemorialBySlug further below.
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [memorialsLoading, setMemorialsLoading] = useState(false);
  const [platformUserCount, setPlatformUserCount] = useState(0);

  useEffect(() => {
    let active = true;
    if (!currentUser) {
      setMemorials([]);
      return;
    }
    setMemorialsLoading(true);
    const loadMine = async () => {
      const results =
        currentUser.role === "admin"
          ? await fetchMemorialsByFilter({})
          : await fetchMemorialsByFilter({ ownerIds: [currentUser.id] });
      if (!active) return;
      setMemorials(results);
      setMemorialsLoading(false);
    };
    loadMine();
    if (currentUser.role === "admin") {
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .then(({ count }) => {
          if (active && typeof count === "number") setPlatformUserCount(count);
        });
    }
    return () => {
      active = false;
    };
  }, [currentUser?.id, currentUser?.role]);

  // Transactions Data
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TRANSACTIONS);
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: "tx-1001",
              userId: "user-demo-1",
              memorialId: "mem-maria-gonzalez",
              memorialName: "María González Henríquez",
              planId: "familia",
              amount: 4900,
              currency: "CLP",
              status: "completed",
              provider: "flow_webpay",
              invoiceNumber: "INV-MEM-849201",
              createdAt: "2024-01-15T15:00:00Z",
            },
          ];
    } catch {
      return [];
    }
  });

  // Modals
  const [activeShareMemorial, setActiveShareMemorial] = useState<Memorial | null>(null);
  const [activeQRMemorial, setActiveQRMemorial] = useState<Memorial | null>(null);
  const [activePrintableMemorial, setActivePrintableMemorial] = useState<Memorial | null>(null);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanTier | null>(null);
  const [targetMemorialForCheckout, setTargetMemorialForCheckout] = useState<string | null>(null);

  // Toast Notifications
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  // Computed Global Storage and Resource Usage
  const userUsage = useMemo<UserUsageInfo>(() => {
    return calculateUserGlobalUsage(
      currentUser?.id,
      memorials,
      currentUser?.currentPlan,
      currentUser?.subscription?.status,
      currentUser?.role
    );
  }, [currentUser?.id, currentUser?.currentPlan, currentUser?.subscription?.status, currentUser?.role, memorials]);

  // Supabase Auth session sync — replaces the old localStorage-backed user
  // state. supabase-js persists the JWT itself; this effect just hydrates
  // `currentUser` from it (profile + entitlements) and keeps it in sync.
  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      const user = await fetchUserProfile(session?.user);
      if (active) {
        setCurrentUser(user);
        setAuthLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return;

      if (event === "PASSWORD_RECOVERY") {
        setIsAuthModalOpen(true);
        setAuthModalMode("reset-confirm");
        return;
      }

      if (event === "SIGNED_OUT") {
        setCurrentUser(null);
        return;
      }

      const user = await fetchUserProfile(session?.user);
      if (!active) return;
      setCurrentUser(user);

      if (event === "SIGNED_IN") {
        // Restore whatever screen/plan the user was on before a Google
        // redirect took them away from the app (stashed in googleLogin()).
        try {
          const stashed = sessionStorage.getItem(OAUTH_STASH_KEY);
          if (stashed) {
            sessionStorage.removeItem(OAUTH_STASH_KEY);
            const { view, plan, memorialId } = JSON.parse(stashed);
            if (view) setCurrentView(view);
            if (plan) setSelectedPlanForCheckout(plan);
            if (memorialId) setTargetMemorialForCheckout(memorialId);
          }
        } catch {}
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error("Failed to persist transactions:", e);
    }
  }, [transactions]);

  // Handle Flow / Payment Gateway Return Redirects & QR Link Navigation
  useEffect(() => {
    try {
      // Check if URL points directly to a memorial slug (e.g. /m/slug or /memorial/slug or ?m=slug)
      const pathname = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);
      const querySlug = urlParams.get("m") || urlParams.get("memorial_slug");

      let targetSlug = querySlug;
      if (!targetSlug && (pathname.startsWith("/m/") || pathname.startsWith("/memorial/"))) {
        targetSlug = pathname.replace(/^\/(m|memorial)\//, "").split("/")[0];
      }

      if (targetSlug) {
        const found = memorials.find((m) => m.slug === targetSlug || m.id === targetSlug);
        if (found) {
          setSelectedMemorialSlug(found.slug);
          setCurrentView("memorial-view");
        } else {
          // Direct link (QR / share URL) to a memorial not already in local
          // state — e.g. an anonymous visitor, or someone else's public
          // memorial. Fetch it from Supabase (RLS governs what comes back).
          fetchMemorialsByFilter({ slug: targetSlug }).then((results) => {
            if (results.length > 0) {
              setMemorials((prev) => [...prev.filter((m) => m.slug !== targetSlug), ...results]);
              setSelectedMemorialSlug(results[0].slug);
              setCurrentView("memorial-view");
            }
          });
        }
      }

      const isPaymentSuccess = urlParams.get("payment_success");
      const paymentStatus = urlParams.get("payment_status");
      const flowToken = urlParams.get("flow_token");
      const mpPaymentId = urlParams.get("mp_payment_id");

      if (isPaymentSuccess === "true" && flowToken) {
        // Never trust plan/amount straight from the URL — verify the token against
        // Flow's own API server-side before granting anything. A crafted URL like
        // ?payment_success=true&plan=legado must not be enough to activate a plan.
        const cleanUrl = window.location.pathname;
        (async () => {
          try {
            const res = await fetch(`/api/payments/flow/status/${encodeURIComponent(flowToken)}`);
            const json = await res.json();
            const statusData = json?.data;

            if (!json?.success || statusData?.status !== 2) {
              notify(
                "warning",
                "No pudimos verificar tu pago",
                "Si realizaste un pago y ves este mensaje, contáctanos por WhatsApp con tu número de orden."
              );
              return;
            }

            let optionalData: any = {};
            try {
              optionalData = statusData.optional
                ? typeof statusData.optional === "string"
                  ? JSON.parse(statusData.optional)
                  : statusData.optional
                : {};
            } catch {
              optionalData = {};
            }

            const normalizedPlan = normalizePlanId(optionalData.planId);
            const planConfig = getPlanConfig(normalizedPlan);
            const memorialId: string | undefined = optionalData.memorialId || undefined;

            // El único que escribe account_entitlements/memorials.plan_id es
            // el webhook de Flow en server.ts (con la service role key) —
            // este efecto solo espera a que esa escritura ya haya ocurrido y
            // refleja el resultado real desde Postgres. Flow llama al webhook
            // antes de redirigir al navegador, así que normalmente ya está
            // listo; el reintento cubre el margen raro donde no lo esté aún.
            let reflected = false;
            for (let attempt = 0; attempt < 5 && !reflected; attempt++) {
              if (attempt > 0) await new Promise((r) => setTimeout(r, 1500));
              const { data: ent } = await supabase
                .from("account_entitlements")
                .select("current_plan, subscription_status")
                .eq("user_id", currentUser?.id)
                .maybeSingle();
              if (ent?.subscription_status === "active" && ent?.current_plan === normalizedPlan) {
                reflected = true;
              }
            }

            if (!reflected) {
              notify(
                "warning",
                "Tu pago fue aprobado, activando tu plan...",
                "Puede tardar unos segundos en reflejarse. Si tras un par de minutos no ves tu plan activo, contáctanos por WhatsApp."
              );
              return;
            }

            const user = await fetchUserProfile(currentUser);
            if (user) setCurrentUser(user);

            if (memorialId) {
              const full = await fetchMemorialsByFilter({ ids: [memorialId] });
              if (full[0]) {
                setMemorials((prev) => [...prev.filter((m) => m.id !== memorialId), ...full]);
              }
            }

            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#C5A880", "#7A4E38", "#24201D", "#10B981"],
            });

            notify(
              "success",
              "¡Suscripción aprobada en Flow!",
              `Tu plan ${planConfig.name} ha sido activado exitosamente (Orden Flow #${statusData.flowOrder || statusData.commerceOrder || "OK"}).`
            );
          } catch (e) {
            console.error("Error verifying Flow payment:", e);
            notify("error", "Error verificando el pago", "Intenta nuevamente o contáctanos por WhatsApp.");
          } finally {
            window.history.replaceState({}, document.title, cleanUrl);
          }
        })();
      } else if (isPaymentSuccess === "true" && mpPaymentId) {
        // Same never-trust-the-URL pattern as Flow above: verify the payment
        // against Mercado Pago's own API server-side, resolve plan/memorial
        // from our own payment_transactions row (by external_reference), then
        // wait for the webhook's account_entitlements write to be reflected.
        const cleanUrl = window.location.pathname;
        (async () => {
          try {
            const res = await fetch(`/api/payments/mercadopago/status/${encodeURIComponent(mpPaymentId)}`);
            const json = await res.json();
            const payment = json?.data;

            if (!json?.success || payment?.status !== "approved") {
              notify(
                "warning",
                "No pudimos verificar tu pago",
                "Si realizaste un pago y ves este mensaje, contáctanos por WhatsApp con tu número de orden."
              );
              return;
            }

            const referenceId = payment.external_reference;
            const { data: txRow } = await supabase
              .from("payment_transactions")
              .select("plan_id, memorial_id")
              .eq("invoice_number", referenceId)
              .maybeSingle();

            const normalizedPlan = normalizePlanId(txRow?.plan_id || "esencial");
            const planConfig = getPlanConfig(normalizedPlan);
            const memorialId: string | undefined = txRow?.memorial_id || undefined;

            let reflected = false;
            for (let attempt = 0; attempt < 5 && !reflected; attempt++) {
              if (attempt > 0) await new Promise((r) => setTimeout(r, 1500));
              const { data: ent } = await supabase
                .from("account_entitlements")
                .select("current_plan, subscription_status")
                .eq("user_id", currentUser?.id)
                .maybeSingle();
              if (ent?.subscription_status === "active" && ent?.current_plan === normalizedPlan) {
                reflected = true;
              }
            }

            if (!reflected) {
              notify(
                "warning",
                "Tu pago fue aprobado, activando tu plan...",
                "Puede tardar unos segundos en reflejarse. Si tras un par de minutos no ves tu plan activo, contáctanos por WhatsApp."
              );
              return;
            }

            const user = await fetchUserProfile(currentUser);
            if (user) setCurrentUser(user);

            if (memorialId) {
              const full = await fetchMemorialsByFilter({ ids: [memorialId] });
              if (full[0]) {
                setMemorials((prev) => [...prev.filter((m) => m.id !== memorialId), ...full]);
              }
            }

            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#C5A880", "#7A4E38", "#24201D", "#10B981"],
            });

            notify(
              "success",
              "¡Suscripción aprobada en Mercado Pago!",
              `Tu plan ${planConfig.name} ha sido activado exitosamente.`
            );
          } catch (e) {
            console.error("Error verifying Mercado Pago payment:", e);
            notify("error", "Error verificando el pago", "Intenta nuevamente o contáctanos por WhatsApp.");
          } finally {
            window.history.replaceState({}, document.title, cleanUrl);
          }
        })();
      } else if (isPaymentSuccess === "false" || paymentStatus === "cancelled" || paymentStatus === "error") {
        notify("warning", "Pago no completado", "La transacción fue cancelada o rechazada. Puedes intentar nuevamente.");
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } catch (e) {
      console.error("Error processing payment return URL:", e);
    }
  }, []);

  const notify = (type: "success" | "info" | "warning" | "error", title: string, message?: string) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setNotifications((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5500);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Sends the user to the plan comparison (landing page pricing section) so they
  // can freely choose Esencial, Familia or Legado — instead of being locked into
  // a single pre-selected checkout.
  const goToPlanSelection = () => {
    setCurrentView("landing");
    setTimeout(() => {
      document.getElementById("planes")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  // Auth Handlers
  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      return { success: false, error: "Ingresa tu correo electrónico." };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: password || "",
    });
    if (error || !data.user) {
      return { success: false, error: mapAuthError(error) };
    }

    await supabase.from("profiles").update({ last_login_at: new Date().toISOString() }).eq("id", data.user.id);
    const user = await fetchUserProfile(data.user);
    if (!user) {
      return { success: false, error: "No se pudo cargar tu perfil. Intenta nuevamente." };
    }

    setCurrentUser(user);
    setIsAuthModalOpen(false);
    notify("success", "Bienvenido a MEMORA", `Sesión iniciada como ${user.name}`);
    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    password?: string,
    avatarFile?: File
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      return { success: false, error: "Por favor ingresa tu nombre y apellido." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { success: false, error: "Por favor ingresa un correo electrónico válido." };
    }

    if (!password || password.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres." };
    }

    // No plan is free — the base Esencial plan is $990 CLP/año and must be
    // pagado via Flow before any MEMORA can be created. Registering only
    // reserves the account; account_entitlements defaults to pending_payment
    // via the handle_new_user Postgres trigger.
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { name: cleanName } },
    });
    if (error) {
      return { success: false, error: mapAuthError(error) };
    }
    if (!data.session || !data.user) {
      return { success: false, error: "Revisa tu correo para confirmar tu cuenta antes de continuar." };
    }

    // The avatar can't be uploaded to Storage until the account (and its user
    // id) exists, so it happens here rather than during signUp() itself.
    if (avatarFile) {
      try {
        const url = await uploadAvatar(data.user.id, avatarFile);
        await supabase.from("profiles").update({ avatar_url: url }).eq("id", data.user.id);
      } catch (e: any) {
        console.error("Avatar upload failed:", e?.message);
      }
    }

    const user = await fetchUserProfile(data.user);
    if (!user) {
      return { success: false, error: "No se pudo crear tu perfil. Intenta nuevamente." };
    }

    setCurrentUser(user);
    setIsAuthModalOpen(false);
    notify(
      "success",
      "¡Cuenta creada con éxito!",
      "Elige el plan que mejor se ajuste a tu familia para activar tu MEMORA."
    );
    goToPlanSelection();
    return { success: true };
  };

  // Redirige a Google (Supabase Auth nativo) en vez del popup anterior. La
  // vista/plan actuales se guardan para restaurarlos al volver — ver el
  // efecto de sincronización de sesión más arriba.
  const googleLogin = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      sessionStorage.setItem(
        OAUTH_STASH_KEY,
        JSON.stringify({
          view: currentView,
          plan: selectedPlanForCheckout,
          memorialId: targetMemorialForCheckout,
        })
      );
    } catch {}

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      return { success: false, error: mapAuthError(error) };
    }
    return { success: true };
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: "Ingresa tu correo electrónico." };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: window.location.origin,
    });
    if (error) {
      return { success: false, message: mapAuthError(error) };
    }

    notify("info", "Correo enviado", "Revisa tu bandeja de entrada para restablecer tu contraseña.");
    return {
      success: true,
      message: `Te enviamos un correo a ${cleanEmail} con un link para restablecer tu contraseña.`,
    };
  };

  // Llamado desde la pantalla que aparece automáticamente cuando el usuario
  // vuelve a MEMORA tras hacer clic en el link de recuperación (ver evento
  // PASSWORD_RECOVERY en el efecto de sincronización de sesión).
  const confirmPasswordReset = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres." };
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { success: false, error: mapAuthError(error) };
    }

    notify("success", "Contraseña actualizada", "Ya puedes usar tu nueva contraseña.");
    return { success: true };
  };

  const updateUserProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!currentUser) return false;

    const { error } = await supabase
      .from("profiles")
      .update({
        name: updates.name ?? currentUser.name,
        avatar_url: updates.avatarUrl ?? currentUser.avatarUrl,
      })
      .eq("id", currentUser.id);

    if (error) {
      notify("error", "No se pudo actualizar tu perfil", error.message);
      return false;
    }

    setCurrentUser({ ...currentUser, ...updates });
    notify("success", "Perfil actualizado", "Los cambios han sido guardados exitosamente.");
    return true;
  };

  const changePassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: "No hay sesión activa." };

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres." };
    }

    // Supabase's updateUser() trusts the current session and doesn't re-check
    // the old password by itself — re-authenticate first to preserve that guarantee.
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: currentUser.email,
      password: oldPassword,
    });
    if (reauthError) {
      return { success: false, error: "La contraseña actual no es correcta." };
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { success: false, error: mapAuthError(error) };
    }

    notify("success", "Contraseña cambiada", "Tu clave ha sido actualizada con éxito.");
    return { success: true };
  };

  const logout = () => {
    supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentView("landing");
    notify("info", "Has cerrado sesión", "Esperamos verte pronto en MEMORA.");
  };

  // Memorials Navigation
  const openMemorialBySlug = (slug: string) => {
    setSelectedMemorialSlug(slug);
    setSelectedMemorialId(null);
    setCurrentView("memorial-view");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Public memorials owned by someone else aren't in the viewer's own
    // `memorials` list — fetch and merge it in on demand (RLS still governs
    // what's actually returned: public+published, or owner/admin/collaborator).
    const alreadyLoaded = memorials.some((m) => m.slug === slug);
    if (!alreadyLoaded) {
      setIsResolvingMemorial(true);
      fetchMemorialsByFilter({ slug }).then((found) => {
        if (found.length > 0) {
          setMemorials((prev) => [...prev.filter((m) => m.slug !== slug), ...found]);
        }
        setIsResolvingMemorial(false);
      });
    }
  };

  const openMemorialById = (id: string) => {
    const found = memorials.find((m) => m.id === id);
    if (found) {
      setSelectedMemorialSlug(found.slug);
      setSelectedMemorialId(id);
      setCurrentView("memorial-view");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const openMemorialEdit = (
    id: string,
    tab: "general" | "story" | "media" | "timeline" | "family" | "events" | "collaborators" | "tributes" | "privacy" | "qr" = "general"
  ) => {
    setSelectedMemorialId(id);
    setActiveEditTab(tab);
    setCurrentView("memorial-edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Resolved Current Memorial
  const currentMemorial =
    (selectedMemorialSlug && memorials.find((m) => m.slug === selectedMemorialSlug)) ||
    (selectedMemorialId && memorials.find((m) => m.id === selectedMemorialId)) ||
    memorials[0] ||
    null;

  // Memorial CRUD with Plan Limits Check
  const createMemorial = async (data: Partial<Memorial>): Promise<Memorial> => {
    if (!userUsage.canCreateMemora) {
      if (!userUsage.isPaid) {
        notify(
          "warning",
          "Necesitas activar un plan",
          "Elige y activa un plan MEMORA para poder crear tu primera MEMORA."
        );
        goToPlanSelection();
      } else {
        notify(
          "warning",
          "Has alcanzado el límite de MEMORAs de tu plan",
          `Actualmente utilizas ${userUsage.memorasUsed} de ${userUsage.memorasMax} MEMORAs permitidas en tu plan ${userUsage.plan.name}. Mejora tu plan para crear más espacios.`
        );
        setSelectedPlanForCheckout(userUsage.plan.id === "esencial" ? "familia" : "legado");
      }
      throw new Error("No se puede crear la MEMORA: plan no activo o límite alcanzado");
    }
    if (!currentUser) throw new Error("Debes iniciar sesión para crear una MEMORA.");

    // getSession() renueva sola el token si aún hay un refresh token válido
    // (protege contra el caso de que el wizard quede abierto mucho rato) y,
    // más importante: session.user.id es la identidad REAL que Postgres verá
    // como auth.uid() para esta escritura — currentUser.id es solo estado de
    // React en memoria, y puede quedar desincronizado del inicio de sesión
    // real del navegador (p. ej. si se cambió de cuenta en otra pestaña).
    // Insertar con currentUser.id en vez de session.user.id fue exactamente
    // lo que producía "new row violates row-level security policy": el
    // owner_id enviado no coincidía con auth.uid(), sin que tuviera nada que
    // ver con cuánto tiempo llevaba la sesión abierta.
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      notify(
        "error",
        "Tu sesión expiró",
        "Ha pasado demasiado tiempo desde que iniciaste sesión. Vuelve a iniciar sesión y tu información no se perderá."
      );
      throw new Error("Sesión expirada — inicia sesión nuevamente.");
    }
    if (session.user.id !== currentUser.id) {
      // El resto del insert (owner_name/owner_email/plan_id) todavía usa
      // currentUser — si el id no coincide con la sesión real, esos otros
      // campos tampoco son de fiar. Mejor pedir recargar que crear un
      // memorial con datos mezclados de dos cuentas distintas.
      notify(
        "error",
        "Tu sesión cambió",
        "Parece que iniciaste sesión con otra cuenta en otra pestaña. Recarga esta página e intenta nuevamente."
      );
      throw new Error("currentUser desincronizado con la sesión activa.");
    }

    const baseSlug = (data.personName || "recuerdo-eterno")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const uniqueSlug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;

    // Se conoce el id ANTES de insertar (en vez de pedirlo de vuelta con
    // .select() en el mismo insert) porque pedir la fila de vuelta en la
    // misma operación choca con la política de SELECT sobre una fila que
    // recién se está creando en esa misma transacción — confirmado en vivo:
    // el mismo insert sin encadenar .select() funciona siempre; encadenado,
    // falla con "new row violates row-level security policy" pese a que el
    // dueño y la sesión son correctos. Se hace un fetch aparte después
    // (fetchMemorialsByFilter, más abajo), como una request nueva y separada
    // — ahí sí lee bien, porque la fila ya quedó confirmada de una operación
    // anterior.
    const newId = data.id || crypto.randomUUID();

    const { error } = await supabase
      .from("memorials")
      .insert({
        id: newId,
        slug: uniqueSlug,
        type: data.type || "person",
        person_name: data.personName || "Nombre y Apellidos",
        preferred_name: data.preferredName || null,
        birth_date: data.birthDate || null,
        passing_date: data.passingDate || null,
        birth_place: data.birthPlace || null,
        resting_place: data.restingPlace || null,
        main_photo: data.mainPhoto || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
        cover_photo: data.coverPhoto || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
        quote: data.quote || `"Su luz y su recuerdo permanecen siempre entre nosotros."`,
        summary: data.summary || "",
        biography: data.biography || "",
        privacy: data.privacy || "public",
        status: "published",
        owner_id: session.user.id,
        owner_name: currentUser.name,
        owner_email: currentUser.email,
        plan_id: currentUser.currentPlan,
        enable_tribute_auto_approval: true,
        background_music_title: data.backgroundMusicTitle || "Serenidad al Atardecer — Piano Acústico",
        species: data.species || null,
        breed: data.breed || null,
        personality: data.personality || null,
        favorite_things: data.favoriteThings || null,
        favorite_place: data.favoritePlace || null,
        anecdote: data.anecdote || null,
        arrival_story: data.arrivalStory || null,
        special_trait: data.specialTrait || null,
        pet_memory_quote: data.petMemoryQuote || null,
      });

    if (error) {
      // code 42501 = RLS insuficiente — casi siempre significa que la sesión
      // se cayó justo entre el getSession() de arriba y este insert (p. ej.
      // el usuario cerró sesión en otra pestaña). Nunca mostrar el texto
      // crudo de Postgres ("new row violates row-level security policy...")
      // a un usuario final, no significa nada para alguien no técnico.
      if (error?.code === "42501") {
        notify(
          "error",
          "Tu sesión expiró",
          "Vuelve a iniciar sesión y tu información no se perderá."
        );
      } else {
        notify("error", "No se pudo crear la MEMORA", error?.message || "Intenta nuevamente.");
      }
      throw error;
    }

    // Nota: privacy="password" aún no protege de verdad (requiere hashear
    // server-side — ver Fase 4 del plan); se guarda sin password_hash por ahora.
    await supabase.from("albums").insert({
      memorial_id: newId,
      title: "Recuerdos Inolvidables",
      description: "Momentos y fotografías atesoradas en el corazón.",
      cover_url: data.mainPhoto || "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80",
      item_count: 0,
    });

    const full = await fetchMemorialsByFilter({ ids: [newId] });
    if (!full[0]) {
      // Rarísimo: el insert confirmó sin error pero el fetch aparte no trajo
      // nada. No hay una fila de DB completa para construir un fallback
      // razonable client-side — mejor pedir que revise su panel que mostrar
      // un memorial con datos inventados.
      notify(
        "warning",
        "MEMORA creada, pero no se pudo cargar",
        "Refresca la página — tu MEMORA ya está guardada."
      );
      throw new Error("Insert confirmado pero fetchMemorialsByFilter no devolvió la fila.");
    }
    const finalMemorial = full[0];

    setMemorials((prev) => [finalMemorial, ...prev]);
    notify("success", "MEMORA creada con éxito", `El espacio conmemorativo de ${finalMemorial.personName} está listo.`);
    return finalMemorial;
  };

  const updateMemorial = (id: string, updates: Partial<Memorial>) => {
    setMemorials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m))
    );

    const row: Record<string, any> = {};
    if (updates.personName !== undefined) row.person_name = updates.personName;
    if (updates.preferredName !== undefined) row.preferred_name = updates.preferredName || null;
    if (updates.birthDate !== undefined) row.birth_date = updates.birthDate || null;
    if (updates.passingDate !== undefined) row.passing_date = updates.passingDate || null;
    if (updates.birthPlace !== undefined) row.birth_place = updates.birthPlace || null;
    if (updates.restingPlace !== undefined) row.resting_place = updates.restingPlace || null;
    if (updates.mainPhoto !== undefined) row.main_photo = updates.mainPhoto;
    if (updates.coverPhoto !== undefined) row.cover_photo = updates.coverPhoto;
    if (updates.quote !== undefined) row.quote = updates.quote;
    if (updates.summary !== undefined) row.summary = updates.summary;
    if (updates.biography !== undefined) row.biography = updates.biography;
    if (updates.privacy !== undefined) row.privacy = updates.privacy;
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.planId !== undefined) row.plan_id = updates.planId;
    if (updates.enableTributeAutoApproval !== undefined) row.enable_tribute_auto_approval = updates.enableTributeAutoApproval;
    if (updates.backgroundMusicTitle !== undefined) row.background_music_title = updates.backgroundMusicTitle;
    if (updates.backgroundMusicUrl !== undefined) row.background_music_url = updates.backgroundMusicUrl;
    if (updates.qrCodeUrl !== undefined) row.qr_code_url = updates.qrCodeUrl;
    if (updates.species !== undefined) row.species = updates.species;
    if (updates.breed !== undefined) row.breed = updates.breed;
    if (updates.personality !== undefined) row.personality = updates.personality;
    if (updates.favoriteThings !== undefined) row.favorite_things = updates.favoriteThings;
    if (updates.favoritePlace !== undefined) row.favorite_place = updates.favoritePlace;
    if (updates.anecdote !== undefined) row.anecdote = updates.anecdote;
    if (updates.arrivalStory !== undefined) row.arrival_story = updates.arrivalStory;
    if (updates.specialTrait !== undefined) row.special_trait = updates.specialTrait;
    if (updates.petMemoryQuote !== undefined) row.pet_memory_quote = updates.petMemoryQuote;

    supabase.from("memorials").update(row).eq("id", id).then(({ error }) => {
      if (error) notify("error", "No se pudo guardar en el servidor", error.message);
    });
    notify("success", "Cambios guardados", "El memorial ha sido actualizado correctamente.");
  };

  const deleteMemorial = (id: string) => {
    setMemorials((prev) => prev.filter((m) => m.id !== id));
    if (selectedMemorialId === id) {
      setSelectedMemorialId(null);
      setCurrentView("dashboard");
    }
    supabase.from("memorials").delete().eq("id", id).then(({ error }) => {
      if (error) notify("error", "No se pudo eliminar en el servidor", error.message);
    });
    notify("info", "MEMORA eliminada", "El espacio y sus archivos han sido removidos, liberando almacenamiento.");
  };

  const publishMemorial = (id: string) => {
    updateMemorial(id, { status: "published" });
    notify("success", "Memorial publicado", "Ahora puede ser compartido y visitado.");
  };

  // Sub-resource Helpers — cada uno actualiza el estado local de inmediato y
  // persiste en Supabase en segundo plano. El status real de un tributo lo
  // decide siempre el trigger set_tribute_status en Postgres, no el cliente.
  const addTribute = async (
    memorialId: string,
    tributeData: Omit<Tribute, "id" | "createdAt" | "status">
  ) => {
    // No se encadena .select() al insert — un homenaje "pending" no es
    // visible ni siquiera para quien lo escribió (así debe ser: nadie ve
    // homenajes sin aprobar salvo el dueño), así que para un visitante
    // anónimo NUNCA se podría leer de vuelta, sin importar el problema de
    // INSERT+RETURNING ya conocido en memorials. El id se genera acá mismo
    // y el status esperado se calcula igual que el trigger set_tribute_status
    // del servidor (según enable_tribute_auto_approval del memorial, que el
    // cliente ya tiene en memoria) — el valor real en la base de datos es
    // siempre la autoridad; esto solo evita depender de leerlo de vuelta.
    const newId = crypto.randomUUID();
    const memorial = memorials.find((m) => m.id === memorialId);
    const expectedStatus: Tribute["status"] = memorial?.enableTributeAutoApproval ? "approved" : "pending";

    const { error } = await supabase.from("tributes").insert({
      id: newId,
      memorial_id: memorialId,
      author_name: tributeData.authorName,
      author_email: tributeData.authorEmail || null,
      relationship: tributeData.relationship || null,
      message: tributeData.message,
      photo_url: tributeData.photoUrl || null,
      candle_lit: tributeData.candleLit || false,
      flower_placed: tributeData.flowerPlaced || false,
      heart_count: 1,
    });

    if (error) {
      notify("error", "No se pudo enviar el homenaje", error.message || "Intenta nuevamente.");
      return;
    }

    const newTribute: Tribute = {
      id: newId,
      memorialId,
      authorName: tributeData.authorName,
      authorEmail: tributeData.authorEmail,
      relationship: tributeData.relationship,
      message: tributeData.message,
      photoUrl: tributeData.photoUrl,
      candleLit: tributeData.candleLit,
      flowerPlaced: tributeData.flowerPlaced,
      heartCount: 1,
      status: expectedStatus,
      createdAt: new Date().toISOString(),
      replies: [],
    };
    setMemorials((prev) =>
      prev.map((m) => (m.id === memorialId ? { ...m, tributes: [newTribute, ...m.tributes] } : m))
    );

    if (newTribute.status === "approved") {
      notify("success", "Homenaje compartido", "Gracias por dedicar tus palabras y encender una luz en su memoria.");
    } else {
      notify("info", "Homenaje enviado", "Tu mensaje será publicado una vez revisado por los administradores.");
      fetch("/api/tributes/notify-pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tributeId: newTribute.id }),
      }).catch(() => {
        // Silencioso: si falla el aviso por correo, el homenaje igual queda
        // pendiente y visible en el panel de moderación del dueño.
      });
    }
  };

  const moderateTribute = (
    memorialId: string,
    tributeId: string,
    action: "approved" | "rejected" | "deleted"
  ) => {
    setMemorials((prev) =>
      prev.map((m) => {
        if (m.id !== memorialId) return m;
        if (action === "deleted") {
          return { ...m, tributes: m.tributes.filter((t) => t.id !== tributeId) };
        }
        return { ...m, tributes: m.tributes.map((t) => (t.id === tributeId ? { ...t, status: action } : t)) };
      })
    );

    const op =
      action === "deleted"
        ? supabase.from("tributes").delete().eq("id", tributeId)
        : supabase.from("tributes").update({ status: action }).eq("id", tributeId);
    op.then(({ error }) => {
      if (error) notify("error", "No se pudo moderar en el servidor", error.message);
    });

    notify("info", "Moderación completada", `El homenaje ha sido ${action === "approved" ? "aprobado" : action === "rejected" ? "rechazado" : "eliminado"}.`);
  };

  // Usa la función react_to_tribute (SECURITY DEFINER) porque la política RLS
  // de UPDATE en "tributes" solo permite escribir a owner/admin — reaccionar
  // (corazón/vela/flor) debe poder hacerlo cualquier visitante que vea el memorial.
  const addTributeReaction = (memorialId: string, tributeId: string, type: "heart" | "candle" | "flower") => {
    setMemorials((prev) =>
      prev.map((m) => {
        if (m.id !== memorialId) return m;
        return {
          ...m,
          tributes: m.tributes.map((t) => {
            if (t.id !== tributeId) return t;
            if (type === "heart") return { ...t, heartCount: (t.heartCount || 0) + 1 };
            if (type === "candle") return { ...t, candleLit: true };
            if (type === "flower") return { ...t, flowerPlaced: true };
            return t;
          }),
        };
      })
    );
    supabase.rpc("react_to_tribute", { p_tribute_id: tributeId, p_reaction: type }).then(({ error }) => {
      if (error) console.error("react_to_tribute failed:", error.message);
    });
  };

  // Usa la función rsvp_to_event (SECURITY DEFINER) porque la política RLS
  // de UPDATE en "memorial_events" solo permite escribir a owner/admin —
  // confirmar asistencia debe poder hacerlo cualquier visitante que vea el memorial.
  const rsvpToEvent = (memorialId: string, eventId: string) => {
    setMemorials((prev) =>
      prev.map((m) => {
        if (m.id !== memorialId) return m;
        return {
          ...m,
          events: m.events.map((e) => (e.id === eventId ? { ...e, rsvpCount: (e.rsvpCount || 0) + 1 } : e)),
        };
      })
    );
    supabase.rpc("rsvp_to_event", { p_event_id: eventId }).then(({ error }) => {
      if (error) console.error("rsvp_to_event failed:", error.message);
    });
  };

  // Add Media Item with Shared-Bag Storage Limit Check
  const addMediaItem = (
    memorialId: string,
    mediaData: Omit<MediaItem, "id" | "uploadedAt" | "status">
  ): boolean => {
    const isVideo = mediaData.type === "video";

    if (isVideo) {
      if (!userUsage.canUploadVideos(1)) {
        notify(
          "warning",
          "Has alcanzado el límite de videos de tu plan",
          `Actualmente utilizas ${userUsage.videosUsed} de ${userUsage.videosMax} videos en tu bolsa compartida (${userUsage.plan.name}). Puedes eliminar videos existentes o mejorar tu plan.`
        );
        setSelectedPlanForCheckout(userUsage.plan.id === "esencial" ? "familia" : "legado");
        return false;
      }
    } else {
      if (!userUsage.canUploadPhotos(1)) {
        notify(
          "warning",
          "Has alcanzado el límite de fotografías de tu plan",
          `Actualmente utilizas ${userUsage.photosUsed} de ${userUsage.photosMax} fotografías en tu bolsa compartida (${userUsage.plan.name}). Puedes eliminar fotografías existentes o mejorar tu plan.`
        );
        setSelectedPlanForCheckout(userUsage.plan.id === "esencial" ? "familia" : "legado");
        return false;
      }
    }

    const tempId = `pending-${Date.now()}`;
    const optimisticItem: MediaItem = { ...mediaData, id: tempId, uploadedAt: new Date().toISOString(), status: "approved" };
    setMemorials((prev) => prev.map((m) => (m.id === memorialId ? { ...m, media: [optimisticItem, ...m.media] } : m)));

    supabase
      .from("media_items")
      .insert({
        memorial_id: memorialId,
        album_id: mediaData.albumId || null,
        type: mediaData.type,
        url: mediaData.url,
        thumbnail_url: mediaData.thumbnailUrl || null,
        title: mediaData.title || null,
        description: mediaData.description || null,
        date: mediaData.date || null,
        album_title: mediaData.albumTitle || null,
        tags: mediaData.tags || null,
        uploader_name: mediaData.uploaderName,
        uploader_email: mediaData.uploaderEmail || null,
      })
      .select()
      .single()
      .then(({ data: row, error }) => {
        if (error || !row) {
          notify("error", "No se pudo guardar el archivo", error?.message || "Intenta nuevamente.");
          setMemorials((prev) => prev.map((m) => (m.id === memorialId ? { ...m, media: m.media.filter((it) => it.id !== tempId) } : m)));
          return;
        }
        const realItem = mapMediaRow(row);
        setMemorials((prev) => prev.map((m) => (m.id === memorialId ? { ...m, media: m.media.map((it) => (it.id === tempId ? realItem : it)) } : m)));
      });

    notify("success", "Archivo agregado", `Se ha añadido "${mediaData.title || "un nuevo recuerdo"}" a la MEMORA.`);
    return true;
  };

  const deleteMediaItem = (memorialId: string, mediaId: string) => {
    setMemorials((prev) =>
      prev.map((m) => (m.id === memorialId ? { ...m, media: m.media.filter((item) => item.id !== mediaId) } : m))
    );
    supabase.from("media_items").delete().eq("id", mediaId).then(({ error }) => {
      if (error) notify("error", "No se pudo eliminar en el servidor", error.message);
    });
    notify("info", "Recuerdo eliminado", "El archivo ha sido removido del memorial, liberando espacio en tu bolsa.");
  };

  const createAlbum = (memorialId: string, title: string, description?: string, coverUrl?: string) => {
    const tempId = `pending-${Date.now()}`;
    const finalCoverUrl = coverUrl || "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80";
    const optimisticAlbum: Album = { id: tempId, memorialId, title, description, coverUrl: finalCoverUrl, itemCount: 0 };
    setMemorials((prev) => prev.map((m) => (m.id === memorialId ? { ...m, albums: [...m.albums, optimisticAlbum] } : m)));

    supabase
      .from("albums")
      .insert({ memorial_id: memorialId, title, description: description || null, cover_url: finalCoverUrl, item_count: 0 })
      .select()
      .single()
      .then(({ data: row, error }) => {
        if (error || !row) {
          notify("error", "No se pudo crear el álbum", error?.message || "Intenta nuevamente.");
          setMemorials((prev) => prev.map((m) => (m.id === memorialId ? { ...m, albums: m.albums.filter((a) => a.id !== tempId) } : m)));
          return;
        }
        const realAlbum = mapAlbumRow(row);
        setMemorials((prev) => prev.map((m) => (m.id === memorialId ? { ...m, albums: m.albums.map((a) => (a.id === tempId ? realAlbum : a)) } : m)));
      });
    notify("success", "Álbum creado", `Álbum "${title}" listo para organizar recuerdos.`);
  };

  const addTimelineEvent = (memorialId: string, eventData: Omit<TimelineEvent, "id">) => {
    if (eventData.photoUrl && !userUsage.canUploadPhotos(1)) {
      notify(
        "warning",
        "Has alcanzado el límite de fotografías de tu plan",
        `Actualmente utilizas ${userUsage.photosUsed} de ${userUsage.photosMax} fotografías en tu bolsa compartida.`
      );
      return;
    }

    const tempId = `pending-${Date.now()}`;
    const optimisticEvent: TimelineEvent = { ...eventData, id: tempId };
    setMemorials((prev) => prev.map((m) => (m.id === memorialId ? { ...m, timeline: [...m.timeline, optimisticEvent] } : m)));

    supabase
      .from("timeline_events")
      .insert({
        memorial_id: memorialId,
        year: eventData.year,
        date: eventData.date || null,
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        photo_url: eventData.photoUrl || null,
        location: eventData.location || null,
      })
      .select()
      .single()
      .then(({ data: row, error }) => {
        if (error || !row) {
          notify("error", "No se pudo guardar el hito", error?.message || "Intenta nuevamente.");
          setMemorials((prev) => prev.map((m) => (m.id === memorialId ? { ...m, timeline: m.timeline.filter((e) => e.id !== tempId) } : m)));
          return;
        }
        const realEvent = mapTimelineRow(row);
        setMemorials((prev) => prev.map((m) => (m.id === memorialId ? { ...m, timeline: m.timeline.map((e) => (e.id === tempId ? realEvent : e)) } : m)));
      });
    notify("success", "Hito agregado a la línea de tiempo", eventData.title);
  };

  const deleteTimelineEvent = (memorialId: string, eventId: string) => {
    setMemorials((prev) =>
      prev.map((m) => (m.id === memorialId ? { ...m, timeline: m.timeline.filter((e) => e.id !== eventId) } : m))
    );
    supabase.from("timeline_events").delete().eq("id", eventId).then(({ error }) => {
      if (error) notify("error", "No se pudo eliminar en el servidor", error.message);
    });
  };

  const addFamilyMember = (memorialId: string, memberData: Omit<FamilyMember, "id">) => {
    if (memberData.photoUrl && !userUsage.canUploadPhotos(1)) {
      notify(
        "warning",
        "Has alcanzado el límite de fotografías de tu plan",
        `Actualmente utilizas ${userUsage.photosUsed} de ${userUsage.photosMax} fotografías en tu bolsa compartida.`
      );
      return;
    }

    const tempId = `pending-${Date.now()}`;
    const optimisticMember: FamilyMember = { ...memberData, id: tempId };
    setMemorials((prev) => prev.map((m) => (m.id === memorialId ? { ...m, family: [...m.family, optimisticMember] } : m)));

    supabase
      .from("family_members")
      .insert({
        memorial_id: memorialId,
        name: memberData.name,
        relationship: memberData.relationship,
        photo_url: memberData.photoUrl || null,
        birth_year: memberData.birthYear || null,
        generation: memberData.generation || null,
        notes: memberData.notes || null,
      })
      .select()
      .single()
      .then(({ data: row, error }) => {
        if (error || !row) {
          notify("error", "No se pudo agregar el familiar", error?.message || "Intenta nuevamente.");
          setMemorials((prev) => prev.map((m) => (m.id === memorialId ? { ...m, family: m.family.filter((f) => f.id !== tempId) } : m)));
          return;
        }
        const realMember = mapFamilyRow(row);
        setMemorials((prev) => prev.map((m) => (m.id === memorialId ? { ...m, family: m.family.map((f) => (f.id === tempId ? realMember : f)) } : m)));
      });
    notify("success", "Familiar agregado", `${memberData.name} (${memberData.relationship})`);
  };

  const deleteFamilyMember = (memorialId: string, memberId: string) => {
    setMemorials((prev) =>
      prev.map((m) => (m.id === memorialId ? { ...m, family: m.family.filter((f) => f.id !== memberId) } : m))
    );
    supabase.from("family_members").delete().eq("id", memberId).then(({ error }) => {
      if (error) notify("error", "No se pudo eliminar en el servidor", error.message);
    });
  };

  const addEvent = (memorialId: string, eventData: Omit<MemorialEvent, "id" | "rsvpCount">) => {
    const tempId = `pending-${Date.now()}`;
    const optimisticEvent: MemorialEvent = { ...eventData, id: tempId, rsvpCount: 1 };
    setMemorials((prev) => prev.map((m) => (m.id === memorialId ? { ...m, events: [...m.events, optimisticEvent] } : m)));

    supabase
      .from("memorial_events")
      .insert({
        memorial_id: memorialId,
        title: eventData.title,
        type: eventData.type,
        date: eventData.date,
        time: eventData.time,
        location_name: eventData.locationName,
        address: eventData.address || null,
        virtual_link: eventData.virtualLink || null,
        description: eventData.description || null,
        rsvp_count: 1,
      })
      .select()
      .single()
      .then(({ data: row, error }) => {
        if (error || !row) {
          notify("error", "No se pudo agregar el evento", error?.message || "Intenta nuevamente.");
          setMemorials((prev) => prev.map((m) => (m.id === memorialId ? { ...m, events: m.events.filter((e) => e.id !== tempId) } : m)));
          return;
        }
        const realEvent = mapEventRow(row);
        setMemorials((prev) => prev.map((m) => (m.id === memorialId ? { ...m, events: m.events.map((e) => (e.id === tempId ? realEvent : e)) } : m)));
      });
    notify("success", "Ceremonia o evento añadido", eventData.title);
  };

  const updateEvent = (
    memorialId: string,
    eventId: string,
    updates: Omit<MemorialEvent, "id" | "memorialId" | "rsvpCount">
  ) => {
    setMemorials((prev) =>
      prev.map((m) =>
        m.id === memorialId
          ? { ...m, events: m.events.map((e) => (e.id === eventId ? { ...e, ...updates } : e)) }
          : m
      )
    );
    supabase
      .from("memorial_events")
      .update({
        title: updates.title,
        type: updates.type,
        date: updates.date,
        time: updates.time,
        location_name: updates.locationName,
        address: updates.address || null,
        virtual_link: updates.virtualLink || null,
        description: updates.description || null,
      })
      .eq("id", eventId)
      .then(({ error }) => {
        if (error) notify("error", "No se pudo actualizar la ceremonia", error.message);
      });
    notify("success", "Ceremonia actualizada", updates.title);
  };

  const deleteEvent = (memorialId: string, eventId: string) => {
    setMemorials((prev) =>
      prev.map((m) => (m.id === memorialId ? { ...m, events: m.events.filter((e) => e.id !== eventId) } : m))
    );
    supabase.from("memorial_events").delete().eq("id", eventId).then(({ error }) => {
      if (error) notify("error", "No se pudo eliminar en el servidor", error.message);
    });
  };

  const inviteCollaborator = (memorialId: string, name: string, email: string, role: any) => {
    const tempId = `pending-${Date.now()}`;
    const optimisticCollab: Collaborator = { id: tempId, memorialId, name, email, role, status: "active", invitedAt: new Date().toISOString() };
    setMemorials((prev) => prev.map((m) => (m.id === memorialId ? { ...m, collaborators: [...m.collaborators, optimisticCollab] } : m)));

    supabase
      .from("collaborators")
      .insert({ memorial_id: memorialId, name, email, role, status: "active" })
      .select()
      .single()
      .then(({ data: row, error }) => {
        if (error || !row) {
          notify("error", "No se pudo invitar al colaborador", error?.message || "Intenta nuevamente.");
          setMemorials((prev) => prev.map((m) => (m.id === memorialId ? { ...m, collaborators: m.collaborators.filter((c) => c.id !== tempId) } : m)));
          return;
        }
        const realCollab = mapCollaboratorRow(row);
        setMemorials((prev) => prev.map((m) => (m.id === memorialId ? { ...m, collaborators: m.collaborators.map((c) => (c.id === tempId ? realCollab : c)) } : m)));
      });
    notify("success", "Invitación enviada", `Se ha asignado el rol de ${role} a ${name} (${email}).`);
  };

  const removeCollaborator = (memorialId: string, collaboratorId: string) => {
    setMemorials((prev) =>
      prev.map((m) =>
        m.id === memorialId ? { ...m, collaborators: m.collaborators.filter((c) => c.id !== collaboratorId) } : m
      )
    );
    supabase.from("collaborators").delete().eq("id", collaboratorId).then(({ error }) => {
      if (error) notify("error", "No se pudo eliminar en el servidor", error.message);
    });
  };

  // AI Story Assistant invocation
  const generateStoryWithAI = async (params: {
    personName: string;
    memorialType?: MemorialType;
    species?: string;
    breed?: string;
    birthDate?: string;
    passingDate?: string;
    birthPlace?: string;
    notes?: string;
    passions?: string;
    familyDetails?: string;
    personality?: string;
    favoriteThings?: string;
    favoritePlace?: string;
    anecdote?: string;
    arrivalStory?: string;
    specialTrait?: string;
    tone?: string;
  }) => {
    try {
      const res = await fetch("/api/gemini/biography-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
      throw new Error(data.error || "No se pudo generar la historia");
    } catch (err) {
      console.warn("AI generation client fallback triggered:", err);

      if (params.memorialType === "pet") {
        return {
          biography: `${params.personName} fue un compañero leal y amoroso que llenó cada día de alegría y ternura en el hogar.\n\n${
            params.arrivalStory ? params.arrivalStory + ". " : ""
          }${
            params.personality ? `Con su personalidad ${params.personality.toLowerCase()}, ` : ""
          }${
            params.favoriteThings ? `siempre encontraba felicidad en ${params.favoriteThings.toLowerCase()}. ` : ""
          }${
            params.favoritePlace ? `Su lugar predilecto era ${params.favoritePlace.toLowerCase()}. ` : ""
          }${
            params.anecdote ? `Entre tantos recuerdos hermosos, siempre recordaremos cuando ${params.anecdote.toLowerCase()}. ` : ""
          }${
            params.specialTrait ? `Lo que lo hacía verdaderamente inolvidable era ${params.specialTrait.toLowerCase()}. ` : ""
          }\n\nGracias por tanto amor incondicional. Tu recuerdo vivirá por siempre en el corazón de tu familia.`,
          shortSummary: `En memoria amorosa de ${params.personName}, compañero fiel y amor eterno en nuestro hogar.`,
          memorialQuote: `"Los mejores amigos dejan huellas imborrables en el corazón."`,
          suggestedMilestones: [
            {
              year: params.birthDate ? params.birthDate.split("-")[0] : "2015",
              title: "Llegada al hogar",
              description: params.arrivalStory || `El día que ${params.personName} llegó a nuestras vidas.`,
            },
            {
              year: "Aventuras compartidas",
              title: "Momentos inolvidables",
              description: params.favoriteThings || "Paseos, juegos y cariño diario.",
            },
            {
              year: params.passingDate ? params.passingDate.split("-")[0] : "2024",
              title: "Amor para siempre",
              description: "Tu recuerdo vivirá eternamente entre nosotros.",
            },
          ],
        };
      }

      return {
        biography: `${params.personName} fue un ser lleno de bondad, cuya calidez humana y ejemplo de vida tocaron profundamente a quienes lo rodearon. ${
          params.birthPlace ? `Originario de ${params.birthPlace}, ` : ""
        }${params.notes || ""}\n\nSu legado de amor, generosidad y recuerdos compartidos permanecerá por siempre en el corazón de su familia y amigos.`,
        shortSummary: `En memoria entrañable de ${params.personName}, celebrando su vida, su amor y sus enseñanzas que trascienden el tiempo.`,
        memorialQuote: `"Los recuerdos que sembramos con amor son eternos en el jardín de la memoria."`,
        suggestedMilestones: [
          {
            year: params.birthDate ? params.birthDate.split("-")[0] : "1960",
            title: "Nacimiento",
            description: `Llegada al mundo de ${params.personName}.`,
          },
          {
            year: "Años dorados",
            title: "Familia y pasiones",
            description: params.passions || "Momentos dedicados a lo que más amaba.",
          },
        ],
      };
    }
  };

  // Complete Payment Simulation / Plan Upgrade
  const completePaymentSimulation = async (
    planId: PlanTier,
    memorialId?: string
  ): Promise<PaymentTransaction> => {
    const normalizedPlan = normalizePlanId(planId);
    const planConfig = getPlanConfig(normalizedPlan);

    const newTx: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      userId: currentUser?.id || "user-demo-1",
      memorialId: memorialId,
      memorialName: memorialId ? memorials.find((m) => m.id === memorialId)?.personName : undefined,
      planId: normalizedPlan,
      amount: planConfig.priceMonthlyCLP,
      currency: "CLP",
      status: "completed",
      provider: "flow_webpay",
      invoiceNumber: `INV-MEM-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    const newSub: UserSubscription = {
      planId: normalizedPlan,
      status: "active",
      startDate: new Date().toISOString(),
      nextRenewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      priceCLP: planConfig.priceMonthlyCLP,
    };

    // TODO(Fase 5): igual que el retorno de Flow — activación local únicamente
    // hasta que exista una escritura server-side autoritativa para este flujo.
    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        currentPlan: normalizedPlan,
        subscription: newSub,
      };
      setCurrentUser(updatedUser);
    }

    if (memorialId) {
      updateMemorial(memorialId, { planId: normalizedPlan });
    }

    notify(
      "success",
      "¡Plan actualizado con éxito!",
      `Tu cuenta ahora cuenta con los beneficios de ${planConfig.name}. Capacidad de ${planConfig.maxMemoras} MEMORAs y hasta ${planConfig.maxPhotosTotal} fotografías.`
    );

    if (currentUser?.email) {
      fetch("/api/payments/send-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: currentUser.email,
          userName: currentUser.name,
          planName: planConfig.name,
          amountCLP: planConfig.priceMonthlyCLP,
          invoiceNumber: newTx.invoiceNumber,
          paymentMethod: "Tarjeta Internacional",
        }),
      }).catch((e) => console.warn("No se pudo enviar el comprobante por correo:", e));
    }

    return newTx;
  };

  // Computed Platform Metrics
  const totalPhotosUploaded = memorials.reduce((acc, m) => acc + (m.media?.length || 0), 0);
  const totalTributes = memorials.reduce((acc, m) => acc + (m.tributes?.length || 0), 0);
  const revenueTotalUSD = transactions
    .filter((t) => t.status === "completed")
    .reduce((acc, t) => acc + t.amount, 0);

  const metrics: PlatformMetric = {
    totalMemorials: memorials.length,
    publishedMemorials: memorials.filter((m) => m.status === "published").length,
    totalUsers: platformUserCount,
    totalTributes: totalTributes + 84,
    totalPhotosUploaded: totalPhotosUploaded + 320,
    revenueTotalUSD: revenueTotalUSD + 1890,
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedMemorialSlug,
        selectedMemorialId,
        activeEditTab,
        setActiveEditTab,
        dashboardTab,
        setDashboardTab,
        openMyProfile,
        openMemorialBySlug,
        isResolvingMemorial,
        openMemorialById,
        openMemorialEdit,

        currentUser,
        isAuthenticated: !!currentUser,
        authLoading,
        userUsage,
        login,
        register,
        googleLogin,
        requestPasswordReset,
        confirmPasswordReset,
        updateUserProfile,
        changePassword,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,

        memorials,
        memorialsLoading,
        currentMemorial,
        createMemorial,
        updateMemorial,
        deleteMemorial,
        publishMemorial,

        addTribute,
        moderateTribute,
        addTributeReaction,
        addMediaItem,
        deleteMediaItem,
        createAlbum,
        addTimelineEvent,
        deleteTimelineEvent,
        addFamilyMember,
        deleteFamilyMember,
        addEvent,
        updateEvent,
        deleteEvent,
        rsvpToEvent,
        inviteCollaborator,
        removeCollaborator,

        activeShareMemorial,
        setActiveShareMemorial,
        activeQRMemorial,
        setActiveQRMemorial,
        activePrintableMemorial,
        setActivePrintableMemorial,

        selectedPlanForCheckout,
        setSelectedPlanForCheckout,
        goToPlanSelection,
        targetMemorialForCheckout,
        setTargetMemorialForCheckout,
        transactions,
        completePaymentSimulation,

        generateStoryWithAI,

        notifications,
        notify,
        dismissNotification,

        metrics,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
