"use client";

import dynamic from "next/dynamic";
import type { GrupoRelatos } from "@/lib/agrupar-relatos";

const MapaRelatos = dynamic(() => import("./MapaRelatos"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-ink-soft">
      Carregando mapa…
    </div>
  ),
});

export default function MapaRelatosClient({
  grupos,
  centroCidade,
  aoSelecionarGrupo,
}: {
  grupos: GrupoRelatos[];
  centroCidade: { lat: number; lng: number };
  aoSelecionarGrupo: (grupo: GrupoRelatos) => void;
}) {
  return <MapaRelatos grupos={grupos} centroCidade={centroCidade} aoSelecionarGrupo={aoSelecionarGrupo} />;
}
