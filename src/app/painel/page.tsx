import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Relato } from "@/lib/categorias";
import PainelConteudo from "@/components/painel/PainelConteudo";
import { sairDoPainel } from "@/app/painel/actions";
import { resolverCidadeAtual } from "@/lib/tenant";
import { PAINEL_COOKIE, sessaoValidaParaCidade } from "@/lib/painel-auth";

export const dynamic = "force-dynamic";

export default async function PainelPage() {
  const cidade = await resolverCidadeAtual();
  if (!cidade) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-10 text-center text-sm text-ink-soft">
        Não foi possível identificar a cidade pelo endereço acessado.
      </div>
    );
  }

  const cookieStore = await cookies();
  if (!sessaoValidaParaCidade(cookieStore.get(PAINEL_COOKIE)?.value, cidade.id, cidade.senha_hash)) {
    redirect("/painel/login?proximo=/painel");
  }

  let relatos: Relato[] = [];
  let erroCarregamento: string | null = null;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("relatos")
      .select("*")
      .eq("cidade_id", cidade.id)
      .order("created_at", { ascending: false });

    if (error) erroCarregamento = error.message;
    else relatos = (data ?? []) as Relato[];
  } catch (erro) {
    erroCarregamento = erro instanceof Error ? erro.message : "Erro desconhecido.";
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            {cidade.nome}, {cidade.uf}
          </p>
          <h1 className="font-serif text-2xl font-bold">Cidade Unida</h1>
          <p className="text-sm font-medium text-ink-soft">Painel de relatos</p>
        </div>
        <form action={sairDoPainel}>
          <button
            type="submit"
            className="rounded-md border border-line px-3 py-1.5 text-sm hover:bg-paper-raised"
          >
            Sair
          </button>
        </form>
      </header>

      {erroCarregamento && (
        <p className="rounded-md bg-accent-soft px-3 py-2 text-sm text-accent">
          Não foi possível carregar os relatos: {erroCarregamento}
        </p>
      )}

      <PainelConteudo
        relatos={relatos}
        centroCidade={{ lat: cidade.latitude, lng: cidade.longitude }}
      />
    </div>
  );
}
