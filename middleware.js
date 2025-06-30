// -----------------------------------------------------------------------------
// middleware.js
// -----------------------------------------------------------------------------
// Este middleware do Next.js intercepta rotas de imóveis para garantir que
// todas as URLs estejam no formato canônico, ou seja, sempre com o slug.
// Se o usuário acessar uma URL como /imovel-9507 (sem slug), o middleware
// busca o slug correto via API e faz um redirecionamento 301 para a URL
// completa, ex: /imovel-9507/avenida-antonio-joaquim-de-moura-andrade-597.
// Isso evita páginas 404 indexadas, melhora o SEO e garante consistência.
//
// Também mantém a lógica anterior de reescrita/redirect entre os formatos
// /imovel-:id/:slug e /imovel/:id/:slug.
//
// O matcher garante que apenas as rotas relevantes sejam interceptadas.
// -----------------------------------------------------------------------------

import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname, origin } = request.nextUrl;

  // 1. Redirecionar /imovel-:id (sem slug) para /imovel-:id/:slug
  const matchSemSlug = pathname.match(/^\/imovel-([^\/]+)$/);
  if (matchSemSlug) {
    const id = matchSemSlug[1];

    // Buscar o slug via API interna
    try {
      const res = await fetch(`${origin}/api/imoveis/${id}`, { next: { revalidate: 60 } });
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
    // Intercepta rotas como /imovel-123, /imovel-123/nome-do-imovel
    "/imovel-:id/:slug*",
    "/imovel-:id",
    // Também intercepta rotas como /imovel/123/nome-do-imovel para redirecionar
    "/imovel/:id/:slug*",
  ],
};
