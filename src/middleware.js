// middleware.js
import { NextResponse } from "next/server";

export async function middleware(request) {
  const url = request.nextUrl.clone();
  const { pathname, origin } = url;

  console.log(`🔍 [MIDDLEWARE] =================== INÍCIO ===================`);
  console.log(`🔍 [MIDDLEWARE] Processando: ${pathname}`);
  console.log(`🔍 [MIDDLEWARE] Origin: ${origin}`);

  // 1. Match EXATO para URLs quebradas
  const match = pathname.match(/^\/imovel-(\d+)\/?$/);
  
  if (!match) {
    console.log(`🔍 [MIDDLEWARE] ❌ Não match para imovel-ID: ${pathname}`);
    
    // Verificar se é URL com slug
    const slugMatch = pathname.match(/^\/imovel-(\d+)\/(.+)$/);
    if (slugMatch) {
      const [, id, slug] = slugMatch;
      console.log(`🔍 [MIDDLEWARE] ✅ URL com slug detectada: ID=${id}, SLUG=${slug}`);
      console.log(`🔍 [MIDDLEWARE] Reescrevendo para: /imovel/${id}/${slug}`);
      
      const rewriteUrl = url.clone();
      rewriteUrl.pathname = `/imovel/${id}/${slug}`;
      return NextResponse.rewrite(rewriteUrl);
    }
    
    console.log(`🔍 [MIDDLEWARE] ➡️ Passando adiante: ${pathname}`);
    return NextResponse.next();
  }

  const id = match[1];
  console.log(`🔍 [MIDDLEWARE] ✅ Interceptou /imovel-${id}`);

  try {
    // Buscar dados via API interna (funciona no Edge Runtime)
    const apiUrl = new URL(`/api/imoveis/${id}`, origin);
    console.log(`🔍 [MIDDLEWARE] 📞 Chamando API: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    console.log(`🔍 [MIDDLEWARE] 📞 API Response: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      const imovel = data.data;
      
      console.log(`🔍 [MIDDLEWARE] 📊 Dados do imóvel:`, { 
        Codigo: imovel?.Codigo, 
        Slug: imovel?.Slug, 
        Empreendimento: imovel?.Empreendimento?.substring(0, 30) 
      });
      
      if (imovel?.Slug) {
        const redirectUrl = `/imovel-${id}/${imovel.Slug}`;
        console.log(`🔍 [MIDDLEWARE] ✅ Redirecionando para: ${redirectUrl}`);
        return NextResponse.redirect(new URL(redirectUrl, origin), 301);
      } else if (imovel?.Empreendimento) {
        // Gerar slug básico se não existir
        const slugBasico = imovel.Empreendimento
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove acentos
          .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
          .replace(/\s+/g, '-') // Substitui espaços por hífens
          .replace(/-+/g, '-') // Remove hífens duplos
          .replace(/^-|-$/g, '') // Remove hífens do início e fim
          || `imovel-${id}`;
        
        const redirectUrl = `/imovel-${id}/${slugBasico}`;
        console.log(`🔍 [MIDDLEWARE] ✅ Redirecionando para slug gerado: ${redirectUrl}`);
        return NextResponse.redirect(new URL(redirectUrl, origin), 301);
      } else {
        console.log(`🔍 [MIDDLEWARE] ❌ Imóvel sem Slug nem Empreendimento`);
      }
    } else {
      console.log(`🔍 [MIDDLEWARE] ❌ API falhou: ${response.status}`);
    }
  } catch (error) {
    console.error('🔍 [MIDDLEWARE] ❌ Erro na API:', error.message);
  }

  const fallbackUrl = `/api/resolve-imovel-redirect/${id}`;
  console.log(`🔍 [MIDDLEWARE] 🔄 Fallback para: ${fallbackUrl}`);
  return NextResponse.redirect(new URL(fallbackUrl, origin), 302);
}

export const config = {
  matcher: [
    '/imovel-:id(\\d+)',           // /imovel-1715
    '/imovel-:id(\\d+)/',          // /imovel-1715/
    '/imovel-:id(\\d+)/:slug*',    // /imovel-1715/helbor-brooklin
  ],
};
