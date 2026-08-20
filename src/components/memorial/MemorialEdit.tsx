import React, { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { Memorial, PrivacyLevel, PlanTier, TimelineEvent, FamilyMember, MemorialEvent, Collaborator } from "../../types";
import { uploadMemorialAsset } from "../../lib/uploadFile";
import { getYouTubeThumbnail } from "../../lib/youtube";
import {
  Save,
  ArrowLeft,
  Eye,
  Sparkles,
  Image as ImageIcon,
  BookOpen,
  Clock,
  Heart,
  Users2,
  Calendar,
  Lock,
  QrCode,
  Shield,
  Trash2,
  Plus,
  CheckCircle2,
  XCircle,
  Loader2,
  Upload,
  Globe,
  KeyRound,
  Download,
  Share2,
  Music,
  Printer,
  Camera,
  Video,
  Play,
  Copy,
  Edit3,
} from "lucide-react";
import QRCode from "qrcode";

export const MemorialEdit: React.FC = () => {
  const {
    currentMemorial,
    updateMemorial,
    deleteMemorial,
    setCurrentView,
    openMemorialBySlug,
    activeEditTab,
    setActiveEditTab,
    generateStoryWithAI,
    moderateTribute,
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
    inviteCollaborator,
    removeCollaborator,
    notify,
    userUsage,
    setSelectedPlanForCheckout,
    setActivePrintableMemorial,
    currentUser,
  } = useApp();

  if (!currentMemorial) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] p-10 text-center">
        <p className="text-sm text-[#5C534B]">No hay un memorial seleccionado para editar.</p>
        <button
          onClick={() => setCurrentView("dashboard")}
          className="mt-4 px-5 py-2 rounded-full bg-[#24201D] text-white text-xs font-semibold"
        >
          Ir al Dashboard
        </button>
      </div>
    );
  }

  // Local Form State initialized from currentMemorial
  const [formData, setFormData] = useState<Memorial>(currentMemorial);
  const [isSaving, setIsSaving] = useState(false);

  // True when an admin opened this editor on a memorial they don't own —
  // e.g. to help a grieving family quickly, at the owner's request.
  const isEditingOnBehalf =
    currentUser?.role === "admin" &&
    currentMemorial.ownerId !== currentUser.id &&
    !currentMemorial.collaborators?.some((c) => c.email === currentUser.email);

  const activeEditTabRef = useRef<HTMLButtonElement>(null);
  const editMainPhotoRef = useRef<HTMLInputElement>(null);
  const editCoverPhotoRef = useRef<HTMLInputElement>(null);
  const editGalleryPhotoRef = useRef<HTMLInputElement>(null);

  // AI Assistant in Story Tab
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiNotes, setAiNotes] = useState("");
  const [aiPassions, setAiPassions] = useState("");
  const [aiTone, setAiTone] = useState("calido");

  // New item draft states
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoTitle, setNewPhotoTitle] = useState("");
  const [newPhotoAlbum, setNewPhotoAlbum] = useState("");

  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newAlbumTitle, setNewAlbumTitle] = useState("");

  const [newTimelineYear, setNewTimelineYear] = useState("");
  const [newTimelineTitle, setNewTimelineTitle] = useState("");
  const [newTimelineDesc, setNewTimelineDesc] = useState("");
  const [newTimelineCategory, setNewTimelineCategory] = useState<TimelineEvent["category"]>("momentos_clave");

  const [newFamilyName, setNewFamilyName] = useState("");
  const [newFamilyRelation, setNewFamilyRelation] = useState("");

  const [newEventTitle, setNewEventEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventAddress, setNewEventAddress] = useState("");
  const [newEventVirtualLink, setNewEventVirtualLink] = useState("");
  const [newEventType, setNewEventType] = useState<MemorialEvent["type"]>("ceremonia");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [newCollabName, setNewCollabName] = useState("");
  const [newCollabEmail, setNewCollabEmail] = useState("");
  const [newCollabRole, setNewCollabRole] = useState<Collaborator["role"]>("collaborator");

  // QR Code Canvas / Export
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  // La barra de pestañas se desborda horizontalmente (10 pestañas) — sin esto,
  // la pestaña activa puede quedar oculta fuera del área visible del scroll.
  React.useEffect(() => {
    activeEditTabRef.current?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }, [activeEditTab]);

  React.useEffect(() => {
    const memorialUrl = `${window.location.origin}/memorial/${formData.slug}`;
    QRCode.toDataURL(memorialUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#24201D",
        light: "#FAF7F2",
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error("Error generating QR:", err));
  }, [formData.slug]);

  const handleSaveGeneral = () => {
    setIsSaving(true);
    updateMemorial(formData.id, formData);
    setTimeout(() => {
      setIsSaving(false);
    }, 400);
  };

  const handleGenerateAIStory = async () => {
    if (!aiNotes && !aiPassions && !formData.personality && !formData.favoriteThings) {
      notify("warning", "Ingresa notas o anécdotas", "Escribe algunos recuerdos para que el asistente pueda redactar.");
      return;
    }
    setIsGeneratingAI(true);
    try {
      const result = await generateStoryWithAI({
        personName: formData.personName,
        birthDate: formData.birthDate,
        passingDate: formData.passingDate,
        birthPlace: formData.birthPlace,
        notes: aiNotes,
        passions: aiPassions,
        tone: aiTone,
        memorialType: formData.type,
        species: formData.species,
        breed: formData.breed,
        personality: formData.personality,
        favoriteThings: formData.favoriteThings,
        favoritePlace: formData.favoritePlace,
        arrivalStory: formData.arrivalStory,
        specialTrait: formData.specialTrait,
        anecdote: formData.anecdote,
      });

      setFormData((prev) => ({
        ...prev,
        biography: result.biography,
        summary: result.shortSummary || prev.summary,
        quote: result.memorialQuote || prev.quote,
      }));
      notify("success", "Biografía redactada con IA", "Revisa los párrafos y guarda los cambios.");
    } catch (e) {
      notify("error", "Error generando biografía con IA", "Intenta escribir directamente o prueba de nuevo.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddNewPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl) return;
    addMediaItem(formData.id, {
      memorialId: formData.id,
      type: "photo",
      url: newPhotoUrl,
      title: newPhotoTitle || "Fotografía de recuerdo",
      albumId: newPhotoAlbum || undefined,
      albumTitle: newPhotoAlbum ? formData.albums?.find((a) => a.id === newPhotoAlbum)?.title : undefined,
      uploaderName: formData.ownerName || "Administrador",
    });
    setNewPhotoUrl("");
    setNewPhotoTitle("");
  };

  const handleAddNewVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoUrl.trim()) return;
    const added = addMediaItem(formData.id, {
      memorialId: formData.id,
      type: "video",
      url: newVideoUrl.trim(),
      title: newVideoTitle || "Video familiar",
      uploaderName: formData.ownerName || "Administrador",
    });
    if (added !== false) {
      setNewVideoUrl("");
      setNewVideoTitle("");
    }
  };

  const handleAddNewAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle) return;
    createAlbum(formData.id, newAlbumTitle);
    setNewAlbumTitle("");
  };

  const handleAddNewTimeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimelineYear || !newTimelineTitle) return;
    addTimelineEvent(formData.id, {
      memorialId: formData.id,
      year: newTimelineYear,
      title: newTimelineTitle,
      description: newTimelineDesc,
      category: newTimelineCategory,
    });
    setNewTimelineYear("");
    setNewTimelineTitle("");
    setNewTimelineDesc("");
  };

  const handleAddNewFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName || !newFamilyRelation) return;
    addFamilyMember(formData.id, {
      memorialId: formData.id,
      name: newFamilyName,
      relationship: newFamilyRelation,
    });
    setNewFamilyName("");
    setNewFamilyRelation("");
  };

  const handleAddNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) return;
    const eventPayload = {
      memorialId: formData.id,
      title: newEventTitle,
      type: newEventType,
      date: newEventDate,
      time: newEventTime || "12:00",
      locationName: newEventLocation || "Lugar a confirmar",
      address: newEventAddress.trim() || undefined,
      virtualLink: newEventVirtualLink.trim() || undefined,
    };
    if (editingEventId) {
      updateEvent(formData.id, editingEventId, eventPayload);
      setEditingEventId(null);
    } else {
      addEvent(formData.id, eventPayload);
    }
    setNewEventEventTitle("");
    setNewEventDate("");
    setNewEventTime("");
    setNewEventLocation("");
    setNewEventAddress("");
    setNewEventVirtualLink("");
  };

  const startEditEvent = (ev: MemorialEvent) => {
    setEditingEventId(ev.id);
    setNewEventEventTitle(ev.title);
    setNewEventType(ev.type);
    setNewEventDate(ev.date);
    setNewEventTime(ev.time);
    setNewEventLocation(ev.locationName);
    setNewEventAddress(ev.address || "");
    setNewEventVirtualLink(ev.virtualLink || "");
  };

  const cancelEditEvent = () => {
    setEditingEventId(null);
    setNewEventEventTitle("");
    setNewEventDate("");
    setNewEventTime("");
    setNewEventLocation("");
    setNewEventAddress("");
    setNewEventVirtualLink("");
  };

  const copyEventInvite = (ev: MemorialEvent) => {
    const memorialUrl = `${window.location.origin}/m/${formData.slug}`;
    const lines = [
      `${ev.title} — en memoria de ${formData.personName}`,
      `${ev.date} a las ${ev.time}`,
      ev.locationName ? `Lugar: ${ev.locationName}` : "",
      ev.locationName && ev.locationName !== "Lugar a confirmar"
        ? `Cómo llegar: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.address || ev.locationName)}`
        : "",
      ev.virtualLink ? `Transmisión en vivo: ${ev.virtualLink}` : "",
      `Más detalles: ${memorialUrl}`,
    ].filter(Boolean);
    navigator.clipboard.writeText(lines.join("\n"));
    notify("success", "Invitación copiada", "Pégala en WhatsApp o envíala a la familia.");
  };

  const handleInviteCollab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollabName || !newCollabEmail) return;
    inviteCollaborator(formData.id, newCollabName, newCollabEmail, newCollabRole);
    setNewCollabName("");
    setNewCollabEmail("");
  };

  const navTabs = [
    { id: "general", label: "Datos", icon: Heart },
    { id: "story", label: "Historia", icon: BookOpen },
    { id: "media", label: "Galería", icon: ImageIcon, count: currentMemorial.media?.length },
    { id: "timeline", label: "Línea de Tiempo", icon: Clock, count: currentMemorial.timeline?.length },
    { id: "tributes", label: "Homenajes", icon: Shield, count: currentMemorial.tributes?.length },
    { id: "family", label: "Familia", icon: Users2, count: currentMemorial.family?.length },
    { id: "events", label: "Ceremonias", icon: Calendar, count: currentMemorial.events?.length },
    { id: "collaborators", label: "Colaboradores", icon: Users2, count: currentMemorial.collaborators?.length },
    { id: "privacy", label: "Privacidad", icon: Lock },
    { id: "qr", label: "QR", icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Admin Assisting Notice */}
        {isEditingOnBehalf && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <Shield className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900">
              Estás editando este memorial como <strong>administrador</strong>, en nombre de{" "}
              <strong>{currentMemorial.ownerName}</strong> ({currentMemorial.ownerEmail}). Úsalo solo para ayudas
              puntuales solicitadas por el cliente.
            </p>
          </div>
        )}

        {/* Top Control Bar */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE3D9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView(isEditingOnBehalf ? "admin" : "dashboard")}
              className="p-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F4EFEA] border border-[#D8CEBE] text-[#24201D] transition-colors"
              title={isEditingOnBehalf ? "Volver al Panel Administrativo" : "Volver al Dashboard"}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#7A4E38] block">
                Editor de Memorial
              </span>
              <h1 className="font-serif text-xl sm:text-2xl text-[#24201D] font-medium">
                {formData.personName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openMemorialBySlug(formData.slug)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#D8CEBE] bg-[#FAF7F2] hover:bg-white text-xs font-semibold text-[#24201D] transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Ver Memorial Público</span>
            </button>

            <button
              onClick={handleSaveGeneral}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-xs font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Selector Nav */}
        <div className="relative">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeEditTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={isActive ? activeEditTabRef : undefined}
                onClick={() => setActiveEditTab(tab.id as any)}
                className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#24201D] text-white shadow-xs"
                    : "bg-white text-[#5C534B] hover:bg-[#F4EFEA] border border-[#EAE3D9]"
                }`}
              >
                <Icon className={`w-3 h-3 ${isActive ? "text-[#C5A880]" : "text-[#8C827A]"}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-[#FAF7F2] text-[#7A4E38]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
          </div>
          <div className="pointer-events-none absolute top-0 bottom-2 left-0 w-8 bg-gradient-to-r from-[#FAF7F2] to-transparent" />
          <div className="pointer-events-none absolute top-0 bottom-2 right-0 w-8 bg-gradient-to-l from-[#FAF7F2] to-transparent" />
        </div>

        {/* TAB 1: DATOS GENERALES */}
        {activeEditTab === "general" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D9] shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#F4EFEA] pb-4">
              <h2 className="font-serif text-xl text-[#24201D] font-medium">Información Principal y Apariencia</h2>
              <p className="text-xs text-[#8C827A]">Nombres, fechas, fotografías de cabecera y ambientación.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                  Tipo de Memorial
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "person" })}
                    className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                      (formData.type || "person") === "person"
                        ? "bg-[#24201D] text-white border-[#24201D]"
                        : "bg-[#FAF7F2] text-[#5C534B] border-[#D8CEBE]"
                    }`}
                  >
                    <span>👤 Persona</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "pet" })}
                    className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                      formData.type === "pet"
                        ? "bg-[#24201D] text-white border-[#24201D]"
                        : "bg-[#FAF7F2] text-[#5C534B] border-[#D8CEBE]"
                    }`}
                  >
                    <span>🐾 Mascota (MEMORA Mascotas)</span>
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                  {formData.type === "pet" ? "Nombre de la Mascota" : "Nombre Completo"}
                </label>
                <input
                  type="text"
                  value={formData.personName}
                  onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
                />
              </div>

              {formData.type === "pet" && (
                <>
                  <div>
                    <label className="block font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                      Especie
                    </label>
                    <select
                      value={["perro", "gato", "ave", "conejo", "caballo"].includes(formData.species || "") ? formData.species : ""}
                      onChange={(e) => setFormData({ ...formData, species: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
                    >
                      <option value="">Prefiero no mostrar etiqueta</option>
                      <option value="perro">Perro 🐕</option>
                      <option value="gato">Gato 🐈</option>
                      <option value="ave">Ave 🦜</option>
                      <option value="conejo">Conejo 🐇</option>
                      <option value="caballo">Caballo 🐎</option>
                    </select>
                    <input
                      type="text"
                      value={formData.species || ""}
                      onChange={(e) => setFormData({ ...formData, species: e.target.value as any })}
                      placeholder="O escribe algo más personal: 'nuestro hijo peludo'..."
                      className="w-full mt-2 px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                      Raza / Tipo
                    </label>
                    <input
                      type="text"
                      value={formData.breed || ""}
                      onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                      placeholder="Ej. Golden Retriever / Mestizo"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                  {formData.type === "pet" ? "Apodo o nombre cariñoso" : "Nombre Cariñoso / Apodo"}
                </label>
                <input
                  type="text"
                  value={formData.preferredName || ""}
                  onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                  placeholder={formData.type === "pet" ? "Ej. Mateo, Teíto" : "Ej. Abuela Tere"}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                  Lugar de Nacimiento / Origen
                </label>
                <input
                  type="text"
                  value={formData.birthPlace || ""}
                  onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                  placeholder="Ej. Valparaíso, Chile"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                  {formData.type === "pet" ? "Fecha de Llegada / Nacimiento" : "Fecha de Nacimiento"}
                </label>
                <input
                  type="date"
                  value={formData.birthDate || ""}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                  Fecha de Partida
                </label>
                <input
                  type="date"
                  value={formData.passingDate || ""}
                  onChange={(e) => setFormData({ ...formData, passingDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                  {formData.type === "pet" ? "Lugar de descanso o memorial en casa" : "Lugar de Descanso o Sepelio"}
                </label>
                <input
                  type="text"
                  value={formData.restingPlace || ""}
                  onChange={(e) => setFormData({ ...formData, restingPlace: e.target.value })}
                  placeholder={formData.type === "pet" ? "Ej. Bajo su árbol favorito en el jardín" : "Ej. Cementerio Parque del Mar, Concón"}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                  Cita o Frase Representativa
                </label>
                <input
                  type="text"
                  value={formData.quote || ""}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder={formData.type === "pet" ? "Ej. Un compañero fiel que vivirá por siempre en nuestros corazones." : "Ej. Vivió con amor y dedicación profunda."}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
                />
              </div>

              {/* Hidden file inputs for editing memorial photos */}
              <input
                type="file"
                ref={editMainPhotoRef}
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !currentMemorial) return;
                  if (file.size > 15 * 1024 * 1024) {
                    notify("warning", "Imagen muy pesada", "El archivo debe pesar menos de 15MB.");
                    return;
                  }
                  try {
                    const url = await uploadMemorialAsset(currentMemorial.id, "main", file);
                    setFormData((prev) => ({ ...prev, mainPhoto: url }));
                    notify("success", "Foto actualizada", "Has cargado un nuevo retrato.");
                  } catch (err: any) {
                    notify("error", "No se pudo subir la foto", err?.message || "Intenta nuevamente.");
                  }
                }}
              />

              <input
                type="file"
                ref={editCoverPhotoRef}
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !currentMemorial) return;
                  if (file.size > 20 * 1024 * 1024) {
                    notify("warning", "Imagen muy pesada", "El archivo debe pesar menos de 20MB.");
                    return;
                  }
                  try {
                    const url = await uploadMemorialAsset(currentMemorial.id, "cover", file);
                    setFormData((prev) => ({ ...prev, coverPhoto: url }));
                    notify("success", "Portada actualizada", "Has cargado una nueva portada.");
                  } catch (err: any) {
                    notify("error", "No se pudo subir la foto", err?.message || "Intenta nuevamente.");
                  }
                }}
              />

              {/* Photos URLs & Uploads */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-[#24201D] uppercase tracking-wider">
                    Foto Principal (Retrato)
                  </label>
                  <button
                    type="button"
                    onClick={() => editMainPhotoRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#F4EFEA] border border-[#D8CEBE] text-[11px] font-semibold text-[#24201D] cursor-pointer"
                  >
                    <Upload className="w-3 h-3 text-[#C5A880]" />
                    <span>Subir archivo</span>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={formData.mainPhoto}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover border border-[#C5A880] flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={formData.mainPhoto}
                    onChange={(e) => setFormData({ ...formData, mainPhoto: e.target.value })}
                    placeholder="Pega URL o usa 'Subir archivo'"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-[#24201D] uppercase tracking-wider">
                    Foto de Portada (Fondo Panorámico)
                  </label>
                  <button
                    type="button"
                    onClick={() => editCoverPhotoRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#F4EFEA] border border-[#D8CEBE] text-[11px] font-semibold text-[#24201D] cursor-pointer"
                  >
                    <Upload className="w-3 h-3 text-[#C5A880]" />
                    <span>Subir archivo</span>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={formData.coverPhoto}
                    alt=""
                    className="w-16 h-12 rounded-xl object-cover border border-[#C5A880] flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={formData.coverPhoto || ""}
                    onChange={(e) => setFormData({ ...formData, coverPhoto: e.target.value })}
                    placeholder="Pega URL o usa 'Subir archivo'"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
                  />
                </div>
              </div>

              {/* Background Music Setting */}
              <div className="sm:col-span-2 pt-4 border-t border-[#F4EFEA]">
                <label className="block font-semibold text-[#24201D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-[#C5A880]" />
                  Ambientación Musical Conmemorativa
                </label>
                <input
                  type="text"
                  value={formData.backgroundMusicTitle || ""}
                  onChange={(e) => setFormData({ ...formData, backgroundMusicTitle: e.target.value })}
                  placeholder="Ej. Serenidad al Atardecer — Piano Acústico"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
                />
                <p className="text-[11px] text-[#8C827A] mt-1">
                  Los visitantes pueden reproducir una melodía de piano pacífica generada por sintetizador mientras leen sus recuerdos.
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSaveGeneral}
                className="px-6 py-2.5 rounded-full bg-[#24201D] text-white text-xs font-semibold hover:bg-[#3D3530] transition-colors"
              >
                Guardar Cambios Generales
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: HISTORIA & BIOGRAFÍA CON IA */}
        {activeEditTab === "story" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D9] shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#F4EFEA] pb-4">
              <h2 className="font-serif text-xl text-[#24201D] font-medium">Historia de Vida y Biografía</h2>
              <p className="text-xs text-[#8C827A]">
                Escribe la historia o utiliza el Asistente Editorial con IA para redactar con calidez y respeto.
              </p>
            </div>

            {/* AI Assistant Drawer */}
            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] space-y-4 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#C5A880]/20 flex items-center justify-center text-[#7A4E38]">
                  <Sparkles className="w-4 h-4 text-[#C5A880]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#7A4E38] uppercase tracking-wider">
                    Asistente de Redacción Biográfica MEMORA
                  </h4>
                  <p className="text-[11px] text-[#8C827A]">
                    Convierte anécdotas dispersas en una semblanza conmovedora y digna.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#24201D] mb-1">Notas, anécdotas y recuerdos:</label>
                  <textarea
                    rows={3}
                    value={aiNotes}
                    onChange={(e) => setAiNotes(e.target.value)}
                    placeholder="Ej. Trabajó 35 años con vocación de servicio, le apasionaba cuidar su jardín de rosas, sus nietos..."
                    className="w-full p-3 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#24201D] mb-1">Pasiones y legado familiar:</label>
                  <textarea
                    rows={3}
                    value={aiPassions}
                    onChange={(e) => setAiPassions(e.target.value)}
                    placeholder="Ej. La cocina tradicional, la música de boleros, reuniones de domingo..."
                    className="w-full p-3 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-[#7A4E38]">Tono:</span>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    className="px-3 py-1 rounded-lg bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  >
                    <option value="calido">Cálido y familiar</option>
                    <option value="clasico">Solemne y respetuoso</option>
                    <option value="poetico">Poético y sereno</option>
                    <option value="intimo">Íntimo y tierno</option>
                  </select>
                </div>

                <button
                  type="button"
                  disabled={isGeneratingAI}
                  onClick={handleGenerateAIStory}
                  className="px-5 py-2.5 rounded-full bg-[#24201D] text-white text-xs font-semibold flex items-center gap-2 hover:bg-[#3D3530] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />
                      <span>Redactando con sensibilidad...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Generar Biografía con IA</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* PET SPECIFIC RECOLLECTION FIELDS */}
            {formData.type === "pet" && (
              <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] space-y-4 text-xs">
                <h4 className="font-bold text-[#7A4E38] uppercase tracking-wider flex items-center gap-2">
                  <span>🐾 Detalles Especiales de su Vida</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#24201D] mb-1">
                      Personalidad & Carácter
                    </label>
                    <input
                      type="text"
                      value={formData.personality || ""}
                      onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                      placeholder="Ej. Alegre, protector, leal, cariñoso"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#24201D] mb-1">
                      Lo que más le encantaba
                    </label>
                    <input
                      type="text"
                      value={formData.favoriteThings || ""}
                      onChange={(e) => setFormData({ ...formData, favoriteThings: e.target.value })}
                      placeholder="Ej. Correr en la playa, su pelota amarilla"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#24201D] mb-1">
                      Su rincón favorito
                    </label>
                    <input
                      type="text"
                      value={formData.favoritePlace || ""}
                      onChange={(e) => setFormData({ ...formData, favoritePlace: e.target.value })}
                      placeholder="Ej. Al lado del sillón de la sala donde daba el sol"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#24201D] mb-1">
                      Cómo llegó a nuestras vidas
                    </label>
                    <input
                      type="text"
                      value={formData.arrivalStory || ""}
                      onChange={(e) => setFormData({ ...formData, arrivalStory: e.target.value })}
                      placeholder="Ej. Lo rescatamos en una tarde lluviosa de 2011"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-[#24201D] mb-1">
                      Lo que lo hacía único / Rasgo especial
                    </label>
                    <input
                      type="text"
                      value={formData.specialTrait || ""}
                      onChange={(e) => setFormData({ ...formData, specialTrait: e.target.value })}
                      placeholder="Ej. Nos recibía siempre con su juguete en la boca dando vueltas de alegría"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-[#24201D] mb-1">
                      Una anécdota inolvidable
                    </label>
                    <textarea
                      rows={2}
                      value={formData.anecdote || ""}
                      onChange={(e) => setFormData({ ...formData, anecdote: e.target.value })}
                      placeholder="Ej. Una tarde de verano se escapó directo al lago y nadó con los patos..."
                      className="w-full p-3 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Summary Field */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider">
                Resumen Breve (Cabecera)
              </label>
              <textarea
                rows={2}
                value={formData.summary || ""}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
              />
            </div>

            {/* Full Biography Text */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider">
                Biografía Completa
              </label>
              <textarea
                rows={10}
                value={formData.biography || ""}
                onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                className="w-full p-4 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D] leading-relaxed"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveGeneral}
                className="px-6 py-2.5 rounded-full bg-[#24201D] text-white text-xs font-semibold hover:bg-[#3D3530] transition-colors"
              >
                Guardar Historia
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: GALERÍA & FOTOGRAFÍAS */}
        {activeEditTab === "media" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D9] shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#F4EFEA] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl text-[#24201D] font-medium">Galería y Recuerdos Fotográficos</h2>
                <p className="text-xs text-[#8C827A]">
                  Agrega nuevas imágenes, crea álbumes temáticos y organiza los momentos especiales.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-[#7A4E38] font-medium bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#D8CEBE]">
                  Bolsa de Fotos: <strong className="font-mono">{userUsage.photosUsed} / {userUsage.photosMax}</strong> ({userUsage.photosRemaining} disponibles)
                </span>
              </div>
            </div>

            {/* Shared Quota Banner */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs text-[#24201D] font-semibold flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#7A4E38]" />
                  Almacenamiento Global Compartido · Plan {userUsage.plan.name}
                </p>
                <p className="text-[11px] text-[#5C534B]">
                  Las fotos y videos no tienen un límite aislado por memorial: forman una bolsa total compartida por tu cuenta ({userUsage.photosMax} fotos y {userUsage.videosMax} videos en total).
                </p>
              </div>

              {userUsage.photosRemaining <= 2 && userUsage.plan.id !== "legado" && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlanForCheckout(userUsage.plan.id === "esencial" ? "familia" : "legado");
                    setCurrentView("pricing");
                  }}
                  className="px-4 py-2 rounded-full bg-[#7A4E38] text-white hover:bg-[#623D2C] text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors shadow-xs flex-shrink-0"
                >
                  Ampliar Bolsa de Fotos
                </button>
              )}
            </div>

            {/* Add Photo, Video & Add Album row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Photo Card */}
              <form onSubmit={handleAddNewPhoto} className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] space-y-3 text-xs">
                <h4 className="font-bold text-[#24201D] uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                  Agregar Fotografía
                </h4>
                {/* Hidden gallery file input */}
                <input
                  type="file"
                  ref={editGalleryPhotoRef}
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !currentMemorial) return;
                    if (file.size > 15 * 1024 * 1024) {
                      notify("warning", "Imagen muy pesada", "El archivo debe pesar menos de 15MB.");
                      return;
                    }
                    try {
                      const url = await uploadMemorialAsset(currentMemorial.id, "gallery", file);
                      setNewPhotoUrl(url);
                      notify("info", "Imagen cargada", "Completa el título y presiona 'Subir Fotografía'.");
                    } catch (err: any) {
                      notify("error", "No se pudo subir la foto", err?.message || "Intenta nuevamente.");
                    }
                  }}
                />

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[#5C534B]">Imagen *</label>
                    <button
                      type="button"
                      onClick={() => editGalleryPhotoRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-[#F4EFEA] border border-[#D8CEBE] text-[11px] font-semibold text-[#24201D] cursor-pointer"
                    >
                      <Upload className="w-3 h-3 text-[#C5A880]" />
                      <span>Subir archivo</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="URL de imagen o presiona 'Subir archivo'"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  />
                  {newPhotoUrl && (
                    <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-[#C5A880]">
                      <img src={newPhotoUrl} alt="Vista previa" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[#5C534B] mb-1">Título o descripción</label>
                  <input
                    type="text"
                    value={newPhotoTitle}
                    onChange={(e) => setNewPhotoTitle(e.target.value)}
                    placeholder="Ej. Vacaciones en el campo, 1984"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  />
                </div>
                <div>
                  <label className="block text-[#5C534B] mb-1">Álbum (Opcional)</label>
                  <select
                    value={newPhotoAlbum}
                    onChange={(e) => setNewPhotoAlbum(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  >
                    <option value="">Sin álbum específico</option>
                    {formData.albums?.map((alb) => (
                      <option key={alb.id} value={alb.id}>
                        {alb.title}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-[#24201D] text-white font-semibold hover:bg-[#3D3530] transition-colors"
                >
                  Subir Fotografía
                </button>
              </form>

              {/* Video Option Card */}
              <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] space-y-3 text-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="font-bold text-[#24201D] uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#C5A880]" />
                    Videos del Recuerdo
                  </h4>
                  {userUsage.videosMax === 0 ? (
                    <div className="p-4 rounded-xl bg-white border border-[#EAE3D9] space-y-3">
                      <p className="text-xs text-[#5C534B] leading-relaxed">
                        Los videos están disponibles desde <strong>MEMORA Familia</strong>.
                      </p>
                      <p className="text-[11px] text-[#8C827A]">
                        Podrás conservar clips con audio, momentos familiares grabados y testimonios en video.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlanForCheckout("familia");
                          setCurrentView("pricing");
                        }}
                        className="w-full py-2 rounded-full bg-[#7A4E38] text-white font-semibold hover:bg-[#623D2C] transition-colors cursor-pointer text-xs"
                      >
                        Ver planes
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleAddNewVideo} className="space-y-2">
                      <p className="text-xs text-[#5C534B]">
                        Tienes <strong>{userUsage.videosRemaining}</strong> de {userUsage.videosMax} videos disponibles en tu plan.
                      </p>
                      <input
                        type="text"
                        required
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        placeholder="Enlace de YouTube del video"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                      />
                      <input
                        type="text"
                        value={newVideoTitle}
                        onChange={(e) => setNewVideoTitle(e.target.value)}
                        placeholder="Título del video (opcional)"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                      />
                      <p className="text-[10px] text-[#8C827A]">
                        Sube el video a tu propia cuenta de YouTube (puede ser "No listado") y pega aquí el enlace — así el video queda bajo tu control, no ocupa espacio de tu plan de almacenamiento de fotos.
                      </p>
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-full bg-[#24201D] text-white font-semibold hover:bg-[#3D3530] transition-colors"
                      >
                        Agregar Video
                      </button>
                    </form>
                  )}
                </div>
                <div className="text-[11px] text-[#8C827A] pt-2 border-t border-[#EAE3D9]">
                  Límite global: {userUsage.videosMax} video(s) totales por plan.
                </div>
              </div>

              {/* Add Album Card */}
              <form onSubmit={handleAddNewAlbum} className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] space-y-3 text-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="font-bold text-[#24201D] uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                    Crear Nuevo Álbum Temático
                  </h4>
                  <div>
                    <label className="block text-[#5C534B] mb-1">Título del Álbum *</label>
                    <input
                      type="text"
                      required
                      value={newAlbumTitle}
                      onChange={(e) => setNewAlbumTitle(e.target.value)}
                      placeholder="Ej. Recuerdos de Juventud, En Familia..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                    />
                  </div>
                  <p className="text-[11px] text-[#8C827A]">
                    Los álbumes te permiten clasificar decenas de fotografías por épocas o reuniones familiares.
                  </p>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-white border border-[#D8CEBE] text-[#24201D] font-semibold hover:bg-[#FAF7F2] transition-colors"
                >
                  Crear Álbum
                </button>
              </form>
            </div>

            {/* Media Items Grid */}
            <div className="space-y-3 pt-4 border-t border-[#F4EFEA]">
              <h3 className="font-serif text-lg text-[#24201D] font-medium">
                Fotos y videos en este Memorial ({currentMemorial.media?.length || 0})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {currentMemorial.media?.map((item) => (
                  <div key={item.id} className="group relative rounded-2xl overflow-hidden bg-stone-100 border border-[#EAE3D9] aspect-square">
                    {item.type === "video" ? (
                      <div className="relative w-full h-full bg-[#24201D]">
                        {getYouTubeThumbnail(item.url) && (
                          <img src={getYouTubeThumbnail(item.url)!} alt={item.title} className="w-full h-full object-cover opacity-70" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                      </div>
                    ) : (
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 text-white">
                      <p className="text-[11px] font-medium truncate">{item.title}</p>
                      <button
                        type="button"
                        onClick={() => deleteMediaItem(formData.id, item.id)}
                        className="self-end p-1.5 rounded-full bg-red-600/90 text-white hover:bg-red-700 transition-colors"
                        title="Eliminar foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LÍNEA DE TIEMPO */}
        {activeEditTab === "timeline" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D9] shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#F4EFEA] pb-4">
              <h2 className="font-serif text-xl text-[#24201D] font-medium">Línea de Tiempo y Momentos Clave</h2>
              <p className="text-xs text-[#8C827A]">
                Construye el recorrido cronológico de su vida, desde sus primeros pasos hasta su legado.
              </p>
            </div>

            <form onSubmit={handleAddNewTimeline} className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] space-y-4 text-xs">
              <h4 className="font-bold text-[#24201D] uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                Agregar Hito Cronológico
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#5C534B] mb-1">Año o Época *</label>
                  <input
                    type="text"
                    required
                    value={newTimelineYear}
                    onChange={(e) => setNewTimelineYear(e.target.value)}
                    placeholder="Ej. 1968 o 'Años 80'"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  />
                </div>
                <div>
                  <label className="block text-[#5C534B] mb-1">Título del momento *</label>
                  <input
                    type="text"
                    required
                    value={newTimelineTitle}
                    onChange={(e) => setNewTimelineTitle(e.target.value)}
                    placeholder="Ej. Matrimonio con Luis"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  />
                </div>
                <div>
                  <label className="block text-[#5C534B] mb-1">Categoría</label>
                  <select
                    value={newTimelineCategory}
                    onChange={(e) => setNewTimelineCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  >
                    <option value="infancia">Infancia y Raíces</option>
                    <option value="familia">Familia y Hogar</option>
                    <option value="estudios_trabajo">Vocación y Trabajo</option>
                    <option value="viajes">Viajes y Aventuras</option>
                    <option value="momentos_clave">Momentos Inolvidables</option>
                    <option value="legado">Legado y Gratitud</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[#5C534B] mb-1">Descripción del recuerdo</label>
                  <textarea
                    rows={2}
                    value={newTimelineDesc}
                    onChange={(e) => setNewTimelineDesc(e.target.value)}
                    placeholder="Breve relato de lo que significó este momento en su vida..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#24201D] text-white font-semibold hover:bg-[#3D3530] transition-colors"
              >
                Agregar a la Línea de Tiempo
              </button>
            </form>

            <div className="space-y-3 pt-4 border-t border-[#F4EFEA]">
              <h3 className="font-serif text-lg text-[#24201D] font-medium">Hitos Registrados</h3>
              {currentMemorial.timeline?.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="font-bold text-[#7A4E38] block">{item.year} — {item.title}</span>
                    <p className="text-[#5C534B] mt-0.5">{item.description}</p>
                  </div>
                  <button
                    onClick={() => deleteTimelineEvent(formData.id, item.id)}
                    className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: MODERACIÓN DE HOMENAJES */}
        {activeEditTab === "tributes" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D9] shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#F4EFEA] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl text-[#24201D] font-medium">Moderación de Homenajes y Condolencias</h2>
                <p className="text-xs text-[#8C827A]">
                  Aprueba, rechaza o elimina los mensajes dejados por visitantes para mantener el respeto y la armonía.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#5C534B]">Aprobación automática:</span>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !formData.enableTributeAutoApproval;
                    setFormData({ ...formData, enableTributeAutoApproval: nextVal });
                    updateMemorial(formData.id, { enableTributeAutoApproval: nextVal });
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    formData.enableTributeAutoApproval
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {formData.enableTributeAutoApproval ? "Activada" : "Manual (Requiere Aprobación)"}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {currentMemorial.tributes?.length === 0 ? (
                <p className="text-xs text-[#8C827A] text-center py-8">Aún no hay homenajes dejados en este memorial.</p>
              ) : (
                currentMemorial.tributes?.map((tr) => (
                  <div
                    key={tr.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-2 text-xs ${
                      tr.status === "approved"
                        ? "bg-[#FAF7F2] border-[#EAE3D9]"
                        : tr.status === "pending"
                        ? "bg-amber-50/60 border-amber-200"
                        : "bg-red-50/50 border-red-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#24201D]">{tr.authorName}</span>
                        {tr.relationship && (
                          <span className="text-[#8C827A] ml-2">({tr.relationship})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            tr.status === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : tr.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tr.status}
                        </span>
                        <span className="text-[10px] text-[#8C827A]">
                          {new Date(tr.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-[#3D3530] text-sm leading-relaxed">{tr.message}</p>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      {tr.status !== "approved" && (
                        <button
                          onClick={() => moderateTribute(formData.id, tr.id, "approved")}
                          className="px-3 py-1 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Aprobar
                        </button>
                      )}
                      {tr.status === "approved" && (
                        <button
                          onClick={() => moderateTribute(formData.id, tr.id, "rejected")}
                          className="px-3 py-1 rounded-full bg-amber-600 text-white hover:bg-amber-700 text-xs font-semibold flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Ocultar
                        </button>
                      )}
                      <button
                        onClick={() => moderateTribute(formData.id, tr.id, "deleted")}
                        className="px-3 py-1 rounded-full bg-stone-200 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 6: FAMILIA */}
        {activeEditTab === "family" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D9] shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#F4EFEA] pb-4">
              <h2 className="font-serif text-xl text-[#24201D] font-medium">Familia y Vínculos Afectivos</h2>
              <p className="text-xs text-[#8C827A]">
                Registra los lazos familiares más queridos (hijos, cónyuge, padres, nietos, hermanos).
              </p>
            </div>

            <form onSubmit={handleAddNewFamily} className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] space-y-4 text-xs">
              <h4 className="font-bold text-[#24201D] uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                Agregar Miembro de la Familia
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#5C534B] mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    placeholder="Ej. Luis González Martínez"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  />
                </div>
                <div>
                  <label className="block text-[#5C534B] mb-1">Parentesco o Relación *</label>
                  <input
                    type="text"
                    required
                    value={newFamilyRelation}
                    onChange={(e) => setNewFamilyRelation(e.target.value)}
                    placeholder="Ej. Esposo, Hija mayor, Nieto..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#24201D] text-white font-semibold hover:bg-[#3D3530] transition-colors"
              >
                Agregar Familiar
              </button>
            </form>

            <div className="space-y-3 pt-4 border-t border-[#F4EFEA]">
              <h3 className="font-serif text-lg text-[#24201D] font-medium">Familiares Registrados</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentMemorial.family?.map((f) => (
                  <div key={f.id} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#24201D] block">{f.name}</span>
                      <span className="text-[#7A4E38] font-medium">{f.relationship}</span>
                    </div>
                    <button
                      onClick={() => deleteFamilyMember(formData.id, f.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: CEREMONIAS */}
        {activeEditTab === "events" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D9] shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#F4EFEA] pb-4">
              <h2 className="font-serif text-xl text-[#24201D] font-medium">Ceremonias, Misas y Homenajes</h2>
              <p className="text-xs text-[#8C827A]">
                Informa a los familiares y amigos sobre fechas, horarios y ubicaciones de las ceremonias o misas de aniversario.
              </p>
            </div>

            <form onSubmit={handleAddNewEvent} className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] space-y-4 text-xs">
              <h4 className="font-bold text-[#24201D] uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                {editingEventId ? "Editar Ceremonia" : "Agregar Ceremonia o Homenaje"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#5C534B] mb-1">Tipo de Evento</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  >
                    <option value="ceremonia">Ceremonia de Despedida</option>
                    <option value="misa">Misa de Recuerdo / Aniversario</option>
                    <option value="homenaje_virtual">Homenaje Virtual</option>
                    <option value="reunion_familiar">Reunión Familiar Íntima</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#5C534B] mb-1">Título del Evento *</label>
                  <input
                    type="text"
                    required
                    value={newEventTitle}
                    onChange={(e) => setNewEventEventTitle(e.target.value)}
                    placeholder="Ej. Misa del Primer Mes"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  />
                </div>
                <div>
                  <label className="block text-[#5C534B] mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  />
                </div>
                <div>
                  <label className="block text-[#5C534B] mb-1">Hora</label>
                  <input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[#5C534B] mb-1">Lugar</label>
                  <input
                    type="text"
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    placeholder="Ej. Parroquia San Pedro de Reñaca"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[#5C534B] mb-1">Enlace en vivo (opcional)</label>
                  <input
                    type="url"
                    value={newEventVirtualLink}
                    onChange={(e) => setNewEventVirtualLink(e.target.value)}
                    placeholder="Ej. link de YouTube, Zoom o Meet"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[#5C534B] mb-1">Dirección exacta (opcional)</label>
                  <input
                    type="text"
                    value={newEventAddress}
                    onChange={(e) => setNewEventAddress(e.target.value)}
                    placeholder="Ej. Av. Borgoño 14500, Reñaca, Viña del Mar"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  />
                </div>
              </div>
              <p className="text-[10px] text-[#8C827A] -mt-2">
                La dirección exacta se usa para el botón "Cómo llegar" que verán tus invitados — si la dejas en blanco, se usa el nombre del lugar. MEMORA no transmite la ceremonia: el enlace en vivo es de tu propia cuenta de YouTube, Zoom, Meet u otra plataforma — solo lo publicamos aquí para que la familia lo encuentre.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#24201D] text-white font-semibold hover:bg-[#3D3530] transition-colors"
                >
                  {editingEventId ? "Guardar Cambios" : "Publicar Ceremonia"}
                </button>
                {editingEventId && (
                  <button
                    type="button"
                    onClick={cancelEditEvent}
                    className="px-5 py-2.5 rounded-full bg-white border border-[#D8CEBE] text-[#5C534B] font-semibold hover:bg-[#F4EFEA] transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-3 pt-4 border-t border-[#F4EFEA]">
              <h3 className="font-serif text-lg text-[#24201D] font-medium">Ceremonias Programadas</h3>
              {currentMemorial.events && currentMemorial.events.length > 0 ? (
                currentMemorial.events.map((ev) => (
                  <div key={ev.id} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-xs space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-bold text-[#24201D] text-sm">{ev.title}</span>
                        <p className="text-[#5C534B] mt-0.5">
                          {ev.date} a las {ev.time} — <strong>{ev.locationName}</strong>
                        </p>
                        {ev.virtualLink && (
                          <p className="text-[#7A4E38] mt-0.5 truncate">🔗 {ev.virtualLink}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => copyEventInvite(ev)}
                          title="Copiar invitación"
                          className="p-1.5 text-stone-400 hover:text-[#24201D] rounded-lg"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditEvent(ev)}
                          title="Editar"
                          className="p-1.5 text-stone-400 hover:text-[#24201D] rounded-lg"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("¿Eliminar esta ceremonia?")) deleteEvent(formData.id, ev.id);
                          }}
                          title="Eliminar"
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#8C827A]">Aún no has agregado ninguna ceremonia.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: COLABORADORES */}
        {activeEditTab === "collaborators" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D9] shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#F4EFEA] pb-4">
              <h2 className="font-serif text-xl text-[#24201D] font-medium">Colaboración Familiar</h2>
              <p className="text-xs text-[#8C827A]">
                Invita a otros familiares a administrar, subir recuerdos y moderar mensajes juntos.
              </p>
            </div>

            <form onSubmit={handleInviteCollab} className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] space-y-4 text-xs">
              <h4 className="font-bold text-[#24201D] uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                Invitar a un Familiar o Co-Administrador
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#5C534B] mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={newCollabName}
                    onChange={(e) => setNewCollabName(e.target.value)}
                    placeholder="Ej. Carmen González"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  />
                </div>
                <div>
                  <label className="block text-[#5C534B] mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={newCollabEmail}
                    onChange={(e) => setNewCollabEmail(e.target.value)}
                    placeholder="carmen@familia.com"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  />
                </div>
                <div>
                  <label className="block text-[#5C534B] mb-1">Rol de Permiso</label>
                  <select
                    value={newCollabRole}
                    onChange={(e) => setNewCollabRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  >
                    <option value="admin">Administrador (Control total)</option>
                    <option value="collaborator">Colaborador (Subir fotos y editar)</option>
                    <option value="viewer">Lector Especial (Ver contenido privado)</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#24201D] text-white font-semibold hover:bg-[#3D3530] transition-colors"
              >
                Enviar Invitación
              </button>
            </form>

            <div className="space-y-3 pt-4 border-t border-[#F4EFEA]">
              <h3 className="font-serif text-lg text-[#24201D] font-medium">Equipo de Colaboradores</h3>
              {currentMemorial.collaborators?.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#24201D] block">{c.name}</span>
                    <span className="text-[#8C827A]">{c.email} — <strong className="capitalize text-[#7A4E38]">{c.role}</strong></span>
                  </div>
                  {c.role !== "owner" && (
                    <button
                      onClick={() => removeCollaborator(formData.id, c.id)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: PRIVACIDAD */}
        {activeEditTab === "privacy" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D9] shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#F4EFEA] pb-4">
              <h2 className="font-serif text-xl text-[#24201D] font-medium">Privacidad y Configuración de Acceso</h2>
              <p className="text-xs text-[#8C827A]">Configura quién tiene permiso para visitar este espacio conmemorativo.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: "public",
                    title: "Público",
                    desc: "Cualquier persona con el enlace puede visitarlo.",
                    icon: Globe,
                  },
                  {
                    id: "password",
                    title: "Protegido por Clave",
                    desc: "Requiere contraseña para ver fotos y homenajes.",
                    icon: KeyRound,
                  },
                  {
                    id: "private",
                    title: "Privado (Solo Invitados)",
                    desc: "Solo familiares con invitación.",
                    icon: Lock,
                  },
                ].map((p) => {
                  const Icon = p.icon;
                  const isSelected = formData.privacy === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setFormData({ ...formData, privacy: p.id as PrivacyLevel })}
                      className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                        isSelected
                          ? "bg-[#FAF7F2] border-[#C5A880] ring-1 ring-[#C5A880]"
                          : "bg-white border-[#EAE3D9] hover:border-[#D8CEBE]"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? "bg-[#C5A880] text-white" : "bg-[#FAF7F2] text-[#7A4E38]"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-[#24201D] block">{p.title}</span>
                        <span className="text-[#5C534B] text-[11px]">{p.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {formData.privacy === "password" && (
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] space-y-2">
                  <label className="block font-semibold text-[#24201D] uppercase tracking-wider">
                    Contraseña de Acceso
                  </label>
                  <input
                    type="password"
                    value={formData.password || ""}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Escribe la clave secreta familiar"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                  />
                </div>
              )}

              <div className="pt-6 border-t border-[#F4EFEA] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-red-600">Zona de Peligro</h4>
                  <p className="text-[#8C827A]">Eliminar este memorial permanentemente.</p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("¿Estás seguro de que deseas eliminar este memorial? Esta acción no se puede deshacer.")) {
                      deleteMemorial(formData.id);
                    }
                  }}
                  className="px-4 py-2 rounded-full border border-red-300 text-red-600 hover:bg-red-50 font-semibold"
                >
                  Eliminar Memorial
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: PLACA QR & EXPORTACIÓN */}
        {activeEditTab === "qr" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D9] shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#F4EFEA] pb-4">
              <h2 className="font-serif text-xl text-[#24201D] font-medium">Placa Conmemorativa & Código QR</h2>
              <p className="text-xs text-[#8C827A]">
                Descarga el código QR oficial de alta resolución para imprimir en tarjetas de ceremonia, obituarios o placas de bronce.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Plaque Preview */}
              <div className="p-8 rounded-3xl bg-gradient-to-b from-[#24201D] to-[#171412] text-[#FAF7F2] border-2 border-[#C5A880]/50 shadow-2xl text-center space-y-4 max-w-sm mx-auto">
                <div className="w-8 h-8 mx-auto rounded-full border border-[#C5A880] flex items-center justify-center">
                  <Heart className="w-4 h-4 text-[#C5A880]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">En Memoria Eterna</p>
                  <h3 className="font-serif text-xl font-medium mt-1">{formData.personName}</h3>
                  <p className="text-[11px] text-stone-300">
                    {formData.birthDate ? formData.birthDate.split("-")[0] : "1942"} — {formData.passingDate ? formData.passingDate.split("-")[0] : "2023"}
                  </p>
                </div>

                {qrCodeDataUrl && (
                  <div className="p-3 bg-white rounded-2xl w-40 h-40 mx-auto shadow-inner">
                    <img src={qrCodeDataUrl} alt="QR Memorial" className="w-full h-full object-contain" />
                  </div>
                )}

                <p className="text-[10px] text-stone-400 font-serif italic">
                  Escanea para descubrir su historia, fotos y dejar un homenaje.
                </p>
                <div className="pt-2 border-t border-[#C5A880]/20 text-[9px] text-[#C5A880] font-sans tracking-widest uppercase">
                  MEMORA · Recuerdos Para Siempre
                </div>
              </div>

              {/* QR Options & Download Actions */}
              <div className="space-y-4 text-xs">
                <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] space-y-3">
                  <h4 className="font-bold text-[#24201D] uppercase tracking-wider">Usos Recomendados del Código QR</h4>
                  <ul className="space-y-2 text-[#5C534B]">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] mt-1.5 flex-shrink-0"></span>
                      <span><strong>Placas de metal o mármol:</strong> Grabado láser para lápidas, nichos o columbarios.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] mt-1.5 flex-shrink-0"></span>
                      <span><strong>Estampas y recordatorios impresos:</strong> Para entregar a familiares durante el funeral o misa.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] mt-1.5 flex-shrink-0"></span>
                      <span><strong>Álbumes familiares físicos:</strong> Vincula el libro de fotos con la galería digital interactiva.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setActivePrintableMemorial(formData)}
                    className="w-full py-3 rounded-full bg-[#FAF7F2] hover:bg-[#F4EFEA] border-2 border-[#C5A880] text-[#7A4E38] font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-[#C5A880]" />
                    <span>🖼️ Crear Recuerdo para Imprimir (Cuadro, Urna, Placa)</span>
                  </button>

                  <a
                    href={qrCodeDataUrl}
                    download={`MEMORA-QR-${formData.slug}.png`}
                    className="w-full py-3 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <Download className="w-4 h-4 text-[#C5A880]" />
                    <span>Descargar solo Código QR (PNG)</span>
                  </a>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/memorial/${formData.slug}`);
                      notify("success", "Enlace copiado", "Enlace directo copiado al portapapeles.");
                    }}
                    className="w-full py-2.5 rounded-full bg-white border border-[#D8CEBE] text-[#24201D] hover:bg-[#FAF7F2] font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#7A4E38]" />
                    <span>Copiar Enlace Directo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
