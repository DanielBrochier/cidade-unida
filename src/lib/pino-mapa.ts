import L from "leaflet";
import type { CategoriaId } from "@/lib/categorias";
import { ICONE_CATEGORIA } from "@/lib/icones-categoria";

const TAMANHO_PINO = 32;

/** Pino de mapa: cor pelo status, ícone pela categoria, selo de contagem se agrupado. */
export function criarIconePino(cor: string, categoria: CategoriaId, quantidade = 1): L.DivIcon {
  const svgIcone = ICONE_CATEGORIA[categoria] ?? ICONE_CATEGORIA.outro;
  const selo =
    quantidade > 1
      ? `<span style="position:absolute;top:-6px;right:-6px;min-width:17px;height:17px;padding:0 3px;border-radius:9999px;background:var(--paper);color:${cor};font:700 10px var(--font-mono,monospace);display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,.4);">${quantidade}</span>`
      : "";

  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:${TAMANHO_PINO}px;height:${TAMANHO_PINO}px;">
      <div style="width:100%;height:100%;border-radius:50%;background:${cor};border:2px solid var(--paper);box-shadow:0 1px 4px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;cursor:pointer;">
        <svg viewBox="0 0 24 24" width="18" height="18">${svgIcone}</svg>
      </div>
      ${selo}
    </div>`,
    iconSize: [TAMANHO_PINO, TAMANHO_PINO],
    iconAnchor: [TAMANHO_PINO / 2, TAMANHO_PINO / 2],
  });
}
