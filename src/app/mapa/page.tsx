import PaginaMapaPublico from "@/components/publico/PaginaMapaPublico";
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

  return <PaginaMapaPublico cidade={cidade} />;
}
