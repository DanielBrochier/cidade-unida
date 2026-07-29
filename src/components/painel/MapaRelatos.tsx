"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import type { Relato } from "@/lib/categorias";
import { statusDoGrupo, type GrupoRelatos } from "@/lib/agrupar-relatos";
import { criarIconePino } from "@/lib/pino-mapa";
import { COR_STATUS } from "@/lib/cor-status";
import AjustarViewMapa from "@/components/AjustarViewMapa";

export default function MapaRelatos({
  grupos,
  centroCidade,
  aoSelecionarGrupo,
}: {
  grupos: GrupoRelatos<Relato>[];
  centroCidade: { lat: number; lng: number };
  aoSelecionarGrupo: (grupo: GrupoRelatos<Relato>) => void;
}) {
  return (
    <MapContainer
      center={[centroCidade.lat, centroCidade.lng]}
      zoom={15}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AjustarViewMapa
        pontos={grupos.map((g) => ({ lat: g.lat, lng: g.lng }))}
        centroPadrao={centroCidade}
      />
      {grupos.map((grupo) => {
        const status = statusDoGrupo(grupo.itens);
        return (
          <Marker
            key={grupo.itens.map((r) => r.id).join(",")}
            position={[grupo.lat, grupo.lng]}
            icon={criarIconePino(COR_STATUS[status], grupo.itens[0].categoria, grupo.itens.length)}
            eventHandlers={{ click: () => aoSelecionarGrupo(grupo) }}
          />
        );
      })}
    </MapContainer>
  );
}
