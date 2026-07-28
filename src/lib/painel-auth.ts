import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

export const PAINEL_COOKIE = "cidade_unida_sessao";

/** Gera hash+salt pra guardar a senha de uma cidade — usado só pelo script de cadastro. */
export function gerarSenhaHash(senha: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(senha, salt, 64).toString("hex");
  return { hash, salt };
}

/** Confere uma tentativa de senha contra o hash+salt guardados da cidade. */
export function senhaConfere(senhaTentativa: string, salt: string, hashEsperado: string): boolean {
  const tentativa = scryptSync(senhaTentativa, salt, 64);
  const esperado = Buffer.from(hashEsperado, "hex");
  return tentativa.length === esperado.length && timingSafeEqual(tentativa, esperado);
}

function tokenDeSessao(cidadeId: string, senhaHash: string): string {
  return createHash("sha256").update(`cidade-unida:${cidadeId}:${senhaHash}`).digest("hex");
}

/**
 * Valor salvo no cookie após login bem-sucedido. Amarrado ao hash de senha
 * atual da cidade: se a senha da cidade mudar, todo cookie antigo invalida
 * sozinho (o token esperado muda junto).
 */
export function gerarCookieSessao(cidadeId: string, senhaHash: string): string {
  return tokenDeSessao(cidadeId, senhaHash);
}

/** Confere se o cookie é válido especificamente para esta cidade (não serve pra outra). */
export function sessaoValidaParaCidade(
  cookieValue: string | undefined,
  cidadeId: string,
  senhaHashAtual: string
): boolean {
  if (!cookieValue) return false;
  const esperado = Buffer.from(tokenDeSessao(cidadeId, senhaHashAtual));
  const recebido = Buffer.from(cookieValue);
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido);
}
