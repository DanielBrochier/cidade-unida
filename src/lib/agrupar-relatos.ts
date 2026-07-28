import type { Relato, StatusRelato } from "@/lib/categorias";
import { distanciaKm } from "@/lib/distancia";

export type GrupoRelatos = {
  lat: number;
  lng: number;
  itens: Relato[];
};

// Raio de distância real (não arredondamento de grade) pra juntar relatos do
// "mesmo buraco" sem misturar problemas diferentes na mesma rua.
const RAIO_AGRUPAMENTO_METROS = 15;

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
        distanciaKm(base.latitude, base.longitude, candidato.latitude, candidato.longitude) * 1000 <=
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

// "descartado" fica por último de propósito: um relato descartado não deve
// mascarar outro item do mesmo grupo que ainda está aberto/em andamento/resolvido.
const PRIORIDADE_STATUS: StatusRelato[] = ["aberto", "em_andamento", "resolvido", "descartado"];

/** Status mais "urgente" entre os itens do grupo — define a cor do pino. */
export function statusDoGrupo(itens: Relato[]): StatusRelato {
  for (const status of PRIORIDADE_STATUS) {
    if (itens.some((r) => r.status === status)) return status;
  }
  return "descartado";
}
