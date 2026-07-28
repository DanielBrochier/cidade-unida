import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { distanciaKm } from "@/lib/distancia";

export type Cidade = {
  id: string;
  slug: string;
  nome: string;
  uf: string;
  latitude: number;
  longitude: number;
  senha_hash: string;
  senha_salt: string;
  created_at: string;
};

/** Só os campos seguros pra mandar pra um Client Component (nunca o hash/salt da senha). */
export type CidadePublica = Pick<Cidade, "id" | "slug" | "nome" | "uf" | "latitude" | "longitude">;

export function paraCidadePublica(cidade: Cidade): CidadePublica {
  return {
    id: cidade.id,
    slug: cidade.slug,
    nome: cidade.nome,
    uf: cidade.uf,
    latitude: cidade.latitude,
    longitude: cidade.longitude,
  };
}

const DOMINIO_BASE = process.env.BASE_DOMAIN || "localhost";

/**
 * Extrai o slug da cidade a partir do Host da requisição.
 * "brochier.cidadeunida.com" -> "brochier"; "brochier.localhost:3000" -> "brochier"
 * (dev, resolve sozinho no navegador); domínio raiz ou host desconhecido -> null.
 */
export function extrairSlugDoHost(hostHeader: string | null): string | null {
  if (!hostHeader) return null;
  const host = hostHeader.split(":")[0].toLowerCase();

  for (const base of new Set([DOMINIO_BASE, "localhost"])) {
    if (host === base) return null;
    const sufixo = `.${base}`;
    if (host.endsWith(sufixo)) {
      const prefixo = host.slice(0, -sufixo.length);
      return prefixo && prefixo !== "www" ? prefixo : null;
    }
  }
  return null;
}

export async function buscarCidadePorSlug(slug: string): Promise<Cidade | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("cidades").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

// Fallback pra quando ainda não existe domínio próprio (ex: testando direto
// em cidade-unida.vercel.app, que não permite subdomínio embaixo dele).
// Sem isso definido, host sem subdomínio reconhecido simplesmente não acha cidade.
const CIDADE_PADRAO_SLUG = process.env.CIDADE_PADRAO_SLUG || null;

/** Uso em Server Components e Server Actions (lê o Host via next/headers). */
export async function resolverCidadeAtual(): Promise<Cidade | null> {
  const headersList = await headers();
  // x-forwarded-host é o host que o navegador realmente pediu; "host" sozinho
  // pode virar um valor interno (ex: "localhost:3000") em certas passagens
  // internas do Next.js, como o redirect disparado por uma Server Action.
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const slug = extrairSlugDoHost(host) ?? CIDADE_PADRAO_SLUG;
  if (!slug) return null;
  return buscarCidadePorSlug(slug);
}

/** Uso em Route Handlers (a requisição já vem como parâmetro). */
export async function resolverCidadeDaRequisicao(request: Request): Promise<Cidade | null> {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const slug = extrairSlugDoHost(host) ?? CIDADE_PADRAO_SLUG;
  if (!slug) return null;
  return buscarCidadePorSlug(slug);
}

// Geolocalização por IP é aproximada (às vezes acerta só a região, não a
// cidade exata) — não sugerir uma cidade cadastrada longe demais do visitante.
const RAIO_SUGESTAO_KM = 150;

/** Lê a localização aproximada do visitante pelos headers de geo-IP da Vercel. */
export async function obterGeoAtual(): Promise<{ lat: number; lng: number } | null> {
  const headersList = await headers();
  const lat = Number(headersList.get("x-vercel-ip-latitude"));
  const lng = Number(headersList.get("x-vercel-ip-longitude"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

/** Cidade cadastrada mais próxima de uma coordenada, se houver alguma por perto. */
export async function buscarCidadeMaisProxima(lat: number, lng: number): Promise<Cidade | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("cidades").select("*");
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return null;

  let maisProxima: Cidade | null = null;
  let menorDistancia = Infinity;
  for (const cidade of data as Cidade[]) {
    const distancia = distanciaKm(lat, lng, cidade.latitude, cidade.longitude);
    if (distancia < menorDistancia) {
      menorDistancia = distancia;
      maisProxima = cidade;
    }
  }
  return menorDistancia <= RAIO_SUGESTAO_KM ? maisProxima : null;
}
