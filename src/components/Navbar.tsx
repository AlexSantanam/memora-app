import React, { useState, useEffect, useRef } from "react";
import { Logo } from "./Logo";
import { useApp } from "../context/AppContext";
import {
  Heart,
  Plus,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Shield,
  Menu,
  X,
  Sparkles,
  ChevronDown,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthModalMode,
    logout,
    openMemorialBySlug,
    openMyProfile,
  } = useApp();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userDropdownOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (currentView !== "landing") {
      setCurrentView("landing");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-[#FAF7F2]/95 backdrop-blur-md shadow-sm border-b border-[#EAE3D9]/80 py-2 sm:py-2.5"
          : "bg-[#FAF7F2] border-b border-[#EAE3D9]/40 py-2.5 sm:py-3.5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => {
            setCurrentView("landing");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="group flex items-center text-left focus:outline-none transition-transform hover:opacity-95"
          id="navbar-logo-button"
        >
          <Logo variant="dark" size="md" showTagline={true} />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-[#5C534B]">
          <button
            onClick={() => scrollToSection("como-funciona")}
            className="hover:text-[#24201D] transition-colors py-1 cursor-pointer"
          >
            Cómo funciona
          </button>
          <button
            onClick={() => scrollToSection("memora-mascotas")}
            className="hover:text-[#24201D] transition-colors py-1 cursor-pointer flex items-center gap-1.5"
          >
            <span>🐾 Mascotas</span>
          </button>
          <button
            onClick={() => scrollToSection("caracteristicas")}
            className="hover:text-[#24201D] transition-colors py-1 cursor-pointer"
          >
            Características
          </button>
          <button
            onClick={() => scrollToSection("ejemplo-memorial")}
            className="hover:text-[#24201D] transition-colors py-1 cursor-pointer flex items-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5 text-[#C5A880]" />
            Ver un Memorial
          </button>
          <button
            onClick={() => scrollToSection("planes")}
            className="hover:text-[#24201D] transition-colors py-1 cursor-pointer"
          >
            Planes
          </button>
          <button
            onClick={() => scrollToSection("preguntas-frecuentes")}
            className="hover:text-[#24201D] transition-colors py-1 cursor-pointer"
          >
            Preguntas Frecuentes
          </button>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated && currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-full border border-[#D8CEBE] hover:border-[#C5A880] bg-white/70 hover:bg-white text-xs font-medium text-[#24201D] transition-all"
                id="user-menu-button"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-[#C5A880]/40"
                />
                <span className="max-w-[120px] truncate">{currentUser.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8C827A]" />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#EAE3D9] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-[#F4EFEA]">
                    <p className="text-xs font-semibold text-[#24201D] truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-[#8C827A] truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#7A4E38] border border-[#EAE3D9]">
                      Plan{" "}
                      {currentUser.currentPlan === "para_siempre" || currentUser.currentPlan === "familia"
                        ? "Familia"
                        : currentUser.currentPlan === "acompanado" || currentUser.currentPlan === "legado"
                        ? "Legado"
                        : "Esencial"}
                      {currentUser.subscription?.status === "free_trial" ? " (Prueba)" : ""}
                      {currentUser.subscription?.status === "pending_payment" ? " (Pago pendiente)" : ""}
                    </span>
                  </div>

                  <button
                    onClick={() => setCurrentView("dashboard")}
                    className="w-full px-4 py-2 text-left text-xs text-[#2C2723] hover:bg-[#FAF7F2] flex items-center gap-2.5 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#8C827A]" />
                    Mi MEMORA (Dashboard)
                  </button>

                  <button
                    onClick={openMyProfile}
                    className="w-full px-4 py-2 text-left text-xs text-[#2C2723] hover:bg-[#FAF7F2] flex items-center gap-2.5 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-[#8C827A]" />
                    Mi Perfil
                  </button>

                  <button
                    onClick={() => setCurrentView("wizard")}
                    className="w-full px-4 py-2 text-left text-xs text-[#2C2723] hover:bg-[#FAF7F2] flex items-center gap-2.5 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[#C5A880]" />
                    Crear Nuevo Memorial
                  </button>

                  <button
                    onClick={() => openMemorialBySlug("maria-gonzalez-valparaiso")}
                    className="w-full px-4 py-2 text-left text-xs text-[#2C2723] hover:bg-[#FAF7F2] flex items-center gap-2.5 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-[#8C827A]" />
                    Ver Memorial Demo
                  </button>

                  {currentUser.role === "admin" && (
                    <button
                      onClick={() => setCurrentView("admin")}
                      className="w-full px-4 py-2 text-left text-xs text-[#7A4E38] hover:bg-[#FAF7F2] flex items-center gap-2.5 transition-colors font-medium"
                    >
                      <Shield className="w-4 h-4 text-[#7A4E38]" />
                      Panel Administrativo
                    </button>
                  )}

                  <div className="border-t border-[#F4EFEA] my-1"></div>

                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthModalMode("login");
                setIsAuthModalOpen(true);
              }}
              className="px-4 py-2 text-sm font-medium text-[#4A423B] hover:text-[#24201D] transition-colors rounded-full hover:bg-[#F4EFEA]/80 cursor-pointer"
              id="navbar-login-btn"
            >
              Iniciar sesión
            </button>
          )}

          {/* Primary CTA button */}
          <button
            onClick={() => {
              if (isAuthenticated) {
                setCurrentView("wizard");
              } else {
                setAuthModalMode("register");
                setIsAuthModalOpen(true);
              }
            }}
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-sm font-medium transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
            id="navbar-create-btn"
          >
            <Sparkles className="w-4 h-4 text-[#C5A880] transition-transform group-hover:rotate-12" />
            <span>Crear mi MEMORA</span>
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#24201D] hover:bg-[#F4EFEA] transition-colors"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#EAE3D9] bg-[#FAF7F2] px-5 pt-4 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <button
            onClick={() => scrollToSection("como-funciona")}
            className="block w-full text-left py-2 text-base font-medium text-[#4A423B] border-b border-[#F4EFEA]"
          >
            Cómo funciona
          </button>
          <button
            onClick={() => scrollToSection("memora-mascotas")}
            className="block w-full text-left py-2 text-base font-medium text-[#4A423B] border-b border-[#F4EFEA] flex items-center gap-2"
          >
            <span>🐾 MEMORA Mascotas</span>
          </button>
          <button
            onClick={() => scrollToSection("caracteristicas")}
            className="block w-full text-left py-2 text-base font-medium text-[#4A423B] border-b border-[#F4EFEA]"
          >
            Características
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openMemorialBySlug("maria-gonzalez-valparaiso");
            }}
            className="block w-full text-left py-2 text-base font-medium text-[#4A423B] border-b border-[#F4EFEA] flex items-center gap-2"
          >
            <Heart className="w-4 h-4 text-[#C5A880]" />
            Ver un Memorial de Ejemplo
          </button>
          <button
            onClick={() => scrollToSection("planes")}
            className="block w-full text-left py-2 text-base font-medium text-[#4A423B] border-b border-[#F4EFEA]"
          >
            Planes y Precios
          </button>
          <button
            onClick={() => scrollToSection("preguntas-frecuentes")}
            className="block w-full text-left py-2 text-base font-medium text-[#4A423B] border-b border-[#F4EFEA]"
          >
            Preguntas Frecuentes
          </button>

          {isAuthenticated && currentUser ? (
            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCurrentView("dashboard");
                }}
                className="w-full py-2.5 text-left text-sm font-medium text-[#24201D] flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-[#8C827A]" />
                Mi MEMORA (Dashboard)
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openMyProfile();
                }}
                className="w-full py-2.5 text-left text-sm font-medium text-[#24201D] flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4 text-[#8C827A]" />
                Mi Perfil
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCurrentView("wizard");
                }}
                className="w-full py-2.5 text-left text-sm font-medium text-[#7A4E38] flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-[#C5A880]" />
                Crear Nuevo Memorial
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full py-2 text-left text-sm text-red-600 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="pt-3 space-y-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalMode("login");
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-2.5 text-center text-sm font-medium text-[#24201D] border border-[#D8CEBE] rounded-full bg-white"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalMode("register");
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-3 text-center text-sm font-medium text-white bg-[#24201D] rounded-full shadow"
              >
                Crear mi MEMORA
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
