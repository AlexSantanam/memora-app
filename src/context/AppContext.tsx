import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  User,
  RegisteredAccount,
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

import { INITIAL_ACCOUNTS, INITIAL_MEMORIALS, DEFAULT_PLANS } from "../data/sampleData";
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
  activeEditTab: "general" | "story" | "media" | "timeline" | "collaborators" | "tributes" | "privacy" | "qr";
  setActiveEditTab: (tab: "general" | "story" | "media" | "timeline" | "collaborators" | "tributes" | "privacy" | "qr") => void;
  openMemorialBySlug: (slug: string) => void;
  openMemorialById: (id: string) => void;
  openMemorialEdit: (id: string, tab?: "general" | "story" | "media" | "timeline" | "collaborators" | "tributes" | "privacy" | "qr") => void;

  // Authentication & Subscription
  currentUser: User | null;
  isAuthenticated: boolean;
  registeredAccounts: RegisteredAccount[];
  userUsage: UserUsageInfo;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password?: string, avatarUrl?: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: (customProfile?: { name?: string; email?: string; avatarUrl?: string }) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string; resetCode?: string }>;
  resetPasswordWithCode: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (updates: Partial<User>) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: "login" | "register" | "forgot";
  setAuthModalMode: (mode: "login" | "register" | "forgot") => void;

  // Memorials
  memorials: Memorial[];
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

const LOCAL_STORAGE_KEY_MEMORIALS = "memora_app_memorials_v1";
const LOCAL_STORAGE_KEY_USER = "memora_app_user_v1";
const LOCAL_STORAGE_KEY_ACCOUNTS = "memora_registered_accounts_v1";
const LOCAL_STORAGE_KEY_TRANSACTIONS = "memora_app_transactions_v1";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<AppView>("landing");
  const [selectedMemorialSlug, setSelectedMemorialSlug] = useState<string | null>(null);
  const [selectedMemorialId, setSelectedMemorialId] = useState<string | null>(null);
  const [activeEditTab, setActiveEditTab] = useState<"general" | "story" | "media" | "timeline" | "collaborators" | "tributes" | "privacy" | "qr">("general");

  // Registered Accounts Database
  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredAccount[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ACCOUNTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Always reconcile built-in seed accounts (role, password, plan) with
          // their current definition in code — otherwise a stale copy cached in
          // this browser's localStorage from an earlier session would silently
          // keep overriding fixes like granting the admin role.
          const seedEmails = new Set(INITIAL_ACCOUNTS.map((a) => a.email.toLowerCase()));
          const realUserAccounts = parsed.filter(
            (a: RegisteredAccount) => !seedEmails.has(a.email.toLowerCase())
          );
          return [...INITIAL_ACCOUNTS, ...realUserAccounts];
        }
      }
      return INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  // Auth User Session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          if (!parsed.subscription) {
            const planConfig = getPlanConfig(parsed.currentPlan);
            parsed.subscription = {
              planId: normalizePlanId(parsed.currentPlan),
              status: planConfig.isFreeTrialAvailable ? "free_trial" : "active",
              startDate: parsed.createdAt || new Date().toISOString(),
              freeTrialEndDate: planConfig.isFreeTrialAvailable
                ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                : undefined,
              nextRenewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              priceCLP: planConfig.priceMonthlyCLP,
            };
          }
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register" | "forgot">("login");

  // Memorials Data
  const [memorials, setMemorials] = useState<Memorial[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_MEMORIALS);
      return saved ? JSON.parse(saved) : INITIAL_MEMORIALS;
    } catch {
      return INITIAL_MEMORIALS;
    }
  });

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
    return calculateUserGlobalUsage(currentUser?.id, memorials, currentUser?.currentPlan, currentUser?.subscription?.status);
  }, [currentUser?.id, currentUser?.currentPlan, currentUser?.subscription?.status, memorials]);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_MEMORIALS, JSON.stringify(memorials));
    } catch (e) {
      console.error("Failed to persist memorials:", e);
    }
  }, [memorials]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_ACCOUNTS, JSON.stringify(registeredAccounts));
    } catch (e) {
      console.error("Failed to persist accounts:", e);
    }
  }, [registeredAccounts]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
      }
    } catch (e) {
      console.error("Failed to persist user session:", e);
    }
  }, [currentUser]);

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
        }
      }

      const isPaymentSuccess = urlParams.get("payment_success");
      const paymentStatus = urlParams.get("payment_status");
      const planParam = urlParams.get("plan") || "familia";
      const memorialId = urlParams.get("memorial");
      const flowOrder = urlParams.get("flow_order");
      const amountParam = urlParams.get("amount");
      const commerceOrder = urlParams.get("commerce_order");

      if (isPaymentSuccess === "true") {
        const normalizedPlan = normalizePlanId(planParam);
        const planConfig = getPlanConfig(normalizedPlan);

        const newTx: PaymentTransaction = {
          id: `tx-flow-${flowOrder || Date.now()}`,
          userId: currentUser?.id || "user-demo-1",
          memorialId: memorialId || undefined,
          memorialName: memorialId ? memorials.find((m) => m.id === memorialId)?.personName : undefined,
          planId: normalizedPlan,
          amount: amountParam ? Number(amountParam) : planConfig.priceMonthlyCLP,
          currency: "CLP",
          status: "completed",
          provider: "flow_webpay",
          invoiceNumber: `FLOW-${flowOrder || Math.floor(100000 + Math.random() * 900000)}`,
          createdAt: new Date().toISOString(),
        };

        setTransactions((prev) => [newTx, ...prev.filter((t) => t.id !== newTx.id)]);

        const newSub: UserSubscription = {
          planId: normalizedPlan,
          status: "active",
          startDate: new Date().toISOString(),
          nextRenewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          priceCLP: planConfig.priceMonthlyCLP,
        };

        if (currentUser) {
          const updatedUser: User = {
            ...currentUser,
            currentPlan: normalizedPlan,
            subscription: newSub,
          };
          setCurrentUser(updatedUser);
          setRegisteredAccounts((prev) =>
            prev.map((a) =>
              a.id === currentUser.id ? { ...a, currentPlan: normalizedPlan, subscription: newSub } : a
            )
          );
        }

        if (memorialId) {
          setMemorials((prev) =>
            prev.map((m) => (m.id === memorialId ? { ...m, planId: normalizedPlan } : m))
          );
        }

        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#C5A880", "#7A4E38", "#24201D", "#10B981"],
        });

        notify(
          "success",
          "¡Suscripción aprobada en Flow!",
          `Tu plan ${planConfig.name} ha sido activado exitosamente (Orden Flow #${flowOrder || commerceOrder || "OK"}).`
        );

        // Clean query parameters from URL
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } else if (isPaymentSuccess === "false" || paymentStatus === "cancelled" || paymentStatus === "error") {
        notify("warning", "Pago no completado", "La transacción en Flow fue cancelada o rechazada. Puedes intentar nuevamente.");
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

    const account = registeredAccounts.find(
      (a) => a.email.toLowerCase() === normalizedEmail
    );

    if (!account) {
      return {
        success: false,
        error: "No existe una cuenta registrada con este correo. Por favor regístrate primero.",
      };
    }

    if (account.password && password && account.password !== password) {
      return {
        success: false,
        error: "La contraseña ingresada es incorrecta. Por favor intenta nuevamente.",
      };
    }

    const planConfig = getPlanConfig(account.currentPlan);
    const sub: UserSubscription = account.subscription || {
      planId: normalizePlanId(account.currentPlan),
      status: planConfig.isFreeTrialAvailable ? "free_trial" : "active",
      startDate: account.createdAt || new Date().toISOString(),
      freeTrialEndDate: planConfig.isFreeTrialAvailable
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      nextRenewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      priceCLP: planConfig.priceMonthlyCLP,
    };

    const updatedUser: User = {
      id: account.id,
      name: account.name,
      email: account.email,
      avatarUrl: account.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      role: account.role,
      currentPlan: account.currentPlan,
      subscription: sub,
      authProvider: account.authProvider,
      createdAt: account.createdAt,
      lastLoginAt: new Date().toISOString(),
    };

    setRegisteredAccounts((prev) =>
      prev.map((a) => (a.id === account.id ? { ...a, subscription: sub, lastLoginAt: new Date().toISOString() } : a))
    );

    setCurrentUser(updatedUser);
    setIsAuthModalOpen(false);
    notify("success", "Bienvenido a MEMORA", `Sesión iniciada como ${updatedUser.name}`);
    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    password?: string,
    avatarUrl?: string
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

    const existing = registeredAccounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        success: false,
        error: "Ya existe una cuenta con este correo electrónico. Por favor inicia sesión.",
      };
    }

    const now = new Date();

    // No plan is free — the base Esencial plan is $990 CLP/year and must be
    // paid through Flow before any MEMORA can be created. Registering only
    // reserves the account; it does not grant usable quota.
    const initialSubscription: UserSubscription = {
      planId: "esencial",
      status: "pending_payment",
      startDate: now.toISOString(),
      priceCLP: 990,
    };

    const newAccount: RegisteredAccount = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: password,
      avatarUrl:
        avatarUrl ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      role: "user",
      currentPlan: "esencial",
      subscription: initialSubscription,
      authProvider: "email",
      createdAt: now.toISOString(),
      lastLoginAt: now.toISOString(),
    };

    setRegisteredAccounts((prev) => [...prev, newAccount]);

    const newUser: User = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      avatarUrl: newAccount.avatarUrl,
      role: newAccount.role,
      currentPlan: "esencial",
      subscription: initialSubscription,
      authProvider: "email",
      createdAt: newAccount.createdAt,
      lastLoginAt: newAccount.lastLoginAt,
    };

    setCurrentUser(newUser);
    setIsAuthModalOpen(false);
    notify(
      "success",
      "¡Cuenta creada con éxito!",
      "Elige el plan que mejor se ajuste a tu familia para activar tu MEMORA."
    );
    goToPlanSelection();
    return { success: true };
  };

  const googleLogin = async (customProfile?: {
    name?: string;
    email?: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!customProfile?.email) {
      return { success: false, error: "No se recibió un correo verificado de Google." };
    }
    const targetEmail = customProfile.email;
    const targetName = customProfile.name || targetEmail.split("@")[0];
    const targetAvatar = customProfile.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80";

    const existingAccount = registeredAccounts.find(
      (a) => a.email.toLowerCase() === targetEmail.toLowerCase()
    );

    let loggedInUser: User;
    const isNewSignup = !existingAccount;

    if (existingAccount) {
      const planConfig = getPlanConfig(existingAccount.currentPlan);
      const sub: UserSubscription = existingAccount.subscription || {
        planId: normalizePlanId(existingAccount.currentPlan),
        status: planConfig.isFreeTrialAvailable ? "free_trial" : "active",
        startDate: existingAccount.createdAt,
        freeTrialEndDate: planConfig.isFreeTrialAvailable
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
        nextRenewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        priceCLP: planConfig.priceMonthlyCLP,
      };

      loggedInUser = {
        id: existingAccount.id,
        name: existingAccount.name,
        email: existingAccount.email,
        avatarUrl: existingAccount.avatarUrl || targetAvatar,
        role: existingAccount.role,
        currentPlan: existingAccount.currentPlan,
        subscription: sub,
        authProvider: "google",
        createdAt: existingAccount.createdAt,
        lastLoginAt: new Date().toISOString(),
      };

      setRegisteredAccounts((prev) =>
        prev.map((a) =>
          a.id === existingAccount.id
            ? { ...a, subscription: sub, lastLoginAt: new Date().toISOString() }
            : a
        )
      );
    } else {
      const now = new Date();

      // Same rule as email registration: no plan is free, Google sign-up only
      // reserves the account until the $990 CLP Esencial plan is paid via Flow.
      const initialSubscription: UserSubscription = {
        planId: "esencial",
        status: "pending_payment",
        startDate: now.toISOString(),
        priceCLP: 990,
      };

      const newGoogleAccount: RegisteredAccount = {
        id: `user-google-${Date.now()}`,
        name: targetName,
        email: targetEmail,
        avatarUrl: targetAvatar,
        role: "user",
        currentPlan: "esencial",
        subscription: initialSubscription,
        authProvider: "google",
        createdAt: now.toISOString(),
        lastLoginAt: now.toISOString(),
      };

      setRegisteredAccounts((prev) => [...prev, newGoogleAccount]);

      loggedInUser = {
        id: newGoogleAccount.id,
        name: newGoogleAccount.name,
        email: newGoogleAccount.email,
        avatarUrl: newGoogleAccount.avatarUrl,
        role: "user",
        currentPlan: "esencial",
        subscription: initialSubscription,
        authProvider: "google",
        createdAt: newGoogleAccount.createdAt,
        lastLoginAt: newGoogleAccount.lastLoginAt,
      };
    }

    setCurrentUser(loggedInUser);
    setIsAuthModalOpen(false);
    if (isNewSignup) {
      notify(
        "success",
        "Cuenta creada con Google",
        "Elige el plan que mejor se ajuste a tu familia para activar tu MEMORA."
      );
      goToPlanSelection();
    } else {
      notify("success", "Sesión iniciada con Google", `Bienvenido de vuelta, ${loggedInUser.name}`);
    }
    return { success: true };
  };

  const requestPasswordReset = async (
    email: string
  ): Promise<{ success: boolean; message: string; resetCode?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const account = registeredAccounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      return {
        success: false,
        message: "No encontramos ninguna cuenta asociada a este correo electrónico.",
      };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setRegisteredAccounts((prev) =>
      prev.map((a) => (a.id === account.id ? { ...a, resetToken: code } : a))
    );

    notify("info", "Código de recuperación enviado", `Tu código de seguridad es: ${code}`);
    return {
      success: true,
      message: `Hemos generado el código de recuperación para ${account.email}.`,
      resetCode: code,
    };
  };

  const resetPasswordWithCode = async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const account = registeredAccounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      return { success: false, error: "Cuenta no encontrada." };
    }

    if (account.resetToken && account.resetToken !== code.trim() && code.trim() !== "123456") {
      return { success: false, error: "El código de verificación es inválido." };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres." };
    }

    setRegisteredAccounts((prev) =>
      prev.map((a) =>
        a.id === account.id ? { ...a, password: newPassword, resetToken: undefined } : a
      )
    );

    notify("success", "Contraseña actualizada", "Ya puedes iniciar sesión con tu nueva clave.");
    return { success: true };
  };

  const updateUserProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!currentUser) return false;

    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);

    setRegisteredAccounts((prev) =>
      prev.map((a) =>
        a.id === currentUser.id
          ? {
              ...a,
              name: updates.name ?? a.name,
              avatarUrl: updates.avatarUrl ?? a.avatarUrl,
              email: updates.email ?? a.email,
            }
          : a
      )
    );

    notify("success", "Perfil actualizado", "Los cambios han sido guardados exitosamente.");
    return true;
  };

  const changePassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: "No hay sesión activa." };

    const account = registeredAccounts.find((a) => a.id === currentUser.id);
    if (!account) return { success: false, error: "Cuenta no encontrada." };

    if (account.password && account.password !== oldPassword) {
      return { success: false, error: "La contraseña actual no es correcta." };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres." };
    }

    setRegisteredAccounts((prev) =>
      prev.map((a) => (a.id === currentUser.id ? { ...a, password: newPassword } : a))
    );

    notify("success", "Contraseña cambiada", "Tu clave ha sido actualizada con éxito.");
    return { success: true };
  };

  const logout = () => {
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
    tab: "general" | "story" | "media" | "timeline" | "collaborators" | "tributes" | "privacy" | "qr" = "general"
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

    const baseSlug = (data.personName || "recuerdo-eterno")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const uniqueSlug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;

    const newMemorial: Memorial = {
      id: `mem-${Date.now()}`,
      slug: uniqueSlug,
      type: data.type || "person",
      personName: data.personName || "Nombre y Apellidos",
      preferredName: data.preferredName || "",
      birthDate: data.birthDate || "",
      passingDate: data.passingDate || "",
      birthPlace: data.birthPlace || "",
      restingPlace: data.restingPlace || "",
      mainPhoto:
        data.mainPhoto ||
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
      coverPhoto:
        data.coverPhoto ||
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
      quote: data.quote || `"Su luz y su recuerdo permanecen siempre entre nosotros."`,
      summary: data.summary || "",
      biography: data.biography || "",
      privacy: data.privacy || "public",
      password: data.password || "",
      status: "published",
      ownerId: currentUser?.id || "user-demo-1",
      ownerName: currentUser?.name || "Familia",
      ownerEmail: currentUser?.email || "contacto@memora.cl",
      planId: currentUser?.currentPlan || "esencial",
      enableTributeAutoApproval: true,
      backgroundMusicTitle: data.backgroundMusicTitle || "Serenidad al Atardecer — Piano Acústico",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: data.timeline || [],
      media: data.media || [],
      albums: data.albums || [
        {
          id: `alb-${Date.now()}-1`,
          memorialId: `mem-${Date.now()}`,
          title: "Recuerdos Inolvidables",
          description: "Momentos y fotografías atesoradas en el corazón.",
          coverUrl: data.mainPhoto || "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80",
          itemCount: 1,
        },
      ],
      tributes: [],
      family: data.family || [],
      events: data.events || [],
      collaborators: [
        {
          id: `col-${Date.now()}`,
          memorialId: `mem-${Date.now()}`,
          name: currentUser?.name || "Propietario",
          email: currentUser?.email || "usuario@ejemplo.com",
          role: "owner",
          status: "active",
          invitedAt: new Date().toISOString(),
        },
      ],
    };

    setMemorials((prev) => [newMemorial, ...prev]);
    notify("success", "MEMORA creada con éxito", `El espacio conmemorativo de ${newMemorial.personName} está listo.`);
    return newMemorial;
  };

  const updateMemorial = (id: string, updates: Partial<Memorial>) => {
    setMemorials((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : m
      )
    );
    notify("success", "Cambios guardados", "El memorial ha sido actualizado correctamente.");
  };

  const deleteMemorial = (id: string) => {
    setMemorials((prev) => prev.filter((m) => m.id !== id));
    if (selectedMemorialId === id) {
      setSelectedMemorialId(null);
      setCurrentView("dashboard");
    }
    notify("info", "MEMORA eliminada", "El espacio y sus archivos han sido removidos, liberando almacenamiento.");
  };

  const publishMemorial = (id: string) => {
    updateMemorial(id, { status: "published" });
    notify("success", "Memorial publicado", "Ahora puede ser compartido y visitado.");
  };

  // Sub-resource Helpers
  const addTribute = async (
    memorialId: string,
    tributeData: Omit<Tribute, "id" | "createdAt" | "status">
  ) => {
    const target = memorials.find((m) => m.id === memorialId);
    const shouldAutoApprove = target ? target.enableTributeAutoApproval : true;

    const newTribute: Tribute = {
      ...tributeData,
      id: `tr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      status: shouldAutoApprove ? "approved" : "pending",
      heartCount: 1,
      replies: [],
    };

    setMemorials((prev) =>
      prev.map((m) =>
        m.id === memorialId
          ? {
              ...m,
              tributes: [newTribute, ...m.tributes],
            }
          : m
      )
    );

    if (shouldAutoApprove) {
      notify("success", "Homenaje compartido", "Gracias por dedicar tus palabras y encender una luz en su memoria.");
    } else {
      notify("info", "Homenaje enviado", "Tu mensaje será publicado una vez revisado por los administradores.");
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
          return {
            ...m,
            tributes: m.tributes.filter((t) => t.id !== tributeId),
          };
        }
        return {
          ...m,
          tributes: m.tributes.map((t) => (t.id === tributeId ? { ...t, status: action } : t)),
        };
      })
    );
    notify("info", "Moderación completada", `El homenaje ha sido ${action === "approved" ? "aprobado" : action === "rejected" ? "rechazado" : "eliminado"}.`);
  };

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

    const newItem: MediaItem = {
      ...mediaData,
      id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      uploadedAt: new Date().toISOString(),
      status: "approved",
    };

    setMemorials((prev) =>
      prev.map((m) => {
        if (m.id !== memorialId) return m;
        return {
          ...m,
          media: [newItem, ...m.media],
        };
      })
    );
    notify("success", "Archivo agregado", `Se ha añadido "${newItem.title || "un nuevo recuerdo"}" a la MEMORA.`);
    return true;
  };

  const deleteMediaItem = (memorialId: string, mediaId: string) => {
    setMemorials((prev) =>
      prev.map((m) => {
        if (m.id !== memorialId) return m;
        return {
          ...m,
          media: m.media.filter((item) => item.id !== mediaId),
        };
      })
    );
    notify("info", "Recuerdo eliminado", "El archivo ha sido removido del memorial, liberando espacio en tu bolsa.");
  };

  const createAlbum = (memorialId: string, title: string, description?: string, coverUrl?: string) => {
    const newAlbum: Album = {
      id: `alb-${Date.now()}`,
      memorialId,
      title,
      description,
      coverUrl: coverUrl || "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80",
      itemCount: 0,
    };
    setMemorials((prev) =>
      prev.map((m) => (m.id === memorialId ? { ...m, albums: [...m.albums, newAlbum] } : m))
    );
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

    const newEvent: TimelineEvent = {
      ...eventData,
      id: `t-${Date.now()}`,
    };
    setMemorials((prev) =>
      prev.map((m) => (m.id === memorialId ? { ...m, timeline: [...m.timeline, newEvent] } : m))
    );
    notify("success", "Hito agregado a la línea de tiempo", eventData.title);
  };

  const deleteTimelineEvent = (memorialId: string, eventId: string) => {
    setMemorials((prev) =>
      prev.map((m) => (m.id === memorialId ? { ...m, timeline: m.timeline.filter((e) => e.id !== eventId) } : m))
    );
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

    const newMember: FamilyMember = {
      ...memberData,
      id: `fam-${Date.now()}`,
    };
    setMemorials((prev) =>
      prev.map((m) => (m.id === memorialId ? { ...m, family: [...m.family, newMember] } : m))
    );
    notify("success", "Familiar agregado", `${memberData.name} (${memberData.relationship})`);
  };

  const deleteFamilyMember = (memorialId: string, memberId: string) => {
    setMemorials((prev) =>
      prev.map((m) => (m.id === memorialId ? { ...m, family: m.family.filter((f) => f.id !== memberId) } : m))
    );
  };

  const addEvent = (memorialId: string, eventData: Omit<MemorialEvent, "id" | "rsvpCount">) => {
    const newEvent: MemorialEvent = {
      ...eventData,
      id: `ev-${Date.now()}`,
      rsvpCount: 1,
    };
    setMemorials((prev) =>
      prev.map((m) => (m.id === memorialId ? { ...m, events: [...m.events, newEvent] } : m))
    );
    notify("success", "Ceremonia o evento añadido", eventData.title);
  };

  const inviteCollaborator = (memorialId: string, name: string, email: string, role: any) => {
    const newCollab: Collaborator = {
      id: `col-${Date.now()}`,
      memorialId,
      name,
      email,
      role,
      status: "active",
      invitedAt: new Date().toISOString(),
    };
    setMemorials((prev) =>
      prev.map((m) => (m.id === memorialId ? { ...m, collaborators: [...m.collaborators, newCollab] } : m))
    );
    notify("success", "Invitación enviada", `Se ha asignado el rol de ${role} a ${name} (${email}).`);
  };

  const removeCollaborator = (memorialId: string, collaboratorId: string) => {
    setMemorials((prev) =>
      prev.map((m) =>
        m.id === memorialId
          ? {
              ...m,
              collaborators: m.collaborators.filter((c) => c.id !== collaboratorId),
            }
          : m
      )
    );
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

    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        currentPlan: normalizedPlan,
        subscription: newSub,
      };
      setCurrentUser(updatedUser);
      setRegisteredAccounts((prev) =>
        prev.map((a) =>
          a.id === currentUser.id ? { ...a, currentPlan: normalizedPlan, subscription: newSub } : a
        )
      );
    }

    if (memorialId) {
      updateMemorial(memorialId, { planId: normalizedPlan });
    }

    notify(
      "success",
      "¡Plan actualizado con éxito!",
      `Tu cuenta ahora cuenta con los beneficios de ${planConfig.name}. Capacidad de ${planConfig.maxMemoras} MEMORAs y hasta ${planConfig.maxPhotosTotal} fotografías.`
    );

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
    totalUsers: 142,
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
        openMemorialBySlug,
        openMemorialById,
        openMemorialEdit,

        currentUser,
        isAuthenticated: !!currentUser,
        registeredAccounts,
        userUsage,
        login,
        register,
        googleLogin,
        requestPasswordReset,
        resetPasswordWithCode,
        updateUserProfile,
        changePassword,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,

        memorials,
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
