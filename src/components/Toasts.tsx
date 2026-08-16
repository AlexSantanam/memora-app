import React from "react";
import { useApp } from "../context/AppContext";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";

export const Toasts: React.FC = () => {
  const { notifications, dismissNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => {
        const isSuccess = notif.type === "success";
        const isError = notif.type === "error";
        const isWarning = notif.type === "warning";

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto rounded-2xl p-4 shadow-xl border backdrop-blur-md flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-bottom-5 ${
              isSuccess
                ? "bg-[#FAF7F2] border-[#C5A880]/60 text-[#24201D]"
                : isError
                ? "bg-red-50 border-red-200 text-red-900"
                : isWarning
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : "bg-[#F4EFEA] border-[#D8CEBE] text-[#24201D]"
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#8C6D46]" />}
              {isError && <XCircle className="w-5 h-5 text-red-600" />}
              {isWarning && <AlertCircle className="w-5 h-5 text-amber-600" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-[#8C827A]" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-snug">{notif.title}</p>
              {notif.message && (
                <p className="text-xs text-[#5C534B] mt-0.5 leading-relaxed break-words">
                  {notif.message}
                </p>
              )}
            </div>

            <button
              onClick={() => dismissNotification(notif.id)}
              className="text-[#8C827A] hover:text-[#24201D] p-1 rounded-lg transition-colors flex-shrink-0"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
