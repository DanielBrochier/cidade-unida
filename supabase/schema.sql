-- Cidade Unida — schema inicial (multi-tenant: um projeto Supabase pra todas as
-- cidades, cada uma isolada pela coluna cidade_id).
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase.
--
-- Se você já tinha um projeto de uma única cidade rodando (schema antigo, sem
-- a tabela `cidades`), NÃO rode este arquivo — use
-- supabase/migrations/0001_multi_tenant.sql em vez disso.

create extension if not exists pgcrypto;

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

create table if not exists public.relatos (
  id uuid primary key default gen_random_uuid(),
  cidade_id uuid not null references public.cidades(id),
  created_at timestamptz not null default now(),
  categoria text not null check (
    categoria in (
      'estrada', 'poste', 'lixo', 'mato_alto', 'animal_solto',
      'vazamento_agua', 'esgoto', 'bueiro', 'sinalizacao', 'arvore', 'outro'
    )
  ),
  descricao text,
  nome_morador text,
  foto_url text not null,
  latitude double precision not null,
  longitude double precision not null,
  status text not null default 'aberto' check (
    status in ('aberto', 'em_andamento', 'resolvido')
  )
);
create index if not exists relatos_cidade_id_idx on public.relatos (cidade_id);

-- RLS ligado e sem nenhuma policy pública: todo acesso (leitura e escrita) passa
-- pela service role key, usada só no servidor (rotas /api e server actions do
-- painel). O isolamento entre cidades é garantido pelo código do servidor
-- (todo select/update filtra por cidade_id), não pelo Postgres — porque a
-- service role key ignora RLS por definição. Ver src/lib/tenant.ts.
alter table public.relatos enable row level security;

-- Bucket de fotos: público para leitura (o painel exibe a foto direto pela URL),
-- upload só é possível via service role key. Caminho de cada foto é prefixado
-- pelo slug da cidade (ex: brochier/uuid.jpg) só por organização.
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

-- Rate limit por IP + cidade: cada tentativa de envio de relato grava uma linha
-- aqui (antes de qualquer upload de foto), e a API recusa novos envios do
-- mesmo IP acima de um limite por hora/dia NAQUELA cidade. Guarda só o IP e o
-- horário — nada que identifique o relato em si.
create table if not exists public.limite_envio (
  id bigint generated always as identity primary key,
  cidade_id uuid not null references public.cidades(id),
  ip text not null,
  created_at timestamptz not null default now()
);
create index if not exists limite_envio_cidade_ip_created_at_idx
  on public.limite_envio (cidade_id, ip, created_at);
alter table public.limite_envio enable row level security;
