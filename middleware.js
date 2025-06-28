import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // ✅ 1. Reescreve /imovel-123/slug → /imovel/123/slug
  if (pathname.match(/^\/imovel-([^\/]+)\/(.+)$/)) {
    const [, id, slug] = pathname.match(/^\/imovel-([^\/]+)\/(.+)$/);
    const url = request.nextUrl.clone();
    url.pathname = `/imovel/${id}/${slug}`;
    return NextResponse.rewrite(url);
  }

  // ✅ 2. Redireciona /imovel/123/slug → /imovel-123/slug
  if (pathname.match(/^\/imovel\/([^\/]+)\/(.+)$/)) {
    const [, id, slug] = pathname.match(/^\/imovel\/([^\/]+)\/(.+)$/);
    const url = request.nextUrl.clone();
    url.pathname = `/imovel-${id}/${slug}`;
    return NextResponse.redirect(url);
  }

  // ✅ 3. Redireciona /imovel/123 → /imovel-123/__ (slug placeholder)
  if (pathname.match(/^\/imovel\/([^\/]+)\/?$/)) {
    const [, id] = pathname.match(/^\/imovel\/([^\/]+)\/?$/);
    const url = request.nextUrl.clone();
    url.pathname = `/imovel-${id}/__`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/imovel-:id/:slug*",
    "/imovel/:id/:slug*",
    "/imovel/:id", // 👈 necessário para capturar /imovel/123
  ],
};
