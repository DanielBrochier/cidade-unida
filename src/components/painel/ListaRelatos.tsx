"use client";

import { useTransition } from "react";
import { atualizarStatusGrupo } from "@/app/painel/actions";
import { labelCategoria, STATUS_LABEL, type StatusRelato } from "@/lib/categorias";
import { statusDoGrupo, type GrupoRelatos } from "@/lib/agrupar-relatos";

const STATUS_OPCOES: StatusRelato[] = ["aberto", "em_andamento", "resolvido", "descartado"];

const CHIP_CLASSE: Record<StatusRelato, string> = {
  aberto: "bg-accent-soft text-accent",
  em_andamento: "bg-amber-soft text-amber",
  resolvido: "bg-moss-soft text-moss",
  descartado: "bg-line text-ink-soft",
};

function LinhaGrupo({
  grupo,
  aoSelecionarGrupo,
}: {
  grupo: GrupoRelatos;
  aoSelecionarGrupo: (grupo: GrupoRelatos) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const status = statusDoGrupo(grupo.itens);
  const principal = grupo.itens[0];
  const ids = grupo.itens.map((r) => r.id);

  return (
    <li className="flex flex-col gap-2 border-b border-line py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={() => aoSelecionarGrupo(grupo)}
        className="flex flex-1 items-center gap-3 text-left"
      >
        <div className="relative flex-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={principal.foto_url}
            alt={labelCategoria(principal.categoria)}
            width={48}
            height={48}
            className="h-12 w-12 rounded-md object-cover"
          />
          {grupo.itens.length > 1 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent font-mono text-[10px] font-bold text-accent-ink">
              {grupo.itens.length}
            </span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium">{labelCategoria(principal.categoria)}</p>
          <p className="text-xs text-ink-soft">
            {grupo.itens.length > 1
              ? `${grupo.itens.length} relatos · atualizado ${new Date(principal.created_at).toLocaleDateString("pt-BR")}`
              : `${principal.nome_morador ? `${principal.nome_morador} · ` : ""}${new Date(principal.created_at).toLocaleDateString("pt-BR")}`}
          </p>
          {grupo.itens.length === 1 && principal.descricao && (
            <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">{principal.descricao}</p>
          )}
        </div>
      </button>

      <div className={`relative inline-block self-start rounded-full sm:self-auto ${CHIP_CLASSE[status]}`}>
        <select
          value={status}
          disabled={isPending}
          onChange={(e) => {
            const novoStatus = e.target.value as StatusRelato;
            startTransition(() => {
              atualizarStatusGrupo(ids, novoStatus);
            });
          }}
          className="appearance-none rounded-full bg-transparent py-1 pl-3 pr-6 font-mono text-xs text-inherit outline-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {STATUS_OPCOES.map((s) => (
            <option key={s} value={s} className="bg-paper text-ink">
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px]">▾</span>
      </div>
    </li>
  );
}

export default function ListaRelatos({
  grupos,
  aoSelecionarGrupo,
}: {
  grupos: GrupoRelatos[];
  aoSelecionarGrupo: (grupo: GrupoRelatos) => void;
}) {
  if (grupos.length === 0) {
    return <p className="text-sm text-ink-soft">Nenhum relato ainda.</p>;
  }
  return (
    <ul>
      {grupos.map((grupo) => (
        <LinhaGrupo
          key={grupo.itens.map((r) => r.id).join(",")}
          grupo={grupo}
          aoSelecionarGrupo={aoSelecionarGrupo}
        />
      ))}
    </ul>
  );
}
