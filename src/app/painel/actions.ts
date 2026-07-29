"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { PAINEL_COOKIE, senhaConfere, sessaoValidaParaCidade, gerarCookieSessao } from "@/lib/painel-auth";
import { resolverCidadeAtual } from "@/lib/tenant";
import type { StatusRelato } from "@/lib/categorias";

export async function entrarNoPainel(formData: FormData) {
  const senha = String(formData.get("senha") ?? "");
  const proximo = String(formData.get("proximo") || "/painel");

  const cidade = await resolverCidadeAtual();
  if (!cidade) {
    redirect(`/painel/login?erro=cidade&proximo=${encodeURIComponent(proximo)}`);
  }

  if (!senhaConfere(senha, cidade.senha_salt, cidade.senha_hash)) {
    redirect(`/painel/login?erro=senha&proximo=${encodeURIComponent(proximo)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(PAINEL_COOKIE, gerarCookieSessao(cidade.id, cidade.senha_hash), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect(proximo);
}

export async function sairDoPainel() {
  const cookieStore = await cookies();
  cookieStore.delete(PAINEL_COOKIE);
  redirect("/painel/login");
}

async function exigirSessaoValida() {
  const cidade = await resolverCidadeAtual();
  if (!cidade) throw new Error("Cidade não encontrada.");

  const cookieStore = await cookies();
  if (!sessaoValidaParaCidade(cookieStore.get(PAINEL_COOKIE)?.value, cidade.id, cidade.senha_hash)) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }
  return cidade;
}

export async function atualizarStatusRelato(id: string, status: StatusRelato) {
  const cidade = await exigirSessaoValida();

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("relatos")
    .update({ status })
    .eq("id", id)
    .eq("cidade_id", cidade.id);
  if (error) throw new Error(error.message);

  revalidatePath("/painel");
}

/** Atualiza o status de todos os relatos de um grupo (mesma ocorrência) de uma vez. */
export async function atualizarStatusGrupo(ids: string[], status: StatusRelato) {
  const cidade = await exigirSessaoValida();
  if (ids.length === 0) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("relatos")
    .update({ status })
    .in("id", ids)
    .eq("cidade_id", cidade.id);
  if (error) throw new Error(error.message);

  revalidatePath("/painel");
}

/** Liga/desliga o mapa público (/mapa) desta cidade. */
export async function alternarPainelPublico(ativar: boolean) {
  const cidade = await exigirSessaoValida();

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("cidades")
    .update({ painel_publico: ativar })
    .eq("id", cidade.id);
  if (error) throw new Error(error.message);

  revalidatePath("/painel");
  revalidatePath("/mapa");
  revalidatePath("/");
}
