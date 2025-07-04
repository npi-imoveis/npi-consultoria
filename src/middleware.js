// middleware.js
import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Verifica se a URL segue o padrão /imovel-:id (SEM slug)
  // Ex: /imovel-123 -> deve redirecionar para /imovel-123/slug
  if (pathname.match(/^\/imovel-([^\/]+)$/)) {
    const [, id] = pathname.match(/^\/imovel-([^\/]+)$/);

    try {
      // Busca o slug do imóvel no banco
      const apiUrl = new URL(`/api/imoveis/${id}`, request.url);
      const response = await fetch(apiUrl.toString());
      
      if (response.ok) {
        const data = await response.json();
        const imovel = data.data;
        
        if (imovel?.Slug) {
          // Redireciona para a URL com slug
          const url = request.nextUrl.clone();
          url.pathname = `/imovel-${id}/${imovel.Slug}`;
          return NextResponse.redirect(url, 301); // Redirect permanente
        } else {
          // Se não tem slug, gera um básico
          const slugBasico = imovel?.Empreendimento 
            ? imovel.Empreendimento
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // Remove acentos
                .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
                .replace(/\s+/g, '-') // Substitui espaços por hífens
                .replace(/-+/g, '-') // Remove hífens duplos
                .replace(/^-|-$/g, '') // Remove hífens do início e fim
            : 'imovel';
          
          const url = request.nextUrl.clone();
          url.pathname = `/imovel-${id}/${slugBasico}`;
          return NextResponse.redirect(url, 301); // Redirect permanente
        }
      }
    } catch (error) {
      console.error('Erro ao buscar slug do imóvel:', error);
      // Em caso de erro, redireciona para uma página de erro ou slug genérico
      const url = request.nextUrl.clone();
      url.pathname = `/imovel-${id}/imovel`;
      return NextResponse.redirect(url, 301);
    }
  }

  // Verifica se a URL segue o padrão /imovel-:id/:slug (COM slug)
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
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Intercepta rotas como /imovel-123 (sem slug) para redirecionar
    "/imovel-:id",
    // Intercepta rotas como /imovel-123/nome-do-imovel (com slug) para rewrite
    "/imovel-:id/:slug*",
    // Também intercepta rotas como /imovel/123/nome-do-imovel (com slug) para redirecionar
    "/imovel/:id/:slug*",
  ],
};
