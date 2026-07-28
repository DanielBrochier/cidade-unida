import type { Relato, StatusRelato } from "@/lib/categorias";

export type GrupoRelatos = {
  lat: number;
  lng: number;
  itens: Relato[];
};

// Raio de distância real (não arredondamento de grade) pra juntar relatos do
// "mesmo buraco" sem misturar problemas diferentes na mesma rua.
const RAIO_AGRUPAMENTO_METROS = 15;
const RAIO_TERRA_METROS = 6371000;

function distanciaMetros(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const paraRad = (graus: number) => (graus * Math.PI) / 180;
  const dLat = paraRad(lat2 - lat1);
  const dLng = paraRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(paraRad(lat1)) * Math.cos(paraRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * RAIO_TERRA_METROS * Math.asin(Math.sqrt(a));
}

/**
 * Agrupa relatos da MESMA categoria que estão a até RAIO_AGRUPAMENTO_METROS um
 * do outro — a ideia é juntar "3 pessoas relataram o mesmo buraco", não
 * misturar um buraco com um poste que por acaso ficam na mesma esquina.
 * Usa distância real (Haversine), não arredondamento de coordenada — assim
 * dois relatos bem próximos não escapam do agrupamento por caírem em lados
 * opostos de uma célula de grade.
 */
export function agruparRelatos(relatos: Relato[]): GrupoRelatos[] {
  const restantes = [...relatos];
  const grupos: Relato[][] = [];

  while (restantes.length > 0) {
    const base = restantes.shift()!;
    const grupo = [base];

    for (let i = restantes.length - 1; i >= 0; i--) {
      const candidato = restantes[i];
      const mesmaCategoria = candidato.categoria === base.categoria;
      const perto =
        distanciaMetros(base.latitude, base.longitude, candidato.latitude, candidato.longitude) <=
        RAIO_AGRUPAMENTO_METROS;
      if (mesmaCategoria && perto) {
        grupo.push(candidato);
        restantes.splice(i, 1);
      }
    }

    grupos.push(grupo);
  }

  return grupos.map((itens) => ({
    lat: itens.reduce((soma, r) => soma + r.latitude, 0) / itens.length,
    lng: itens.reduce((soma, r) => soma + r.longitude, 0) / itens.length,
    itens,
  }));
}

const PRIORIDADE_STATUS: StatusRelato[] = ["aberto", "em_andamento", "resolvido"];

/** Status mais "urgente" entre os itens do grupo — define a cor do pino. */
export function statusDoGrupo(itens: Relato[]): StatusRelato {
  for (const status of PRIORIDADE_STATUS) {
    if (itens.some((r) => r.status === status)) return status;
  }
  return "resolvido";
}
