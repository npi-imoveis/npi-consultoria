// -----------------------------------------------------------------------------
// middleware.js
// -----------------------------------------------------------------------------
// Este middleware garante que toda URL de imóvel SEM SLUG seja redirecionada
// para a URL canônica COM SLUG, buscando o slug correto via API interna.
// Isso evita indexação de páginas 404 e melhora o SEO.
// -----------------------------------------------------------------------------

import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname, origin } = request.nextUrl;

  // 1. Redirecionar /imovel-:id (sem slug) para /imovel-:id/:slug
  const matchSemSlug = pathname.match(/^\/imovel-([^\/]+)$/);
  if (matchSemSlug) {
    const id = matchSemSlug[1];

    try {
      // Busca o slug correto via API interna
      const res = await fetch(`${origin}/api/imoveis/${id}`);
      if (res.ok) {
        const data = await res.json();
        const slug = data?.data?.Slug;
        if (slug && typeof slug === "string") {
          // Redireciona para a URL canônica com slug
          return NextResponse.redirect(`${origin}/imovel-${id}/${slug}`, 301);
        }
      }
    } catch (e) {
      // Se der erro, segue para o 404 normalmente
    }
    // Se não encontrar slug, deixa cair no 404
    return NextResponse.next();
  }

  // 2. Reescreve /imovel-:id/:slug para /imovel/:id/:slug (internamente)
  if (pathname.match(/^\/imovel-([^\/]+)\/(.+)$/)) {
    const [, id, slug] = pathname.match(/^\/imovel-([^\/]+)\/(.+)$/);
    const url = request.nextUrl.clone();
    url.pathname = `/imovel/${id}/${slug}`;
    return NextResponse.rewrite(url);
  }

  // 3. Redireciona /imovel/:id/:slug para /imovel-:id/:slug (externamente)
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
    "/imovel-:id/:slug*",
    "/imovel-:id",
    "/imovel/:id/:slug*",
  ],
};
