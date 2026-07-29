"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { labelCategoria, STATUS_LABEL, type RelatoPublico } from "@/lib/categorias";
import { statusDoGrupo, type GrupoRelatos } from "@/lib/agrupar-relatos";
import { criarIconePino } from "@/lib/pino-mapa";
import { COR_STATUS } from "@/lib/cor-status";
import AjustarViewMapa from "@/components/AjustarViewMapa";

export default function MapaPublico({
  grupos,
  centroCidade,
}: {
  grupos: GrupoRelatos<RelatoPublico>[];
  centroCidade: { lat: number; lng: number };
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
          >
            <Popup maxWidth={240}>
              <div className="flex max-h-56 min-w-40 flex-col gap-3 overflow-y-auto">
                {grupo.itens.length > 1 && <strong>{grupo.itens.length} relatos neste local</strong>}
                {grupo.itens.map((item) => (
                  <div key={item.id} className="flex flex-col gap-1 border-b border-black/10 pb-2 last:border-0 last:pb-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.foto_url}
                      alt={labelCategoria(item.categoria)}
                      width={200}
                      height={120}
                      className="w-full rounded object-cover"
                    />
                    <strong>{labelCategoria(item.categoria)}</strong>
                    <span>{STATUS_LABEL[item.status]}</span>
                    <span>{new Date(item.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                ))}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
