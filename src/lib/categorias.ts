export type CategoriaId =
  | "estrada"
  | "poste"
  | "lixo"
  | "mato_alto"
  | "animal_solto"
  | "vazamento_agua"
  | "esgoto"
  | "bueiro"
  | "sinalizacao"
  | "arvore"
  | "outro";

export const CATEGORIAS: { id: CategoriaId; label: string }[] = [
  { id: "estrada", label: "Buraco / estrada de chão" },
  { id: "poste", label: "Iluminação pública" },
  { id: "lixo", label: "Lixo acumulado" },
  { id: "mato_alto", label: "Mato alto" },
  { id: "animal_solto", label: "Animal solto" },
  { id: "vazamento_agua", label: "Vazamento de água" },
  { id: "esgoto", label: "Esgoto a céu aberto" },
  { id: "bueiro", label: "Bueiro entupido/danificado" },
  { id: "sinalizacao", label: "Sinalização danificada" },
  { id: "arvore", label: "Árvore caída ou com risco" },
  { id: "outro", label: "Outro" },
];

export function labelCategoria(id: string): string {
  return CATEGORIAS.find((c) => c.id === id)?.label ?? id;
}

export type StatusRelato = "aberto" | "em_andamento" | "resolvido" | "descartado";

export const STATUS_LABEL: Record<StatusRelato, string> = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  resolvido: "Resolvido",
  descartado: "Descartado",
};

export type Relato = {
  id: string;
  cidade_id: string;
  created_at: string;
  categoria: CategoriaId;
  descricao: string | null;
  nome_morador: string | null;
  foto_url: string;
  latitude: number;
  longitude: number;
  status: StatusRelato;
};

/**
 * Versão do relato pro mapa público — sem nome do morador nem descrição
 * livre, de propósito (ver decisão de privacidade em src/app/mapa/page.tsx).
 */
export type RelatoPublico = Pick<
  Relato,
  "id" | "categoria" | "foto_url" | "latitude" | "longitude" | "status" | "created_at"
>;
