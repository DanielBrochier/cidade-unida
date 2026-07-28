"use client";

import { useTransition } from "react";
import { atualizarStatusGrupo } from "@/app/painel/actions";
import { labelCategoria, STATUS_LABEL, type StatusRelato } from "@/lib/categorias";
import { statusDoGrupo, type GrupoRelatos } from "@/lib/agrupar-relatos";
import { COR_STATUS } from "@/lib/cor-status";
import StatusBadge from "@/components/painel/StatusBadge";
import MiniMapaLocalClient from "@/components/painel/MiniMapaLocalClient";

const STATUS_OPCOES: StatusRelato[] = ["aberto", "em_andamento", "resolvido"];

const CLASSE_BOTAO: Record<StatusRelato, string> = {
  aberto: "border-accent bg-accent-soft text-accent",
  em_andamento: "border-amber bg-amber-soft text-amber",
  resolvido: "border-moss bg-moss-soft text-moss",
};

export default function RelatoModal({
  grupo,
  aoFechar,
}: {
  grupo: GrupoRelatos | null;
  aoFechar: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  if (!grupo) return null;

  const statusAtual = statusDoGrupo(grupo.itens);
  const ids = grupo.itens.map((r) => r.id);

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4"
      onClick={aoFechar}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-line bg-paper"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line p-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">
              {grupo.itens.length > 1 ? `${grupo.itens.length} relatos neste local` : "1 relato"}
            </p>
            <h2 className="font-serif text-xl font-bold">{labelCategoria(grupo.itens[0].categoria)}</h2>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            className="rounded-md px-2 py-1 text-xl leading-none text-ink-soft hover:bg-paper-raised"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="h-48 flex-none border-b border-line">
          <MiniMapaLocalClient
            lat={grupo.lat}
            lng={grupo.lng}
            cor={COR_STATUS[statusAtual]}
            categoria={grupo.itens[0].categoria}
            quantidade={grupo.itens.length}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-line p-5">
          <span className="mr-1 text-xs font-medium uppercase tracking-wide text-ink-soft">
            {grupo.itens.length > 1 ? "Marcar todos como" : "Status"}
          </span>
          {STATUS_OPCOES.map((status) => (
            <button
              key={status}
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => atualizarStatusGrupo(ids, status))}
              className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold uppercase tracking-wide transition-opacity disabled:opacity-50 ${
                statusAtual === status ? CLASSE_BOTAO[status] : "border-line text-ink-soft"
              }`}
            >
              {STATUS_LABEL[status]}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto p-5">
          {grupo.itens.map((relato) => (
            <div
              key={relato.id}
              className="flex flex-col gap-2 border-b border-line pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {relato.nome_morador ?? "Morador não identificado"}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {new Date(relato.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <StatusBadge status={relato.status} tamanho="grande" />
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={relato.foto_url}
                alt={labelCategoria(relato.categoria)}
                className="h-56 w-full rounded-md object-cover"
              />
              {relato.descricao && <p className="text-sm text-ink-soft">{relato.descricao}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
