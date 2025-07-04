// middleware.js
import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Debug logging para produção
  console.log(`[MIDDLEWARE] Processando: ${pathname}`);

  // Verifica se a URL segue o padrão /imovel-:id (SEM slug)
  // Ex: /imovel-123 -> deve redirecionar para /imovel-123/slug
  if (pathname.match(/^\/imovel-([^\/]+)$/)) {
    const [, id] = pathname.match(/^\/imovel-([^\/]+)$/);
    console.log(`[MIDDLEWARE] URL sem slug detectada: ${pathname}, ID: ${id}`);

    try {
      // Busca o slug do imóvel no banco
      const apiUrl = new URL(`/api/imoveis/${id}`, request.nextUrl.origin);
      console.log(`[MIDDLEWARE] Buscando dados em: ${apiUrl.toString()}`);
      const response = await fetch(apiUrl.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const imovel = data.data;
        
        if (imovel?.Slug) {
          // Redireciona para a URL com slug
          const url = request.nextUrl.clone();
          url.pathname = `/imovel-${id}/${imovel.Slug}`;
          console.log(`[MIDDLEWARE] Redirecionando para: ${url.pathname}`);
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
      } else {
        console.error(`[MIDDLEWARE] Erro na resposta da API: ${response.status}`);
        // Em caso de erro na resposta, redireciona para slug genérico
        const url = request.nextUrl.clone();
        url.pathname = `/imovel-${id}/imovel`;
        return NextResponse.redirect(url, 301);
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
    console.log(`[MIDDLEWARE] URL com slug detectada: ${pathname}, ID: ${id}, Slug: ${slug}`);

    // Cria a nova URL interna para processamento
    const url = request.nextUrl.clone();
    url.pathname = `/imovel/${id}/${slug}`;
    console.log(`[MIDDLEWARE] Reescrevendo para: ${url.pathname}`);

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
    // Intercepta apenas rotas de imóveis para evitar problemas com outras rotas
    "/imovel-:path*",
    "/imovel/:path*",
  ],
};
