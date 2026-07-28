import { entrarNoPainel } from "@/app/painel/actions";
import { resolverCidadeAtual } from "@/lib/tenant";

export default async function PainelLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; proximo?: string }>;
}) {
  const { erro, proximo } = await searchParams;
  const cidade = await resolverCidadeAtual();

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-lg border border-line bg-paper-raised p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          {cidade ? `${cidade.nome}, ${cidade.uf}` : "Cidade não reconhecida"}
        </p>
        <h1 className="font-serif text-2xl font-bold">Cidade Unida</h1>
        <p className="text-sm font-medium text-ink-soft">Painel da prefeitura</p>
        <p className="mt-1 mb-5 text-sm text-ink-soft">
          Acesso restrito. Informe a senha da equipe responsável por esta cidade.
        </p>

        <form action={entrarNoPainel} className="flex flex-col gap-3">
          <input type="hidden" name="proximo" value={proximo || "/painel"} />
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">Senha</span>
            <input
              type="password"
              name="senha"
              autoFocus
              required
              disabled={!cidade}
              className="rounded-md border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-accent disabled:opacity-50"
            />
          </label>

          {erro === "senha" && (
            <p className="rounded-md bg-accent-soft px-3 py-2 text-sm text-accent">
              Senha incorreta. Tente novamente.
            </p>
          )}
          {erro === "cidade" && (
            <p className="rounded-md bg-accent-soft px-3 py-2 text-sm text-accent">
              Não foi possível identificar a cidade pelo endereço acessado.
            </p>
          )}
          {!cidade && !erro && (
            <p className="rounded-md bg-accent-soft px-3 py-2 text-sm text-accent">
              Acesse pelo subdomínio da sua cidade (ex: brochier.cidadeunida.com).
            </p>
          )}

          <button
            type="submit"
            disabled={!cidade}
            className="mt-1 rounded-md bg-accent py-2.5 text-sm font-semibold text-accent-ink disabled:opacity-50"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
