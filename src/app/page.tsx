import FormularioRelato from "@/components/FormularioRelato";
import { resolverCidadeAtual, paraCidadePublica } from "@/lib/tenant";

export default async function Home() {
  const cidade = await resolverCidadeAtual();

  if (!cidade) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-10 text-center text-sm text-ink-soft">
        Não foi possível identificar a cidade pelo endereço acessado. Acesse pelo
        subdomínio da sua cidade (ex: brochier.cidadeunida.com).
      </div>
    );
  }

  return (
    <div className="flex flex-1 justify-center px-4 py-10">
      <main className="w-full max-w-md">
        <header className="mb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            {cidade.nome}, {cidade.uf}
          </p>
          <h1 className="font-serif text-3xl font-bold leading-tight">Cidade Unida</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Buraco na rua, poste apagado, lixo acumulado? Relate abaixo — a prefeitura vê tudo
            num mapa e prioriza o atendimento.
          </p>
        </header>
        <FormularioRelato cidade={paraCidadePublica(cidade)} />
      </main>
    </div>
  );
}
