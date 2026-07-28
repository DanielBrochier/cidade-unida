"use client";

import dynamic from "next/dynamic";

const MapaSelecionarLocal = dynamic(() => import("./MapaSelecionarLocal"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-ink-soft">
      Carregando mapa…
    </div>
  ),
});

export default function MapaSelecionarLocalClient({
  posicao,
  aoMover,
}: {
  posicao: { lat: number; lng: number };
  aoMover: (posicao: { lat: number; lng: number }) => void;
}) {
  return <MapaSelecionarLocal posicao={posicao} aoMover={aoMover} />;
}
