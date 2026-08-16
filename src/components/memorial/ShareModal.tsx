import React, { useState, useEffect, useRef } from "react";
import { Memorial } from "../../types";
import { useApp } from "../../context/AppContext";
import QRCode from "qrcode";
import {
  X,
  Copy,
  Check,
  QrCode,
  Download,
  Share2,
  Mail,
  Send,
  Printer,
} from "lucide-react";

interface ShareModalProps {
  memorial: Memorial;
  isOpen?: boolean;
  onClose: () => void;
  showQROnly?: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  memorial,
  isOpen = true,
  onClose,
  showQROnly = false,
}) => {
  const { notify, setActivePrintableMemorial } = useApp();
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/m/${memorial.slug}` : `https://memora.app/m/${memorial.slug}`;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(
        shareUrl,
        {
          width: 400,
          margin: 2,
          color: {
            dark: "#24201D",
            light: "#FAF7F2",
          },
        },
        (err, url) => {
          if (!err && url) {
            setQrDataUrl(url);
          }
        }
      );
    }
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    notify("success", "Enlace copiado", "Pégalo en WhatsApp o envíalo a tu familia.");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR-Memorial-${memorial.personName.replace(/\s+/g, "_")}.png`;
    a.click();
    notify("success", "Código QR descargado", "Listo para imprimir en recordatorios o placas.");
  };

  const handleWhatsAppShare = () => {
    const text = `Te invito a recordar y rendir homenaje a ${memorial.personName} en su memorial digital MEMORA: ${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleEmailShare = () => {
    const subject = `Memorial digital en memoria de ${memorial.personName}`;
    const body = `Hola,\n\nTe comparto el espacio conmemorativo de ${memorial.personName} en MEMORA para compartir recuerdos, fotos y homenajes:\n\n${shareUrl}\n\nCon afecto.`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#EAE3D9] relative max-h-[90vh] overflow-y-auto">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#8C827A] hover:text-[#24201D] hover:bg-[#F4EFEA] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6 space-y-1">
          <div className="w-11 h-11 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] mx-auto flex items-center justify-center text-[#7A4E38] mb-2">
            <QrCode className="w-6 h-6 text-[#C5A880]" />
          </div>
          <h3 className="font-serif text-2xl text-[#24201D] font-medium">
            {showQROnly ? "Código QR del Memorial" : "Compartir este Memorial"}
          </h3>
          <p className="text-xs text-[#5C534B]">
            {memorial.personName}
          </p>
        </div>

        {/* QR Display Card */}
        <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] text-center space-y-4 mb-6">
          {qrDataUrl ? (
            <div className="w-44 h-44 mx-auto rounded-2xl overflow-hidden p-2 bg-[#FAF7F2] border border-[#EAE3D9] shadow-xs">
              <img src={qrDataUrl} alt="Código QR Memorial" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-44 h-44 mx-auto bg-stone-100 rounded-2xl flex items-center justify-center text-xs text-[#8C827A]">
              Generando QR...
            </div>
          )}

          <p className="text-[11px] text-[#5C534B] leading-relaxed">
            Escanea este código con cualquier cámara de smartphone para ingresar directamente sin instalar apps.
          </p>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleDownloadQR}
              className="w-full py-2.5 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Descargar solo QR (PNG)</span>
            </button>

            <button
              onClick={() => {
                onClose();
                setActivePrintableMemorial(memorial);
              }}
              className="w-full py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#F4EFEA] border border-[#C5A880] text-[#7A4E38] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>🖼️ Crear recuerdo para imprimir (Cuadro, Urna, Placa)</span>
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        {!showQROnly && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider">
              Enlace directo al memorial
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D] truncate focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-white border border-[#D8CEBE] hover:border-[#C5A880] text-xs font-semibold text-[#24201D] flex items-center gap-1.5 transition-colors flex-shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copiado" : "Copiar"}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleWhatsAppShare}
                className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handleEmailShare}
                className="py-2.5 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F4EFEA] text-[#24201D] border border-[#D8CEBE] text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-[#7A4E38]" />
                <span>Correo Familiar</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
