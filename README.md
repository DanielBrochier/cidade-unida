# Cidade Unida

Central de relatos urbanos white-label: o morador manda foto + localização pelo navegador
(sem instalar nada); a prefeitura vê tudo num painel com mapa e organiza por status.

**Multi-tenant por subdomínio**: um único deploy e um único projeto Supabase atendem
todas as cidades. Cada cidade é identificada pelo subdomínio
(`brochier.cidadeunida.com`, `montenegro.cidadeunida.com`, ...) e só enxerga os próprios
dados — tanto o formulário do morador quanto o painel da prefeitura resolvem "qual
cidade é essa" a partir do subdomínio, em `src/lib/tenant.ts`.

## Como está organizado

```
src/
  app/
    page.tsx                # formulário público do morador (rota "/")
    api/relatos/route.ts    # recebe o relato: sobe a foto e grava no banco
    painel/
      page.tsx               # dashboard da prefeitura (mapa + lista) — protegido
      login/page.tsx          # tela de senha
      actions.ts              # server actions: login, logout, trocar status
  components/
    FormularioRelato.tsx     # formulário do morador (foto, GPS, categoria, nome livre)
    painel/                  # mapa, lista, modal, filtros do painel
  lib/
    categorias.ts            # categorias de problema e tipos compartilhados
    tenant.ts                # resolve a cidade a partir do subdomínio da requisição
    painel-auth.ts           # hash de senha (scrypt) e verificação de sessão por cidade
    agrupar-relatos.ts       # agrupa relatos próximos da mesma categoria (mesma ocorrência)
    supabase-admin.ts        # cliente Supabase server-only (service role key)
  proxy.ts                   # barreira rápida de /painel/* (verificação real fica na page/action)
scripts/cidade.mjs           # cadastra ou atualiza uma cidade (nome, coordenadas, senha)
supabase/
  schema.sql                # schema completo, para projeto Supabase novo
  migrations/0001_multi_tenant.sql  # migração pra quem já tinha o schema de cidade única
```

## Isolamento entre cidades: como funciona de verdade

Como o servidor sempre usa a `service_role key` do Supabase (que ignora Row Level
Security por definição), o isolamento **não** vem do banco — vem do código: toda
consulta a `relatos` passa pela cidade resolvida em `src/lib/tenant.ts`, e as server
actions que alteram status sempre filtram por `cidade_id` além do `id` do relato (então
mesmo um id vindo de outro lugar só afeta linhas da própria cidade). Isso é o padrão
"Data Access Layer" recomendado pelo próprio guia de segurança do Next.js quando não se
usa autenticação real de usuário.

A sessão do painel também é amarrada à cidade: o cookie guarda um token derivado do
`cidade_id` + hash de senha daquela cidade especificamente, então um cookie válido para
Brochier não abre o painel de outra cidade mesmo se copiado manualmente — e some
sozinho se a senha da cidade for trocada.

## Cadastrando uma cidade

```bash
npm run cidade -- <slug> <nome> <uf> <latitude> <longitude> <senha>

# exemplo
npm run cidade -- brochier Brochier RS -29.5501 -51.5945 "escolha-uma-senha-forte"
```

Isso cria (ou atualiza, se o slug já existir) a linha da cidade na tabela `cidades`,
com a senha já em hash (scrypt, nunca em texto puro). Rodar de novo com uma senha nova
troca a senha da cidade.

## Configurando o Supabase (uma vez só, serve pra todas as cidades)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. **Projeto novo, sem dados**: vá em **SQL Editor**, cole
   [`supabase/schema.sql`](supabase/schema.sql) inteiro e rode.
   **Já tinha o schema antigo (cidade única)**: siga
   [`supabase/migrations/0001_multi_tenant.sql`](supabase/migrations/0001_multi_tenant.sql)
   — ele te diz exatamente quando rodar `npm run cidade` no meio da migração.
3. Vá em **Project Settings > API** e copie:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (não a `anon`/`publishable`) → `SUPABASE_SERVICE_ROLE_KEY`
4. Copie `.env.example` para `.env.local` e preencha as duas variáveis:

   ```bash
   cp .env.example .env.local
   ```

   A `service_role key` é secreta — nunca é exposta ao navegador (só é lida dentro das
   rotas do servidor) e nunca deve ser commitada; `.env.local` já está no `.gitignore`.
5. Cadastre a primeira cidade com `npm run cidade` (ver acima).

## Rodando localmente

```bash
npm install
npm run dev
```

Navegadores modernos resolvem `*.localhost` sozinhos, sem editar `/etc/hosts`:

- `http://brochier.localhost:3000` — formulário do morador de Brochier
- `http://brochier.localhost:3000/painel` — painel de Brochier (senha cadastrada via
  `npm run cidade`)
- `http://localhost:3000` (sem subdomínio) — mostra que a cidade não foi identificada;
  é o esperado, não um erro.

## Em produção

Aponte um subdomínio por cidade pro seu deploy (`brochier.cidadeunida.com`,
`montenegro.cidadeunida.com`, ...) e defina `BASE_DOMAIN=cidadeunida.com` no ambiente de
produção. Não precisa de um deploy por cidade — é o mesmo deploy pra todas.

## Notas técnicas

- Next.js 16 (App Router). O arquivo de proteção de rotas chama-se `proxy.ts`, não
  `middleware.ts` — convenção renomeada nesta versão.
- Senha de cidade em hash com `scrypt` (nativo do Node, sem dependência extra).
- Mapa com Leaflet + OpenStreetMap (gratuito, sem chave de API). Pinos usam ícone por
  categoria + cor por status; relatos próximos da mesma categoria se agrupam num só
  pino (raio de 15m, distância real via Haversine).
- Fotos vão para o bucket público `fotos` do Supabase Storage, prefixadas por
  `<slug-da-cidade>/`; o painel exibe a URL pública direto, sem signed URLs.
- Limite de foto: 8 MB por envio (validado na API antes do upload); a própria foto é
  recomprimida no navegador antes de enviar (`src/lib/comprimir-imagem.ts`).
- Rate limit por IP + cidade: 5 envios/hora, 15/dia (`src/lib/rate-limit.ts`).
