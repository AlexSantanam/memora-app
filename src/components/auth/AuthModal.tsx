import React, { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { Logo } from "../Logo";
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Smartphone,
  Upload,
  Camera,
  Trash2,
} from "lucide-react";

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    googleLogin,
    requestPasswordReset,
    confirmPasswordReset,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password Reset state — a real email is sent by Supabase with a secure
  // link; there is no code to type in. "reset-confirm" mode (a separate
  // screen below) is opened automatically once the user comes back via that link.
  const [resetRequested, setResetRequested] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Feedback & Loading
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: "", color: "" };
    if (pass.length < 6) return { score: 1, text: "Muy corta (mínimo 6 caracteres)", color: "bg-red-400 text-red-700" };
    const hasLetters = /[a-zA-Z]/.test(pass);
    const hasNumbers = /\d/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pass);
    const score = (hasLetters ? 1 : 0) + (hasNumbers ? 1 : 0) + (hasSpecial ? 1 : 0) + (pass.length >= 8 ? 1 : 0);

    if (score <= 2) return { score: 2, text: "Seguridad básica", color: "bg-amber-400 text-amber-700" };
    if (score === 3) return { score: 3, text: "Buena seguridad", color: "bg-emerald-400 text-emerald-700" };
    return { score: 4, text: "Muy segura", color: "bg-emerald-600 text-emerald-800" };
  };

  const strength = getPasswordStrength(password);

  const resetFormState = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword("");
    setConfirmPassword("");
    setResetRequested(false);
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const handleSwitchMode = (mode: "login" | "register" | "forgot" | "reset-confirm") => {
    resetFormState();
    setAuthModalMode(mode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (authModalMode === "login") {
        const result = await login(email, password);
        if (!result.success) {
          setErrorMessage(result.error || "No se pudo iniciar sesión.");
        }
      } else if (authModalMode === "register") {
        if (password !== confirmPassword) {
          setErrorMessage("Las contraseñas no coinciden.");
          setLoading(false);
          return;
        }

        const result = await register(name, email, password, selectedAvatarFile || undefined);
        if (!result.success) {
          setErrorMessage(result.error || "No se pudo crear la cuenta.");
        }
      } else if (authModalMode === "forgot") {
        const result = await requestPasswordReset(email);
        if (result.success) {
          setSuccessMessage(result.message);
          setResetRequested(true);
        } else {
          setErrorMessage(result.message);
        }
      } else {
        // reset-confirm: user arrived via the email link, just needs to set a new password
        if (newPassword !== confirmNewPassword) {
          setErrorMessage("Las contraseñas no coinciden.");
          setLoading(false);
          return;
        }
        const result = await confirmPasswordReset(newPassword);
        if (result.success) {
          setSuccessMessage("¡Contraseña restablecida con éxito!");
          setTimeout(() => {
            setIsAuthModalOpen(false);
            resetFormState();
          }, 1200);
        } else {
          setErrorMessage(result.error || "No se pudo restablecer la contraseña.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Redirige a Google (Supabase Auth) — el navegador navega a Google y vuelve
  // a MEMORA; la sesión se completa automáticamente al volver (ver AppContext).
  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setLoading(true);
    const result = await googleLogin();
    if (!result.success) {
      setErrorMessage(result.error || "No se pudo iniciar sesión con Google.");
      setLoading(false);
    }
    // On success the browser is navigating away — no further action needed here.
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#EAE3D9] relative max-h-[92vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-[#8C827A] hover:text-[#24201D] hover:bg-[#F4EFEA] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <>
            {/* Header */}
            <div className="text-center mb-6 space-y-2">
              <Logo variant="dark" size="sm" showTagline={true} className="justify-center" />
              <h3 className="font-serif text-2xl text-[#24201D] font-medium pt-2">
                {authModalMode === "login"
                  ? "Bienvenido a tu espacio"
                  : authModalMode === "register"
                  ? "Crea tu cuenta familiar"
                  : authModalMode === "reset-confirm"
                  ? "Elige tu nueva contraseña"
                  : "Recuperar contraseña"}
              </h3>
              <p className="text-xs text-[#5C534B]">
                {authModalMode === "login"
                  ? "Ingresa para administrar los memoriales y recuerdos de tu familia."
                  : authModalMode === "register"
                  ? "Comienza a construir un legado para siempre en pocos minutos."
                  : authModalMode === "reset-confirm"
                  ? "Ya verificamos tu identidad mediante el link de tu correo."
                  : "Ingresa tu correo y te enviaremos un link seguro para restablecerla."}
              </p>
            </div>

            {/* Error & Success Banners */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{successMessage}</span>
              </div>
            )}

            {/* Google One-Click Login Button */}
            {(authModalMode === "login" || authModalMode === "register") && (
              <div className="space-y-4 mb-6">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl border border-[#D8CEBE] hover:border-[#C5A880] bg-white hover:bg-[#FAF7F2] text-xs font-semibold text-[#24201D] flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer active:scale-[0.99] disabled:opacity-50"
                  id="google-signin-button"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continuar con Google</span>
                </button>

                <div className="flex items-center gap-3">
                  <div className="h-px bg-[#EAE3D9] flex-1"></div>
                  <span className="text-[11px] text-[#8C827A] uppercase font-medium">o con correo independiente</span>
                  <div className="h-px bg-[#EAE3D9] flex-1"></div>
                </div>
              </div>
            )}

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* REGISTER MODE: Name & Avatar selection */}
              {authModalMode === "register" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                      Nombre y Apellido
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Roberto Morales Valdés"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D] focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1.5">
                      Foto de Perfil (Opcional)
                    </label>

                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            setErrorMessage("La imagen debe ser menor a 10MB");
                            return;
                          }
                          setSelectedAvatarFile(file);
                          setSelectedAvatar(URL.createObjectURL(file));
                        }
                      }}
                    />

                    <div className="flex items-center gap-3">
                      {selectedAvatar ? (
                        <div className="relative group">
                          <img
                            src={selectedAvatar}
                            alt="Vista previa"
                            className="w-14 h-14 rounded-full object-cover border-2 border-[#C5A880] shadow-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAvatar("");
                              setSelectedAvatarFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="absolute -top-1 -right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-xs"
                            title="Eliminar foto"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border-2 border-dashed border-[#D8CEBE] flex items-center justify-center text-[#8C827A]">
                          <Camera className="w-5 h-5" />
                        </div>
                      )}

                      <div className="flex-1 space-y-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F4EFEA] border border-[#D8CEBE] text-xs font-semibold text-[#24201D] flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>{selectedAvatar ? "Cambiar foto..." : "Subir archivo de imagen"}</span>
                        </button>
                        <p className="text-[11px] text-[#8C827A]">
                          JPG, PNG o WEBP desde tu dispositivo (máx. 10MB).
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* COMMON: Email input (not shown for reset-confirm, or once the reset email was already requested) */}
              {authModalMode !== "reset-confirm" && !(authModalMode === "forgot" && resetRequested) && (
                <div>
                  <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu.correo@ejemplo.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D] focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>
              )}

              {/* LOGIN & REGISTER: Password input */}
              {(authModalMode === "login" || authModalMode === "register") && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider">
                      Contraseña
                    </label>
                    {authModalMode === "login" && (
                      <button
                        type="button"
                        onClick={() => handleSwitchMode("forgot")}
                        className="text-[11px] text-[#7A4E38] hover:underline cursor-pointer"
                      >
                        ¿Olvidaste tu clave?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D] focus:outline-none focus:border-[#C5A880]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#8C827A] hover:text-[#24201D] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength indicator for registration */}
                  {authModalMode === "register" && password.length > 0 && (
                    <div className="mt-1.5 space-y-1">
                      <div className="flex gap-1 h-1.5 w-full bg-[#EAE3D9] rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            strength.score === 1
                              ? "w-1/4 bg-red-500"
                              : strength.score === 2
                              ? "w-2/4 bg-amber-500"
                              : strength.score === 3
                              ? "w-3/4 bg-emerald-500"
                              : "w-full bg-emerald-600"
                          }`}
                        ></div>
                      </div>
                      <span className="text-[10px] text-[#8C827A] block">{strength.text}</span>
                    </div>
                  )}
                </div>
              )}

              {/* REGISTER MODE: Confirm Password */}
              {authModalMode === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-3.5" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite tu contraseña"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D] focus:outline-none focus:border-[#C5A880]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-[#8C827A] hover:text-[#24201D] cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* FORGOT PASSWORD: confirmation that a real email was sent */}
              {authModalMode === "forgot" && resetRequested && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    Revisa tu bandeja de entrada (y spam) y haz clic en el link para elegir una nueva contraseña.
                  </span>
                </div>
              )}

              {/* RESET-CONFIRM: new password after clicking the email link */}
              {authModalMode === "reset-confirm" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D] focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                      Confirmar Nueva Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Repite tu nueva contraseña"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D] focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              {!(authModalMode === "forgot" && resetRequested) && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  <span>
                    {authModalMode === "login"
                      ? "Iniciar Sesión"
                      : authModalMode === "register"
                      ? "Crear mi Cuenta Independiente"
                      : authModalMode === "reset-confirm"
                      ? "Guardar Nueva Contraseña"
                      : "Enviar Link de Recuperación"}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#C5A880]" />
                </button>
              )}
            </form>

            {/* Switch mode links */}
            {authModalMode !== "reset-confirm" && (
              <div className="mt-6 pt-4 border-t border-[#F4EFEA] text-center text-xs text-[#5C534B] space-y-2">
                {authModalMode === "login" ? (
                  <p>
                    ¿Aún no tienes cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => handleSwitchMode("register")}
                      className="text-[#7A4E38] font-semibold hover:underline cursor-pointer"
                    >
                      Regístrate gratis
                    </button>
                  </p>
                ) : (
                  <p>
                    ¿Ya tienes cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => handleSwitchMode("login")}
                      className="text-[#7A4E38] font-semibold hover:underline cursor-pointer"
                    >
                      Inicia sesión aquí
                    </button>
                  </p>
                )}
              </div>
            )}
        </>

      </div>
    </div>
  );
};

