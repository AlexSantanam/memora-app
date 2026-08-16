import React, { useState } from "react";
import { Memorial } from "../../types";
import { useApp } from "../../context/AppContext";
import { X, Flame, Flower2, Heart, Sparkles, Image as ImageIcon, Loader2 } from "lucide-react";

interface TributeModalProps {
  memorial: Memorial;
  isOpen: boolean;
  onClose: () => void;
}

export const TributeModal: React.FC<TributeModalProps> = ({ memorial, isOpen, onClose }) => {
  const { addTribute, currentUser } = useApp();
  const [authorName, setAuthorName] = useState(currentUser?.name || "");
  const [relationship, setRelationship] = useState("");
  const [message, setMessage] = useState("");
  const [candleLit, setCandleLit] = useState(true);
  const [flowerPlaced, setFlowerPlaced] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      await addTribute(memorial.id, {
        memorialId: memorial.id,
        authorName,
        relationship: relationship || "Familiar / Amigo",
        message,
        candleLit,
        flowerPlaced,
        photoUrl: photoUrl || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#EAE3D9] relative max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#8C827A] hover:text-[#24201D] hover:bg-[#F4EFEA] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FAF7F2] text-xs font-semibold text-[#7A4E38] border border-[#D8CEBE]">
            <Heart className="w-3 h-3 text-[#C5A880]" />
            <span>Homenaje en Memoria</span>
          </div>
          <h2 className="font-serif text-2xl text-[#24201D] font-medium">
            Dedica unas palabras a {memorial.personName}
          </h2>
          <p className="text-xs text-[#5C534B]">
            Tu mensaje brindará consuelo y quedará guardado para siempre.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                Tu nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Ej. Sofía Morales"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                Vínculo / Parentesco
              </label>
              <input
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="Ej. Sobrina, Amigo de infancia"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D] focus:outline-none focus:border-[#C5A880]"
              />
            </div>
          </div>

          {/* Virtual Offering Toggles */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-2">
              Ofrenda Virtual
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCandleLit(!candleLit)}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                  candleLit
                    ? "bg-amber-50 border-amber-300 text-amber-900 shadow-xs"
                    : "bg-[#FAF7F2] border-[#EAE3D9] text-[#7A7067]"
                }`}
              >
                <Flame className={`w-4 h-4 ${candleLit ? "text-amber-500 fill-amber-500" : ""}`} />
                <span>Encender una vela</span>
              </button>

              <button
                type="button"
                onClick={() => setFlowerPlaced(!flowerPlaced)}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                  flowerPlaced
                    ? "bg-rose-50 border-rose-300 text-rose-900 shadow-xs"
                    : "bg-[#FAF7F2] border-[#EAE3D9] text-[#7A7067]"
                }`}
              >
                <Flower2 className={`w-4 h-4 ${flowerPlaced ? "text-rose-500 fill-rose-500" : ""}`} />
                <span>Colocar una flor</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1">
              Tu mensaje o recuerdo <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu testimonio, recuerdo o palabras de agradecimiento..."
              className="w-full p-3.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D] focus:outline-none focus:border-[#C5A880] leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1">
              Adjuntar fotografía memorable (opcional)
            </label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="Pega la URL de una foto para adjuntarla"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D] focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F4EFEA]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-xs font-medium text-[#7A7067] hover:text-[#24201D]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Publicar Homenaje</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
