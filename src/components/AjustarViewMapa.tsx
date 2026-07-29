"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export default function AjustarViewMapa({
  pontos,
  centroPadrao,
}: {
  pontos: { lat: number; lng: number }[];
  centroPadrao: { lat: number; lng: number };
}) {
  const map = useMap();
  const chave = pontos.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join("|");

  useEffect(() => {
    if (pontos.length === 0) {
      map.setView([centroPadrao.lat, centroPadrao.lng], 15);
      return;
    }
    if (pontos.length === 1) {
      map.setView([pontos[0].lat, pontos[0].lng], 16);
      return;
    }
    const bounds = L.latLngBounds(pontos.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, centroPadrao.lat, centroPadrao.lng, map]);

  return null;
}
