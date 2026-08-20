import React, { useState } from "react";
import { MediaItem } from "../../types";
import { getYouTubeEmbedUrl } from "../../lib/youtube";
import { X, Calendar, User, Heart, Tag, Download, Loader2 } from "lucide-react";

interface MediaLightboxModalProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({ item, isOpen, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !item) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // A plain <a download> is ignored by browsers for cross-origin URLs
      // (Supabase Storage lives on a different domain) — fetching the bytes
      // ourselves and downloading from a blob: URL works regardless of origin.
      const res = await fetch(item.url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const ext = blob.type.split("/")[1] || "jpg";
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${(item.title || "memora-recuerdo").replace(/[^a-z0-9]+/gi, "-")}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(item.url, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row bg-[#1F1B18] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        
        {/* Media Frame */}
        <div className="flex-1 bg-black flex items-center justify-center p-2 min-h-[300px] md:min-h-[500px]">
          {item.type === "video" ? (
            getYouTubeEmbedUrl(item.url) ? (
              <div className="w-full aspect-video max-h-[80vh]">
                <iframe
                  src={getYouTubeEmbedUrl(item.url)!}
                  title={item.title || "Video conmemorativo"}
                  className="w-full h-full rounded-xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="text-white text-center p-6 space-y-2">
                <p className="text-sm">Video conmemorativo</p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-full bg-white text-black text-xs font-semibold inline-block"
                >
                  Abrir video en fuente externa
                </a>
              </div>
            )
          ) : (
            <img
              src={item.url}
              alt={item.title || "Fotografía de memorial"}
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl"
            />
          )}
        </div>

        {/* Sidebar Info */}
        <div className="w-full md:w-80 p-6 bg-[#24201D] text-[#EAE3D9] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880] block mb-1">
                Recuerdo Fotográfico
              </span>
              <h3 className="font-serif text-xl font-medium text-white leading-snug">
                {item.title || "Momento atesorado"}
              </h3>
            </div>

            {item.description && (
              <p className="text-xs text-[#A89F95] leading-relaxed italic">
                "{item.description}"
              </p>
            )}

            <div className="space-y-2 text-xs text-[#8C827A] pt-4 border-t border-white/10">
              {item.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>{item.date}</span>
                </div>
              )}
              {item.uploaderName && (
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Aportado por: {item.uploaderName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2">
            {item.type !== "video" && (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full py-2.5 rounded-full bg-[#C5A880] hover:bg-[#D4BC97] text-xs font-semibold text-[#1F1B18] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{isDownloading ? "Descargando..." : "Descargar foto"}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
            >
              Cerrar visualizador
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
