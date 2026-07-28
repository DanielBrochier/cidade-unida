import { STATUS_LABEL, type StatusRelato } from "@/lib/categorias";

const CLASSE_COR: Record<StatusRelato, string> = {
  aberto: "bg-accent-soft text-accent",
  em_andamento: "bg-amber-soft text-amber",
  resolvido: "bg-moss-soft text-moss",
};

export default function StatusBadge({
  status,
  tamanho = "normal",
}: {
  status: StatusRelato;
  tamanho?: "normal" | "grande";
}) {
  const classeTamanho =
    tamanho === "grande" ? "px-4 py-1.5 text-sm font-bold" : "px-3 py-1 text-xs font-medium";
  return (
    <span className={`inline-block rounded-full font-mono uppercase tracking-wide ${classeTamanho} ${CLASSE_COR[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
