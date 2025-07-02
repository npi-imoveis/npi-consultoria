// middleware.js
//
// Este middleware serve apenas para normalizar rotas de imóveis, garantindo que URLs como /imovel/123/slug sejam reescritas para /imovel-123/slug e vice-versa.
// Não faz acesso ao banco de dados, apenas manipula a URL para manter o padrão canônico e evitar conteúdo duplicado.
//
import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Reescreve /imovel-123/slug para /imovel/123/slug (rota interna)
  const matchHifen = pathname.match(/^\/imovel-(\d+)\/(.+)$/);
  if (matchHifen) {
    const [, id, slug] = matchHifen;
    const url = request.nextUrl.clone();
    url.pathname = `/imovel/${id}/${slug}`;
    return NextResponse.rewrite(url);
  }

  // Redireciona /imovel/123/slug para /imovel-123/slug (URL canônica)
  const matchBarra = pathname.match(/^\/imovel\/(\d+)\/(.+)$/);
  if (matchBarra) {
    const [, id, slug] = matchBarra;
    const url = request.nextUrl.clone();
    url.pathname = `/imovel-${id}/${slug}`;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/imovel-:id/:slug*",
    "/imovel/:id/:slug*",
  ],
};
