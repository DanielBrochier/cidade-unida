import type { StatusRelato } from "@/lib/categorias";

// Sem dependência do Leaflet — pode ser importado por qualquer componente,
// inclusive os que são pré-renderizados no servidor (ao contrário de
// pino-mapa.ts, que só pode ser usado em componentes client-only).
export const COR_STATUS: Record<StatusRelato, string> = {
  aberto: "#b8451f",
  em_andamento: "#a47418",
  resolvido: "#5c6b45",
};
