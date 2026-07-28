const RAIO_TERRA_KM = 6371;

/** Distância real entre duas coordenadas (fórmula de Haversine), em km. */
export function distanciaKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const paraRad = (graus: number) => (graus * Math.PI) / 180;
  const dLat = paraRad(lat2 - lat1);
  const dLng = paraRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(paraRad(lat1)) * Math.cos(paraRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * RAIO_TERRA_KM * Math.asin(Math.sqrt(a));
}
