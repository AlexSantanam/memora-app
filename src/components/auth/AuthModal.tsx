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
  ArrowLeft,
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
    resetPasswordWithCode,
    registeredAccounts,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password Reset state
  const [resetStep, setResetStep] = useState<"request" | "verify">("request");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [sentCodeHint, setSentCodeHint] = useState<string | null>(null);

  // Google Selector Modal state
  const [showGoogleSelector, setShowGoogleSelector] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");

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
    setResetStep("request");
    setResetCode("");
    setNewPassword("");
    setSentCodeHint(null);
  };

  const handleSwitchMode = (mode: "login" | "register" | "forgot") => {
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

        const result = await register(name, email, password, selectedAvatar);
        if (!result.success) {
          setErrorMessage(result.error || "No se pudo crear la cuenta.");
        }
      } else {
        // Forgot password flow
        if (resetStep === "request") {
          const result = await requestPasswordReset(email);
          if (result.success) {
            setSuccessMessage(result.message);
            if (result.resetCode) {
              setSentCodeHint(result.resetCode);
              setResetCode(result.resetCode);
            }
            setResetStep("verify");
          } else {
            setErrorMessage(result.message);
          }
        } else {
          // Verify & set new password
          const result = await resetPasswordWithCode(email, resetCode, newPassword);
          if (result.success) {
            setSuccessMessage("¡Contraseña restablecida con éxito! Ya puedes ingresar.");
            setTimeout(() => {
              setAuthModalMode("login");
              setPassword(newPassword);
              resetFormState();
            }, 1200);
          } else {
            setErrorMessage(result.error || "Código o datos inválidos.");
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteGoogleLogin = async (profile?: { name?: string; email?: string; avatarUrl?: string }) => {
    setLoading(true);
    try {
      const res = await googleLogin(profile);
      if (res.success) {
        setShowGoogleSelector(false);
        setIsAuthModalOpen(false);
      } else {
        setErrorMessage(res.error || "Error al conectar con Google.");
      }
    } finally {
      setLoading(false);
    }
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

        {/* GOOGLE ACCOUNT SELECTOR SUB-MODAL */}
        {showGoogleSelector ? (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EAE3D9]">
              <button
                onClick={() => setShowGoogleSelector(false)}
                className="p-1 rounded-lg hover:bg-[#F4EFEA] text-[#7A4E38] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="font-serif text-lg text-[#24201D] font-medium">
                Acceder con Google
              </h3>
            </div>

            <p className="text-xs text-[#5C534B]">
              Selecciona una cuenta de Google para iniciar sesión o registrarte instantáneamente en MEMORA:
            </p>

            {/* Google Primary Account Card */}
            <div className="space-y-2.5">
              <button
                onClick={() =>
                  handleExecuteGoogleLogin({
                    email: "conectadoaia@gmail.com",
                    name: "Conectado AI",
                    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
                  })
                }
                disabled={loading}
                className="w-full p-3.5 rounded-2xl border border-[#D8CEBE] hover:border-[#C5A880] bg-[#FAF7F2] hover:bg-white text-left flex items-center justify-between transition-all group cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center text-sm border-2 border-white shadow-xs">
                    C
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-[#24201D] block group-hover:text-[#7A4E38]">
                      Conectado AI
                    </span>
                    <span className="text-[11px] text-[#7A7067]">conectadoaia@gmail.com</span>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-white border border-[#D8CEBE] flex items-center justify-center group-hover:bg-[#24201D] group-hover:text-white transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Custom Google Email Form */}
              <div className="p-4 rounded-2xl bg-white border border-[#EAE3D9] space-y-3">
                <span className="text-xs font-semibold text-[#24201D] block">
                  O usa otra cuenta Google (@gmail.com):
                </span>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    placeholder="Tu nombre (Ej. María José)"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D] focus:outline-none focus:border-[#C5A880]"
                  />
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="ejemplo@gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
                <button
                  onClick={() => {
                    if (!customGoogleEmail.includes("@")) {
                      setErrorMessage("Ingresa un correo Google válido.");
                      return;
                    }
                    handleExecuteGoogleLogin({
                      email: customGoogleEmail,
                      name: customGoogleName || customGoogleEmail.split("@")[0],
                    });
                  }}
                  disabled={loading || !customGoogleEmail}
                  className="w-full py-2.5 rounded-xl bg-[#24201D] text-white hover:bg-[#3D3530] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span>Continuar con esta cuenta Google</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C5A880]" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#8C827A] pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Conexión cifrada directa con los servidores de autenticación.</span>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-6 space-y-2">
              <Logo variant="dark" size="sm" showTagline={true} className="justify-center" />
              <h3 className="font-serif text-2xl text-[#24201D] font-medium pt-2">
                {authModalMode === "login"
                  ? "Bienvenido a tu espacio"
                  : authModalMode === "register"
                  ? "Crea tu cuenta familiar"
                  : "Recuperar contraseña"}
              </h3>
              <p className="text-xs text-[#5C534B]">
                {authModalMode === "login"
                  ? "Ingresa para administrar los memoriales y recuerdos de tu familia."
                  : authModalMode === "register"
                  ? "Comienza a construir un legado para siempre en pocos minutos."
                  : "Ingresa tu correo y te enviaremos el código seguro para restablecerla."}
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
            {authModalMode !== "forgot" && (
              <div className="space-y-4 mb-6">
                <button
                  type="button"
                  onClick={() => setShowGoogleSelector(true)}
                  className="w-full py-3 px-4 rounded-2xl border border-[#D8CEBE] hover:border-[#C5A880] bg-white hover:bg-[#FAF7F2] text-xs font-semibold text-[#24201D] flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
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
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setSelectedAvatar(event.target?.result as string);
                          };
                          reader.readAsDataURL(file);
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

              {/* COMMON: Email input */}
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

              {/* LOGIN & REGISTER: Password input */}
              {authModalMode !== "forgot" && (
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

              {/* FORGOT PASSWORD: STEP 2 (Verify code & new password) */}
              {authModalMode === "forgot" && resetStep === "verify" && (
                <div className="space-y-4 pt-2 border-t border-[#EAE3D9]">
                  {sentCodeHint && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                      <span className="font-semibold block">Código de recuperación generado:</span>
                      <span className="font-mono text-base font-bold tracking-widest text-[#7A4E38]">
                        {sentCodeHint}
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1">
                      Código de 6 dígitos
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="Ej. 849201"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] font-mono text-xs text-[#24201D] focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>

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
                </div>
              )}

              {/* Submit Button */}
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
                    : resetStep === "request"
                    ? "Solicitar Código de Recuperación"
                    : "Guardar Nueva Contraseña"}
                </span>
                <ArrowRight className="w-4 h-4 text-[#C5A880]" />
              </button>
            </form>

            {/* Switch mode links */}
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

            {/* Demo Fast Logins for Testing */}
            <div className="mt-5 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] text-[11px] text-[#7A7067] space-y-2.5">
              <span className="font-semibold block text-[#24201D]">Cuentas de prueba listas para usar:</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("carolina.valenzuela@ejemplo.com");
                    setPassword("password123");
                    login("carolina.valenzuela@ejemplo.com", "password123");
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-[#D8CEBE] text-[11px] font-medium text-[#24201D] hover:bg-[#F4EFEA] transition-colors cursor-pointer"
                >
                  👤 Familiar (Carolina)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("admin@memora.com");
                    setPassword("password123");
                    login("admin@memora.com", "password123");
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-[#D8CEBE] text-[11px] font-medium text-[#7A4E38] hover:bg-[#F4EFEA] transition-colors cursor-pointer"
                >
                  🛡️ Administrador
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleExecuteGoogleLogin({
                      email: "conectadoaia@gmail.com",
                      name: "Conectado AI",
                    })
                  }
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-[#D8CEBE] text-[11px] font-medium text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  🔵 Google (Conectado AI)
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

