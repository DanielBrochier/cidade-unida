"use client";

import dynamic from "next/dynamic";
import type { RelatoPublico } from "@/lib/categorias";
import type { GrupoRelatos } from "@/lib/agrupar-relatos";

const MapaPublico = dynamic(() => import("./MapaPublico"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-ink-soft">
      Carregando mapa…
    </div>
  ),
});

export default function MapaPublicoClient({
  grupos,
  centroCidade,
}: {
  grupos: GrupoRelatos<RelatoPublico>[];
  centroCidade: { lat: number; lng: number };
}) {
  return <MapaPublico grupos={grupos} centroCidade={centroCidade} />;
}
