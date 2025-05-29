// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Verifica se a URL segue o padrão /imovel-:id/:slug
  // Ex: /imovel-123/apartamento-centro
  if (pathname.match(/^\/imovel-([^\/]+)\/(.+)$/)) {
    // Extrai o ID e o slug da URL
    const [, id, slug] = pathname.match(/^\/imovel-([^\/]+)\/(.+)$/);

    // Cria a nova URL interna para processamento
    const url = request.nextUrl.clone();
    url.pathname = `/imovel/${id}/${slug}`;

    // Reescreve a URL internamente sem mudar a URL visível para o usuário
    return NextResponse.rewrite(url);
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
    "/imovel-:id/:slug*",
    // Também intercepta rotas como /imovel/123/nome-do-imovel para redirecionar
    "/imovel/:id/:slug*",
  ],
};
