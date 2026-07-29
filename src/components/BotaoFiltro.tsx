"use client";

export default function BotaoFiltro({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        ativo ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft hover:border-ink-soft"
      }`}
    >
      {children}
    </button>
  );
}
