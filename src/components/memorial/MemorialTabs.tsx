import React, { useState, useRef, useEffect } from "react";
import { Memorial, Tribute, MediaItem, TimelineEvent, FamilyMember, MemorialEvent } from "../../types";
import { useApp } from "../../context/AppContext";
import { getYouTubeThumbnail } from "../../lib/youtube";
import {
  BookOpen,
  Image as ImageIcon,
  Clock,
  Heart,
  Users2,
  Calendar,
  Flame,
  Flower2,
  MessageSquare,
  Plus,
  Share2,
  MapPin,
  ExternalLink,
  Lock,
  Copy,
  Navigation,
  Play,
} from "lucide-react";

interface MemorialTabsProps {
  memorial: Memorial;
  onOpenTributeModal: () => void;
  onOpenMediaLightbox: (item: MediaItem) => void;
}

export const MemorialTabs: React.FC<MemorialTabsProps> = ({
  memorial,
  onOpenTributeModal,
  onOpenMediaLightbox,
}) => {
  const { addTributeReaction, rsvpToEvent, openMemorialEdit, currentUser, notify } = useApp();
  const [activeTab, setActiveTab] = useState<"story" | "gallery" | "timeline" | "tributes" | "family" | "events">("story");
  const [selectedAlbumFilter, setSelectedAlbumFilter] = useState<string | "all">("all");
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // La barra de pestañas se desborda horizontalmente en celulares (6 pestañas)
  // — sin esto, la pestaña activa puede quedar fuera del área visible y nada
  // indica que hay más opciones hacia la derecha.
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }, [activeTab]);
  const [confirmedEventIds, setConfirmedEventIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(`memora_rsvp_${memorial.id}`);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  const copyEventInvite = (ev: MemorialEvent) => {
    const memorialUrl = `${window.location.origin}/m/${memorial.slug}`;
    const dateLabel = new Date(ev.date + "T00:00:00").toLocaleDateString("es-CL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const lines = [
      `${ev.title} — en memoria de ${memorial.personName}`,
      `${dateLabel} a las ${ev.time}`,
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

  const confirmAttendance = (eventId: string) => {
    if (confirmedEventIds.has(eventId)) return;
    rsvpToEvent(memorial.id, eventId);
    setConfirmedEventIds((prev) => {
      const next = new Set(prev).add(eventId);
      try {
        localStorage.setItem(`memora_rsvp_${memorial.id}`, JSON.stringify([...next]));
      } catch {
        // localStorage unavailable — la confirmación igual se persiste en el servidor
      }
      return next;
    });
  };

  const isOwner = currentUser && memorial.ownerId === currentUser.id;

  // Filter approved tributes
  const approvedTributes = memorial.tributes?.filter((t) => t.status === "approved") || [];

  // Filter media by album
  const filteredMedia =
    selectedAlbumFilter === "all"
      ? memorial.media || []
      : memorial.media?.filter((m) => m.albumId === selectedAlbumFilter) || [];

  const tabItems = [
    {
      id: "story",
      label: "Historia",
      icon: BookOpen,
      count: null,
    },
    { id: "gallery", label: "Galería", icon: ImageIcon, count: memorial.media?.length || 0 },
    { id: "timeline", label: "Línea de Tiempo", icon: Clock, count: memorial.timeline?.length || 0 },
    { id: "tributes", label: "Homenajes", icon: Heart, count: approvedTributes.length },
    {
      id: "family",
      label: "Familia",
      icon: Users2,
      count: memorial.family?.length || 0,
    },
    { id: "events", label: "Ceremonias", icon: Calendar, count: memorial.events?.length || 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Tab Navigation Pill Bar */}
      <div className="relative mb-10">
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 border-b border-[#EAE3D9] scrollbar-none gap-1.5 sm:gap-2">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={isActive ? activeTabRef : undefined}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 flex-shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#24201D] text-white shadow-sm"
                    : "bg-white text-[#5C534B] hover:bg-[#F4EFEA] border border-[#EAE3D9]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? "text-[#C5A880]" : "text-[#8C827A]"}`} />
                <span>{tab.label}</span>
                {tab.count !== null && tab.count > 0 && (
                  <span
                    className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full ${
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
        {/* Fade hints on mobile so it's clear the pill bar keeps scrolling */}
        <div className="sm:hidden pointer-events-none absolute top-0 bottom-4 left-0 w-8 bg-gradient-to-r from-[#FAF7F2] to-transparent" />
        <div className="sm:hidden pointer-events-none absolute top-0 bottom-4 right-0 w-8 bg-gradient-to-l from-[#FAF7F2] to-transparent" />
      </div>

      {/* TAB CONTENT: Historia de Vida / Recuerdos */}
      {activeTab === "story" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-in fade-in duration-300">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EAE3D9] shadow-xs space-y-6">
              <div className="border-b border-[#F4EFEA] pb-4">
                <h2 className="font-serif text-2xl sm:text-3xl text-[#24201D] font-medium">
                  {memorial.type === "pet" ? "Su Historia & Recuerdos" : "Biografía y Legado"}
                </h2>
                <p className="text-xs text-[#8C827A] mt-0.5">
                  {memorial.type === "pet"
                    ? "El amor, la lealtad y los momentos imborrables que compartió con nosotros."
                    : "La historia de quien dejó una huella imborrable."}
                </p>
              </div>

              {memorial.summary && (
                <div className="p-5 rounded-2xl bg-[#FAF7F2] border-l-4 border-[#C5A880] text-sm text-[#4A423B] leading-relaxed italic">
                  {memorial.summary}
                </div>
              )}

              <div className="prose prose-stone max-w-none text-sm sm:text-base text-[#3D3530] leading-relaxed space-y-4 whitespace-pre-line font-light">
                {memorial.biography || "La historia de este memorial está siendo recopilada con cariño."}
              </div>

              {isOwner && (
                <div className="pt-4 border-t border-[#F4EFEA] flex justify-end">
                  <button
                    onClick={() => openMemorialEdit(memorial.id, "story")}
                    className="text-xs font-semibold text-[#7A4E38] hover:text-[#24201D] transition-colors"
                  >
                    {memorial.type === "pet" ? "Editar historia y recuerdos →" : "Editar historia y biografía →"}
                  </button>
                </div>
              )}
            </div>

            {/* PET SPECIFIC SPECIAL MEMORY CARDS */}
            {memorial.type === "pet" && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D9] shadow-xs space-y-6">
                <div className="border-b border-[#F4EFEA] pb-3">
                  <h3 className="font-serif text-xl text-[#24201D] font-medium flex items-center gap-2">
                    <span>🐾 Recuerdos Inolvidables</span>
                  </h3>
                  <p className="text-xs text-[#8C827A] mt-0.5">
                    Detalles y costumbres que hicieron de {memorial.personName} un compañero único.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {memorial.personality && (
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A4E38] block">
                        🌟 Personalidad & Carácter
                      </span>
                      <p className="text-xs sm:text-sm text-[#3D3530] leading-relaxed">
                        {memorial.personality}
                      </p>
                    </div>
                  )}

                  {memorial.favoriteThings && (
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A4E38] block">
                        🎾 Lo que más le encantaba
                      </span>
                      <p className="text-xs sm:text-sm text-[#3D3530] leading-relaxed">
                        {memorial.favoriteThings}
                      </p>
                    </div>
                  )}

                  {memorial.favoritePlace && (
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A4E38] block">
                        ☀️ Su rincón favorito
                      </span>
                      <p className="text-xs sm:text-sm text-[#3D3530] leading-relaxed">
                        {memorial.favoritePlace}
                      </p>
                    </div>
                  )}

                  {memorial.arrivalStory && (
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A4E38] block">
                        🏡 Cómo llegó a nuestras vidas
                      </span>
                      <p className="text-xs sm:text-sm text-[#3D3530] leading-relaxed">
                        {memorial.arrivalStory}
                      </p>
                    </div>
                  )}

                  {memorial.specialTrait && (
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-1 md:col-span-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A4E38] block">
                        💖 Lo que lo hacía único
                      </span>
                      <p className="text-xs sm:text-sm text-[#3D3530] leading-relaxed">
                        {memorial.specialTrait}
                      </p>
                    </div>
                  )}

                  {memorial.anecdote && (
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] space-y-1 md:col-span-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A4E38] block">
                        📖 Una anécdota o travesura inolvidable
                      </span>
                      <p className="text-xs sm:text-sm text-[#3D3530] leading-relaxed italic">
                        "{memorial.anecdote}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Key Details Summary Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#EAE3D9] shadow-xs space-y-5">
              <h3 className="font-serif text-lg text-[#24201D] font-medium border-b border-[#F4EFEA] pb-3">
                {memorial.type === "pet" ? "Datos de su Vida" : "Datos de Vida"}
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[#8C827A] block">
                    {memorial.type === "pet" ? "Nombre de la mascota" : "Nombre completo"}
                  </span>
                  <span className="font-semibold text-[#24201D] text-sm">{memorial.personName}</span>
                </div>

                {memorial.preferredName && (
                  <div>
                    <span className="text-[#8C827A] block">Conocido cariñosamente como</span>
                    <span className="font-medium text-[#7A4E38]">{memorial.preferredName}</span>
                  </div>
                )}

                {memorial.type === "pet" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[#8C827A] block">Especie</span>
                      <span className="font-medium text-[#24201D] capitalize">
                        {memorial.species || "Mascota"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8C827A] block">Raza</span>
                      <span className="font-medium text-[#24201D]">
                        {memorial.breed || "Mestizo / Único"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[#8C827A] block">
                      {memorial.type === "pet" ? "Llegada / Nacimiento" : "Nacimiento"}
                    </span>
                    <span className="font-medium text-[#24201D]">{memorial.birthDate || "No especificado"}</span>
                  </div>
                  <div>
                    <span className="text-[#8C827A] block">Partida</span>
                    <span className="font-medium text-[#24201D]">{memorial.passingDate || "No especificado"}</span>
                  </div>
                </div>

                {memorial.birthPlace && (
                  <div>
                    <span className="text-[#8C827A] block">Lugar de origen</span>
                    <span className="font-medium text-[#24201D] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                      {memorial.birthPlace}
                    </span>
                  </div>
                )}

                {memorial.restingPlace && (
                  <div>
                    <span className="text-[#8C827A] block">Lugar de descanso o memoria</span>
                    <span className="font-medium text-[#24201D] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                      {memorial.restingPlace}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Tribute CTA banner */}
            <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#D8CEBE] text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#C5A880]/20 mx-auto flex items-center justify-center text-[#7A4E38]">
                <Flame className="w-5 h-5 text-[#C5A880]" />
              </div>
              <h4 className="font-serif text-lg text-[#24201D] font-medium">
                ¿Tienes un recuerdo especial?
              </h4>
              <p className="text-xs text-[#5C534B]">
                Dedica unas palabras, comparte una foto o enciende una vela en su memoria.
              </p>
              <button
                onClick={onOpenTributeModal}
                className="w-full py-2.5 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-xs font-semibold transition-colors cursor-pointer"
              >
                Dejar Homenaje
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Galería & Recuerdos */}
      {activeTab === "gallery" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Albums bar */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedAlbumFilter("all")}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedAlbumFilter === "all"
                    ? "bg-[#24201D] text-white"
                    : "bg-white text-[#5C534B] border border-[#D8CEBE]"
                }`}
              >
                Todos los archivos ({memorial.media?.length || 0})
              </button>
              {memorial.albums?.map((alb) => (
                <button
                  key={alb.id}
                  onClick={() => setSelectedAlbumFilter(alb.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedAlbumFilter === alb.id
                      ? "bg-[#24201D] text-white"
                      : "bg-white text-[#5C534B] border border-[#D8CEBE]"
                  }`}
                >
                  {alb.title}
                </button>
              ))}
            </div>

            {isOwner && (
              <button
                onClick={() => openMemorialEdit(memorial.id, "media")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#D8CEBE] hover:border-[#C5A880] text-xs font-semibold text-[#24201D] transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Agregar fotos o álbumes</span>
              </button>
            )}
          </div>

          {/* Media Grid */}
          {filteredMedia.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onOpenMediaLightbox(item)}
                  className="group relative rounded-3xl overflow-hidden bg-white border border-[#EAE3D9] shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="relative h-60 overflow-hidden bg-stone-900">
                    {item.type === "video" ? (
                      <>
                        {getYouTubeThumbnail(item.url) && (
                          <img
                            src={getYouTubeThumbnail(item.url)!}
                            alt={item.title || "Video"}
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="w-5 h-5 text-[#24201D] fill-[#24201D] ml-0.5" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.title || "Recuerdo"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      {item.date && (
                        <span className="text-[10px] text-[#E7D7C1] font-light block">
                          {item.date}
                        </span>
                      )}
                      <h4 className="font-serif text-sm font-medium line-clamp-1">
                        {item.title || "Momento familiar"}
                      </h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#EAE3D9] p-8 space-y-3">
              <ImageIcon className="w-10 h-10 text-[#C5A880] mx-auto opacity-70" />
              <h3 className="font-serif text-xl text-[#24201D]">No hay recuerdos en este álbum</h3>
              <p className="text-xs text-[#8C827A] max-w-sm mx-auto">
                Los recuerdos fotográficos agregados aparecerán en esta galería para ser recordados siempre.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Línea de Tiempo */}
      {activeTab === "timeline" && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-[#EAE3D9] pb-4">
            <div>
              <h2 className="font-serif text-2xl text-[#24201D] font-medium">
                Línea de Tiempo y Acontecimientos
              </h2>
              <p className="text-xs text-[#8C827A] mt-0.5">
                Los momentos, viajes y etapas que marcaron su camino.
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => openMemorialEdit(memorial.id, "timeline")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#D8CEBE] text-xs font-semibold text-[#24201D]"
              >
                <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Agregar hito</span>
              </button>
            )}
          </div>

          <div className="relative pl-6 sm:pl-8 border-l-2 border-[#D8CEBE] space-y-8">
            {memorial.timeline && memorial.timeline.length > 0 ? (
              memorial.timeline.map((event) => (
                <div
                  key={event.id}
                  className="relative group bg-white rounded-3xl p-6 border border-[#EAE3D9] hover:border-[#C5A880] transition-all shadow-xs"
                >
                  <div className="absolute -left-[31px] sm:-left-[39px] top-6 w-4 h-4 rounded-full bg-[#C5A880] border-4 border-[#FAF7F2] shadow-xs"></div>

                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {event.photoUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenMediaLightbox({
                            id: event.id,
                            memorialId: memorial.id,
                            type: "photo",
                            url: event.photoUrl!,
                            title: event.title,
                            description: event.description,
                            date: event.date || event.year,
                            uploaderName: memorial.personName,
                            status: "approved",
                            uploadedAt: "",
                          })
                        }
                        className="w-full sm:w-44 h-36 rounded-2xl overflow-hidden bg-stone-100 flex-shrink-0 cursor-pointer"
                        title="Ver y descargar fotografía"
                      >
                        <img
                          src={event.photoUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    )}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif font-bold text-lg text-[#7A4E38]">
                          {event.year}
                        </span>
                        {event.date && (
                          <span className="text-xs text-[#8C827A]">{event.date}</span>
                        )}
                        {event.location && (
                          <span className="text-xs text-[#8C827A] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#C5A880]" />
                            {event.location}
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-xl text-[#24201D] font-medium">
                        {event.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#5C534B] leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#8C827A]">Aún no se han añadido hitos a la línea de tiempo.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Homenajes & Velas */}
      {activeTab === "tributes" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#EAE3D9] pb-4">
            <div>
              <h2 className="font-serif text-2xl text-[#24201D] font-medium">
                Muro de Homenajes y Condolencias
              </h2>
              <p className="text-xs text-[#8C827A] mt-0.5">
                Mensajes, oraciones y recuerdos compartidos por la familia y amigos.
              </p>
            </div>
            <button
              onClick={onOpenTributeModal}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Encender una Vela / Dejar Mensaje</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedTributes.map((tribute) => (
              <div
                key={tribute.id}
                className="bg-white rounded-3xl p-6 border border-[#EAE3D9] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#C5A880] transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-base font-semibold text-[#24201D]">
                        {tribute.authorName}
                      </h4>
                      {tribute.relationship && (
                        <span className="text-[11px] text-[#8C827A]">{tribute.relationship}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {tribute.candleLit && (
                        <span className="p-1 rounded-full bg-amber-50 text-amber-600" title="Vela encendida">
                          <Flame className="w-4 h-4 fill-amber-500" />
                        </span>
                      )}
                      {tribute.flowerPlaced && (
                        <span className="p-1 rounded-full bg-rose-50 text-rose-600" title="Ofrenda floral">
                          <Flower2 className="w-4 h-4 fill-rose-500" />
                        </span>
                      )}
                    </div>
                  </div>

                  {tribute.photoUrl && (
                    <div className="h-44 rounded-2xl overflow-hidden bg-stone-100">
                      <img src={tribute.photoUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-[#4A423B] italic leading-relaxed">
                    "{tribute.message}"
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F4EFEA] flex items-center justify-between text-xs text-[#8C827A]">
                  <span className="text-[10px]">
                    {new Date(tribute.createdAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>

                  <button
                    onClick={() => addTributeReaction(memorial.id, tribute.id, "heart")}
                    className="flex items-center gap-1.5 text-[#7A4E38] hover:text-[#24201D] font-medium transition-colors cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 text-[#C5A880] fill-[#C5A880]" />
                    <span>{tribute.heartCount || 0}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Familia & Vínculos */}
      {activeTab === "family" && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-[#EAE3D9] pb-4">
            <div>
              <h2 className="font-serif text-2xl text-[#24201D] font-medium">
                Familia y Círculo Cercano
              </h2>
              <p className="text-xs text-[#8C827A] mt-0.5">
                Las personas que compartieron su vida y perpetúan su legado.
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => openMemorialEdit(memorial.id, "general")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#D8CEBE] text-xs font-semibold text-[#24201D]"
              >
                <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Agregar familiar</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {memorial.family && memorial.family.length > 0 ? (
              memorial.family.map((fam) => (
                <div
                  key={fam.id}
                  className="bg-white rounded-3xl p-5 border border-[#EAE3D9] flex items-center gap-4 shadow-xs"
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-stone-100 border border-[#D8CEBE] flex-shrink-0">
                    <img
                      src={fam.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                      alt={fam.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-sm text-[#24201D]">{fam.name}</h4>
                    <span className="text-xs text-[#7A4E38] block">{fam.relationship}</span>
                    {fam.notes && <p className="text-[11px] text-[#8C827A] mt-0.5">{fam.notes}</p>}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#8C827A]">No se han registrado vínculos familiares aún.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Ceremonias & Eventos */}
      {activeTab === "events" && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-[#EAE3D9] pb-4">
            <div>
              <h2 className="font-serif text-2xl text-[#24201D] font-medium">
                Ceremonias y Homenajes
              </h2>
              <p className="text-xs text-[#8C827A] mt-0.5">
                Convocatorias conmemorativas, misas y reuniones familiares.
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => openMemorialEdit(memorial.id, "general")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#D8CEBE] text-xs font-semibold text-[#24201D]"
              >
                <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Crear convocatoria</span>
              </button>
            )}
          </div>

          <div className="space-y-6">
            {memorial.events && memorial.events.length > 0 ? (
              memorial.events.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D9] shadow-xs flex flex-col sm:flex-row justify-between gap-6"
                >
                  <div className="space-y-3">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#FAF7F2] text-[#7A4E38] text-[10px] font-bold uppercase tracking-wider border border-[#D8CEBE]">
                      {ev.type === "ceremonia"
                        ? "Ceremonia"
                        : ev.type === "misa"
                        ? "Misa Conmemorativa"
                        : ev.type === "homenaje_virtual"
                        ? "Homenaje Virtual"
                        : "Reunión Familiar"}
                    </span>
                    <h3 className="font-serif text-2xl text-[#24201D] font-medium">{ev.title}</h3>
                    <div className="space-y-1.5 text-xs text-[#5C534B]">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#C5A880]" />
                        <strong>Fecha y hora:</strong>{" "}
                        {new Date(ev.date + "T00:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })} — {ev.time}
                      </p>
                      <p className="flex items-center gap-2 flex-wrap">
                        <MapPin className="w-4 h-4 text-[#C5A880]" />
                        <strong>Lugar:</strong> {ev.locationName}
                        {ev.locationName && ev.locationName !== "Lugar a confirmar" && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.address || ev.locationName)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[#7A4E38] underline underline-offset-2 font-medium"
                          >
                            <Navigation className="w-3 h-3" />
                            Cómo llegar
                          </a>
                        )}
                      </p>
                      {ev.virtualLink && (
                        <p className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-[#C5A880]" />
                          <a
                            href={ev.virtualLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#7A4E38] underline"
                          >
                            Enlace a transmisión virtual en vivo
                          </a>
                        </p>
                      )}
                    </div>
                    {ev.description && (
                      <p className="text-xs text-[#5C534B] pt-2">{ev.description}</p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-[#F4EFEA] pt-4 sm:pt-0 sm:pl-6 gap-3">
                    <span className="text-xs text-[#8C827A]">
                      {ev.rsvpCount || 0} personas confirmadas
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyEventInvite(ev)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#D8CEBE] text-[#24201D] hover:border-[#C5A880] text-xs font-semibold cursor-pointer"
                        title="Copiar invitación para compartir"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Copiar invitación</span>
                      </button>
                      <button
                        onClick={() => confirmAttendance(ev.id)}
                        disabled={confirmedEventIds.has(ev.id)}
                        className="px-5 py-2 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-default"
                      >
                        {confirmedEventIds.has(ev.id) ? "Asistencia confirmada ✓" : "Confirmar Asistencia"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#8C827A]">No hay eventos o ceremonias programadas en este momento.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
