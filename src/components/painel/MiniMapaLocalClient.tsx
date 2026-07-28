"use client";

import dynamic from "next/dynamic";
import type { CategoriaId } from "@/lib/categorias";

const MiniMapaLocal = dynamic(() => import("./MiniMapaLocal"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-ink-soft">
      Carregando mapa…
    </div>
  ),
});

export default function MiniMapaLocalClient(props: {
  lat: number;
  lng: number;
  cor: string;
  categoria: CategoriaId;
  quantidade: number;
}) {
  return <MiniMapaLocal {...props} />;
}
