import React, { Suspense, lazy } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Toasts } from "./components/Toasts";
import { LandingPage } from "./components/landing/LandingPage";
import { WhatsAppFloatingWidget } from "./components/whatsapp/WhatsAppFloatingWidget";

// Code-split every view/modal that isn't the landing page — a visitor who
// only ever sees the landing (most search traffic) was previously
// downloading the dashboard, wizard, admin portal, checkout and PDF/QR
// export code (jsPDF, html2canvas) upfront too, bloating the main bundle
// to 1.28MB. Vite gives each of these its own chunk automatically.
const AuthModal = lazy(() => import("./components/auth/AuthModal").then((m) => ({ default: m.AuthModal })));
const UserDashboard = lazy(() => import("./components/dashboard/UserDashboard").then((m) => ({ default: m.UserDashboard })));
const MemorialWizard = lazy(() => import("./components/wizard/MemorialWizard").then((m) => ({ default: m.MemorialWizard })));
const MemorialView = lazy(() => import("./components/memorial/MemorialView").then((m) => ({ default: m.MemorialView })));
const MemorialEdit = lazy(() => import("./components/memorial/MemorialEdit").then((m) => ({ default: m.MemorialEdit })));
const AdminPortal = lazy(() => import("./components/admin/AdminPortal").then((m) => ({ default: m.AdminPortal })));
const PrivacyPolicyView = lazy(() => import("./components/static/PrivacyPolicyView").then((m) => ({ default: m.PrivacyPolicyView })));
const TermsView = lazy(() => import("./components/static/TermsView").then((m) => ({ default: m.TermsView })));
const ContactView = lazy(() => import("./components/static/ContactView").then((m) => ({ default: m.ContactView })));
const AccountDeletionView = lazy(() => import("./components/static/AccountDeletionView").then((m) => ({ default: m.AccountDeletionView })));
const CheckoutModal = lazy(() => import("./components/checkout/CheckoutModal").then((m) => ({ default: m.CheckoutModal })));
const ShareModal = lazy(() => import("./components/memorial/ShareModal").then((m) => ({ default: m.ShareModal })));
const PrintableMemorialModal = lazy(() => import("./components/memorial/PrintableMemorialModal").then((m) => ({ default: m.PrintableMemorialModal })));

const ViewFallback = () => (
  <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF7F2]">
    <div className="w-8 h-8 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
  </div>
);

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
        {currentView === "landing" ? (
          <LandingPage />
        ) : (
          <Suspense fallback={<ViewFallback />}>
            {currentView === "dashboard" && <UserDashboard />}
            {currentView === "wizard" && <MemorialWizard />}
            {currentView === "memorial-view" && <MemorialView />}
            {currentView === "memorial-edit" && <MemorialEdit />}
            {currentView === "admin" && <AdminPortal />}
            {currentView === "privacy-policy" && <PrivacyPolicyView />}
            {currentView === "terms" && <TermsView />}
            {currentView === "contact" && <ContactView />}
            {currentView === "account-deletion" && <AccountDeletionView />}
          </Suspense>
        )}
      </main>

      {/* Universal Warm Footer */}
      <Footer />

      {/* Global Toast Notifications */}
      <Toasts />

      {/* Global Authentication Modal */}
      {isAuthModalOpen && (
        <Suspense fallback={null}>
          <AuthModal />
        </Suspense>
      )}

      {/* Global Checkout / Upgrade Modal */}
      {selectedPlanForCheckout && (
        <Suspense fallback={null}>
          <CheckoutModal
            planId={selectedPlanForCheckout}
            memorialId={targetMemorialForCheckout || undefined}
            onClose={() => setSelectedPlanForCheckout(null)}
          />
        </Suspense>
      )}

      {/* Global Share Modal */}
      {activeShareMemorial && (
        <Suspense fallback={null}>
          <ShareModal
            memorial={activeShareMemorial}
            onClose={() => setActiveShareMemorial(null)}
          />
        </Suspense>
      )}

      {/* Global Printable Memorial Modal (Cuadro, Urna, Placa) */}
      {activePrintableMemorial && (
        <Suspense fallback={null}>
          <PrintableMemorialModal
            memorial={activePrintableMemorial}
            isOpen={!!activePrintableMemorial}
            onClose={() => setActivePrintableMemorial(null)}
          />
        </Suspense>
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
