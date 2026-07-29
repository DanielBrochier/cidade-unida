import Link from "next/link";
import { Camera } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { RelatoPublico } from "@/lib/categorias";
import type { Cidade } from "@/lib/tenant";
import PainelPublicoConteudo from "@/components/publico/PainelPublicoConteudo";
import RodapeContato from "@/components/RodapeContato";

export default async function PaginaMapaPublico({ cidade }: { cidade: Cidade }) {
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
      <header className="flex flex-col gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            {cidade.nome}, {cidade.uf}
          </p>
          <h1 className="font-serif text-3xl font-bold leading-tight">Cidade Unida</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Veja os problemas relatados pelos moradores e o andamento de cada um.
          </p>
        </div>

        <Link
          href="/relatar"
          className="group flex items-center justify-center gap-2 self-start rounded-full bg-accent px-6 py-3.5 text-base font-bold text-accent-ink shadow-lg shadow-accent/25 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Camera className="h-5 w-5" aria-hidden="true" />
          Relatar um problema
        </Link>
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

      <RodapeContato />
    </div>
  );
}
