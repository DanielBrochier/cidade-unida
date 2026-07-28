// Lista curta e conservadora — pensada pra pegar abuso óbvio (xingamento
// pesado, discurso de ódio) sem bloquear reclamação normal do dia a dia.
// Primeira linha de defesa, não é (nem tenta ser) um filtro exaustivo.
const TERMOS_BLOQUEADOS = [
  "arrombado",
  "desgraçado",
  "filho da puta",
  "vagabundo",
  "corno",
  "viado",
  "bicha",
  "traveco",
  "macaco",
  "cigano ladrão",
  "puta",
  "piranha",
  "vadia",
  "retardado",
  "mongoloide",
  "aleijado",
];

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Checa nome/descrição contra termos claramente abusivos antes de aceitar o envio. */
export function contemConteudoImproprio(texto: string): boolean {
  if (!texto) return false;
  const normalizado = normalizar(texto);
  return TERMOS_BLOQUEADOS.some((termo) => {
    const regex = new RegExp(`\\b${escaparRegex(normalizar(termo))}\\b`, "i");
    return regex.test(normalizado);
  });
}
