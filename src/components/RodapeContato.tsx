import { EMAIL_CONTATO } from "@/lib/contato";

export default function RodapeContato() {
  return (
    <footer className="mt-8 border-t border-line pt-4 text-center text-xs text-ink-soft">
      Cidade Unida — plataforma de relatos urbanos. Quer levar pra sua cidade?{" "}
      <a href={`mailto:${EMAIL_CONTATO}`} className="text-accent underline">
        {EMAIL_CONTATO}
      </a>
    </footer>
  );
}
