"use client";

import { useMemo, useState } from "react";
import { CATEGORIAS, STATUS_LABEL, type CategoriaId, type Relato, type StatusRelato } from "@/lib/categorias";
import { agruparRelatos, type GrupoRelatos } from "@/lib/agrupar-relatos";
import MapaRelatosClient from "@/components/painel/MapaRelatosClient";
import ListaRelatos from "@/components/painel/ListaRelatos";
import RelatoModal from "@/components/painel/RelatoModal";

const STATUS_FILTRO: (StatusRelato | "todos")[] = ["todos", "aberto", "em_andamento", "resolvido"];

function BotaoFiltro({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        ativo ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft hover:border-ink-soft"
      }`}
    >
      {children}
    </button>
  );
}

export default function PainelConteudo({
  relatos,
  centroCidade,
}: {
  relatos: Relato[];
  centroCidade: { lat: number; lng: number };
}) {
  const [filtroStatus, setFiltroStatus] = useState<StatusRelato | "todos">("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaId | "todas">("todas");
  const [grupoSelecionado, setGrupoSelecionado] = useState<GrupoRelatos | null>(null);

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
              <BotaoFiltro key={c.id} ativo={filtroCategoria === c.id} onClick={() => setFiltroCategoria(c.id)}>
                {c.label}
              </BotaoFiltro>
            ))}
          </div>
        </div>

        <p className="font-mono text-xs text-ink-soft">
          {relatosFiltrados.length} de {relatos.length} relato{relatos.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="h-[45vh] min-h-80 overflow-hidden rounded-lg border border-line sm:h-[60vh]">
        <MapaRelatosClient grupos={grupos} centroCidade={centroCidade} aoSelecionarGrupo={setGrupoSelecionado} />
      </div>

      <div className="rounded-lg border border-line bg-paper-raised p-4">
        <ListaRelatos grupos={grupos} aoSelecionarGrupo={setGrupoSelecionado} />
      </div>

      <RelatoModal grupo={grupoSelecionado} aoFechar={() => setGrupoSelecionado(null)} />
    </div>
  );
}
