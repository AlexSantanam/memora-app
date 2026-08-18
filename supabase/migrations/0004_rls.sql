-- MEMORA — Fase 1: Row Level Security
-- Corre después de 0003_functions_and_triggers.sql

alter table profiles enable row level security;
alter table account_entitlements enable row level security;
alter table memorials enable row level security;
alter table albums enable row level security;
alter table media_items enable row level security;
alter table timeline_events enable row level security;
alter table tributes enable row level security;
alter table tribute_replies enable row level security;
alter table family_members enable row level security;
alter table memorial_events enable row level security;
alter table collaborators enable row level security;
alter table payment_transactions enable row level security;

-- ── profiles ──────────────────────────────────────────────────────────────
create policy "profiles_select_self_or_admin" on profiles for select
  using (id = auth.uid() or is_admin());
create policy "profiles_update_self" on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
-- INSERT solo vía el trigger handle_new_user (security definer, corre como
-- el dueño de la función) — no hay política de INSERT para authenticated/anon.

-- ── account_entitlements ──────────────────────────────────────────────────
-- Sin política de INSERT/UPDATE/DELETE para authenticated/anon a propósito:
-- solo el service_role (usado exclusivamente en server.ts) puede escribir
-- aquí. Esto es lo que impide activar un plan sin pasar por el webhook de
-- pago verificado.
create policy "entitlements_select_self_or_admin" on account_entitlements for select
  using (user_id = auth.uid() or is_admin());

-- ── memorials ─────────────────────────────────────────────────────────────
create policy "memorials_select" on memorials for select
  using (can_view_memorial(id));
create policy "memorials_insert" on memorials for insert
  with check (owner_id = auth.uid());
create policy "memorials_update" on memorials for update
  using (memorial_role(id) in ('owner', 'admin') or is_admin());
create policy "memorials_delete" on memorials for delete
  using (memorial_role(id) in ('owner', 'admin') or is_admin());

-- ── albums / timeline_events / family_members / memorial_events ────────────
-- Mismo patrón de permisos para las cuatro tablas hijas "simples".
create policy "albums_select" on albums for select
  using (can_view_memorial(memorial_id));
create policy "albums_write" on albums for all
  using (memorial_role(memorial_id) in ('owner', 'admin', 'collaborator') or is_admin())
  with check (memorial_role(memorial_id) in ('owner', 'admin', 'collaborator') or is_admin());

create policy "timeline_events_select" on timeline_events for select
  using (can_view_memorial(memorial_id));
create policy "timeline_events_write" on timeline_events for all
  using (memorial_role(memorial_id) in ('owner', 'admin', 'collaborator') or is_admin())
  with check (memorial_role(memorial_id) in ('owner', 'admin', 'collaborator') or is_admin());

create policy "family_members_select" on family_members for select
  using (can_view_memorial(memorial_id));
create policy "family_members_write" on family_members for all
  using (memorial_role(memorial_id) in ('owner', 'admin', 'collaborator') or is_admin())
  with check (memorial_role(memorial_id) in ('owner', 'admin', 'collaborator') or is_admin());

create policy "memorial_events_select" on memorial_events for select
  using (can_view_memorial(memorial_id));
create policy "memorial_events_write" on memorial_events for all
  using (memorial_role(memorial_id) in ('owner', 'admin', 'collaborator') or is_admin())
  with check (memorial_role(memorial_id) in ('owner', 'admin', 'collaborator') or is_admin());

-- ── media_items ───────────────────────────────────────────────────────────
create policy "media_items_select" on media_items for select
  using (can_view_memorial(memorial_id));
create policy "media_items_write" on media_items for all
  using (memorial_role(memorial_id) in ('owner', 'admin', 'collaborator') or is_admin())
  with check (memorial_role(memorial_id) in ('owner', 'admin', 'collaborator') or is_admin());

-- ── tributes ──────────────────────────────────────────────────────────────
-- Lectura pública solo de tributos aprobados; el dueño/colaborador/admin ve
-- también los pendientes (para poder moderarlos).
create policy "tributes_select" on tributes for select
  using (
    (status = 'approved' and can_view_memorial(memorial_id))
    or memorial_role(memorial_id) in ('owner', 'admin', 'collaborator')
    or is_admin()
  );
-- INSERT abierto a visitantes anónimos (hoy no se requiere login para dejar
-- un tributo) mientras el memorial sea visible; el status real lo decide el
-- trigger set_tribute_status, nunca el cliente.
create policy "tributes_insert" on tributes for insert
  with check (can_view_memorial(memorial_id));
create policy "tributes_moderate" on tributes for update
  using (memorial_role(memorial_id) in ('owner', 'admin') or is_admin());
create policy "tributes_delete" on tributes for delete
  using (memorial_role(memorial_id) in ('owner', 'admin') or is_admin());

-- ── tribute_replies ───────────────────────────────────────────────────────
create policy "tribute_replies_select" on tribute_replies for select
  using (exists(
    select 1 from tributes t where t.id = tribute_id and (
      (t.status = 'approved' and can_view_memorial(t.memorial_id))
      or memorial_role(t.memorial_id) in ('owner', 'admin', 'collaborator')
      or is_admin()
    )
  ));
create policy "tribute_replies_write" on tribute_replies for all
  using (exists(
    select 1 from tributes t where t.id = tribute_id
    and (memorial_role(t.memorial_id) in ('owner', 'admin', 'collaborator') or is_admin())
  ))
  with check (exists(
    select 1 from tributes t where t.id = tribute_id
    and (memorial_role(t.memorial_id) in ('owner', 'admin', 'collaborator') or is_admin())
  ));

-- ── collaborators ─────────────────────────────────────────────────────────
create policy "collaborators_select" on collaborators for select
  using (memorial_role(memorial_id) is not null or is_admin());
create policy "collaborators_write" on collaborators for all
  using (memorial_role(memorial_id) in ('owner', 'admin') or is_admin())
  with check (memorial_role(memorial_id) in ('owner', 'admin') or is_admin());

-- ── payment_transactions ──────────────────────────────────────────────────
-- Sin política de escritura para authenticated/anon: solo el webhook de
-- Flow (service_role, en server.ts) inserta filas aquí.
create policy "payment_transactions_select" on payment_transactions for select
  using (user_id = auth.uid() or is_admin());
