"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATEGORIAS, STATUS_LABEL, type CategoriaId, type Relato, type StatusRelato } from "@/lib/categorias";
import { agruparRelatos, type GrupoRelatos } from "@/lib/agrupar-relatos";
import MapaRelatosClient from "@/components/painel/MapaRelatosClient";
import ListaRelatos from "@/components/painel/ListaRelatos";
import RelatoModal from "@/components/painel/RelatoModal";
import BotaoFiltro from "@/components/BotaoFiltro";

const STATUS_FILTRO: (StatusRelato | "todos")[] = [
  "todos",
  "aberto",
  "em_andamento",
  "resolvido",
  "descartado",
];
const STATUS_VALIDOS = new Set<string>(STATUS_FILTRO);
const CATEGORIAS_VALIDAS = new Set<string>(CATEGORIAS.map((c) => c.id));

export default function PainelConteudo({
  relatos,
  centroCidade,
}: {
  relatos: Relato[];
  centroCidade: { lat: number; lng: number };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [grupoSelecionado, setGrupoSelecionado] = useState<GrupoRelatos<Relato> | null>(null);

  const statusNaUrl = searchParams.get("status");
  const categoriaNaUrl = searchParams.get("categoria");
  const filtroStatus: StatusRelato | "todos" =
    statusNaUrl && STATUS_VALIDOS.has(statusNaUrl) ? (statusNaUrl as StatusRelato) : "todos";
  const filtroCategoria: CategoriaId | "todas" =
    categoriaNaUrl && CATEGORIAS_VALIDAS.has(categoriaNaUrl) ? (categoriaNaUrl as CategoriaId) : "todas";

  function atualizarFiltro(chave: "status" | "categoria", valor: string, valorPadrao: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor === valorPadrao) params.delete(chave);
    else params.set(chave, valor);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const relatosFiltrados = useMemo(
    () =>
      relatos.filter(
        (r) =>
          // "Todos os status" esconde descartados de propósito — só aparecem
          // quando alguém filtra por "Descartado" explicitamente.
          (filtroStatus === "todos" ? r.status !== "descartado" : r.status === filtroStatus) &&
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
              <BotaoFiltro
                key={s}
                ativo={filtroStatus === s}
                onClick={() => atualizarFiltro("status", s, "todos")}
              >
                {s === "todos" ? "Todos os status" : STATUS_LABEL[s]}
              </BotaoFiltro>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 border-t border-line pt-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">Categoria</span>
          <div className="flex flex-wrap gap-2">
            <BotaoFiltro
              ativo={filtroCategoria === "todas"}
              onClick={() => atualizarFiltro("categoria", "todas", "todas")}
            >
              Todas as categorias
            </BotaoFiltro>
            {CATEGORIAS.map((c) => (
              <BotaoFiltro
                key={c.id}
                ativo={filtroCategoria === c.id}
                onClick={() => atualizarFiltro("categoria", c.id, "todas")}
              >
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
