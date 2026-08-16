import React from "react";
import { Sparkles, Calendar, MapPin, Heart, BookOpen, Quote } from "lucide-react";
import { useApp } from "../../context/AppContext";

export const StoryCompositionSection: React.FC = () => {
  const { openMemorialBySlug } = useApp();

  const timelinePreviewItems = [
    {
      year: "1964",
      date: "Diciembre, 1964",
      title: "Su primera vocación",
      text: "Graduada como profesora con honores. Comenzó a enseñar a leer a cientos de niños de la costa.",
      location: "Viña del Mar",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80",
    },
    {
      year: "1965",
      date: "Febrero, 1965",
      title: "58 años de amor",
      text: "Matrimonio con Alberto en la Iglesia La Matriz, uniendo dos familias y una vida entera de complicidad.",
      location: "Valparaíso",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
    },
    {
      year: "1995",
      date: "Octubre, 1995",
      title: "El viaje soñado al Sur",
      text: "Navegando los lagos del sur de Chile junto a sus hijos y nietos mayores, cantando bajo la lluvia.",
      location: "Puerto Varas & Chiloé",
      image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80",
    },
  ];

  return (
    <section id="cuenta-su-historia" className="py-24 bg-white border-b border-[#EAE3D9] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF7F2] border border-[#D8CEBE] text-xs font-semibold text-[#7A4E38] uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Cuenta su historia</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#24201D] font-normal tracking-tight">
            Una vida está hecha de momentos.
          </h2>
          <p className="text-base sm:text-lg text-[#5C534B] leading-relaxed">
            MEMORA transforma fotografías, palabras y recuerdos dispersos en una historia que puede seguir siendo contada y compartida por generaciones.
          </p>
        </div>

        {/* Composition Album / Timeline Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Interactive Timeline Cards */}
          <div className="lg:col-span-8 space-y-6">
            <div className="relative pl-6 sm:pl-8 border-l-2 border-[#D8CEBE] space-y-8">
              {timelinePreviewItems.map((item, idx) => (
                <div
                  key={idx}
                  className="relative group bg-[#FAF7F2] rounded-3xl p-5 sm:p-6 border border-[#EAE3D9] hover:border-[#C5A880] transition-all duration-300 hover:shadow-sm"
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-6 w-4 h-4 rounded-full bg-[#C5A880] border-4 border-white shadow-xs"></div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                    <div className="sm:col-span-4 h-40 rounded-2xl overflow-hidden bg-stone-200">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="sm:col-span-8 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif font-bold text-lg text-[#7A4E38]">
                          {item.year}
                        </span>
                        <span className="text-xs text-[#8C827A] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#C5A880]" />
                          {item.date}
                        </span>
                        <span className="text-xs text-[#8C827A] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#C5A880]" />
                          {item.location}
                        </span>
                      </div>

                      <h4 className="font-serif text-xl text-[#24201D] font-medium">
                        {item.title}
                      </h4>

                      <p className="text-xs sm:text-sm text-[#5C534B] leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: AI Editorial Assistant Feature Spotlight */}
          <div className="lg:col-span-4 bg-[#FAF7F2] rounded-3xl p-6 sm:p-7 border border-[#D8CEBE] space-y-5">
            <div className="w-10 h-10 rounded-2xl bg-[#C5A880]/15 flex items-center justify-center text-[#7A4E38]">
              <Sparkles className="w-5 h-5 text-[#C5A880]" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#7A4E38]">
                Asistente Editorial MEMORA
              </span>
              <h3 className="font-serif text-2xl text-[#24201D] font-medium mt-1">
                “Ayúdame a contar su historia”
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-[#5C534B] leading-relaxed">
              Sabemos que a veces encontrar las palabras justas resulta abrumador. Puedes escribir notas sueltas, recuerdos y anécdotas, y nuestra tecnología impulsada por Gemini te ayudará a ordenarlas en una biografía digna, cálida y emocionante.
            </p>

            <div className="p-4 rounded-2xl bg-white border border-[#EAE3D9] space-y-2">
              <p className="text-[11px] font-semibold text-[#8C827A] uppercase tracking-wider">
                Ejemplo de entrada del familiar:
              </p>
              <p className="text-xs italic text-[#5C534B]">
                "Nació en Valparaíso en 1942, fue profesora de básica 40 años, le gustaban los jazmines, hacía pan amasado los domingos y cuidaba a sus 7 nietos..."
              </p>
              <div className="pt-2 border-t border-[#F4EFEA] flex items-center gap-1.5 text-xs text-[#7A4E38] font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Genera automáticamente una biografía estructurada</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => openMemorialBySlug("maria-gonzalez-valparaiso")}
                className="w-full py-3 rounded-full bg-[#24201D] text-white hover:bg-[#3D3530] text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Ver biografía completa en el memorial demo</span>
              </button>
            </div>

            <p className="text-[11px] text-[#8C827A] text-center italic">
              La IA actúa como asistente editorial. Tú siempre tienes el control y la última palabra.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
