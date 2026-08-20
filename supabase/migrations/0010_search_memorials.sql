-- MEMORA — buscador público de memoriales por nombre.
-- ILIKE por sí solo no ignora tildes: "gonzal" nunca hace match con
-- "González" porque compara byte a byte (la "a" sin tilde no es la misma
-- que la "á"). Para nombres en español esto rompe la mayoría de búsquedas
-- reales, así que se usa unaccent() en ambos lados de la comparación.
create extension if not exists unaccent;

-- SECURITY INVOKER (por defecto, no se marca DEFINER): corre con los
-- privilegios de quien llama, así que igual queda sujeto a la política RLS
-- "memorials_select" — el where de acá no reemplaza esa protección, es
-- una capa adicional explícita para que el índice/plan de la consulta sea
-- más directo, no para saltarse RLS.
create or replace function search_memorials(q text)
returns table (
  slug text,
  person_name text,
  main_photo text,
  birth_date date,
  passing_date date,
  resting_place text
)
language sql stable as $$
  select slug, person_name, main_photo, birth_date, passing_date, resting_place
  from memorials
  where status = 'published'
    and privacy in ('public', 'unlisted')
    and unaccent(person_name) ilike unaccent('%' || q || '%')
  order by person_name
  limit 8;
$$;

grant execute on function search_memorials(text) to anon, authenticated;
