// middleware.js
import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  console.log(`[MIDDLEWARE] Processando: ${pathname}`); // Mantenha os logs para debug

  // 1. TRATA URLs com o prefixo '/imovel-' (com ou sem slug)
  // Exemplos: /imovel-9507, /imovel-9507/, /imovel-9507/nome-do-imovel
  // Objetivo: Reescrever internamente para o formato /imovel/[id]/[slug]
  // Se o slug estiver ausente, um slug temporário será usado.
  if (pathname.match(/^\/imovel-(\d+)(?:\/(.*))?$/)) { // Regex ajustada para capturar opcionalmente o slug
    const [, id, slug] = pathname.match(/^\/imovel-(\d+)(?:\/(.*))?$/);
    console.log(`[MIDDLEWARE] URL de imóvel detectada: ${pathname}, ID: ${id}, Slug (original): ${slug}`);

    // Se a URL original tinha um slug, usa ele.
    // Caso contrário (URL como /imovel-9507 ou /imovel-9507/), usa um slug temporário.
    const targetSlug = slug || 'temp-slug-for-redirect'; // Use um slug temporário se não houver

    const url = request.nextUrl.clone();
    url.pathname = `/imovel/${id}/${targetSlug}`; // Reescreve para o caminho interno /imovel/[id]/[slug]
    
    console.log(`[MIDDLEWARE] Reescrevendo para rota interna: ${url.pathname}`);
    return NextResponse.rewrite(url);
  }

  // 2. TRATA URLs no formato antigo '/imovel/:id/:slug'
  // Exemplo: /imovel/123/nome-do-imovel
  // Objetivo: Redirecionar para o novo formato '/imovel-:id/:slug' (visível para o usuário)
  if (pathname.match(/^\/imovel\/(\d+)\/(.+)$/)) {
    const [, id, slug] = pathname.match(/^\/imovel\/(\d+)\/(.+)$/);
    const url = request.nextUrl.clone();
    url.pathname = `/imovel-${id}/${slug}`;
    
    console.log(`[MIDDLEWARE] Redirecionando formato antigo para: ${url.pathname}`);
    return NextResponse.redirect(url, 301);
  }

  console.log(`[MIDDLEWARE] Nenhuma regra aplicada, passando adiante: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/imovel-:path*", // Captura /imovel-ID e /imovel-ID/slug
    "/imovel/:path*", // Captura /imovel/ID e /imovel/ID/slug
  ],
};
