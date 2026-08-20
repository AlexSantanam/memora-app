import React, { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useApp } from "../../context/AppContext";

interface SearchResult {
  slug: string;
  personName: string;
  mainPhoto: string;
  birthDate: string | null;
  passingDate: string | null;
  restingPlace: string | null;
}

function formatYears(birth: string | null, passing: string | null): string {
  const by = birth ? new Date(birth).getFullYear() : null;
  const py = passing ? new Date(passing).getFullYear() : null;
  if (by && py) return `${by} — ${py}`;
  if (py) return `† ${py}`;
  return "";
}

// Vive arriba del todo en el Hero (visible sin hacer scroll) en vez de ser
// su propia sección más abajo — quien entra buscando a alguien no debería
// tener que desplazarse para encontrar el buscador.
export const HeroMemorialSearch: React.FC = () => {
  const { openMemorialBySlug } = useApp();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      // Vía RPC (search_memorials) en vez de .ilike() directo: ILIKE por sí
      // solo no ignora tildes ("gonzal" nunca calza con "González"). Solo
      // memoriales publicados y con privacidad "public"/"unlisted" — los
      // privados o con contraseña nunca deben aparecer acá.
      const { data, error } = await supabase.rpc("search_memorials", { q: trimmed });

      setResults(
        !error && data
          ? data.map((r) => ({
              slug: r.slug,
              personName: r.person_name,
              mainPhoto: r.main_photo,
              birthDate: r.birth_date,
              passingDate: r.passing_date,
              restingPlace: r.resting_place,
            }))
          : []
      );
      setIsSearching(false);
      setHasSearched(true);
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div id="buscar-memorial" className="relative max-w-md mx-auto lg:mx-0">
      <Search className="w-4 h-4 text-[#8C827A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="¿Buscas el memorial de alguien? Escribe su nombre..."
        className="w-full pl-11 pr-10 py-3 rounded-full bg-white border border-[#D8CEBE] text-sm text-[#24201D] focus:outline-none focus:border-[#C5A880] shadow-xs"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C827A] hover:text-[#24201D] cursor-pointer"
          aria-label="Limpiar búsqueda"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-[#EAE3D9] shadow-lg text-left overflow-hidden z-30 max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="px-5 py-4 text-xs text-[#8C827A]">Buscando...</div>
          ) : results.length > 0 ? (
            results.map((r) => (
              <button
                key={r.slug}
                onClick={() => {
                  openMemorialBySlug(r.slug);
                  setQuery("");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FAF7F2] transition-colors text-left border-b border-[#F4EFEA] last:border-b-0 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#F4EFEA] flex-shrink-0 border border-[#EAE3D9]">
                  {r.mainPhoto && (
                    <img src={r.mainPhoto} alt={r.personName} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#24201D] truncate">{r.personName}</p>
                  <p className="text-[11px] text-[#8C827A]">
                    {formatYears(r.birthDate, r.passingDate)}
                    {r.restingPlace ? ` · ${r.restingPlace}` : ""}
                  </p>
                </div>
              </button>
            ))
          ) : hasSearched ? (
            <div className="px-5 py-4 text-xs text-[#8C827A]">
              No encontramos ningún memorial público con ese nombre.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
