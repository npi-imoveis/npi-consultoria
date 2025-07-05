// middleware.js
import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Debug logging para produção
  console.log(`[MIDDLEWARE] ============ INICIANDO ============`);
  console.log(`[MIDDLEWARE] Processando: ${pathname}`);
  console.log(`[MIDDLEWARE] User-Agent: ${request.headers.get('user-agent')?.substring(0, 50)}...`);

  // Verifica se a URL segue o padrão /imovel-:id (SEM slug)
  // Ex: /imovel-123 -> deve redirecionar para /imovel-123/slug
  if (pathname.match(/^\/imovel-([^\/]+)$/)) {
    const [, id] = pathname.match(/^\/imovel-([^\/]+)$/);
    console.log(`[MIDDLEWARE] URL sem slug detectada: ${pathname}, ID: ${id}`);

    try {
      // Busca o slug do imóvel no banco
      const apiUrl = new URL(`/api/imoveis/${id}`, request.nextUrl.origin);
      console.log(`[MIDDLEWARE] Buscando dados em: ${apiUrl.toString()}`);
      
      // Timeout mais agressivo para evitar problemas no Vercel
      const response = await fetch(apiUrl.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 segundos timeout
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
          // Se não tem slug, gera um básico baseado no nome do empreendimento
          const slugBasico = imovel?.Empreendimento 
            ? imovel.Empreendimento
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // Remove acentos
                .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
                .replace(/\s+/g, '-') // Substitui espaços por hífens
                .replace(/-+/g, '-') // Remove hífens duplos
                .replace(/^-|-$/g, '') // Remove hífens do início e fim
            : `imovel-${id}`;
          
          const url = request.nextUrl.clone();
          url.pathname = `/imovel-${id}/${slugBasico}`;
          console.log(`[MIDDLEWARE] Redirecionando para slug gerado: ${url.pathname}`);
          return NextResponse.redirect(url, 301); // Redirect permanente
        }
      } else {
        console.error(`[MIDDLEWARE] Erro na resposta da API: ${response.status} - ${response.statusText}`);
        // Em caso de erro na resposta, redireciona para slug genérico
        const url = request.nextUrl.clone();
        url.pathname = `/imovel-${id}/imovel-${id}`;
        console.log(`[MIDDLEWARE] Redirecionando para slug de erro: ${url.pathname}`);
        return NextResponse.redirect(url, 301);
      }
    } catch (error) {
      console.error('Erro ao buscar slug do imóvel:', error);
      // Em caso de erro, redireciona para slug genérico baseado no ID
      const url = request.nextUrl.clone();
      url.pathname = `/imovel-${id}/imovel-${id}`;
      console.log(`[MIDDLEWARE] Redirecionando para slug de catch: ${url.pathname}`);
      return NextResponse.redirect(url, 301);
    }
  }

  // 🔥 CORREÇÃO CRÍTICA: Verifica se a URL segue o padrão /imovel-:id/:slug (COM slug)
  // Ex: /imovel-123/apartamento-centro
  if (pathname.match(/^\/imovel-([^\/]+)\/(.+)$/)) {
    // Extrai o ID e o slug da URL
    const [, id, slug] = pathname.match(/^\/imovel-([^\/]+)\/(.+)$/);
    console.log(`[MIDDLEWARE] URL com slug detectada: ${pathname}, ID: ${id}, Slug: ${slug}`);

    // 🎯 CORREÇÃO: Preservar headers originais para meta tags
    const response = NextResponse.next();
    
    // 📍 ADICIONAR HEADERS PARA PRESERVAR META TAGS
    response.headers.set('x-pathname', pathname);
    response.headers.set('x-imovel-id', id);
    response.headers.set('x-imovel-slug', slug);
    
    // 🔧 REWRITE SEM PERDER CONTEXTO
    const url = request.nextUrl.clone();
    url.pathname = `/imovel/${id}/${slug}`;
    console.log(`[MIDDLEWARE] Reescrevendo para: ${url.pathname}`);

    // ⚡ MUDANÇA: Usar NextResponse.rewrite com headers preservados
    const rewriteResponse = NextResponse.rewrite(url);
    
    // Copiar headers importantes
    rewriteResponse.headers.set('x-pathname', pathname);
    rewriteResponse.headers.set('x-imovel-id', id);
    rewriteResponse.headers.set('x-imovel-slug', slug);
    
    return rewriteResponse;
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

  console.log(`[MIDDLEWARE] ============ FINALIZANDO ============`);
  console.log(`[MIDDLEWARE] Nenhuma regra aplicada, passando adiante: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Intercepta apenas rotas de imóveis para evitar problemas com outras rotas
    "/imovel-:path*",
    "/imovel/:path*",
  ],
};
