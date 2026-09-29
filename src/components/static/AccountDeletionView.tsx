import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Trash2, ArrowLeft, AlertTriangle } from "lucide-react";

export const AccountDeletionView: React.FC = () => {
  const { setCurrentView, currentUser, deleteAccount, notify } = useApp();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar tu cuenta y todos tus memoriales? Esta acción es irreversible.")) {
      return;
    }
    setIsDeleting(true);
    const result = await deleteAccount();
    setIsDeleting(false);
    if (!result.success) {
      notify("error", "No pudimos eliminar tu cuenta", result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-12 border border-[#EAE3D9] shadow-xs space-y-8">
        <button
          onClick={() => setCurrentView("landing")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#7A4E38] hover:text-[#24201D] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al inicio</span>
        </button>

        <div className="border-b border-[#F4EFEA] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] text-xs font-semibold text-[#7A4E38] mb-3">
            <Trash2 className="w-3.5 h-3.5 text-[#C5A880]" />
            Eliminación de Cuenta — MEMORA
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#24201D] font-medium">
            Eliminar tu cuenta de MEMORA
          </h1>
        </div>

        <div className="space-y-6 text-sm text-[#4A423B] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-xl text-[#24201D] font-medium">Cómo solicitar la eliminación</h2>
            <p>
              Puedes eliminar tu cuenta de MEMORA (aplicación <strong>lat.memora.twa</strong>, sitio{" "}
              <strong>memora.lat</strong>) de dos formas:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Desde la app o el sitio:</strong> inicia sesión, ve a tu <strong>Panel de usuario → Cuenta →
                Eliminación de Cuenta</strong>, y presiona "Eliminar mi cuenta definitivamente". Puedes usar el botón
                aquí abajo si ya iniciaste sesión.
              </li>
              <li>
                <strong>Sin iniciar sesión:</strong> escríbenos a{" "}
                <a href="mailto:contacto@memora.lat" className="text-[#7A4E38] underline">
                  contacto@memora.lat
                </a>{" "}
                desde el correo asociado a tu cuenta, solicitando la eliminación. Procesaremos la solicitud dentro de
                un plazo de 30 días.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl text-[#24201D] font-medium">Qué datos se eliminan</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Tu perfil (nombre, correo, foto de perfil) y credenciales de acceso.</li>
              <li>
                Todos los memoriales de los que eres propietario, junto con sus fotos, videos, biografía, línea de
                tiempo, homenajes, árbol familiar y colaboradores asociados.
              </li>
              <li>Tu rol como colaborador en memoriales de otras familias.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl text-[#24201D] font-medium">Qué datos se conservan</h2>
            <p>
              Por obligaciones contables y tributarias, conservamos el registro de tus transacciones de pago (monto,
              fecha, estado), pero desvinculado de tu identidad — ya no queda asociado a tu nombre ni correo una vez
              eliminada la cuenta.
            </p>
          </section>

          <section className="space-y-3 bg-[#FAF7F2] rounded-2xl p-5 border border-[#EAE3D9]">
            <div className="flex items-start gap-2 text-[#B45309]">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-xs font-semibold">
                Esta acción es irreversible. Los memoriales, fotos y homenajes se eliminan de forma permanente.
              </p>
            </div>

            {currentUser ? (
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold text-red-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Eliminando…" : `Eliminar la cuenta de ${currentUser.email}`}
              </button>
            ) : (
              <p className="text-xs text-[#8C827A]">
                Inicia sesión para eliminar tu cuenta desde aquí, o escríbenos a contacto@memora.lat.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
