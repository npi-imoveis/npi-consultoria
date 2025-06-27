// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // ✅ Novo: Intercepta URLs do tipo /imovel-123/ (sem slug) e reescreve para /imovel-123/__
  if (pathname.match(/^\/imovel-(\d+)\/?$/)) {
    const [, id] = pathname.match(/^\/imovel-(\d+)\/?$/);

    const url = request.nextUrl.clone();
    url.pathname = `/imovel-${id}/__`;

    return NextResponse.rewrite(url);
  }

  // Verifica se a URL segue o padrão /imovel-:id/:slug
  // Ex: /imovel-123/apartamento-centro
  if (pathname.match(/^\/imovel-([^\/]+)\/(.+)$/)) {
    const [, id, slug] = pathname.match(/^\/imovel-([^\/]+)\/(.+)$/);

    const url = request.nextUrl.clone();
    url.pathname = `/imovel/${id}/${slug}`;

    return NextResponse.rewrite(url);
  }

  // Se alguém acessar diretamente o formato /imovel/:id/:slug, redireciona para /imovel-:id/:slug
  if (pathname.match(/^\/imovel\/([^\/]+)\/(.+)$/)) {
    const [, id, slug] = pathname.match(/^\/imovel\/([^\/]+)\/(.+)$/);

    const url = request.nextUrl.clone();
    url.pathname = `/imovel-${id}/${slug}`;

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Novo matcher para capturar /imovel-123/
    "/imovel-*/",
    // Intercepta /imovel-123/nome-do-imovel
    "/imovel-:id/:slug*",
    // Intercepta /imovel/123/nome-do-imovel
    "/imovel/:id/:slug*",
  ],
};
