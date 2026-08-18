import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Toasts } from "./components/Toasts";
import { AuthModal } from "./components/auth/AuthModal";
import { LandingPage } from "./components/landing/LandingPage";
import { UserDashboard } from "./components/dashboard/UserDashboard";
import { MemorialWizard } from "./components/wizard/MemorialWizard";
import { MemorialView } from "./components/memorial/MemorialView";
import { MemorialEdit } from "./components/memorial/MemorialEdit";
import { AdminPortal } from "./components/admin/AdminPortal";
import { PrivacyPolicyView } from "./components/static/PrivacyPolicyView";
import { TermsView } from "./components/static/TermsView";
import { ContactView } from "./components/static/ContactView";
import { CheckoutModal } from "./components/checkout/CheckoutModal";
import { ShareModal } from "./components/memorial/ShareModal";
import { PrintableMemorialModal } from "./components/memorial/PrintableMemorialModal";
import { WhatsAppFloatingWidget } from "./components/whatsapp/WhatsAppFloatingWidget";

function AppContent() {
  const {
    currentView,
    isAuthModalOpen,
    authLoading,
    selectedPlanForCheckout,
    setSelectedPlanForCheckout,
    targetMemorialForCheckout,
    activeShareMemorial,
    setActiveShareMemorial,
    activePrintableMemorial,
    setActivePrintableMemorial,
  } = useApp();

  // Avoid flashing the logged-out landing page for the brief moment it takes
  // to hydrate the Supabase session on first load.
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#24201D] font-sans antialiased selection:bg-[#C5A880]/30 selection:text-[#24201D]">
      {/* Universal Top Navigation */}
      <Navbar />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === "landing" && <LandingPage />}
        {currentView === "dashboard" && <UserDashboard />}
        {currentView === "wizard" && <MemorialWizard />}
        {currentView === "memorial-view" && <MemorialView />}
        {currentView === "memorial-edit" && <MemorialEdit />}
        {currentView === "admin" && <AdminPortal />}
        {currentView === "privacy-policy" && <PrivacyPolicyView />}
        {currentView === "terms" && <TermsView />}
        {currentView === "contact" && <ContactView />}
      </main>

      {/* Universal Warm Footer */}
      <Footer />

      {/* Global Toast Notifications */}
      <Toasts />

      {/* Global Authentication Modal */}
      {isAuthModalOpen && <AuthModal />}

      {/* Global Checkout / Upgrade Modal */}
      {selectedPlanForCheckout && (
        <CheckoutModal
          planId={selectedPlanForCheckout}
          memorialId={targetMemorialForCheckout || undefined}
          onClose={() => setSelectedPlanForCheckout(null)}
        />
      )}

      {/* Global Share Modal */}
      {activeShareMemorial && (
        <ShareModal
          memorial={activeShareMemorial}
          onClose={() => setActiveShareMemorial(null)}
        />
      )}

      {/* Global Printable Memorial Modal (Cuadro, Urna, Placa) */}
      {activePrintableMemorial && (
        <PrintableMemorialModal
          memorial={activePrintableMemorial}
          isOpen={!!activePrintableMemorial}
          onClose={() => setActivePrintableMemorial(null)}
        />
      )}

      {/* Global Floating WhatsApp Contact & Help Widget */}
      <WhatsAppFloatingWidget />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
