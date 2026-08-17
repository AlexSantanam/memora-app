import React, { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { Memorial, PrivacyLevel, MemorialType, PetSpecies } from "../../types";
import { WhatsAppButton } from "../whatsapp/WhatsAppButton";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Heart,
  CheckCircle2,
  Lock,
  Globe,
  KeyRound,
  EyeOff,
  Image as ImageIcon,
  BookOpen,
  QrCode,
  Calendar,
  MapPin,
  Loader2,
  RefreshCw,
  User as UserIcon,
  Smile,
  Compass,
  Upload,
  Camera,
  X,
} from "lucide-react";

export const MemorialWizard: React.FC = () => {
  const {
    createMemorial,
    setCurrentView,
    openMemorialBySlug,
    generateStoryWithAI,
    notify,
    currentUser,
    userUsage,
    setSelectedPlanForCheckout,
    goToPlanSelection,
  } = useApp();

  // Step 0: Type Selection ("¿A quién quieres recordar?")
  // Step 1: Basic Info
  // Step 2: Photos & Quote
  // Step 3: Story & AI
  // Step 4: Privacy & Plan
  // Step 5: Confirm & Publish
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // File Input Refs for direct local image uploads
  const mainPhotoInputRef = useRef<HTMLInputElement>(null);
  const coverPhotoInputRef = useRef<HTMLInputElement>(null);

  // Memorial Type Choice
  const [memorialType, setMemorialType] = useState<MemorialType>("person");

  // Form State
  const [formData, setFormData] = useState<{
    personName: string;
    preferredName: string;
    birthDate: string;
    passingDate: string;
    birthPlace: string;
    restingPlace: string;
    mainPhoto: string;
    coverPhoto: string;
    quote: string;
    summary: string;
    biography: string;
    privacy: PrivacyLevel;
    password: string;
    // Pet specific fields
    species: string;
    breed: string;
    personality: string;
    favoriteThings: string;
    favoritePlace: string;
    anecdote: string;
    arrivalStory: string;
    specialTrait: string;
    // AI Input Fields
    aiNotes: string;
    aiPassions: string;
    aiFamily: string;
    aiTone: string;
  }>({
    personName: "",
    preferredName: "",
    birthDate: "",
    passingDate: "",
    birthPlace: "",
    restingPlace: "",
    mainPhoto: "",
    coverPhoto: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    quote: `"Su luz y su recuerdo permanecen siempre entre nosotros."`,
    summary: "",
    biography: "",
    privacy: "public",
    password: "",
    // Pet defaults
    species: "perro",
    breed: "",
    personality: "",
    favoriteThings: "",
    favoritePlace: "",
    anecdote: "",
    arrivalStory: "",
    specialTrait: "",
    // AI inputs
    aiNotes: "",
    aiPassions: "",
    aiFamily: "",
    aiTone: "emotivo y celebratorio de su vida",
  });

  const [aiGeneratedSuccess, setAiGeneratedSuccess] = useState(false);

  // Preset sample photo choices for persons
  const samplePersonMainPhotos = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  ];

  // Preset sample photo choices for pets
  const samplePetMainPhotos = [
    "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80",
  ];

  const sampleCoverPhotos = [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1600&q=80",
  ];

  const petSpeciesOptions = [
    { id: "perro", label: "Perro", icon: "🐕" },
    { id: "gato", label: "Gato", icon: "🐈" },
    { id: "ave", label: "Ave", icon: "🦜" },
    { id: "conejo", label: "Conejo", icon: "🐇" },
    { id: "caballo", label: "Caballo", icon: "🐎" },
    { id: "otro", label: "Otro compañero", icon: "✨" },
  ];

  const handleSelectType = (type: MemorialType) => {
    setMemorialType(type);
    if (type === "pet") {
      setFormData((prev) => ({
        ...prev,
        quote: `"Nos diste años de alegría incondicional y el amor más puro que conocimos."`,
        summary: prev.summary || `En memoria amorosa de nuestro fiel compañero`,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        quote: `"Su luz y su recuerdo permanecen siempre entre nosotros."`,
      }));
    }
    setCurrentStep(1);
  };

  // Validation
  const canProceedStep1 = formData.personName.trim().length > 0;

  const handleGenerateAI = async () => {
    if (!formData.personName) {
      notify("warning", "Nombre requerido", "Por favor ingresa primero el nombre en el paso 1.");
      return;
    }

    setIsGeneratingAI(true);
    try {
      const result = await generateStoryWithAI({
        personName: formData.personName,
        memorialType,
        species: formData.species,
        breed: formData.breed,
        birthDate: formData.birthDate,
        passingDate: formData.passingDate,
        birthPlace: formData.birthPlace,
        notes: formData.aiNotes,
        passions: formData.aiPassions,
        familyDetails: formData.aiFamily,
        personality: formData.personality,
        favoriteThings: formData.favoriteThings,
        favoritePlace: formData.favoritePlace,
        anecdote: formData.anecdote,
        arrivalStory: formData.arrivalStory,
        specialTrait: formData.specialTrait,
        tone: formData.aiTone,
      });

      setFormData((prev) => ({
        ...prev,
        biography: result.biography,
        summary: result.shortSummary || prev.summary,
        quote: result.memorialQuote || prev.quote,
      }));
      setAiGeneratedSuccess(true);
      notify("success", "Historia redactada con éxito", "Puedes revisarla, modificar párrafos y darle tu toque personal.");
    } catch (err) {
      notify("error", "No se pudo generar la historia", "Intenta escribir unas líneas manualmente.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleFinishCreation = async () => {
    setIsSubmitting(true);
    try {
      const created = await createMemorial({
        type: memorialType,
        personName: formData.personName,
        preferredName: formData.preferredName,
        birthDate: formData.birthDate,
        passingDate: formData.passingDate,
        birthPlace: formData.birthPlace,
        restingPlace: formData.restingPlace,
        mainPhoto: formData.mainPhoto,
        coverPhoto: formData.coverPhoto,
        quote: formData.quote,
        summary:
          formData.summary ||
          (memorialType === "pet"
            ? `En memoria entrañable de ${formData.personName}, nuestro amado compañero.`
            : `En memoria amorosa de ${formData.personName}`),
        biography:
          formData.biography ||
          (memorialType === "pet"
            ? `${formData.personName} fue un ser leal y bondadoso que llenó nuestro hogar de alegría y amor incondicional.`
            : `${formData.personName} fue un ser humano excepcional, cuyo amor y recuerdos perdurarán eternamente.`),
        privacy: formData.privacy,
        password: formData.password,
        // Pet attributes
        species: memorialType === "pet" ? formData.species : undefined,
        breed: memorialType === "pet" ? formData.breed : undefined,
        personality: memorialType === "pet" ? formData.personality : undefined,
        favoriteThings: memorialType === "pet" ? formData.favoriteThings : undefined,
        favoritePlace: memorialType === "pet" ? formData.favoritePlace : undefined,
        anecdote: memorialType === "pet" ? formData.anecdote : undefined,
        arrivalStory: memorialType === "pet" ? formData.arrivalStory : undefined,
        specialTrait: memorialType === "pet" ? formData.specialTrait : undefined,
      });

      // Navigate to created memorial
      openMemorialBySlug(created.slug);
    } catch (e) {
      notify("error", "Error al crear el memorial", "Por favor revisa los campos e intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#EAE3D9]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#7A4E38] flex items-center gap-1.5 mb-1">
              <Heart className="w-3.5 h-3.5 text-[#C5A880]" />
              {memorialType === "pet" ? "MEMORA Mascotas" : "Creación de Memorial"}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#24201D] font-medium">
              {currentStep === 0
                ? "¿A quién deseas recordar?"
                : memorialType === "pet"
                ? "Crea un memorial para tu compañero animal"
                : "Crea un espacio eterno para tu ser querido"}
            </h1>
          </div>
          <button
            onClick={() => setCurrentView("dashboard")}
            className="text-xs font-medium text-[#8C827A] hover:text-[#24201D] transition-colors"
          >
            Cancelar y volver
          </button>
        </div>

        {/* Quota warning banner if at limit */}
        {!userUsage.canCreateMemora && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">
                  {userUsage.isPaid
                    ? `Límite de MEMORAs alcanzado (${userUsage.memorasUsed} de ${userUsage.memorasMax})`
                    : "Necesitas activar tu plan para crear una MEMORA"}
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  {userUsage.isPaid
                    ? `Tu plan actual (${userUsage.plan.name}) tiene copada su cuota de MEMORAs. Puedes mejorar a Plan Familia ($4.900/año) o Legado ($14.900/año) para crear más espacios y ampliar tu bolsa de fotos.`
                    : "Tu cuenta aún no tiene un plan activo. Elige y activa un plan para poder crear tu primera MEMORA."}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (userUsage.isPaid) {
                  setSelectedPlanForCheckout(userUsage.plan.id === "esencial" ? "familia" : "legado");
                } else {
                  goToPlanSelection();
                }
              }}
              className="px-4 py-2 rounded-full bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors shadow-xs"
            >
              {userUsage.isPaid ? "Mejorar mi Plan" : "Elegir mi Plan"}
            </button>
          </div>
        )}

        {/* STEP 0: Initial Type Selection Card Screen */}
        {currentStep === 0 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <p className="text-sm sm:text-base text-[#5C534B] leading-relaxed">
                Selecciona a quién deseas rendir homenaje. Cada espacio dentro de MEMORA mantiene la misma elegancia, calidez y permanencia digital.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              
              {/* Option 1: Persona */}
              <div
                onClick={() => handleSelectType("person")}
                className="group relative bg-white rounded-3xl p-8 border-2 border-[#EAE3D9] hover:border-[#C5A880] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6"
                id="wizard-select-person-btn"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] group-hover:bg-[#C5A880]/20 flex items-center justify-center text-[#7A4E38] transition-colors">
                    <UserIcon className="w-8 h-8 text-[#7A4E38]" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A4E38] block">
                      Memorial Personal
                    </span>
                    <h3 className="font-serif text-2xl text-[#24201D] font-medium group-hover:text-[#7A4E38] transition-colors">
                      Una Persona
                    </h3>
                    <p className="text-xs font-serif italic text-[#7A4E38]">
                      "Una vida, una historia, un legado."
                    </p>
                  </div>

                  <p className="text-xs text-[#5C534B] leading-relaxed">
                    Reúne su biografía, historia familiar, fotografías, árbol de vínculos y homenajes de todas las personas que tocaron su camino.
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F4EFEA] flex items-center justify-between text-xs font-semibold text-[#24201D] group-hover:text-[#7A4E38]">
                  <span>Crear Memorial Persona</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A880] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Option 2: Mascota */}
              <div
                onClick={() => handleSelectType("pet")}
                className="group relative bg-white rounded-3xl p-8 border-2 border-[#EAE3D9] hover:border-[#C5A880] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6"
                id="wizard-select-pet-btn"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] group-hover:bg-[#C5A880]/20 flex items-center justify-center text-[#7A4E38] transition-colors text-3xl">
                    🐾
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A4E38] block">
                      MEMORA Mascotas
                    </span>
                    <h3 className="font-serif text-2xl text-[#24201D] font-medium group-hover:text-[#7A4E38] transition-colors">
                      Una Mascota
                    </h3>
                    <p className="text-xs font-serif italic text-[#7A4E38]">
                      "Un compañero, una historia, un amor para siempre."
                    </p>
                  </div>

                  <p className="text-xs text-[#5C534B] leading-relaxed">
                    Conserva sus momentos entrañables, travesuras, costumbres favoritas, fotos inolvidables y la gratitud por su lealtad eterna.
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F4EFEA] flex items-center justify-between text-xs font-semibold text-[#24201D] group-hover:text-[#7A4E38]">
                  <span>Crear Memorial Mascota</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A880] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Steps 1 to 5 */}
        {currentStep > 0 && (
          <>
            {/* Step Indicator */}
            <div className="mb-10">
              <div className="flex items-center justify-between text-xs text-[#7A4E38] mb-2 px-1">
                <button
                  onClick={() => setCurrentStep(0)}
                  className="font-medium hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Tipo: {memorialType === "pet" ? "🐾 Mascota" : "👤 Persona"}</span>
                  <span className="text-[10px] text-[#8C827A]">(Cambiar)</span>
                </button>
                <span className="text-[11px] text-[#8C827A]">Paso {currentStep} de 5</span>
              </div>

              <div className="grid grid-cols-5 gap-2 sm:gap-4">
                {[
                  { num: 1, label: memorialType === "pet" ? "Datos del Compañero" : "Datos Básicos" },
                  { num: 2, label: "Fotografías" },
                  { num: 3, label: memorialType === "pet" ? "¿Cómo era? & IA" : "Biografía & IA" },
                  { num: 4, label: "Privacidad" },
                  { num: 5, label: "Confirmar" },
                ].map((step) => {
                  const isCurrent = currentStep === step.num;
                  const isDone = currentStep > step.num;
                  return (
                    <div key={step.num} className="flex flex-col items-center text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                          isCurrent
                            ? "bg-[#24201D] text-white shadow-md ring-4 ring-[#C5A880]/30"
                            : isDone
                            ? "bg-[#C5A880] text-white"
                            : "bg-[#EAE3D9] text-[#7A7067]"
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs mt-1.5 font-medium truncate max-w-full ${
                          isCurrent ? "text-[#24201D]" : "text-[#8C827A]"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="w-full bg-[#EAE3D9] h-1 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-[#C5A880] h-full transition-all duration-300"
                  style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Form Container Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EAE3D9] shadow-sm">
              
              {/* STEP 1: Datos Principales */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-[#F4EFEA] pb-4">
                    <h2 className="font-serif text-xl sm:text-2xl text-[#24201D] font-medium">
                      {memorialType === "pet"
                        ? "Información de tu compañero animal"
                        : "Información de la persona"}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5C534B] mt-1">
                      {memorialType === "pet"
                        ? "Ingresa los datos para honrar y celebrar su vida junto a la familia."
                        : "Ingresa los datos fundamentales para identificar el memorial."}
                    </p>
                  </div>

                  {memorialType === "pet" ? (
                    /* PET FORM FIELDS */
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1.5">
                            Nombre de la mascota <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.personName}
                            onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                            placeholder="Ej. Mateo, Luna, Toby, Simón"
                            className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] focus:outline-none focus:border-[#C5A880] text-sm text-[#24201D]"
                            id="input-pet-name"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1.5">
                            Apodo o nombre cariñoso (opcional)
                          </label>
                          <input
                            type="text"
                            value={formData.preferredName}
                            onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                            placeholder="Ej. Matito, Gordito, Pelusa"
                            className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] focus:outline-none focus:border-[#C5A880] text-sm text-[#24201D]"
                          />
                        </div>
                      </div>

                      {/* Species selector chips */}
                      <div>
                        <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-2">
                          Especie
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                          {petSpeciesOptions.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, species: opt.id })}
                              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                                formData.species === opt.id
                                  ? "bg-[#24201D] text-white border-[#24201D] shadow-xs"
                                  : "bg-[#FAF7F2] text-[#5C534B] border-[#EAE3D9] hover:border-[#D8CEBE]"
                              }`}
                            >
                              <span className="text-xl">{opt.icon}</span>
                              <span className="text-xs font-medium">{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1.5">
                            Raza o mezcla
                          </label>
                          <input
                            type="text"
                            value={formData.breed}
                            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                            placeholder="Ej. Golden Retriever, Mestizo, Siamés"
                            className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] focus:outline-none focus:border-[#C5A880] text-sm text-[#24201D]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1.5">
                            Lugar de origen o ciudad
                          </label>
                          <input
                            type="text"
                            value={formData.birthPlace}
                            onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                            placeholder="Ej. Valdivia, Chile"
                            className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] focus:outline-none focus:border-[#C5A880] text-sm text-[#24201D]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1.5">
                            Fecha de nacimiento o llegada
                          </label>
                          <input
                            type="date"
                            value={formData.birthDate}
                            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                            className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] focus:outline-none focus:border-[#C5A880] text-sm text-[#24201D]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1.5">
                            Fecha de despedida
                          </label>
                          <input
                            type="date"
                            value={formData.passingDate}
                            onChange={(e) => setFormData({ ...formData, passingDate: e.target.value })}
                            className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] focus:outline-none focus:border-[#C5A880] text-sm text-[#24201D]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1.5">
                          Lugar de descanso o memoria (opcional)
                        </label>
                        <input
                          type="text"
                          value={formData.restingPlace}
                          onChange={(e) => setFormData({ ...formData, restingPlace: e.target.value })}
                          placeholder="Ej. Bajo el cerezo en el jardín, En nuestro corazón"
                          className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] focus:outline-none focus:border-[#C5A880] text-sm text-[#24201D]"
                        />
                      </div>
                    </div>
                  ) : (
                    /* PERSON FORM FIELDS */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1.5">
                          Nombre completo <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.personName}
                          onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                          placeholder="Ej. María Teresa González Henríquez"
                          className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] focus:outline-none focus:border-[#C5A880] text-sm text-[#24201D]"
                          id="input-person-name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1.5">
                          Nombre cariñoso o apodo (opcional)
                        </label>
                        <input
                          type="text"
                          value={formData.preferredName}
                          onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                          placeholder="Ej. Abuelita Tere, Tito"
                          className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] focus:outline-none focus:border-[#C5A880] text-sm text-[#24201D]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1.5">
                          Lugar de origen o nacimiento
                        </label>
                        <input
                          type="text"
                          value={formData.birthPlace}
                          onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                          placeholder="Ej. Valparaíso, Chile"
                          className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] focus:outline-none focus:border-[#C5A880] text-sm text-[#24201D]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1.5">
                          Fecha de nacimiento
                        </label>
                        <input
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] focus:outline-none focus:border-[#C5A880] text-sm text-[#24201D]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1.5">
                          Fecha de partida
                        </label>
                        <input
                          type="date"
                          value={formData.passingDate}
                          onChange={(e) => setFormData({ ...formData, passingDate: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] focus:outline-none focus:border-[#C5A880] text-sm text-[#24201D]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider mb-1.5">
                          Lugar de descanso o sepelio (opcional)
                        </label>
                        <input
                          type="text"
                          value={formData.restingPlace}
                          onChange={(e) => setFormData({ ...formData, restingPlace: e.target.value })}
                          placeholder="Ej. Cementerio Parque del Mar, Concón"
                          className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] focus:outline-none focus:border-[#C5A880] text-sm text-[#24201D]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Fotografías Principales & Frase */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-[#F4EFEA] pb-4">
                    <h2 className="font-serif text-xl sm:text-2xl text-[#24201D] font-medium">
                      Fotografía de portada y retrato
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5C534B] mt-1">
                      {memorialType === "pet"
                        ? "Elige una fotografía entrañable de tu mascota y una imagen de fondo que represente la paz de la naturaleza."
                        : "Elige una foto cálida que refleje su sonrisa y una imagen de fondo que represente sus gustos o tranquilidad."}
                    </p>
                  </div>

                  {/* Main Photo Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider">
                        Foto de perfil o retrato principal
                      </label>
                      <button
                        type="button"
                        onClick={() => mainPhotoInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F4EFEA] border border-[#D8CEBE] text-xs font-semibold text-[#24201D] transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Subir archivo desde mi dispositivo</span>
                      </button>
                    </div>

                    {/* Hidden input for main photo */}
                    <input
                      type="file"
                      ref={mainPhotoInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 15 * 1024 * 1024) {
                            notify("warning", "Imagen muy pesada", "El archivo debe pesar menos de 15MB.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setFormData((prev) => ({
                              ...prev,
                              mainPhoto: event.target?.result as string,
                            }));
                            notify("success", "Foto cargada", "Se ha actualizado el retrato principal.");
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />

                    <div className="flex items-center gap-4">
                      <div
                        onClick={() => mainPhotoInputRef.current?.click()}
                        className={`w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 relative group cursor-pointer ${
                          formData.mainPhoto
                            ? "bg-stone-100 border-2 border-[#C5A880]"
                            : "bg-[#FAF7F2] border-2 border-dashed border-[#D8CEBE] flex flex-col items-center justify-center text-[#8C827A]"
                        }`}
                      >
                        {formData.mainPhoto ? (
                          <>
                            <img
                              src={formData.mainPhoto}
                              alt="Retrato"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => mainPhotoInputRef.current?.click()}
                              className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer text-[10px] font-medium"
                            >
                              <Camera className="w-4 h-4 mb-0.5" />
                              <span>Cambiar</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-5 h-5 mb-1" />
                            <span className="text-[10px] font-medium text-center px-1">Sube una foto</span>
                          </>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={formData.mainPhoto}
                            onChange={(e) => setFormData({ ...formData, mainPhoto: e.target.value })}
                            placeholder="O pega la URL directa de la imagen"
                            className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D]"
                          />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          <span className="text-[10px] text-[#8C827A] flex-shrink-0">Fotos sugeridas:</span>
                          {(memorialType === "pet" ? samplePetMainPhotos : samplePersonMainPhotos).map((url, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setFormData({ ...formData, mainPhoto: url })}
                              className={`w-8 h-8 rounded-lg overflow-hidden border transition-all flex-shrink-0 cursor-pointer ${
                                formData.mainPhoto === url ? "ring-2 ring-[#C5A880] border-[#C5A880]" : "opacity-60 hover:opacity-100 border-[#D8CEBE]"
                              }`}
                            >
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cover Photo Selection */}
                  <div className="space-y-3 pt-4 border-t border-[#F4EFEA]">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider">
                        Foto de portada (Fondo panorámico)
                      </label>
                      <button
                        type="button"
                        onClick={() => coverPhotoInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F4EFEA] border border-[#D8CEBE] text-xs font-semibold text-[#24201D] transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Subir archivo de portada</span>
                      </button>
                    </div>

                    {/* Hidden input for cover photo */}
                    <input
                      type="file"
                      ref={coverPhotoInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 20 * 1024 * 1024) {
                            notify("warning", "Imagen muy pesada", "El archivo de portada debe pesar menos de 20MB.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setFormData((prev) => ({
                              ...prev,
                              coverPhoto: event.target?.result as string,
                            }));
                            notify("success", "Portada cargada", "Se ha actualizado la imagen panorámica de fondo.");
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />

                    <div className="h-36 rounded-2xl overflow-hidden bg-stone-100 border border-[#D8CEBE] relative group">
                      <img
                        src={formData.coverPhoto}
                        alt="Portada"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/35 flex items-center justify-between px-6">
                        <span className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xs text-xs font-semibold text-[#24201D] shadow-xs">
                          Vista previa de cabecera
                        </span>
                        <button
                          type="button"
                          onClick={() => coverPhotoInputRef.current?.click()}
                          className="px-4 py-2 rounded-full bg-[#24201D]/90 hover:bg-[#24201D] text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>Subir otra portada</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      <span className="text-[10px] text-[#8C827A] flex-shrink-0">Paisajes de serenidad:</span>
                      {sampleCoverPhotos.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, coverPhoto: url })}
                          className={`h-10 w-20 rounded-lg overflow-hidden border transition-all flex-shrink-0 cursor-pointer ${
                            formData.coverPhoto === url ? "ring-2 ring-[#C5A880] border-[#C5A880]" : "opacity-60 hover:opacity-100 border-[#D8CEBE]"
                          }`}
                        >
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quote */}
                  <div className="space-y-2 pt-4 border-t border-[#F4EFEA]">
                    <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider">
                      Cita o frase representativa
                    </label>
                    <textarea
                      rows={2}
                      value={formData.quote}
                      onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                      placeholder={
                        memorialType === "pet"
                          ? '"Hay seres que no necesitan hablar para enseñarnos lo que es el amor incondicional."'
                          : '"Los recuerdos que sembramos con amor son eternos..."'
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] focus:outline-none focus:border-[#C5A880] text-sm text-[#24201D]"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Biografía / ¿Cómo era? & Asistente IA */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-[#F4EFEA] pb-4">
                    <h2 className="font-serif text-xl sm:text-2xl text-[#24201D] font-medium">
                      {memorialType === "pet" ? "¿Cómo era? & Su Historia" : "Historia de vida y biografía"}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5C534B] mt-1">
                      {memorialType === "pet"
                        ? "Cuéntanos sobre su personalidad y momentos inolvidables. Puedes usar nuestro asistente inteligente para redactar su historia con profundo cariño y respeto."
                        : "Puedes redactar libremente o apoyarte en nuestro asistente inteligente para estructurar sus vivencias."}
                    </p>
                  </div>

                  {/* PET SPECIFIC EMOTIONAL MEMORIES CARD */}
                  {memorialType === "pet" && (
                    <div className="rounded-2xl p-5 bg-[#FAF7F2] border border-[#D8CEBE] space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A4E38] flex items-center gap-2">
                        <span>🐾 Recuerdos y Rasgos de su Vida</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-semibold text-[#24201D] mb-1">
                            Personalidad
                          </label>
                          <input
                            type="text"
                            value={formData.personality}
                            onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                            placeholder="Ej. Noble, juguetón, dulce y muy paciente"
                            className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-[#24201D] mb-1">
                            Lo que más le encantaba
                          </label>
                          <input
                            type="text"
                            value={formData.favoriteThings}
                            onChange={(e) => setFormData({ ...formData, favoriteThings: e.target.value })}
                            placeholder="Ej. Pasear en la playa, jugar con su pelota, los pedacitos de queso"
                            className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-[#24201D] mb-1">
                            Su rincón favorito del hogar
                          </label>
                          <input
                            type="text"
                            value={formData.favoritePlace}
                            onChange={(e) => setFormData({ ...formData, favoritePlace: e.target.value })}
                            placeholder="Ej. El tapete al sol junto a la ventana"
                            className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-[#24201D] mb-1">
                            ¿Cómo llegó a sus vidas?
                          </label>
                          <input
                            type="text"
                            value={formData.arrivalStory}
                            onChange={(e) => setFormData({ ...formData, arrivalStory: e.target.value })}
                            placeholder="Ej. Lo adoptamos una tarde de lluvia siendo un cachorro"
                            className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-[#24201D] mb-1">
                            Una travesura o anécdota inolvidable
                          </label>
                          <textarea
                            rows={2}
                            value={formData.anecdote}
                            onChange={(e) => setFormData({ ...formData, anecdote: e.target.value })}
                            placeholder="Ej. Aquella vez que se robó una barra de pan de la mesa y se sentó orgulloso en el patio con ella en la boca..."
                            className="w-full p-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                          />
                        </div>
                      </div>

                      {/* AI Generator CTA for Pets */}
                      <div className="pt-3 border-t border-[#EAE3D9] flex flex-col sm:flex-row items-center justify-between gap-3">
                        <span className="text-[11px] text-[#7A7067] italic">
                          Convierte estos recuerdos en una conmovedora historia con nuestro redactor asistido por IA.
                        </span>
                        <button
                          type="button"
                          disabled={isGeneratingAI}
                          onClick={handleGenerateAI}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                          {isGeneratingAI ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />
                              <span>Escribiendo historia con cariño...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                              <span>{aiGeneratedSuccess ? "Regenerar Historia con IA" : "Redactar Historia con IA"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PERSON AI ASSISTANT BOX */}
                  {memorialType === "person" && (
                    <div className="rounded-2xl p-5 bg-[#FAF7F2] border border-[#D8CEBE] space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#C5A880]/20 flex items-center justify-center text-[#7A4E38]">
                          <Sparkles className="w-4 h-4 text-[#C5A880]" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A4E38]">
                            Asistente Editorial MEMORA (Impulsado por Gemini)
                          </h4>
                          <p className="text-[11px] text-[#8C827A]">
                            Escribe notas simples o anécdotas y crearemos una redacción cuidada y conmovedora.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-semibold text-[#24201D] mb-1">
                            Recuerdos clave / notas sueltas
                          </label>
                          <textarea
                            rows={3}
                            value={formData.aiNotes}
                            onChange={(e) => setFormData({ ...formData, aiNotes: e.target.value })}
                            placeholder="Ej. Fue docente 40 años, adoraba cocinar para la familia grande los domingos, siempre tenía una sonrisa para sus vecinos..."
                            className="w-full p-3 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-[#24201D] mb-1">
                            Pasiones, viajes y familia
                          </label>
                          <textarea
                            rows={3}
                            value={formData.aiPassions}
                            onChange={(e) => setFormData({ ...formData, aiPassions: e.target.value })}
                            placeholder="Ej. Le gustaba la música clásica, viajar al sur de Chile, sus nietos eran su mayor orgullo..."
                            className="w-full p-3 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <span className="text-[11px] text-[#7A7067] italic">
                          Tú siempre podrás revisar y editar el texto generado.
                        </span>
                        <button
                          type="button"
                          disabled={isGeneratingAI}
                          onClick={handleGenerateAI}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                          {isGeneratingAI ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />
                              <span>Redactando con sensibilidad...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                              <span>{aiGeneratedSuccess ? "Regenerar Biografía" : "Redactar Biografía con IA"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Main Biography / Story Textarea */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider">
                        {memorialType === "pet" ? "Texto de la Historia Conmemorativa" : "Texto Biográfico del Memorial"}
                      </label>
                      {formData.biography.length > 0 && (
                        <span className="text-[10px] text-[#8C827A]">
                          {formData.biography.length} caracteres
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={8}
                      value={formData.biography}
                      onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                      placeholder={
                        memorialType === "pet"
                          ? "Aquí aparecerá la historia de tu compañero. Puedes escribirla directamente o usar el asistente de arriba."
                          : "Aquí aparecerá la biografía. Puedes escribirla directamente o usar el asistente de arriba."
                      }
                      className="w-full p-4 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] focus:outline-none focus:border-[#C5A880] text-sm text-[#24201D] leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Privacidad & Selección de Plan */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-[#F4EFEA] pb-4">
                    <h2 className="font-serif text-xl sm:text-2xl text-[#24201D] font-medium">
                      Privacidad y Nivel de Acceso
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5C534B] mt-1">
                      Decide quiénes podrán ingresar a este memorial y qué nivel de reserva deseas.
                    </p>
                  </div>

                  {/* Privacy Radio Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        id: "public",
                        title: "Público",
                        desc: "Visible para cualquier persona con el link.",
                        icon: Globe,
                      },
                      {
                        id: "protected",
                        title: "Protegido por Clave",
                        desc: "Requiere contraseña para ver las fotos y recuerdos.",
                        icon: KeyRound,
                      },
                      {
                        id: "private",
                        title: "Privado (Solo invitados)",
                        desc: "Solo familiares con invitación por correo.",
                        icon: Lock,
                      },
                      {
                        id: "unlisted",
                        title: "Oculto de Buscadores",
                        desc: "No aparece en Google ni buscadores.",
                        icon: EyeOff,
                      },
                    ].map((p) => {
                      const Icon = p.icon;
                      const isSelected = formData.privacy === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setFormData({ ...formData, privacy: p.id as PrivacyLevel })}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                            isSelected
                              ? "bg-[#FAF7F2] border-[#C5A880] ring-1 ring-[#C5A880]"
                              : "bg-white border-[#EAE3D9] hover:border-[#D8CEBE]"
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isSelected ? "bg-[#C5A880] text-white" : "bg-[#FAF7F2] text-[#7A4E38]"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#24201D]">{p.title}</h4>
                            <p className="text-[11px] text-[#5C534B] mt-0.5">{p.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {formData.privacy === "protected" && (
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#D8CEBE] space-y-2">
                      <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider">
                        Contraseña del Memorial
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Escribe una contraseña para compartir con familiares"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D8CEBE] text-xs text-[#24201D]"
                      />
                    </div>
                  )}

                  {/* Current Plan Summary (read-only — plan changes go through real checkout) */}
                  <div className="pt-4 border-t border-[#F4EFEA] space-y-3">
                    <label className="block text-xs font-semibold text-[#24201D] uppercase tracking-wider">
                      Tu plan {userUsage.isPaid ? "actual" : "(pago pendiente)"}
                    </label>
                    <div className="p-5 rounded-2xl bg-[#24201D] text-white border border-[#24201D]">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <span className="font-serif font-bold text-lg block">{userUsage.plan.name}</span>
                          <p className="text-xs text-stone-300 mt-0.5 max-w-md">{userUsage.plan.tagline}</p>
                          {!userUsage.isPaid && (
                            <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
                              Pago pendiente
                            </span>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xl font-serif font-bold block">
                            ${userUsage.plan.priceAnnualCLP.toLocaleString("es-CL")}{" "}
                            <span className="text-[11px] font-sans uppercase text-stone-300">CLP/año</span>
                          </span>
                          <span className="text-[11px] text-[#C5A880] font-medium">{userUsage.plan.renewalText}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-3 text-center text-xs">
                        <div>
                          <span className="block font-semibold">{userUsage.memorasUsed}/{userUsage.memorasMax}</span>
                          <span className="text-[10px] text-stone-300">MEMORAs usadas</span>
                        </div>
                        <div>
                          <span className="block font-semibold">{userUsage.photosUsed}/{userUsage.photosMax}</span>
                          <span className="text-[10px] text-stone-300">Fotos usadas</span>
                        </div>
                        <div>
                          <span className="block font-semibold">{userUsage.videosUsed}/{userUsage.videosMax}</span>
                          <span className="text-[10px] text-stone-300">Videos usados</span>
                        </div>
                      </div>

                      <ul className="mt-4 pt-4 border-t border-white/10 space-y-1.5 text-[11px] text-stone-200">
                        {userUsage.plan.features.slice(0, 6).map((feat, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A880] flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      {(!userUsage.isPaid || userUsage.plan.id !== "legado") && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!userUsage.isPaid) {
                              goToPlanSelection();
                            } else {
                              setSelectedPlanForCheckout(userUsage.plan.id === "familia" ? "legado" : "familia");
                            }
                          }}
                          className="mt-4 w-full py-2.5 rounded-full bg-[#C5A880] text-[#1F1B18] hover:bg-[#D4BC97] text-xs font-semibold transition-colors cursor-pointer"
                        >
                          {!userUsage.isPaid ? "Elegir mi plan" : "Mejorar mi plan"}
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-[#8C827A]">
                      {userUsage.isPaid
                        ? "Esta MEMORA se creará bajo tu plan actual. Si necesitas más capacidad, mejora tu plan antes de publicar — el cambio de plan se procesa de forma segura a través de Flow."
                        : "Necesitas activar tu plan (pagar vía Flow) antes de poder publicar esta MEMORA."}
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 5: Confirmación y Vista Previa */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-[#F4EFEA] pb-4">
                    <h2 className="font-serif text-xl sm:text-2xl text-[#24201D] font-medium">
                      Todo listo para publicar
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5C534B] mt-1">
                      Revisa el resumen de tu memorial antes de activarlo y compartirlo con tu familia.
                    </p>
                  </div>

                  {/* Preview Card */}
                  <div className="rounded-3xl overflow-hidden bg-[#FAF7F2] border border-[#EAE3D9]">
                    <div className="relative h-44 sm:h-52 bg-stone-200">
                      <img
                        src={formData.coverPhoto}
                        alt="Portada"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                      <div className="absolute -bottom-8 left-6 w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-[#FAF7F2] flex items-center justify-center text-[#8C827A]">
                        {formData.mainPhoto ? (
                          <img
                            src={formData.mainPhoto}
                            alt={formData.personName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6" />
                        )}
                      </div>
                    </div>

                    <div className="pt-10 p-6 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EAE3D9] text-[#7A4E38]">
                              {memorialType === "pet" ? `🐾 Mascota · ${formData.species || "Compañero"}` : "👤 Persona"}
                            </span>
                          </div>
                          <h3 className="font-serif text-2xl text-[#24201D] font-medium mt-1">
                            {formData.personName || (memorialType === "pet" ? "Nombre de la mascota" : "Nombre del ser querido")}
                          </h3>
                          {formData.preferredName && (
                            <p className="text-xs text-[#7A4E38] font-medium">
                              Conocido con cariño como "{formData.preferredName}"
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-[#8C827A]">
                          {formData.birthDate ? formData.birthDate.split("-")[0] : "2015"} —{" "}
                          {formData.passingDate ? formData.passingDate.split("-")[0] : "2024"}
                        </span>
                      </div>

                      <p className="font-serif italic text-xs sm:text-sm text-[#5C534B] border-l-2 border-[#C5A880] pl-3 py-0.5">
                        {formData.quote}
                      </p>

                      <p className="text-xs text-[#5C534B] line-clamp-3 leading-relaxed">
                        {formData.biography || "Historia en preparación..."}
                      </p>

                      <div className="pt-3 border-t border-[#EAE3D9] flex flex-wrap items-center justify-between gap-2 text-xs text-[#8C827A]">
                        <span className="capitalize">
                          Privacidad: <strong>{formData.privacy}</strong>
                        </span>
                        <span>
                          Plan: <strong>{userUsage.plan.name}</strong>
                          {!userUsage.isPaid && <span className="text-amber-700 font-semibold"> (pago pendiente)</span>}
                        </span>
                        <span className="text-[#7A4E38] font-medium flex items-center gap-1">
                          <QrCode className="w-3.5 h-3.5 text-[#C5A880]" />
                          Código QR generado automáticamente
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Footer Navigation Controls */}
              <div className="flex items-center justify-between pt-8 mt-8 border-t border-[#F4EFEA]">
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#D8CEBE] text-xs sm:text-sm font-medium text-[#24201D] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{currentStep === 1 ? "Cambiar tipo" : "Paso anterior"}</span>
                </button>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    disabled={currentStep === 1 && !canProceedStep1}
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-xs sm:text-sm font-medium transition-all shadow-xs disabled:opacity-40 cursor-pointer"
                    id="wizard-next-step-btn"
                  >
                    <span>Continuar</span>
                    <ArrowRight className="w-4 h-4 text-[#C5A880]" />
                  </button>
                ) : userUsage.canCreateMemora ? (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFinishCreation}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#C5A880] text-[#1F1B18] hover:bg-[#D4BC97] text-xs sm:text-sm font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    id="wizard-publish-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#1F1B18]" />
                        <span>Publicando memorial...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#7A4E38]" />
                        <span>Publicar mi Memorial MEMORA</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!userUsage.isPaid) {
                        goToPlanSelection();
                      } else {
                        setSelectedPlanForCheckout(userUsage.plan.id === "familia" ? "legado" : "familia");
                      }
                    }}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-amber-800 hover:bg-amber-900 text-white text-xs sm:text-sm font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer"
                    id="wizard-pay-to-publish-btn"
                  >
                    <Lock className="w-4 h-4 text-[#C5A880]" />
                    <span>{!userUsage.isPaid ? "Elegir plan para publicar" : "Mejorar plan para publicar"}</span>
                  </button>
                )}
              </div>

            </div>
          </>
        )}

        {/* Discrete WhatsApp Help Footer (Non-intrusive) */}
        <div className="mt-8 pt-6 border-t border-[#EAE3D9] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="text-xs font-medium text-[#5C534B]">
              ¿Necesitas ayuda para crear tu MEMORA?
            </p>
            <p className="text-[11px] text-[#8C827A]">
              Estamos a tu disposición si requieres apoyo con fotos, fechas o redacción.
            </p>
          </div>
          <WhatsAppButton
            context="create_memora"
            label="Hablar con nosotros por WhatsApp"
            size="sm"
            variant="secondary"
            className="flex-shrink-0"
            id="wizard-whatsapp-help-btn"
          />
        </div>

      </div>
    </div>
  );
};
