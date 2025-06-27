// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // NOVO: Trata URLs como /imovel-9507/ ou /imovel-9507 (sem slug)
  // O objetivo é reescrever para o formato interno /imovel/[id]/[slug_temporario]
  // para que a página do imóvel possa lidar com o redirecionamento para o slug correto.
  // Esta regra deve vir antes das outras para garantir que URLs sem slug sejam capturadas primeiro.
  if (pathname.match(/^\/imovel-(\d+)\/?$/)) {
    const [, id] = pathname.match(/^\/imovel-(\d+)\/?$/);
    const url = request.nextUrl.clone();
    // Reescreve para o caminho interno /imovel/[id]/[slug_temporario]
    // O 'temp-slug-for-redirect' é um slug temporário.
    // Sua página de imóvel (e.g., pages/imovel/[id]/[slug].js) deve ser capaz de:
    // 1. Receber o 'id' e o 'slug' (que será 'temp-slug-for-redirect').
    // 2. Ignorar 'temp-slug-for-redirect' e buscar o slug correto com base no 'id'.
    // 3. Redirecionar o usuário para a URL com o slug correto (e.g., /imovel-9507/avenida-antonio-joaquim-de-moura-andrade-597).
    url.pathname = `/imovel/${id}/temp-slug-for-redirect`;
    return NextResponse.rewrite(url);
  }

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
