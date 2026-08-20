-- MEMORA — homenajes: por defecto deben quedar pendientes de revisión, no
-- publicados de inmediato. Hoy cualquier visitante (sin login) podía dejar
-- un homenaje que se publicaba al instante porque enable_tribute_auto_approval
-- nacía en `true` para todo memorial nuevo — el dueño ya podía desactivarlo
-- manualmente desde "Editar Memorial", pero casi nadie sabía que existía esa
-- opción. Se invierte el valor seguro por defecto; el dueño sigue pudiendo
-- reactivar la aprobación automática si la prefiere.
alter table memorials alter column enable_tribute_auto_approval set default false;

-- Los memoriales ya creados nunca eligieron conscientemente este valor
-- (era el default silencioso) — se corrigen también, no solo los nuevos.
update memorials set enable_tribute_auto_approval = false;

-- Adjuntar una fotografía a un homenaje hoy solo aceptaba pegar una URL
-- externa; se habilita subida real de archivo al mismo bucket que el resto
-- de las fotos del memorial, bajo la carpeta {memorial_id}/tribute/. Se usa
-- la misma condición que ya rige la escritura de la fila del homenaje
-- (tributes_insert en 0004_rls.sql): visitante anónimo permitido mientras
-- el memorial sea visible — el dueño del memorial no participa en este paso,
-- así que no puede exigirse memorial_role() como en el resto del bucket.
create policy "memorial_assets_tribute_insert" on storage.objects for insert
  with check (
    bucket_id = 'memorial-assets'
    and (storage.foldername(name))[2] = 'tribute'
    and can_view_memorial((storage.foldername(name))[1]::uuid)
  );
