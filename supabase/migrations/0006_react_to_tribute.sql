-- MEMORA — Fase 3: reacciones a tributos (corazón/vela/flor)
-- La política RLS de UPDATE en "tributes" (tributes_moderate) solo permite
-- escribir a owner/admin. Reaccionar a un tributo debe poder hacerlo
-- cualquier visitante que vea el memorial — se resuelve con esta función
-- SECURITY DEFINER, que solo puede tocar heart_count/candle_lit/flower_placed
-- (nunca message/status/author), tras validar visibilidad con can_view_memorial().

create function react_to_tribute(p_tribute_id uuid, p_reaction text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_memorial_id uuid;
begin
  select memorial_id into v_memorial_id from tributes where id = p_tribute_id;
  if v_memorial_id is null or not can_view_memorial(v_memorial_id) then
    raise exception 'not authorized';
  end if;

  if p_reaction = 'heart' then
    update tributes set heart_count = heart_count + 1 where id = p_tribute_id;
  elsif p_reaction = 'candle' then
    update tributes set candle_lit = true where id = p_tribute_id;
  elsif p_reaction = 'flower' then
    update tributes set flower_placed = true where id = p_tribute_id;
  else
    raise exception 'invalid reaction type: %', p_reaction;
  end if;
end;
$$;

grant execute on function react_to_tribute(uuid, text) to anon, authenticated;
