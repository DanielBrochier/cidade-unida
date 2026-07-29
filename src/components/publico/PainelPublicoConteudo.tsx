"use client";

import { useMemo, useState } from "react";
import {
  CATEGORIAS,
  STATUS_LABEL,
  labelCategoria,
  type CategoriaId,
  type RelatoPublico,
  type StatusRelato,
} from "@/lib/categorias";
import { agruparRelatos } from "@/lib/agrupar-relatos";
import BotaoFiltro from "@/components/BotaoFiltro";
import StatusBadge from "@/components/painel/StatusBadge";
import MapaPublicoClient from "@/components/publico/MapaPublicoClient";

// Só os três status que fazem sentido pro morador acompanhar — "descartado"
// nunca chega até aqui, já é filtrado antes de a página buscar os relatos.
const STATUS_FILTRO: (StatusRelato | "todos")[] = ["todos", "aberto", "em_andamento", "resolvido"];

export default function PainelPublicoConteudo({
  relatos,
  centroCidade,
}: {
  relatos: RelatoPublico[];
  centroCidade: { lat: number; lng: number };
}) {
  const [filtroStatus, setFiltroStatus] = useState<StatusRelato | "todos">("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaId | "todas">("todas");

  const contagens = useMemo(
    () => ({
      aberto: relatos.filter((r) => r.status === "aberto").length,
      em_andamento: relatos.filter((r) => r.status === "em_andamento").length,
      resolvido: relatos.filter((r) => r.status === "resolvido").length,
    }),
    [relatos]
  );

  const relatosFiltrados = useMemo(
    () =>
      relatos.filter(
        (r) =>
          (filtroStatus === "todos" || r.status === filtroStatus) &&
          (filtroCategoria === "todas" || r.categoria === filtroCategoria)
      ),
    [relatos, filtroStatus, filtroCategoria]
  );

  const grupos = useMemo(() => agruparRelatos(relatosFiltrados), [relatosFiltrados]);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-line bg-paper-raised p-3 text-center">
          <p className="font-mono text-2xl font-bold text-accent">{contagens.aberto}</p>
          <p className="text-xs text-ink-soft">Abertos</p>
        </div>
        <div className="rounded-lg border border-line bg-paper-raised p-3 text-center">
          <p className="font-mono text-2xl font-bold text-amber">{contagens.em_andamento}</p>
          <p className="text-xs text-ink-soft">Em andamento</p>
        </div>
        <div className="rounded-lg border border-line bg-paper-raised p-3 text-center">
          <p className="font-mono text-2xl font-bold text-moss">{contagens.resolvido}</p>
          <p className="text-xs text-ink-soft">Resolvidos</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-line bg-paper-raised p-4">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">Status</span>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTRO.map((s) => (
              <BotaoFiltro key={s} ativo={filtroStatus === s} onClick={() => setFiltroStatus(s)}>
                {s === "todos" ? "Todos os status" : STATUS_LABEL[s]}
              </BotaoFiltro>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 border-t border-line pt-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">Categoria</span>
          <div className="flex flex-wrap gap-2">
            <BotaoFiltro ativo={filtroCategoria === "todas"} onClick={() => setFiltroCategoria("todas")}>
              Todas as categorias
            </BotaoFiltro>
            {CATEGORIAS.map((c) => (
              <BotaoFiltro
                key={c.id}
                ativo={filtroCategoria === c.id}
                onClick={() => setFiltroCategoria(c.id)}
              >
                {c.label}
              </BotaoFiltro>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[45vh] min-h-80 overflow-hidden rounded-lg border border-line sm:h-[60vh]">
        <MapaPublicoClient grupos={grupos} centroCidade={centroCidade} />
      </div>

      <ul className="rounded-lg border border-line bg-paper-raised p-4">
        {grupos.length === 0 && <p className="text-sm text-ink-soft">Nenhum relato ainda.</p>}
        {grupos.map((grupo) => {
          const principal = grupo.itens[0];
          return (
            <li
              key={grupo.itens.map((r) => r.id).join(",")}
              className="flex items-center gap-3 border-b border-line py-3 last:border-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={principal.foto_url}
                alt={labelCategoria(principal.categoria)}
                width={48}
                height={48}
                className="h-12 w-12 flex-none rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {labelCategoria(principal.categoria)}
                  {grupo.itens.length > 1 && (
                    <span className="text-ink-soft"> · {grupo.itens.length} relatos</span>
                  )}
                </p>
                <p className="text-xs text-ink-soft">
                  {new Date(principal.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <StatusBadge status={principal.status} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
