import { redirect } from "next/navigation";
import PaginaFormulario from "@/components/PaginaFormulario";
import PaginaMapaPublico from "@/components/publico/PaginaMapaPublico";
import { resolverCidadeAtual, obterGeoAtual, buscarCidadeMaisProxima } from "@/lib/tenant";
import { EMAIL_CONTATO } from "@/lib/contato";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cidade = await resolverCidadeAtual();

  if (!cidade) {
    const baseDomain = process.env.BASE_DOMAIN;
    if (baseDomain) {
      const geo = await obterGeoAtual();
      const cidadeProxima = geo ? await buscarCidadeMaisProxima(geo.lat, geo.lng) : null;
      if (cidadeProxima) {
        redirect(`https://${cidadeProxima.slug}.${baseDomain}`);
      }
    }

    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-10 text-center text-sm text-ink-soft">
        <p>
          Ainda não temos o Cidade Unida cadastrado pra sua região. Se você é da
          prefeitura e quer trazer pra sua cidade, entre em contato:
        </p>
        <a href={`mailto:${EMAIL_CONTATO}`} className="text-accent underline">
          {EMAIL_CONTATO}
        </a>
      </div>
    );
  }

  if (cidade.painel_publico) {
    return <PaginaMapaPublico cidade={cidade} />;
  }

  return <PaginaFormulario cidade={cidade} />;
}
