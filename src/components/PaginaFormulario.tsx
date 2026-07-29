import Link from "next/link";
import FormularioRelato from "@/components/FormularioRelato";
import type { Cidade } from "@/lib/tenant";
import { paraCidadePublica } from "@/lib/tenant";

export default function PaginaFormulario({ cidade }: { cidade: Cidade }) {
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

        {cidade.painel_publico && (
          <p className="mt-4 text-center text-sm">
            <Link href="/" className="text-accent underline">
              Ver o mapa de relatos da cidade
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}
