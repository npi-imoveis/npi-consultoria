import { NextResponse } from "next/server";

// Cache de emergência para redirecionamentos críticos
const CRITICAL_REDIRECTS = new Map([
  ['9507', 'avenida-antonio-joaquim-de-moura-andrade-597'],
  ['80867', 'edificio-searpa'],
  // Adicione outros IDs críticos conforme necessário
]);

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  // 1. Caso 1: URL quebrada sem slug (ex: /imovel-9507)
  const brokenUrlMatch = pathname.match(/^\/imovel-(\d+)(?:\/)?$/);
  if (brokenUrlMatch) {
    const id = brokenUrlMatch[1];
    
    // 1a. Verifica cache de emergência
    if (CRITICAL_REDIRECTS.has(id)) {
      return NextResponse.redirect(
        new URL(`/imovel-${id}/${CRITICAL_REDIRECTS.get(id)}`, url),
        301
      );
    }

    // 1b. Busca o slug via API
    try {
      const apiUrl = new URL(`/api/get-slug-by-id/${id}`, url.origin);
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const { slug } = await response.json();
        if (slug) {
          return NextResponse.redirect(
            new URL(`/imovel-${id}/${slug}`, url),
            301
          );
        }
      }
    } catch (error) {
      console.error(`Middleware error for ID ${id}:`, error);
    }

    // 1c. Fallback para página de busca
    return NextResponse.rewrite(new URL('/busca', url));
  }

  // 2. Caso 2: URL formatada corretamente (/imovel-:id/:slug)
  const formattedMatch = pathname.match(/^\/imovel-([^\/]+)\/(.+)$/);
  if (formattedMatch) {
    const [, id, slug] = formattedMatch;
    url.pathname = `/imovel/${id}/${slug}`;
    return NextResponse.rewrite(url);
  }

  // 3. Caso 3: URL no formato antigo (/imovel/:id/:slug)
  const oldFormatMatch = pathname.match(/^\/imovel\/([^\/]+)\/(.+)$/);
  if (oldFormatMatch) {
    const [, id, slug] = oldFormatMatch;
    url.pathname = `/imovel-${id}/${slug}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/imovel-:id*",         // Captura URLs quebradas
    "/imovel-:id/:slug*",   // Formato correto
    "/imovel/:id/:slug*",   // Formato antigo
  ],
};
