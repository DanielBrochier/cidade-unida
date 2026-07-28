-- Migração: transforma o projeto de "uma cidade fixa" pra multi-tenant
-- (várias cidades no mesmo projeto Supabase, isoladas por cidade_id).
--
-- RODE EM DUAS ETAPAS, NESTA ORDEM:
--
-- 1) Rode o bloco "ETAPA 1" abaixo.
-- 2) Rode, no terminal do projeto (não no SQL Editor):
--      node scripts/cidade.mjs brochier Brochier RS -29.5501 -51.5945 "sua-senha-aqui"
--    Isso cadastra a cidade de Brochier com a senha já em hash.
-- 3) Só depois rode o bloco "ETAPA 2", que liga os relatos existentes a essa
--    cidade e trava a coluna como obrigatória.

-- ===== ETAPA 1 =====
create table if not exists public.cidades (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nome text not null,
  uf text not null,
  latitude double precision not null,
  longitude double precision not null,
  senha_hash text not null,
  senha_salt text not null,
  created_at timestamptz not null default now()
);
alter table public.cidades enable row level security;

alter table public.relatos add column if not exists cidade_id uuid references public.cidades(id);
alter table public.limite_envio add column if not exists cidade_id uuid references public.cidades(id);

-- ===== ETAPA 2 (só depois de rodar scripts/cidade.mjs) =====
update public.relatos set cidade_id = (select id from public.cidades where slug = 'brochier')
  where cidade_id is null;
alter table public.relatos alter column cidade_id set not null;
create index if not exists relatos_cidade_id_idx on public.relatos (cidade_id);

update public.limite_envio set cidade_id = (select id from public.cidades where slug = 'brochier')
  where cidade_id is null;
alter table public.limite_envio alter column cidade_id set not null;
create index if not exists limite_envio_cidade_ip_created_at_idx
  on public.limite_envio (cidade_id, ip, created_at);
