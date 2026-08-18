import React, { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { Memorial } from "../../types";
import { uploadAvatar } from "../../lib/uploadFile";
import {
  Heart,
  Plus,
  Edit3,
  Eye,
  QrCode,
  Share2,
  Trash2,
  Lock,
  Globe,
  Sparkles,
  Download,
  Flame,
  Image as ImageIcon,
  Clock,
  Calendar,
  Shield,
  CreditCard,
  User as UserIcon,
  CheckCircle2,
  KeyRound,
  Save,
  Check,
  Upload,
  Camera,
  MessageCircle,
  Printer,
} from "lucide-react";
import { WhatsAppButton } from "../whatsapp/WhatsAppButton";

export const UserDashboard: React.FC = () => {
  const {
    currentUser,
    memorials,
    userUsage,
    openMemorialBySlug,
    openMemorialEdit,
    deleteMemorial,
    setCurrentView,
    setActiveShareMemorial,
    setActiveQRMemorial,
    setActivePrintableMemorial,
    setSelectedPlanForCheckout,
    goToPlanSelection,
    transactions,
    notify,
    updateUserProfile,
    changePassword,
    dashboardTab: activeTab,
    setDashboardTab: setActiveTab,
  } = useApp();

  const [typeFilter, setTypeFilter] = useState<"all" | "person" | "pet">("all");

  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Profile Edit State
  const [editName, setEditName] = useState(currentUser?.name || "");
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatarUrl || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  // Admin accounts get Infinity as their quota — show "∞" instead of the literal word.
  const fmtQuota = (n: number) => (n === Infinity ? "∞" : n.toLocaleString("es-CL"));

  const myMemorials = memorials.filter(
    (m) =>
      (m.ownerId === currentUser?.id ||
        m.collaborators?.some((c) => c.email === currentUser?.email)) &&
      (typeFilter === "all" || (m.type || "person") === typeFilter)
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateUserProfile({
        name: editName.trim(),
        avatarUrl: editAvatar.trim(),
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setPassError("La confirmación de la contraseña no coincide.");
      return;
    }

    if (newPassword.length < 6) {
      setPassError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        setPassSuccess("Contraseña actualizada exitosamente.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setPassError(res.error || "No se pudo actualizar la contraseña.");
      }
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleExportBackup = (memorial: Memorial) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(memorial, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `MEMORA-Backup-${memorial.slug}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    notify("success", "Respaldo exportado", `Se ha descargado el archivo con todos los datos de ${memorial.personName}.`);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EAE3D9]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4EFEA] border border-[#D8CEBE] text-xs font-semibold text-[#7A4E38]">
              <Heart className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Mi Espacio Familiar</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#24201D] font-medium">
              Hola, {currentUser?.name || "Familia"}
            </h1>
            <p className="text-xs sm:text-sm text-[#5C534B]">
              Administra los memoriales, fotografías y homenajes de tus seres queridos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <WhatsAppButton
              context="default"
              label="¿Necesitas ayuda?"
              size="sm"
              variant="secondary"
              id="dashboard-header-whatsapp-btn"
            />
            <button
              onClick={() => {
                if (!userUsage.canCreateMemora) {
                  if (!userUsage.isPaid) {
                    notify(
                      "warning",
                      "Elige un plan para crear tu MEMORA",
                      "Aún no tienes un plan activo. Elige el que mejor se ajuste a tu familia."
                    );
                    goToPlanSelection();
                  } else {
                    notify(
                      "warning",
                      "Límite de MEMORAs alcanzado",
                      `Tu plan ${userUsage.plan.name} permite hasta ${userUsage.memorasMax} MEMORAs. Mejora tu plan para crear más.`
                    );
                    setSelectedPlanForCheckout(userUsage.plan.id === "esencial" ? "familia" : "legado");
                    setCurrentView("pricing");
                  }
                  return;
                }
                setCurrentView("wizard");
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              id="dashboard-new-memorial-btn"
            >
              <Plus className="w-4 h-4 text-[#C5A880]" />
              <span>Crear Nuevo Memorial</span>
            </button>
          </div>
        </div>

        {/* Global Storage & Plan Quota Status Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE3D9] shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#F4EFEA]">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#8C827A]">
                  Plan Actual
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  userUsage.plan.id === "legado"
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : userUsage.plan.id === "familia"
                    ? "bg-stone-900 text-white"
                    : "bg-[#F4EFEA] text-[#7A4E38] border border-[#D8CEBE]"
                }`}>
                  {userUsage.plan.name}
                </span>
                {currentUser?.subscription?.status === "free_trial" && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                    🌱 Primer año GRATIS (365 días)
                  </span>
                )}
                {!userUsage.isPaid && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 text-[11px] font-semibold border border-amber-200">
                    ⏳ Pago pendiente
                  </span>
                )}
              </div>
              <p className="text-xs text-[#5C534B]">
                {!userUsage.isPaid
                  ? `Completa el pago de $${userUsage.plan.priceAnnualCLP.toLocaleString("es-CL")} CLP para activar tu plan ${userUsage.plan.name} y crear tu primera MEMORA.`
                  : userUsage.plan.id === "esencial"
                  ? "Plan Esencial: $990 CLP / año. 1 MEMORA y 10 fotos totales. Renovación: $990 CLP."
                  : `$${userUsage.plan.priceAnnualCLP.toLocaleString("es-CL")} CLP / año. Almacenamiento y cuotas compartidas por plan.`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {(!userUsage.isPaid || userUsage.plan.id !== "legado") && (
                <button
                  onClick={() => {
                    if (!userUsage.isPaid) {
                      goToPlanSelection();
                    } else {
                      setSelectedPlanForCheckout(userUsage.plan.id === "esencial" ? "familia" : "legado");
                    }
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#7A4E38] hover:bg-[#623D2C] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>{!userUsage.isPaid ? "Elegir Plan" : "Mejorar Plan"}</span>
                </button>
              )}
            </div>
          </div>

          {/* 3 Global Resource Usage Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {/* MEMORAs */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#24201D] flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-[#7A4E38]" />
                  MEMORAs (Espacios)
                </span>
                <span className="font-mono font-bold text-[#7A4E38]">
                  {userUsage.memorasUsed} / {fmtQuota(userUsage.memorasMax)}
                </span>
              </div>
              <div className="w-full bg-[#EAE3D9] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    userUsage.memorasMax === 0
                      ? "bg-stone-300"
                      : userUsage.memorasUsed >= userUsage.memorasMax
                      ? "bg-amber-600"
                      : "bg-[#7A4E38]"
                  }`}
                  style={{
                    width: `${
                      userUsage.memorasMax === 0 ? 0 : Math.min(100, (userUsage.memorasUsed / userUsage.memorasMax) * 100)
                    }%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-[#8C827A]">
                {!userUsage.isPaid
                  ? "Activa tu plan para habilitar espacios"
                  : userUsage.canCreateMemora
                  ? `${fmtQuota(userUsage.memorasRemaining)} espacio(s) disponible(s)`
                  : "Límite del plan alcanzado"}
              </p>
            </div>

            {/* Photos Shared Bag */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#24201D] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#7A4E38]" />
                  Bolsa Global de Fotos
                </span>
                <span className="font-mono font-bold text-[#7A4E38]">
                  {userUsage.photosUsed} / {fmtQuota(userUsage.photosMax)}
                </span>
              </div>
              <div className="w-full bg-[#EAE3D9] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    userUsage.photosMax === 0
                      ? "bg-stone-300"
                      : userUsage.photosUsed >= userUsage.photosMax
                      ? "bg-amber-600"
                      : "bg-[#7A4E38]"
                  }`}
                  style={{
                    width: `${
                      userUsage.photosMax === 0 ? 0 : Math.min(100, (userUsage.photosUsed / userUsage.photosMax) * 100)
                    }%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-[#8C827A]">
                {!userUsage.isPaid
                  ? "Activa tu plan para habilitar tu bolsa de fotos"
                  : userUsage.photosRemaining > 0
                  ? `${fmtQuota(userUsage.photosRemaining)} foto(s) disponibles para distribuir`
                  : "Bolsa de fotos completa"}
              </p>
            </div>

            {/* Videos Shared Bag */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#24201D] flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#7A4E38]" />
                  Bolsa Global de Videos
                </span>
                <span className="font-mono font-bold text-[#7A4E38]">
                  {userUsage.videosUsed} / {fmtQuota(userUsage.videosMax)}
                </span>
              </div>
              <div className="w-full bg-[#EAE3D9] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    userUsage.videosMax === 0
                      ? "bg-stone-300"
                      : userUsage.videosUsed >= userUsage.videosMax
                      ? "bg-amber-600"
                      : "bg-[#7A4E38]"
                  }`}
                  style={{
                    width: `${userUsage.videosMax === 0 ? 0 : Math.min(100, (userUsage.videosUsed / userUsage.videosMax) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#8C827A]">
                <span>
                  {userUsage.videosMax === 0
                    ? "Videos disponibles desde Plan Familia"
                    : userUsage.videosRemaining > 0
                    ? `${fmtQuota(userUsage.videosRemaining)} video(s) disponibles`
                    : "Bolsa de videos completa"}
                </span>
                {userUsage.videosMax === 0 && (
                  <button
                    onClick={() => {
                      setSelectedPlanForCheckout("familia");
                      setCurrentView("pricing");
                    }}
                    className="text-[#7A4E38] font-bold hover:underline cursor-pointer"
                  >
                    Ver planes
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-[#EAE3D9] pb-3">
          <button
            onClick={() => setActiveTab("memorials")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === "memorials"
                ? "bg-[#24201D] text-white"
                : "bg-white text-[#5C534B] border border-[#D8CEBE] hover:border-[#C5A880]"
            }`}
          >
            Mis Memoriales ({myMemorials.length})
          </button>
          <button
            onClick={() => setActiveTab("billing")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === "billing"
                ? "bg-[#24201D] text-white"
                : "bg-white text-[#5C534B] border border-[#D8CEBE] hover:border-[#C5A880]"
            }`}
          >
            Planes y Facturas ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === "security"
                ? "bg-[#24201D] text-white"
                : "bg-white text-[#5C534B] border border-[#D8CEBE] hover:border-[#C5A880]"
            }`}
          >
            Mi Perfil & Cuenta
          </button>
        </div>

        {/* TAB 1: Memorials List */}
        {activeTab === "memorials" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Subfilter Pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  typeFilter === "all"
                    ? "bg-[#7A4E38] text-white shadow-xs"
                    : "bg-[#FAF7F2] text-[#5C534B] border border-[#EAE3D9] hover:border-[#D8CEBE]"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTypeFilter("person")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  typeFilter === "person"
                    ? "bg-[#7A4E38] text-white shadow-xs"
                    : "bg-[#FAF7F2] text-[#5C534B] border border-[#EAE3D9] hover:border-[#D8CEBE]"
                }`}
              >
                <span>👤 Personas</span>
              </button>
              <button
                onClick={() => setTypeFilter("pet")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  typeFilter === "pet"
                    ? "bg-[#7A4E38] text-white shadow-xs"
                    : "bg-[#FAF7F2] text-[#5C534B] border border-[#EAE3D9] hover:border-[#D8CEBE]"
                }`}
              >
                <span>🐾 Mascotas</span>
              </button>
            </div>

            {myMemorials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myMemorials.map((memorial) => {
                  const candleCount = memorial.tributes?.filter((t) => t.candleLit).length || 0;
                  const tributeCount = memorial.tributes?.length || 0;
                  const photoCount = memorial.media?.length || 0;

                  return (
                    <div
                      key={memorial.id}
                      className="bg-white rounded-3xl overflow-hidden border border-[#EAE3D9] hover:border-[#C5A880] transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
                    >
                      <div>
                        {/* Cover & Avatar */}
                        <div className="relative h-40 bg-stone-100 overflow-hidden">
                          <img
                            src={memorial.coverPhoto}
                            alt={memorial.personName}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                          {/* Type & Privacy Badges */}
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white flex items-center gap-1">
                              {memorial.type === "pet" ? "🐾 Mascota" : "👤 Persona"}
                            </span>
                          </div>

                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-semibold text-[#24201D] flex items-center gap-1">
                              {memorial.privacy === "public" ? (
                                <Globe className="w-3 h-3 text-[#C5A880]" />
                              ) : (
                                <Lock className="w-3 h-3 text-[#7A4E38]" />
                              )}
                              <span className="capitalize">{memorial.privacy}</span>
                            </span>
                          </div>

                          <div className="absolute -bottom-6 left-4 w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white">
                            <img
                              src={memorial.mainPhoto}
                              alt={memorial.personName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="pt-8 p-5 space-y-3">
                          <div>
                            {memorial.type === "pet" && memorial.species && (
                              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A4E38] block mb-0.5">
                                {memorial.species} {memorial.breed ? `· ${memorial.breed}` : ""}
                              </span>
                            )}
                            <h3 className="font-serif text-xl font-medium text-[#24201D] leading-snug">
                              {memorial.personName}
                            </h3>
                            <p className="text-xs text-[#8C827A]">
                              {memorial.birthDate || "1940"} — {memorial.passingDate || "2023"}
                            </p>
                          </div>

                          {/* Stats mini bar */}
                          <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#F4EFEA] text-center text-xs">
                            <div>
                              <span className="font-bold text-[#24201D] block">{photoCount}</span>
                              <span className="text-[10px] text-[#8C827A]">Fotos</span>
                            </div>
                            <div>
                              <span className="font-bold text-[#24201D] block">{candleCount}</span>
                              <span className="text-[10px] text-[#8C827A]">Velas</span>
                            </div>
                            <div>
                              <span className="font-bold text-[#24201D] block">{tributeCount}</span>
                              <span className="text-[10px] text-[#8C827A]">Homenajes</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions Footer */}
                      <div className="p-4 bg-[#FAF7F2] border-t border-[#EAE3D9] flex items-center justify-between gap-2">
                        <button
                          onClick={() => openMemorialBySlug(memorial.slug)}
                          className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#D8CEBE] hover:border-[#C5A880] text-xs font-semibold text-[#24201D] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#7A4E38]" />
                          <span>Ver</span>
                        </button>

                        <button
                          onClick={() => openMemorialEdit(memorial.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#24201D] text-white hover:bg-[#3D3530] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => setActivePrintableMemorial(memorial)}
                          className="p-2 rounded-xl bg-white border border-[#D8CEBE] hover:border-[#C5A880] text-[#7A4E38] hover:text-[#24201D] transition-colors cursor-pointer"
                          title="Crear recuerdo para imprimir (Cuadro, Urna o Placa)"
                        >
                          <Printer className="w-4 h-4 text-[#C5A880]" />
                        </button>

                        <button
                          onClick={() => setActiveQRMemorial(memorial)}
                          className="p-2 rounded-xl bg-white border border-[#D8CEBE] hover:border-[#C5A880] text-[#7A4E38] transition-colors"
                          title="Ver Código QR"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleExportBackup(memorial)}
                          className="p-2 rounded-xl bg-white border border-[#D8CEBE] hover:border-[#C5A880] text-[#7A4E38] transition-colors"
                          title="Descargar Respaldo JSON"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-[#EAE3D9] p-8 space-y-4">
                <Heart className="w-12 h-12 text-[#C5A880] mx-auto opacity-80" />
                <h3 className="font-serif text-2xl text-[#24201D]">Aún no has creado un memorial</h3>
                <p className="text-xs sm:text-sm text-[#5C534B] max-w-md mx-auto">
                  Crea hoy el primer espacio digital de tu familia para atesorar recuerdos, fotografías e historias para siempre.
                </p>
                <button
                  onClick={() => setCurrentView("wizard")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-xs font-semibold shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#C5A880]" />
                  <span>Crear mi primer Memorial</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Billing & Transactions */}
        {activeTab === "billing" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Active Subscription Summary Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D9] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE3D9]">
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#8C827A]">
                    Suscripción Activa
                  </span>
                  <h3 className="font-serif text-2xl text-[#24201D] font-medium flex items-center gap-3">
                    {userUsage.plan.name}
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                      Activa
                    </span>
                  </h3>
                  <p className="text-xs text-[#5C534B]">
                    {userUsage.plan.id === "esencial"
                      ? "Plan Esencial: 1 MEMORA, 10 fotos, 0 videos. $990 CLP / año."
                      : userUsage.plan.id === "familia"
                      ? "Plan Familia: Hasta 3 MEMORAs, 100 fotos, 10 videos (totales por plan). $4.900 CLP / año."
                      : "Plan Legado: Hasta 10 MEMORAs, 1.000 fotos, 50 videos (totales por plan). $14.900 CLP / año."}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedPlanForCheckout(userUsage.plan.id === "esencial" ? "familia" : "legado");
                      setCurrentView("pricing");
                    }}
                    className="px-5 py-2.5 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Cambiar / Mejorar Plan</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9]">
                  <span className="text-[#8C827A] block mb-1">Precio Anual</span>
                  <span className="font-mono font-bold text-base text-[#24201D]">
                    ${userUsage.plan.priceAnnualCLP.toLocaleString("es-CL")} CLP
                  </span>
                  <span className="text-[10px] text-[#7A4E38] block mt-0.5">
                    Renovación anual: ${userUsage.plan.renewalPriceCLP.toLocaleString("es-CL")} CLP
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9]">
                  <span className="text-[#8C827A] block mb-1">Próxima Renovación Anual</span>
                  <span className="font-medium text-[#24201D]">
                    {currentUser?.subscription?.nextRenewalDate
                      ? new Date(currentUser.subscription.nextRenewalDate).toLocaleDateString("es-CL", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "1 año desde activación"}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9]">
                  <span className="text-[#8C827A] block mb-1">Pasarela de Pago</span>
                  <span className="font-medium text-[#24201D] flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    Flow (WebPay Plus, Tarjetas)
                  </span>
                </div>
              </div>
            </div>

            {/* Invoices History Table */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D9] space-y-6">
              <div>
                <h3 className="font-serif text-2xl text-[#24201D] font-medium">
                  Historial de Pagos y Facturas
                </h3>
                <p className="text-xs text-[#8C827A]">
                  Detalle de transacciones registradas y comprobantes oficiales.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#EAE3D9] text-[#8C827A] uppercase font-semibold">
                      <th className="py-3 px-4">Comprobante</th>
                      <th className="py-3 px-4">Memorial Asociado</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Monto</th>
                      <th className="py-3 px-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4EFEA]">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#FAF7F2] transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-[#24201D]">
                          {tx.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 font-medium text-[#24201D]">
                          {tx.memorialName || "Espacio Familiar Global"}
                        </td>
                        <td className="py-3 px-4 capitalize font-medium text-[#7A4E38]">
                          {tx.planId === "familia" || tx.planId === "para_siempre"
                            ? "MEMORA Familia"
                            : tx.planId === "legado" || tx.planId === "acompanado"
                            ? "MEMORA Legado"
                            : "MEMORA Esencial"}
                        </td>
                        <td className="py-3 px-4 text-[#8C827A]">
                          {new Date(tx.createdAt).toLocaleDateString("es-CL")}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#24201D]">
                          ${tx.amount.toLocaleString("es-CL")} {tx.currency}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                            Completado
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Security & Privacy Settings */}
        {activeTab === "security" && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl">

            {/* Plan Renewal Reminder */}
            {currentUser?.subscription?.nextRenewalDate && (() => {
              const renewalDate = new Date(currentUser.subscription!.nextRenewalDate!);
              const daysLeft = Math.ceil((renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const isSoon = daysLeft <= 30 && daysLeft >= 0;
              return (
                <div
                  className={`p-5 rounded-3xl border flex items-center gap-4 ${
                    isSoon ? "bg-amber-50 border-amber-200" : "bg-white border-[#EAE3D9]"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      isSoon ? "bg-amber-100 text-amber-700" : "bg-[#FAF7F2] text-[#7A4E38] border border-[#EAE3D9]"
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#24201D]">
                      Tu plan {userUsage.plan.name} se renueva el{" "}
                      {renewalDate.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p className="text-[11px] text-[#8C827A] mt-0.5">
                      {daysLeft < 0
                        ? "La fecha de renovación ya pasó."
                        : daysLeft === 0
                        ? "¡Vence hoy!"
                        : `Faltan ${daysLeft} día${daysLeft === 1 ? "" : "s"}. Renovación: $${userUsage.plan.priceAnnualCLP.toLocaleString("es-CL")} CLP.`}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Account Status Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D9] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE3D9]">
                <div className="flex items-center gap-4">
                  <img
                    src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                    alt={currentUser?.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#C5A880] shadow-sm"
                  />
                  <div>
                    <h3 className="font-serif text-xl text-[#24201D] font-medium">
                      {currentUser?.name || "Usuario"}
                    </h3>
                    <p className="text-xs text-[#7A7067]">{currentUser?.email}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {currentUser?.authProvider === "google" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200">
                          <svg className="w-3 h-3" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                          </svg>
                          Autenticado con Google
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#7A4E38] text-[11px] font-semibold border border-[#D8CEBE]">
                          <UserIcon className="w-3 h-3" />
                          Cuenta Independiente
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200">
                        {currentUser?.role === "admin" ? "Administrador" : "Familiar Titular"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Profile Info Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <h4 className="font-serif text-lg text-[#24201D] font-medium">Editar Datos Personales</h4>
                
                {/* Hidden input for avatar upload */}
                <input
                  type="file"
                  ref={avatarFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !currentUser) return;
                    if (file.size > 10 * 1024 * 1024) {
                      notify("warning", "Imagen muy pesada", "El archivo debe pesar menos de 10MB.");
                      return;
                    }
                    try {
                      const url = await uploadAvatar(currentUser.id, file);
                      setEditAvatar(url);
                      notify("info", "Foto seleccionada", "Guarda los cambios para actualizar tu perfil.");
                    } catch (err: any) {
                      notify("error", "No se pudo subir la foto", err?.message || "Intenta nuevamente.");
                    }
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                      Nombre para mostrar
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D] focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                      Foto de Perfil
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        className="px-3 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F4EFEA] border border-[#D8CEBE] text-xs font-semibold text-[#24201D] flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Subir archivo</span>
                      </button>
                      <input
                        type="text"
                        value={editAvatar}
                        onChange={(e) => setEditAvatar(e.target.value)}
                        placeholder="O pega URL de foto"
                        className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D] focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-5 py-2.5 rounded-full bg-[#24201D] hover:bg-[#3D3530] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>{isSavingProfile ? "Guardando..." : "Guardar Cambios"}</span>
                  </button>
                </div>
              </form>

              {/* Password Change Form (Independent accounts) */}
              {currentUser?.authProvider !== "google" && (
                <form onSubmit={handleChangePassword} className="pt-6 border-t border-[#EAE3D9] space-y-4">
                  <div>
                    <h4 className="font-serif text-lg text-[#24201D] font-medium">Cambiar Contraseña</h4>
                    <p className="text-xs text-[#7A7067]">
                      Actualiza tu clave de acceso independiente.
                    </p>
                  </div>

                  {passError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                      {passError}
                    </div>
                  )}

                  {passSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{passSuccess}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                        Contraseña actual
                      </label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D] focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                        Nueva contraseña
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mín. 6 caracteres"
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D] focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                        Confirmar nueva
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Repite la nueva"
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D] focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isChangingPass}
                      className="px-5 py-2 rounded-full bg-[#7A4E38] hover:bg-[#603c2a] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{isChangingPass ? "Actualizando..." : "Actualizar Contraseña"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Privacy & Sovereignty */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D9] space-y-6">
              <div>
                <h3 className="font-serif text-2xl text-[#24201D] font-medium">
                  Privacidad y Derecho al Olvido
                </h3>
                <p className="text-xs text-[#8C827A]">
                  Control soberano sobre tus datos personales y contenidos subidos.
                </p>
              </div>

              <div className="space-y-4 text-xs text-[#5C534B]">
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#C5A880] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#24201D]">Compromiso de No Monetización de Datos</p>
                    <p className="mt-0.5">
                      MEMORA nunca vende, comparte ni analiza con fines publicitarios la información de los memoriales ni las fotos de tus seres queridos.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F4EFEA]">
                  <h4 className="font-semibold text-[#24201D] mb-1">Descarga Completa de Archivos</h4>
                  <p className="mb-3">
                    Puedes descargar una copia de seguridad con todos los textos, imágenes y tributos asociados a tu cuenta.
                  </p>
                  <button
                    onClick={() => notify("success", "Exportación iniciada", "Se ha generado el paquete de descarga.")}
                    className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F4EFEA] border border-[#D8CEBE] text-xs font-semibold text-[#24201D] cursor-pointer"
                  >
                    Descargar todos mis datos (.zip)
                  </button>
                </div>

                <div className="pt-4 border-t border-[#F4EFEA]">
                  <h4 className="font-semibold text-red-600 mb-1">Eliminación de Cuenta</h4>
                  <p className="mb-3">
                    Si deseas cerrar tu cuenta de forma definitiva y borrar todos los memoriales asociados de nuestros servidores, puedes solicitarlo directamente.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm("¿Estás seguro de que deseas eliminar tu cuenta y todos los memoriales? Esta acción es irreversible.")) {
                        notify("info", "Cuenta eliminada", "Se han borrado los datos conforme a tu solicitud.");
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold text-red-700 cursor-pointer"
                  >
                    Eliminar mi cuenta definitivamente
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Helpful Human Assistance Banner */}
        <div className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#D8CEBE] flex items-center justify-center text-emerald-600 flex-shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-[#24201D]">
                Acompañamiento y Soporte Directo
              </h4>
              <p className="text-[11px] text-[#7A7067]">
                ¿Tienes dudas sobre cómo editar tu biografía, subir fotos o configurar la privacidad? Escríbenos por WhatsApp.
              </p>
            </div>
          </div>
          <WhatsAppButton
            context="default"
            label="Hablar por WhatsApp"
            size="sm"
            variant="primary"
            className="flex-shrink-0"
            id="dashboard-footer-whatsapp-btn"
          />
        </div>

      </div>
    </div>
  );
};
