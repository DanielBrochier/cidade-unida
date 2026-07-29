import PaginaFormulario from "@/components/PaginaFormulario";
import { resolverCidadeAtual } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function RelatarPage() {
  const cidade = await resolverCidadeAtual();

  if (!cidade) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-10 text-center text-sm text-ink-soft">
        Não foi possível identificar a cidade pelo endereço acessado.
      </div>
    );
  }

  return <PaginaFormulario cidade={cidade} />;
}
