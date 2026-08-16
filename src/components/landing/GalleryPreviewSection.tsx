import React, { useState } from "react";
import { ImageIcon, Folder, Eye, Heart, Sparkles, Filter } from "lucide-react";
import { useApp } from "../../context/AppContext";

export const GalleryPreviewSection: React.FC = () => {
  const { openMemorialBySlug } = useApp();
  const [activeFilter, setActiveFilter] = useState<"todas" | "albumes" | "recuerdos">("todas");

  const sampleGallery = [
    {
      id: "g1",
      url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
      title: "En su rincón favorito de lectura",
      date: "Verano 2019",
      album: "Momentos en Familia",
      tag: "Foto",
      span: "row-span-2",
    },
    {
      id: "g2",
      url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
      title: "Risas en la playa con los nietos",
      date: "Febrero 2021",
      album: "Momentos en Familia",
      tag: "Foto",
      span: "row-span-1",
    },
    {
      id: "g3",
      url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
      title: "Jardines y orquídeas que cuidaba cada mañana",
      date: "Primavera 2020",
      album: "Jardines y Flores",
      tag: "Álbum",
      span: "row-span-1",
    },
    {
      id: "g4",
      url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
      title: "Manos y generaciones tejiendo historias",
      date: "Invierno 2018",
      album: "Momentos en Familia",
      tag: "Foto",
      span: "row-span-2",
    },
    {
      id: "g5",
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      title: "El mar de Valparaíso al atardecer",
      date: "Abril 2020",
      album: "Jardines y Flores",
      tag: "Foto",
      span: "row-span-1",
    },
  ];

  return (
    <section className="py-24 bg-[#FAF7F2] border-b border-[#EAE3D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F4EFEA] border border-[#D8CEBE] text-xs font-semibold text-[#7A4E38] uppercase tracking-wider">
              <ImageIcon className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Galería de recuerdos</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#24201D] font-normal tracking-tight">
              Guarda cada momento.
            </h2>
            <p className="text-base text-[#5C534B] leading-relaxed">
              Conserva fotografías, videos, cartas manuscritas y álbumes ordenados en una galería elegante tipo masonry con microinteracciones y protección original.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter("todas")}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeFilter === "todas"
                  ? "bg-[#24201D] text-white shadow-xs"
                  : "bg-white text-[#5C534B] border border-[#D8CEBE] hover:border-[#C5A880]"
              }`}
            >
              Todas las fotos
            </button>
            <button
              onClick={() => setActiveFilter("albumes")}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeFilter === "albumes"
                  ? "bg-[#24201D] text-white shadow-xs"
                  : "bg-white text-[#5C534B] border border-[#D8CEBE] hover:border-[#C5A880]"
              }`}
            >
              Álbumes familiares
            </button>
            <button
              onClick={() => setActiveFilter("recuerdos")}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeFilter === "recuerdos"
                  ? "bg-[#24201D] text-white shadow-xs"
                  : "bg-white text-[#5C534B] border border-[#D8CEBE] hover:border-[#C5A880]"
              }`}
            >
              Cartas y momentos
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleGallery.map((item) => (
            <div
              key={item.id}
              onClick={() => openMemorialBySlug("maria-gonzalez-valparaiso")}
              className="group relative rounded-3xl overflow-hidden bg-white border border-[#EAE3D9] shadow-xs hover:shadow-xl transition-all duration-500 cursor-pointer"
            >
              <div className="relative h-72 sm:h-80 overflow-hidden bg-[#F4EFEA]">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                
                {/* Tag pill */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-semibold text-[#24201D] border border-white/40">
                    {item.album}
                  </span>
                </div>

                {/* Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                  <span className="text-[11px] text-[#E7D7C1] font-light">
                    {item.date}
                  </span>
                  <h4 className="font-serif text-lg font-medium leading-snug line-clamp-2">
                    {item.title}
                  </h4>
                </div>

                {/* Micro-interaction icon */}
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#24201D] opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-y-0 translate-y-2">
                  <Eye className="w-4 h-4 text-[#7A4E38]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 p-6 rounded-3xl bg-white border border-[#EAE3D9] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-[#F4EFEA] flex items-center justify-center text-[#7A4E38] flex-shrink-0">
              <Folder className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#24201D]">
                Organiza álbumes temáticos colaborativos
              </p>
              <p className="text-xs text-[#8C827A]">
                Infancia, juventud, matrimonios, viajes familiares, pasiones y cartas guardadas.
              </p>
            </div>
          </div>
          <button
            onClick={() => openMemorialBySlug("maria-gonzalez-valparaiso")}
            className="px-6 py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#F4EFEA] border border-[#D8CEBE] text-xs font-semibold text-[#24201D] transition-colors flex-shrink-0 cursor-pointer"
          >
            Ver galería completa del memorial
          </button>
        </div>

      </div>
    </section>
  );
};
