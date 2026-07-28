const DIMENSAO_MAXIMA = 1600;
const QUALIDADE_JPEG = 0.75;

/**
 * Redimensiona e recomprime a foto no navegador antes do envio — fotos de
 * celular costumam vir com vários MB, e isso deixa o upload rápido em
 * conexão ruim e economiza a cota de storage do Supabase.
 * Se algo falhar (API não suportada, arquivo corrompido), devolve o
 * arquivo original em vez de travar o envio.
 */
export async function comprimirImagem(arquivo: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(arquivo);
    const escala = Math.min(1, DIMENSAO_MAXIMA / Math.max(bitmap.width, bitmap.height));
    const largura = Math.round(bitmap.width * escala);
    const altura = Math.round(bitmap.height * escala);

    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const contexto = canvas.getContext("2d");
    if (!contexto) return arquivo;
    contexto.drawImage(bitmap, 0, 0, largura, altura);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALIDADE_JPEG)
    );
    if (!blob || blob.size >= arquivo.size) return arquivo;

    return new File([blob], "foto.jpg", { type: "image/jpeg" });
  } catch {
    return arquivo;
  }
}
