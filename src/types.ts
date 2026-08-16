export type PrivacyLevel = "public" | "private" | "password" | "unlisted";
export type MemorialStatus = "draft" | "published" | "archived";
export type UserRole = "user" | "admin";
export type PlanTier = "esencial" | "familia" | "legado" | "para_siempre" | "acompanado";
export type SubscriptionStatus =
  | "free_trial"
  | "active"
  | "pending_payment"
  | "payment_failed"
  | "cancelled"
  | "expired";

export interface UserSubscription {
  planId: PlanTier;
  status: SubscriptionStatus;
  startDate: string;
  freeTrialEndDate?: string;
  nextRenewalDate?: string;
  priceCLP: number;
}

export type CollaboratorRole = "owner" | "admin" | "collaborator" | "viewer";
export type TributeStatus = "approved" | "pending" | "rejected";
export type MemorialType = "person" | "pet" | "family";
export type PetSpecies = "perro" | "gato" | "ave" | "conejo" | "caballo" | "otro";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  currentPlan: PlanTier;
  subscription?: UserSubscription;
  createdAt: string;
  authProvider?: "email" | "google";
  lastLoginAt?: string;
}

export interface RegisteredAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  role: UserRole;
  currentPlan: PlanTier;
  subscription?: UserSubscription;
  authProvider: "email" | "google";
  createdAt: string;
  lastLoginAt: string;
  resetToken?: string;
}

export interface TimelineEvent {
  id: string;
  memorialId: string;
  year: string;
  date?: string;
  title: string;
  description: string;
  category: "infancia" | "familia" | "estudios_trabajo" | "viajes" | "momentos_clave" | "legado";
  photoUrl?: string;
  location?: string;
}

export interface MediaItem {
  id: string;
  memorialId: string;
  type: "photo" | "video" | "document" | "letter";
  url: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  date?: string;
  albumId?: string;
  albumTitle?: string;
  tags?: string[];
  uploaderName: string;
  uploaderEmail?: string;
  status: "approved" | "pending";
  uploadedAt: string;
}

export interface Album {
  id: string;
  memorialId: string;
  title: string;
  description?: string;
  coverUrl?: string;
  itemCount: number;
}

export interface TributeReply {
  id: string;
  authorName: string;
  message: string;
  createdAt: string;
}

export interface Tribute {
  id: string;
  memorialId: string;
  authorName: string;
  authorEmail?: string;
  relationship?: string;
  message: string;
  photoUrl?: string;
  candleLit?: boolean;
  flowerPlaced?: boolean;
  heartCount?: number;
  status: TributeStatus;
  createdAt: string;
  replies?: TributeReply[];
}

export interface FamilyMember {
  id: string;
  memorialId: string;
  name: string;
  relationship: string;
  photoUrl?: string;
  birthYear?: string;
  generation?: "ascendiente" | "pareja" | "hermano" | "hijo" | "nieto" | "amigo";
  notes?: string;
}

export interface MemorialEvent {
  id: string;
  memorialId: string;
  title: string;
  type: "ceremonia" | "misa" | "homenaje_virtual" | "reunion_familiar";
  date: string;
  time: string;
  locationName: string;
  address?: string;
  virtualLink?: string;
  description?: string;
  rsvpCount: number;
}

export interface Collaborator {
  id: string;
  memorialId: string;
  userId?: string;
  name: string;
  email: string;
  role: CollaboratorRole;
  status: "active" | "pending";
  invitedAt: string;
}

export interface Memorial {
  id: string;
  slug: string;
  type?: MemorialType;
  personName: string;
  preferredName?: string;
  birthDate: string;
  passingDate: string;
  birthPlace?: string;
  restingPlace?: string;
  mainPhoto: string;
  coverPhoto?: string;
  quote?: string;
  summary: string;
  biography: string;
  privacy: PrivacyLevel;
  password?: string;
  status: MemorialStatus;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  planId: PlanTier;
  enableTributeAutoApproval: boolean;
  backgroundMusicTitle?: string;
  backgroundMusicUrl?: string;
  qrCodeUrl?: string;
  createdAt: string;
  updatedAt: string;

  // Pet Specific Attributes (MEMORA Mascotas)
  species?: PetSpecies | string;
  breed?: string;
  personality?: string;
  favoriteThings?: string;
  favoritePlace?: string;
  anecdote?: string;
  arrivalStory?: string;
  specialTrait?: string;
  petMemoryQuote?: string;
  
  // Embedded or relational data
  timeline: TimelineEvent[];
  media: MediaItem[];
  albums: Album[];
  tributes: Tribute[];
  family: FamilyMember[];
  events: MemorialEvent[];
  collaborators: Collaborator[];
}

export interface PlanConfig {
  id: PlanTier;
  name: string;
  tagline: string;
  price: number;
  currency: string;
  billingText: string;
  features: string[];
  limitPhotos: string;
  limitVideos: string;
  isPopular?: boolean;
  ctaText: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  memorialId?: string;
  memorialName?: string;
  planId: PlanTier;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed";
  provider: "flow_webpay" | "stripe_test_mode" | "mercadopago_mock" | "bank_transfer";
  invoiceNumber: string;
  createdAt: string;
}

export interface PlatformMetric {
  totalMemorials: number;
  publishedMemorials: number;
  totalUsers: number;
  totalTributes: number;
  totalPhotosUploaded: number;
  revenueTotalUSD: number;
}
