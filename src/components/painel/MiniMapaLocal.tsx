"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { criarIconePino } from "@/lib/pino-mapa";
import type { CategoriaId } from "@/lib/categorias";

export default function MiniMapaLocal({
  lat,
  lng,
  cor,
  categoria,
  quantidade,
}: {
  lat: number;
  lng: number;
  cor: string;
  categoria: CategoriaId;
  quantidade: number;
}) {
  return (
    <MapContainer center={[lat, lng]} zoom={17} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={criarIconePino(cor, categoria, quantidade)} />
    </MapContainer>
  );
}
