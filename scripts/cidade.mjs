#!/usr/bin/env node
// Cadastra ou atualiza uma cidade (cria se o slug não existir, atualiza senha
// e coordenadas se já existir). Lê SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
// do .env.local na raiz do projeto.
//
// Uso:
//   node scripts/cidade.mjs <slug> <nome> <uf> <latitude> <longitude> <senha>
//
// Exemplo:
//   node scripts/cidade.mjs brochier Brochier RS -29.5501 -51.5945 "minha-senha-forte"

import { createClient } from "@supabase/supabase-js";
import { randomBytes, scryptSync } from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function carregarEnvLocal() {
  const caminho = join(__dirname, "..", ".env.local");
  const conteudo = readFileSync(caminho, "utf8");
  return Object.fromEntries(
    conteudo
      .split("\n")
      .filter((linha) => linha.includes("=") && !linha.trim().startsWith("#"))
      .map((linha) => {
        const i = linha.indexOf("=");
        return [linha.slice(0, i).trim(), linha.slice(i + 1).trim()];
      })
  );
}

function gerarSenhaHash(senha) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(senha, salt, 64).toString("hex");
  return { hash, salt };
}

const [slug, nome, uf, latitude, longitude, senha] = process.argv.slice(2);

if (!slug || !nome || !uf || !latitude || !longitude || !senha) {
  console.error(
    "Uso: node scripts/cidade.mjs <slug> <nome> <uf> <latitude> <longitude> <senha>\n" +
      'Exemplo: node scripts/cidade.mjs brochier Brochier RS -29.5501 -51.5945 "minha-senha"'
  );
  process.exit(1);
}

const env = carregarEnvLocal();
if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar no .env.local");
  process.exit(1);
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const { hash, salt } = gerarSenhaHash(senha);

const { data, error } = await supabase
  .from("cidades")
  .upsert(
    {
      slug,
      nome,
      uf,
      latitude: Number(latitude),
      longitude: Number(longitude),
      senha_hash: hash,
      senha_salt: salt,
    },
    { onConflict: "slug" }
  )
  .select("id, slug, nome, uf")
  .single();

if (error) {
  console.error("Erro ao cadastrar cidade:", error.message);
  process.exit(1);
}

console.log(`Cidade cadastrada/atualizada: ${data.nome}, ${data.uf} (slug: ${data.slug}, id: ${data.id})`);
console.log(`Acesse em: http://${data.slug}.localhost:3000 (dev) ou https://${data.slug}.<seu-dominio> (produção)`);
