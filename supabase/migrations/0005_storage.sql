-- MEMORA — Fase 1: buckets de Storage y políticas
-- Corre después de 0004_rls.sql

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('memorial-assets', 'memorial-assets', false)
on conflict (id) do nothing;

-- avatars: público de lectura, cualquier usuario autenticado puede subir/editar
-- solo dentro de su propia carpeta ({user_id}/...).
create policy "avatars_public_read" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "avatars_own_write" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_own_update" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_own_delete" on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- memorial-assets: rutas con forma {memorial_id}/{categoria}/{archivo}.
-- Lectura respeta la misma visibilidad que la fila del memorial en Postgres.
create policy "memorial_assets_read" on storage.objects for select
  using (bucket_id = 'memorial-assets' and can_view_memorial((storage.foldername(name))[1]::uuid));
-- INSERT no valida dueño del memorial (la fila puede no existir aún durante
-- el wizard) — ver plan, Fase 4: el id del memorial se genera en el cliente
-- antes de crear la fila. Los objetos huérfanos quedan ilegibles igual,
-- porque SELECT sí exige que la fila del memorial exista y sea visible.
create policy "memorial_assets_insert" on storage.objects for insert
  with check (bucket_id = 'memorial-assets' and auth.role() = 'authenticated');
create policy "memorial_assets_update" on storage.objects for update
  using (bucket_id = 'memorial-assets' and memorial_role((storage.foldername(name))[1]::uuid) in ('owner', 'admin', 'collaborator'));
create policy "memorial_assets_delete" on storage.objects for delete
  using (bucket_id = 'memorial-assets' and memorial_role((storage.foldername(name))[1]::uuid) in ('owner', 'admin', 'collaborator'));
