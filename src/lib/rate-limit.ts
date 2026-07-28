import { getSupabaseAdmin } from "@/lib/supabase-admin";

const JANELA_CURTA_MS = 60 * 60 * 1000; // 1 hora
const LIMITE_CURTO = 5;
const JANELA_LONGA_MS = 24 * 60 * 60 * 1000; // 24 horas
const LIMITE_LONGO = 15;

export function obterIp(request: Request): string {
  const encaminhado = request.headers.get("x-forwarded-for");
  if (encaminhado) return encaminhado.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "desconhecido";
}

async function contarEnvios(cidadeId: string, ip: string, desde: Date): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("limite_envio")
    .select("id", { count: "exact", head: true })
    .eq("cidade_id", cidadeId)
    .eq("ip", ip)
    .gte("created_at", desde.toISOString());

  if (error) throw new Error(error.message);
  return count ?? 0;
}

/**
 * Limita quantos relatos o mesmo IP pode enviar PRA UMA CIDADE, pra evitar que
 * um script cadastre milhares de relatos falsos de uma vez. Escopado por
 * cidade pra tráfego alto numa cidade não afetar o limite de outra. Cada
 * tentativa que passa nessa checagem já é registrada aqui, antes de qualquer
 * upload de foto — assim uma requisição que falha em outra validação ainda
 * conta pro limite.
 */
export async function verificarLimiteEnvio(
  cidadeId: string,
  ip: string
): Promise<{ permitido: true } | { permitido: false; motivo: string }> {
  const agora = Date.now();

  const enviosNaUltimaHora = await contarEnvios(cidadeId, ip, new Date(agora - JANELA_CURTA_MS));
  if (enviosNaUltimaHora >= LIMITE_CURTO) {
    return { permitido: false, motivo: "Muitos envios em pouco tempo. Tente novamente em 1 hora." };
  }

  const enviosNoUltimoDia = await contarEnvios(cidadeId, ip, new Date(agora - JANELA_LONGA_MS));
  if (enviosNoUltimoDia >= LIMITE_LONGO) {
    return { permitido: false, motivo: "Limite diário de envios atingido. Tente novamente amanhã." };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("limite_envio").insert({ ip, cidade_id: cidadeId });
  if (error) throw new Error(error.message);

  return { permitido: true };
}
