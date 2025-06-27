import { NextResponse } from 'next/server';

export async function middleware(request) {
  const url = request.nextUrl;
  const pathname = url.pathname;
  
  // Log inicial para verificar se o middleware está sendo acionado
  console.log('🛠️ Middleware executado para URL:', request.url);
  console.log('🔍 Pathname analisado:', pathname);

  // Verifica se é uma rota de imóvel sem slug
  const imovelPattern = /^\/imovel-(\d+)(\/)?$/;
  const match = pathname.match(imovelPattern);

  if (match) {
    console.log('✅ Padrão de imóvel identificado');
    const id = match[1];
    const hasTrailingSlash = match[2];
    
    console.log(`📌 ID extraído: ${id}`);
    console.log(`🔗 Tem barra no final?: ${hasTrailingSlash ? 'Sim' : 'Não'}`);

    if (!hasTrailingSlash) {
      try {
        const apiUrl = new URL(`/api/get-slug-by-id/${id}`, request.url);
        console.log('🌐 Chamando API:', apiUrl.toString());

        const response = await fetch(apiUrl);
        console.log('📡 Status da resposta:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('📦 Dados recebidos:', JSON.stringify(data));

          if (data.slug) {
            const destination = new URL(`/imovel-${id}/${data.slug}`, request.url);
            console.log('↪️ Redirecionando para:', destination.toString());
            return NextResponse.redirect(destination, 301); // 301 permanente para SEO
          } else {
            console.warn('⚠️ Slug não encontrado nos dados da API');
          }
        } else {
          console.error('❌ Erro na resposta da API:', response.statusText);
        }
      } catch (error) {
        console.error('💥 Erro durante o fetch:', error.message);
      }
    }
  } else {
    console.log('➡️ Não é uma rota de imóvel, passando adiante');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/imovel-:id*'],
};
