import React, { useState, useEffect, useRef } from "react";
import { Memorial, MediaItem } from "../../types";
import { useApp } from "../../context/AppContext";
import {
  Heart,
  Flame,
  Flower2,
  Share2,
  QrCode,
  Volume2,
  VolumeX,
  Edit3,
  Calendar,
  MapPin,
  Sparkles,
  Printer,
  Download,
} from "lucide-react";

interface MemorialHeroProps {
  memorial: Memorial;
  onOpenTributeModal: () => void;
  onOpenShareModal: () => void;
  onOpenQRModal?: () => void;
  onOpenMediaLightbox?: (item: MediaItem) => void;
}

export const MemorialHero: React.FC<MemorialHeroProps> = ({
  memorial,
  onOpenTributeModal,
  onOpenShareModal,
  onOpenQRModal,
  onOpenMediaLightbox,
}) => {
  const { openMemorialEdit, currentUser, setActivePrintableMemorial } = useApp();
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isOwnerOrCollaborator =
    currentUser &&
    (memorial.ownerId === currentUser.id ||
      memorial.collaborators?.some((c) => c.email === currentUser.email));

  const openPhotoDownload = (url: string, title: string) => {
    if (!onOpenMediaLightbox || !url) return;
    onOpenMediaLightbox({
      id: `${memorial.id}-${title}`,
      memorialId: memorial.id,
      type: "photo",
      url,
      title,
      uploaderName: memorial.personName,
      status: "approved",
      uploadedAt: "",
    });
  };

  const totalTributesCount = memorial.tributes?.filter((t) => t.status === "approved").length || 0;
  const totalCandles = memorial.tributes?.filter((t) => t.candleLit).length || 0;
  const totalPhotos = memorial.media?.length || 0;

  // "The Long Dark" by Scott Buckley — CC-BY 4.0, www.scottbuckley.com.au
  const toggleAmbientMusic = () => {
    if (isPlayingMusic) {
      audioRef.current?.pause();
      setIsPlayingMusic(false);
    } else {
      if (!audioRef.current) {
        const audio = new Audio("/audio/ambient-piano.mp3");
        audio.loop = true;
        audio.volume = 0.35;
        audio.addEventListener("ended", () => setIsPlayingMusic(false));
        audioRef.current = audio;
      }
      audioRef.current.play().catch((e) => {
        console.warn("Ambient audio playback error:", e);
        setIsPlayingMusic(false);
      });
      setIsPlayingMusic(true);
    }
  };

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  return (
    <div className="relative bg-[#FAF7F2] border-b border-[#EAE3D9]">
      {/* Cover Panorama */}
      <div className="relative h-72 sm:h-96 lg:h-[420px] w-full overflow-hidden bg-stone-900">
        <img
          src={memorial.coverPhoto}
          alt={memorial.personName}
          className="w-full h-full object-cover object-center filter brightness-[0.88]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#24201D]/90 via-[#24201D]/30 to-black/20"></div>

        {onOpenMediaLightbox && memorial.coverPhoto && (
          <button
            type="button"
            onClick={() => openPhotoDownload(memorial.coverPhoto!, `Foto de portada de ${memorial.personName}`)}
            className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Ver y descargar foto de portada"
            title="Ver y descargar foto de portada"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        {/* Top Control Bar Over Cover */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-8 right-4 sm:right-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/80 backdrop-blur-md text-[11px] font-semibold text-[#24201D] border border-white/40 flex items-center gap-1.5 shadow-sm">
              <Heart className="w-3 h-3 text-[#C5A880] fill-[#C5A880]" />
              <span>{memorial.type === "pet" ? "🐾 MEMORA Mascotas" : "Memorial Permanente"}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Ambient Music Toggle */}
            <button
              onClick={toggleAmbientMusic}
              className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                isPlayingMusic
                  ? "bg-[#C5A880] text-[#1F1B18] ring-2 ring-white/50"
                  : "bg-white/80 hover:bg-white text-[#24201D] border border-white/40"
              }`}
              title={`Música ambiental relajante — "The Long Dark" de Scott Buckley (CC-BY 4.0, scottbuckley.com.au)`}
            >
              {isPlayingMusic ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#1F1B18] animate-pulse" />
                  <span className="hidden sm:inline">Música Activa</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-[#7A4E38]" />
                  <span className="hidden sm:inline">Música de Fondo</span>
                </>
              )}
            </button>

            {/* QR Code Quick Button */}
            <button
              onClick={onOpenQRModal}
              className="p-2 rounded-full bg-white/80 hover:bg-white text-[#24201D] backdrop-blur-md transition-all shadow-sm cursor-pointer border border-white/40"
              title="Ver y descargar Código QR"
            >
              <QrCode className="w-4 h-4 text-[#7A4E38]" />
            </button>

            {/* Share Quick Button */}
            <button
              onClick={onOpenShareModal}
              className="p-2 rounded-full bg-white/80 hover:bg-white text-[#24201D] backdrop-blur-md transition-all shadow-sm cursor-pointer border border-white/40"
              title="Compartir memorial"
            >
              <Share2 className="w-4 h-4 text-[#7A4E38]" />
            </button>

            {/* Printable Memory Quick Button */}
            <button
              onClick={() => setActivePrintableMemorial(memorial)}
              className="p-2 rounded-full bg-white/80 hover:bg-white text-[#24201D] backdrop-blur-md transition-all shadow-sm cursor-pointer border border-white/40"
              title="Crear recuerdo para imprimir (Cuadro, Urna, Placa)"
            >
              <Printer className="w-4 h-4 text-[#7A4E38]" />
            </button>

            {/* Owner Edit Shortcut */}
            {isOwnerOrCollaborator && (
              <button
                onClick={() => openMemorialEdit(memorial.id)}
                className="px-3 py-1.5 rounded-full bg-[#24201D]/90 hover:bg-[#24201D] text-white text-xs font-medium backdrop-blur-md transition-all shadow-sm flex items-center gap-1.5 border border-white/20 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#C5A880]" />
                <span className="hidden sm:inline">Administrar</span>
              </button>
            )}
          </div>
        </div>

        {/* Dates & Location on bottom of cover (mobile friendly) */}
        <div className="absolute bottom-20 sm:bottom-24 lg:bottom-28 left-4 sm:left-8 right-4 sm:right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-2 text-white">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-[#EAE3D9] font-light">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
              {memorial.birthDate || "1942"} — {memorial.passingDate || "2023"}
            </span>
            {memorial.birthPlace && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                {memorial.birthPlace}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Details Bar & Avatar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 -mt-16 sm:-mt-20 relative z-20">
          
          {/* Left Avatar & Name */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 sm:gap-6">
            
            {/* Portrait Frame */}
            {onOpenMediaLightbox && memorial.mainPhoto ? (
              <button
                type="button"
                onClick={() => openPhotoDownload(memorial.mainPhoto!, `Foto de perfil de ${memorial.personName}`)}
                className="group relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden bg-white p-1 shadow-xl border-2 border-[#C5A880] flex-shrink-0 cursor-pointer"
                aria-label="Ver foto de perfil en grande"
                title="Ver foto de perfil en grande"
              >
                <img
                  src={memorial.mainPhoto}
                  alt={memorial.personName}
                  className="w-full h-full object-cover rounded-2xl"
                />
                <div className="absolute inset-1 rounded-2xl bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Download className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ) : (
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden bg-white p-1 shadow-xl border-2 border-[#C5A880] flex-shrink-0">
                <img
                  src={memorial.mainPhoto}
                  alt={memorial.personName}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            )}

            {/* Titles & Nickname */}
            <div className="space-y-1.5 pt-2 sm:pt-20">
              {memorial.type === "pet" && (memorial.species || memorial.breed) && (
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <span className="text-[11px] font-semibold tracking-wide px-3 py-0.5 rounded-full bg-[#EAE3D9] text-[#7A4E38] border border-[#D8CEBE]">
                    🐾{" "}
                    {["perro", "gato", "ave", "conejo", "caballo"].includes(memorial.species || "")
                      ? memorial.species!.toUpperCase()
                      : memorial.species || ""}
                    {memorial.breed ? ` · ${memorial.breed}` : ""}
                  </span>
                </div>
              )}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#24201D] font-medium leading-tight">
                {memorial.personName}
              </h1>
              {memorial.preferredName && (
                <p className="text-sm sm:text-base font-serif italic text-[#7A4E38]">
                  "{memorial.preferredName}"
                </p>
              )}
              {memorial.restingPlace && (
                <p className="text-xs text-[#8C827A] flex items-center justify-center sm:justify-start gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Descansa en: {memorial.restingPlace}</span>
                </p>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 sm:pt-6">
            <button
              onClick={onOpenTributeModal}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-xs sm:text-sm font-medium transition-all shadow-md active:scale-[0.98] cursor-pointer"
              id="memorial-hero-tribute-btn"
            >
              <Flame className="w-4 h-4 text-[#C5A880]" />
              <span>Encender Vela / Dejar Homenaje</span>
            </button>

            <button
              onClick={onOpenShareModal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-[#F4EFEA] border border-[#D8CEBE] text-xs sm:text-sm font-medium text-[#24201D] transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-[#7A4E38]" />
              <span>Compartir</span>
            </button>

            <button
              onClick={() => setActivePrintableMemorial(memorial)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#FAF7F2] hover:bg-[#F4EFEA] border border-[#D8CEBE] hover:border-[#C5A880] text-xs sm:text-sm font-medium text-[#24201D] transition-all shadow-2xs cursor-pointer"
              id="memorial-hero-printable-btn"
              title="Crear recuerdo para imprimir (Cuadro, Urna o Placa)"
            >
              <Printer className="w-4 h-4 text-[#C5A880]" />
              <span>Recuerdo para imprimir</span>
            </button>
          </div>

        </div>

        {/* Representative Quote & Quick Metrics */}
        <div className="mt-8 pt-6 border-t border-[#EAE3D9] flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="font-serif italic text-base sm:text-lg text-[#5C534B] text-center md:text-left max-w-3xl leading-relaxed">
            {memorial.quote}
          </p>

          <div className="flex items-center gap-6 text-center text-xs flex-shrink-0">
            <div>
              <span className="block font-serif font-bold text-lg text-[#24201D]">
                {totalCandles}
              </span>
              <span className="text-[11px] text-[#8C827A] flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500" /> Velas
              </span>
            </div>
            <div className="w-px h-8 bg-[#EAE3D9]"></div>
            <div>
              <span className="block font-serif font-bold text-lg text-[#24201D]">
                {totalTributesCount}
              </span>
              <span className="text-[11px] text-[#8C827A] flex items-center gap-1">
                <Heart className="w-3 h-3 text-[#C5A880]" /> Homenajes
              </span>
            </div>
            <div className="w-px h-8 bg-[#EAE3D9]"></div>
            <div>
              <span className="block font-serif font-bold text-lg text-[#24201D]">
                {totalPhotos}
              </span>
              <span className="text-[11px] text-[#8C827A]">Fotografías</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
