import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Shield,
  Users,
  Heart,
  Image as ImageIcon,
  DollarSign,
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  Lock,
  ArrowLeft,
} from "lucide-react";

export const AdminPortal: React.FC = () => {
  const { metrics, memorials, openMemorialBySlug, deleteMemorial, setCurrentView } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMemorials = memorials.filter(
    (m) =>
      m.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE3D9] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#24201D] text-[#C5A880] flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#7A4E38] block">
                Supervisión Global
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#24201D] font-medium">
                Panel de Administración MEMORA
              </h1>
            </div>
          </div>

          <button
            onClick={() => setCurrentView("dashboard")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D8CEBE] bg-white hover:bg-[#FAF7F2] text-xs font-semibold text-[#24201D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Mi Panel</span>
          </button>
        </div>

        {/* Top Metric Bento Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-[#EAE3D9] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#8C827A]">
              <span className="text-xs font-medium">Memoriales Activos</span>
              <Heart className="w-4 h-4 text-[#C5A880]" />
            </div>
            <p className="font-serif text-3xl text-[#24201D] font-bold">{metrics.totalMemorials}</p>
            <span className="text-[11px] text-emerald-600 font-medium">{metrics.publishedMemorials} publicados</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#EAE3D9] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#8C827A]">
              <span className="text-xs font-medium">Homenajes Registrados</span>
              <Users className="w-4 h-4 text-[#C5A880]" />
            </div>
            <p className="font-serif text-3xl text-[#24201D] font-bold">{metrics.totalTributes}</p>
            <span className="text-[11px] text-[#7A4E38] font-medium">Velas y condolencias</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#EAE3D9] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#8C827A]">
              <span className="text-xs font-medium">Fotos Preservadas</span>
              <ImageIcon className="w-4 h-4 text-[#C5A880]" />
            </div>
            <p className="font-serif text-3xl text-[#24201D] font-bold">{metrics.totalPhotosUploaded}</p>
            <span className="text-[11px] text-[#7A4E38] font-medium">En alta resolución</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#EAE3D9] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#8C827A]">
              <span className="text-xs font-medium">Ingresos Estimados</span>
              <DollarSign className="w-4 h-4 text-[#C5A880]" />
            </div>
            <p className="font-serif text-3xl text-[#24201D] font-bold">${metrics.revenueTotalUSD}</p>
            <span className="text-[11px] text-emerald-600 font-medium">Planes Para Siempre</span>
          </div>
        </div>

        {/* Memorials Management Table */}
        <div className="bg-white rounded-3xl border border-[#EAE3D9] shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#F4EFEA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl text-[#24201D] font-medium">Lista de Memoriales en Plataforma</h2>
              <p className="text-xs text-[#8C827A]">Monitoreo de privacidad, contenido y propietarios.</p>
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o correo..."
                className="w-full pl-9 pr-4 py-2 rounded-full bg-[#FAF7F2] border border-[#D8CEBE] text-xs text-[#24201D] focus:outline-none focus:border-[#C5A880]"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#7A7067] uppercase font-semibold border-b border-[#EAE3D9]">
                <tr>
                  <th className="px-6 py-3.5">Persona / Memorial</th>
                  <th className="px-6 py-3.5">Propietario</th>
                  <th className="px-6 py-3.5">Plan</th>
                  <th className="px-6 py-3.5">Privacidad</th>
                  <th className="px-6 py-3.5">Homenajes</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EFEA]">
                {filteredMemorials.map((m) => (
                  <tr key={m.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.mainPhoto}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-[#D8CEBE]"
                        />
                        <div>
                          <p className="font-semibold text-[#24201D] text-sm">{m.personName}</p>
                          <p className="text-[11px] text-[#8C827A]">/{m.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#24201D]">{m.ownerName}</p>
                      <p className="text-[11px] text-[#8C827A]">{m.ownerEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize font-semibold text-[#7A4E38] bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#EAE3D9]">
                        {m.planId === "para_siempre" ? "Para Siempre" : m.planId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-[#5C534B]">{m.privacy}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#24201D]">
                      {m.tributes?.length || 0}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openMemorialBySlug(m.slug)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-[#24201D] hover:bg-[#FAF7F2]"
                        title="Ver memorial"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar el memorial de ${m.personName}?`)) {
                            deleteMemorial(m.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Eliminar memorial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
