import { NextResponse } from "next/server";
import { getSupabaseAdmin, FOTOS_BUCKET } from "@/lib/supabase-admin";
import { CATEGORIAS } from "@/lib/categorias";
import { obterIp, verificarLimiteEnvio } from "@/lib/rate-limit";
import { resolverCidadeDaRequisicao } from "@/lib/tenant";

const TAMANHO_MAXIMO_FOTO = 8 * 1024 * 1024; // 8 MB

export async function POST(request: Request) {
  let cidade;
  try {
    cidade = await resolverCidadeDaRequisicao(request);
  } catch (error) {
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : "Supabase não configurado." },
      { status: 500 }
    );
  }
  if (!cidade) {
    return NextResponse.json(
      { erro: "Não foi possível identificar a cidade pelo endereço acessado." },
      { status: 400 }
    );
  }

  try {
    const limite = await verificarLimiteEnvio(cidade.id, obterIp(request));
    if (!limite.permitido) {
      return NextResponse.json({ erro: limite.motivo }, { status: 429 });
    }
  } catch (error) {
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : "Erro ao checar limite de envio." },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { erro: "Não foi possível ler o formulário enviado." },
      { status: 400 }
    );
  }

  const categoria = String(formData.get("categoria") ?? "");
  const nome = String(formData.get("nome") ?? "").slice(0, 120);
  const descricao = String(formData.get("descricao") ?? "").slice(0, 1000);
  const latitude = Number(formData.get("latitude"));
  const longitude = Number(formData.get("longitude"));
  const foto = formData.get("foto");

  if (!CATEGORIAS.some((c) => c.id === categoria)) {
    return NextResponse.json({ erro: "Categoria inválida." }, { status: 400 });
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json(
      { erro: "Localização ausente ou inválida. Ative o GPS e tente novamente." },
      { status: 400 }
    );
  }
  if (!(foto instanceof File) || foto.size === 0) {
    return NextResponse.json(
      { erro: "É preciso anexar uma foto do problema." },
      { status: 400 }
    );
  }
  if (!foto.type.startsWith("image/")) {
    return NextResponse.json(
      { erro: "O arquivo enviado precisa ser uma imagem." },
      { status: 400 }
    );
  }
  if (foto.size > TAMANHO_MAXIMO_FOTO) {
    return NextResponse.json(
      { erro: "A foto é muito grande (máximo 8 MB)." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const extensao = foto.type.split("/")[1] || "jpg";
  const caminhoFoto = `${cidade.slug}/${crypto.randomUUID()}.${extensao}`;
  const bytes = Buffer.from(await foto.arrayBuffer());

  const { error: erroUpload } = await supabase.storage
    .from(FOTOS_BUCKET)
    .upload(caminhoFoto, bytes, { contentType: foto.type });

  if (erroUpload) {
    return NextResponse.json(
      { erro: `Falha ao enviar a foto: ${erroUpload.message}` },
      { status: 500 }
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from(FOTOS_BUCKET)
    .getPublicUrl(caminhoFoto);

  const { data, error: erroInsert } = await supabase
    .from("relatos")
    .insert({
      cidade_id: cidade.id,
      categoria,
      nome_morador: nome || null,
      descricao: descricao || null,
      foto_url: publicUrlData.publicUrl,
      latitude,
      longitude,
      status: "aberto",
    })
    .select("id")
    .single();

  if (erroInsert) {
    return NextResponse.json(
      { erro: `Falha ao salvar o relato: ${erroInsert.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}
