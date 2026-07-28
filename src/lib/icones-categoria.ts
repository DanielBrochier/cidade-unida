import type { CategoriaId } from "@/lib/categorias";

// Formas simples (linhas/círculos/polígonos) desenhadas à mão, sem depender de
// biblioteca de ícones externa. Pensadas pra ficar legíveis em ~17px dentro do
// pino do mapa — por isso a preferência por formas geométricas básicas.
export const ICONE_CATEGORIA: Record<CategoriaId, string> = {
  estrada:
    '<circle cx="12" cy="12" r="6" fill="none" stroke="white" stroke-width="1.8"/><circle cx="12" cy="12" r="2.4" fill="white"/>',
  poste:
    '<circle cx="12" cy="10" r="5" fill="none" stroke="white" stroke-width="1.8"/><line x1="10" y1="17" x2="14" y2="17" stroke="white" stroke-width="1.8" stroke-linecap="round"/><line x1="10.5" y1="19.5" x2="13.5" y2="19.5" stroke="white" stroke-width="1.8" stroke-linecap="round"/>',
  lixo:
    '<rect x="6" y="8" width="12" height="12" rx="1.5" fill="none" stroke="white" stroke-width="1.7"/><line x1="4" y1="8" x2="20" y2="8" stroke="white" stroke-width="1.8" stroke-linecap="round"/><rect x="9" y="4" width="6" height="3" rx="1" fill="none" stroke="white" stroke-width="1.5"/><line x1="9.5" y1="11.5" x2="9.5" y2="17" stroke="white" stroke-width="1.4" stroke-linecap="round"/><line x1="12" y1="11.5" x2="12" y2="17" stroke="white" stroke-width="1.4" stroke-linecap="round"/><line x1="14.5" y1="11.5" x2="14.5" y2="17" stroke="white" stroke-width="1.4" stroke-linecap="round"/>',
  mato_alto:
    '<line x1="7" y1="20" x2="7" y2="10" stroke="white" stroke-width="1.8" stroke-linecap="round"/><line x1="12" y1="20" x2="12" y2="6" stroke="white" stroke-width="1.8" stroke-linecap="round"/><line x1="17" y1="20" x2="17" y2="10" stroke="white" stroke-width="1.8" stroke-linecap="round"/>',
  animal_solto:
    '<circle cx="12" cy="16" r="4" fill="white"/><circle cx="7" cy="9" r="1.8" fill="white"/><circle cx="11" cy="6.5" r="1.8" fill="white"/><circle cx="15" cy="6.5" r="1.8" fill="white"/><circle cx="17" cy="9" r="1.8" fill="white"/>',
  vazamento_agua: '<circle cx="12" cy="15" r="5" fill="white"/><polygon points="12,3 8,13 16,13" fill="white"/>',
  esgoto:
    '<polyline points="4,9 6,7 8,9 10,7 12,9 14,7 16,9 18,7 20,9" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><polyline points="4,15 6,13 8,15 10,13 12,15 14,13 16,15 18,13 20,15" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  bueiro:
    '<rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="white" stroke-width="1.7"/><line x1="4" y1="9.3" x2="20" y2="9.3" stroke="white" stroke-width="1.3"/><line x1="4" y1="14.7" x2="20" y2="14.7" stroke="white" stroke-width="1.3"/><line x1="9.3" y1="4" x2="9.3" y2="20" stroke="white" stroke-width="1.3"/><line x1="14.7" y1="4" x2="14.7" y2="20" stroke="white" stroke-width="1.3"/>',
  sinalizacao:
    '<polygon points="12,3 21,20 3,20" fill="none" stroke="white" stroke-width="1.8" stroke-linejoin="round"/><line x1="12" y1="10" x2="12" y2="14.5" stroke="white" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="white"/>',
  arvore:
    '<polygon points="12,3 17,11 7,11" fill="white"/><polygon points="12,7 18,16 6,16" fill="white"/><rect x="10.5" y="16" width="3" height="5" fill="white"/>',
  outro:
    '<line x1="12" y1="5" x2="12" y2="15" stroke="white" stroke-width="1.8" stroke-linecap="round"/><line x1="7" y1="7.5" x2="17" y2="12.5" stroke="white" stroke-width="1.8" stroke-linecap="round"/><line x1="17" y1="7.5" x2="7" y2="12.5" stroke="white" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="19" r="1" fill="white"/>',
};
