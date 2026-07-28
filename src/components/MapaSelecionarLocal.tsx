"use client";

import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";

type Posicao = { lat: number; lng: number };

function RastreadorDeCentro({ aoMover }: { aoMover: (posicao: Posicao) => void }) {
  useMapEvents({
    moveend: (evento) => {
      const centro = evento.target.getCenter();
      aoMover({ lat: centro.lat, lng: centro.lng });
    },
  });
  return null;
}

export default function MapaSelecionarLocal({
  posicao,
  aoMover,
}: {
  posicao: Posicao;
  aoMover: (posicao: Posicao) => void;
}) {
  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[posicao.lat, posicao.lng]}
        zoom={16}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RastreadorDeCentro aoMover={aoMover} />
      </MapContainer>

      {/* Pino fixo no centro do container: o mapa se move por baixo dele.
          Mesma geometria de âncora de um marcador (ponta encostando no centro exato). */}
      <div
        className="pointer-events-none absolute z-[1000]"
        style={{ left: "calc(50% - 11px)", top: "calc(50% - 22px)" }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50% 50% 50% 0",
            transform: "rotate(-45deg)",
            background: "var(--accent)",
            border: "2px solid var(--paper)",
            boxShadow: "0 1px 4px rgba(0,0,0,.35)",
          }}
        />
      </div>
    </div>
  );
}
