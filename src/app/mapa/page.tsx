import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { RelatoPublico } from "@/lib/categorias";
import PainelPublicoConteudo from "@/components/publico/PainelPublicoConteudo";
import { resolverCidadeAtual } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function MapaPublicoPage() {
  const cidade = await resolverCidadeAtual();

  if (!cidade) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-10 text-center text-sm text-ink-soft">
        Não foi possível identificar a cidade pelo endereço acessado.
      </div>
    );
  }

  if (!cidade.painel_publico) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-10 text-center text-sm text-ink-soft">
        A prefeitura de {cidade.nome} ainda não disponibilizou o mapa público de relatos.
      </div>
    );
  }

  let relatos: RelatoPublico[] = [];
  let erroCarregamento: string | null = null;

  try {
    // Só as colunas seguras pra mostrar publicamente — nunca nome_morador nem
    // descricao (podem conter informação que a pessoa não esperava tornar
    // pública), e nunca relatos descartados (spam/sem sentido).
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("relatos")
      .select("id, categoria, foto_url, latitude, longitude, status, created_at")
      .eq("cidade_id", cidade.id)
      .neq("status", "descartado")
      .order("created_at", { ascending: false });

    if (error) erroCarregamento = error.message;
    else relatos = (data ?? []) as RelatoPublico[];
  } catch (erro) {
    erroCarregamento = erro instanceof Error ? erro.message : "Erro desconhecido.";
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          {cidade.nome}, {cidade.uf}
        </p>
        <h1 className="font-serif text-2xl font-bold">Cidade Unida</h1>
        <p className="text-sm font-medium text-ink-soft">Mapa público de relatos</p>
        <p className="mt-1 text-sm text-ink-soft">
          Veja os problemas relatados pelos moradores e o andamento de cada um.{" "}
          <Link href="/" className="text-accent underline">
            Relatar um problema
          </Link>
        </p>
      </header>

      {erroCarregamento && (
        <p className="rounded-md bg-accent-soft px-3 py-2 text-sm text-accent">
          Não foi possível carregar os relatos: {erroCarregamento}
        </p>
      )}

      <PainelPublicoConteudo
        relatos={relatos}
        centroCidade={{ lat: cidade.latitude, lng: cidade.longitude }}
      />
    </div>
  );
}
