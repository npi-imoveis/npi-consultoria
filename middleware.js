// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. TRATA URLs com o prefixo '/imovel-' (com ou sem slug)
  // Exemplos: /imovel-9507, /imovel-9507/, /imovel-9507/nome-do-imovel
  // Objetivo: Reescrever internamente para o formato /imovel/[id]/[slug]
  // Se o slug estiver ausente, um slug temporário será usado.
  if (pathname.match(/^\/imovel-(\d+)(?:\/(.*))?$/)) {
    const [, id, slug] = pathname.match(/^\/imovel-(\d+)(?:\/(.*))?$/);
    const url = request.nextUrl.clone();

    // Se a URL original tinha um slug, usa ele.
    // Caso contrário (URL como /imovel-9507 ou /imovel-9507/), usa um slug temporário.
    // Sua página de imóvel (e.g., pages/imovel/[id]/[slug].js) receberá este slug.
    // Ela deve ignorar 'temp-slug-for-redirect' e buscar o slug correto para o ID.
    url.pathname = `/imovel/${id}/${slug || 'temp-slug-for-redirect'}`;
    
    // Reescreve a URL internamente sem mudar a URL visível para o usuário.
    // Isso faz com que sua página de imóvel seja carregada.
    return NextResponse.rewrite(url);
  }

  // 2. TRATA URLs no formato antigo '/imovel/:id/:slug'
  // Exemplo: /imovel/123/nome-do-imovel
  // Objetivo: Redirecionar para o novo formato '/imovel-:id/:slug' (visível para o usuário)
  if (pathname.match(/^\/imovel\/(\d+)\/(.+)$/)) {
    const [, id, slug] = pathname.match(/^\/imovel\/(\d+)\/(.+)$/);
    const url = request.nextUrl.clone();
    url.pathname = `/imovel-${id}/${slug}`;
    
    // Redireciona o usuário para a URL no formato correto.
    return NextResponse.redirect(url);
  }

  // Se nenhuma das regras acima corresponder, continua o processamento normal.
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Intercepta rotas como /imovel-123 e /imovel-123/nome-do-imovel
    "/imovel-:id/:slug*",
    // Também intercepta rotas como /imovel/123/nome-do-imovel para redirecionar
    "/imovel/:id/:slug*",
  ],
};
