-- MEMORA — Fase 1: extensiones y tipos enumerados
-- Ejecutar en Supabase Dashboard → SQL Editor → New query → pegar → Run.

create extension if not exists pgcrypto;

create type user_role as enum ('user', 'admin');
create type plan_tier as enum ('esencial', 'familia', 'legado');
create type subscription_status as enum ('free_trial', 'active', 'pending_payment', 'payment_failed', 'cancelled', 'expired');
create type memorial_type as enum ('person', 'pet', 'family');
create type privacy_level as enum ('public', 'private', 'password', 'unlisted');
create type memorial_status as enum ('draft', 'published', 'archived');
