import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PAINEL_COOKIE } from "@/lib/painel-auth";

/**
 * Barreira rápida, sem tocar no banco: só confere se existe um cookie de
 * sessão. A validação de verdade (o cookie realmente bate com a senha atual
 * DESTA cidade) acontece em painel/page.tsx e nas server actions, que já
 * precisam buscar a cidade no banco mesmo — ver data-security guide do Next.js
 * sobre não confiar só no proxy para autenticação.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/painel/login")) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(PAINEL_COOKIE)?.value;
  if (cookie) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const loginUrl = new URL("/painel/login", request.url);
  loginUrl.searchParams.set("proximo", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/painel/:path*", "/api/painel/:path*"],
};
