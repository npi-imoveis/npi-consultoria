// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Debug log para entender as rotas interceptadas
  console.log('Middleware interceptou:', pathname);
  
  // INTERCEPTAÇÃO PRIORITÁRIA: URLs que começam com /imovel- seguido de números
  // Ex: /imovel-1715 ou /imovel-1715/slug
  if (pathname.match(/^\/imovel-(\d+)/)) {
    console.log('Detectou URL de imóvel:', pathname);
    
    // Verifica se tem slug ou não
    const matchComSlug = pathname.match(/^\/imovel-(\d+)\/(.+)$/);
    const matchSemSlug = pathname.match(/^\/imovel-(\d+)$/);
    
    if (matchComSlug) {
      // Tem slug - reescreve para estrutura interna
      const [, id, slug] = matchComSlug;
      const url = request.nextUrl.clone();
      url.pathname = `/imovel/${id}/${slug}`;
      console.log('Reescrevendo para:', url.pathname);
      return NextResponse.rewrite(url);
    } else if (matchSemSlug) {
      // Sem slug - redireciona para página intermediária
      const [, id] = matchSemSlug;
      const url = request.nextUrl.clone();
      url.pathname = `/imovel/${id}`;
      console.log('Redirecionando sem slug para:', url.pathname);
      return NextResponse.rewrite(url);
    }
  }


  // Se alguém acessar diretamente o formato /imovel/:id/:slug, redireciona para /imovel-:id/:slug
  if (pathname.match(/^\/imovel\/([^\/]+)\/(.+)$/)) {
    // Extrai o ID e o slug da URL
    const [, id, slug] = pathname.match(/^\/imovel\/([^\/]+)\/(.+)$/);

    // Cria a nova URL com o formato correto para exibição
    const url = request.nextUrl.clone();
    url.pathname = `/imovel-${id}/${slug}`;

    // Redireciona para a URL no formato correto (visível para o usuário)
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Intercepta rotas como /imovel-123/nome-do-imovel
    "/imovel-:path*",
    // Também intercepta rotas como /imovel/123/nome-do-imovel para redirecionar
    "/imovel/:path*",
  ],
};
