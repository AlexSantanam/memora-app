-- MEMORA — confirmación de asistencia a ceremonias/eventos
-- La política RLS de UPDATE en "memorial_events" solo permite escribir a
-- owner/admin. Confirmar asistencia debe poder hacerlo cualquier visitante
-- que vea el memorial — se resuelve con esta función SECURITY DEFINER, que
-- solo puede incrementar rsvp_count, tras validar visibilidad con
-- can_view_memorial().

create function rsvp_to_event(p_event_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_memorial_id uuid;
begin
  select memorial_id into v_memorial_id from memorial_events where id = p_event_id;
  if v_memorial_id is null or not can_view_memorial(v_memorial_id) then
    raise exception 'not authorized';
  end if;

  update memorial_events set rsvp_count = rsvp_count + 1 where id = p_event_id;
end;
$$;

grant execute on function rsvp_to_event(uuid) to anon, authenticated;
