import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { MemorialHero } from "./MemorialHero";
import { MemorialTabs } from "./MemorialTabs";
import { TributeModal } from "./TributeModal";
import { ShareModal } from "./ShareModal";
import { MediaLightboxModal } from "./MediaLightboxModal";
import { MediaItem } from "../../types";
import { Lock, KeyRound, ArrowLeft, Heart, Sparkles, Share2, Printer } from "lucide-react";

export const MemorialView: React.FC = () => {
  const {
    currentMemorial,
    setCurrentView,
    activeShareMemorial,
    setActiveShareMemorial,
    setActivePrintableMemorial,
  } = useApp();

  const [isTributeModalOpen, setIsTributeModalOpen] = useState(false);
  const [selectedLightboxItem, setSelectedLightboxItem] = useState<MediaItem | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  if (!currentMemorial) {
    return (
      <div className="min-h-[70vh] bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#EAE3D9] flex items-center justify-center text-[#7A4E38] mb-4">
          <Heart className="w-8 h-8 text-[#C5A880]" />
        </div>
        <h2 className="font-serif text-2xl text-[#24201D] font-medium mb-2">Memorial no encontrado</h2>
        <p className="text-sm text-[#5C534B] max-w-md mb-6">
          El memorial que buscas no está disponible o el enlace ha cambiado.
        </p>
        <button
          onClick={() => setCurrentView("landing")}
          className="px-6 py-2.5 rounded-full bg-[#24201D] text-white text-xs font-semibold hover:bg-[#3D3530] transition-colors"
        >
          Volver a la página principal
        </button>
      </div>
    );
  }

  // Password Protection Gate
  const isProtected =
    (currentMemorial.privacy === "password" || (currentMemorial.privacy as string) === "protected") &&
    currentMemorial.password &&
    !isUnlocked;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === currentMemorial.password) {
      setIsUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  if (isProtected) {
    return (
      <div className="min-h-[80vh] bg-[#FAF7F2] flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D9] shadow-md text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] flex items-center justify-center mx-auto text-[#7A4E38]">
            <Lock className="w-8 h-8 text-[#C5A880]" />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#7A4E38] block mb-1">
              Memorial Privado Protegido
            </span>
            <h2 className="font-serif text-2xl text-[#24201D] font-medium">
              {currentMemorial.personName}
            </h2>
            <p className="text-xs text-[#5C534B] mt-2">
              Este espacio conmemorativo familiar requiere una contraseña para ingresar y ver las fotografías, homenajes y recuerdos.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError(false);
                }}
                placeholder="Ingresa la contraseña familiar"
                className={`w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border text-sm text-[#24201D] focus:outline-none ${
                  passwordError
                    ? "border-red-400 focus:border-red-500"
                    : "border-[#D8CEBE] focus:border-[#C5A880]"
                }`}
                autoFocus
              />
            </div>

            {passwordError && (
              <p className="text-xs text-red-500 font-medium">
                Contraseña incorrecta. Por favor consulta con la familia organizadora.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
            >
              Ingresar al Memorial
            </button>
          </form>

          <div className="pt-4 border-t border-[#F4EFEA]">
            <button
              onClick={() => setCurrentView("landing")}
              className="inline-flex items-center gap-1.5 text-xs text-[#8C827A] hover:text-[#24201D] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la portada de MEMORA</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Memorial Hero Header */}
      <MemorialHero
        memorial={currentMemorial}
        onOpenTributeModal={() => setIsTributeModalOpen(true)}
        onOpenShareModal={() => setActiveShareMemorial(currentMemorial)}
      />

      {/* Main Memorial Tabs Content */}
      <MemorialTabs
        memorial={currentMemorial}
        onOpenTributeModal={() => setIsTributeModalOpen(true)}
        onOpenMediaLightbox={(item) => setSelectedLightboxItem(item)}
      />

      {/* Floating Bottom Quick Action Bar on Mobile/Tablet */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-30 flex items-center gap-2">
        <button
          onClick={() => setIsTributeModalOpen(true)}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-xs font-semibold shadow-lg hover:shadow-xl transition-all active:scale-[0.98] cursor-pointer"
          id="floating-tribute-btn"
        >
          <Heart className="w-4 h-4 text-[#C5A880]" />
          <span>Dejar Homenaje o Vela</span>
        </button>

        <button
          onClick={() => setActiveShareMemorial(currentMemorial)}
          className="w-11 h-11 rounded-full bg-white text-[#24201D] border border-[#D8CEBE] hover:border-[#C5A880] shadow-lg flex items-center justify-center transition-all cursor-pointer"
          aria-label="Compartir memorial"
          id="floating-share-btn"
        >
          <Share2 className="w-4 h-4 text-[#7A4E38]" />
        </button>

        <button
          onClick={() => setActivePrintableMemorial(currentMemorial)}
          className="w-11 h-11 rounded-full bg-[#FAF7F2] text-[#24201D] border border-[#D8CEBE] hover:border-[#C5A880] shadow-lg flex items-center justify-center transition-all cursor-pointer"
          aria-label="Crear recuerdo para imprimir (Cuadro, Urna, Placa)"
          title="Recuerdo para imprimir"
          id="floating-printable-btn"
        >
          <Printer className="w-4 h-4 text-[#C5A880]" />
        </button>
      </div>

      {/* Modals */}
      {isTributeModalOpen && (
        <TributeModal
          memorial={currentMemorial}
          onClose={() => setIsTributeModalOpen(false)}
        />
      )}

      {activeShareMemorial && (
        <ShareModal
          memorial={activeShareMemorial}
          onClose={() => setActiveShareMemorial(null)}
        />
      )}

      {selectedLightboxItem && (
        <MediaLightboxModal
          item={selectedLightboxItem}
          memorial={currentMemorial}
          onClose={() => setSelectedLightboxItem(null)}
        />
      )}
    </div>
  );
};
