-- MEMORA — Fase 1: funciones de apoyo y triggers estructurales
-- Corre después de 0002_tables.sql

-- SECURITY DEFINER evita el problema clásico de RLS recursiva: si estas
-- funciones fueran llamadas como el usuario, sus propias consultas internas
-- volverían a pasar por las políticas RLS de las tablas que consultan.
-- set search_path = public en cada función SECURITY DEFINER: evita tanto el
-- fallo de resolución de tablas (ver nota en handle_new_user más abajo) como
-- la advertencia de seguridad "Function Search Path Mutable" del linter de Supabase.
create function is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists(
    select 1 from account_entitlements
    where user_id = auth.uid() and role = 'admin'
  );
$$;

create function memorial_role(mid uuid) returns text
language sql security definer stable set search_path = public as $$
  select case
    when exists(select 1 from memorials where id = mid and owner_id = auth.uid()) then 'owner'
    else (select role from collaborators where memorial_id = mid and user_id = auth.uid() and status = 'active' limit 1)
  end;
$$;

create function can_view_memorial(mid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select is_admin()
    or memorial_role(mid) is not null
    or exists(
      select 1 from memorials
      where id = mid and status = 'published' and privacy in ('public', 'unlisted')
    );
  -- privacy = 'password' se maneja aparte, fuera de RLS (ver server.ts, ruta
  -- de verificación de contraseña) porque RLS no puede validar un password
  -- tipeado por un visitante dentro de una política.
$$;

-- Al crear una cuenta en Supabase Auth (email/password o Google), crea
-- automáticamente su fila de perfil y de "entitlements" con los mismos
-- valores por defecto que usa hoy AppContext.tsx: plan esencial, pago
-- pendiente (ningún plan es gratis).
-- search_path se fija explícitamente: el rol interno de Supabase que dispara
-- este trigger (supabase_auth_admin) no tiene "public" en su search_path por
-- defecto, así que sin esto las referencias a las tablas fallan en silencio
-- y el registro completo devuelve un 500 genérico ("Database error saving new user").
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, avatar_url, auth_provider)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_app_meta_data->>'provider', 'email')
  );
  insert into public.account_entitlements (user_id, role, current_plan, subscription_status, price_clp)
  values (new.id, 'user', 'esencial', 'pending_payment', 990);
  return new;
end;
$$;

create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function handle_new_user();

-- La decisión de auto-aprobar un tributo hoy vive en el cliente
-- (AppContext.tsx) — un cliente manipulado podría forzar "approved". Se
-- fuerza aquí server-side según la configuración real del memorial.
create function set_tribute_status() returns trigger
language plpgsql as $$
begin
  new.status := case
    when (select enable_tribute_auto_approval from memorials where id = new.memorial_id) then 'approved'
    else 'pending'
  end;
  return new;
end;
$$;

create trigger trg_tribute_status
  before insert on tributes
  for each row execute function set_tribute_status();

create function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_memorials_updated_at
  before update on memorials
  for each row execute function set_updated_at();
