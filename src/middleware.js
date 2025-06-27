// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 🔁 Caso 1: URL incompleta do tipo /imovel-12345/ → reescreve para /imovel/12345
  if (pathname.match(/^\/imovel-(\d+)\/?$/)) {
    const [, id] = pathname.match(/^\/imovel-(\d+)\/?$/);

    const url = request.nextUrl.clone();
    url.pathname = `/imovel/${id}`;

    return NextResponse.rewrite(url);
  }

  // 🔁 Caso 2: URL no formato antigo /imovel/12345/slug → redireciona para /imovel-12345/slug
  if (pathname.match(/^\/imovel\/([^\/]+)\/(.+)$/)) {
    const [, id, slug] = pathname.match(/^\/imovel\/([^\/]+)\/(.+)$/);

    const url = request.nextUrl.clone();
    url.pathname = `/imovel-${id}/${slug}`;

    return NextResponse.redirect(url);
  }

  // 🔁 Caso 3: URL já está no formato esperado /imovel-12345/slug → reescreve para /imovel/12345/slug
  if (pathname.match(/^\/imovel-([^\/]+)\/(.+)$/)) {
    const [, id, slug] = pathname.match(/^\/imovel-([^\/]+)\/(.+)$/);

    const url = request.nextUrl.clone();
    url.pathname = `/imovel/${id}/${slug}`;

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/imovel-:id",
    "/imovel-:id/:slug*",
    "/imovel/:id/:slug*",
  ],
};
