-- Adiciona o mapa público opcional por cidade (desligado por padrão).
alter table public.cidades add column if not exists painel_publico boolean not null default false;
