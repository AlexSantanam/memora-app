-- MEMORA — Fase 4: fotos/videos reales en Storage
-- Decisión (aprobada): la página de un memorial privado/con contraseña queda
-- 100% bloqueada por RLS (nadie no autorizado puede navegar a ella ni leer
-- sus datos). Las fotos en sí usan rutas con UUID al azar imposibles de
-- adivinar — protección equivalente a la que usan la mayoría de apps para
-- contenido "no listado". Por eso el bucket pasa a público: permite servir
-- imágenes con una URL simple (<img src>), sin necesitar URLs firmadas que
-- expiran ni relecturas constantes solo para mostrar una foto.
update storage.buckets set public = true where id = 'memorial-assets';

-- Ahora que las lecturas son públicas (sin pasar por RLS), la política de
-- escritura original ("cualquier usuario autenticado, cualquier ruta") deja
-- de ser suficientemente estricta: alguien podría subir contenido bajo el
-- folder de un memorial ajeno y quedaría públicamente accesible por URL.
-- Se reemplaza por: solo si el memorial de esa ruta aún no existe (flujo del
-- wizard, antes de crear la fila) o si el usuario es owner/admin/collaborator
-- de ese memorial.
drop policy "memorial_assets_insert" on storage.objects;
create policy "memorial_assets_insert" on storage.objects for insert
  with check (
    bucket_id = 'memorial-assets'
    and auth.role() = 'authenticated'
    and (
      not exists (select 1 from memorials where id = (storage.foldername(name))[1]::uuid)
      or memorial_role((storage.foldername(name))[1]::uuid) in ('owner', 'admin', 'collaborator')
    )
  );
