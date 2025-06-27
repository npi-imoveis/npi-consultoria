// middleware.js
import { NextResponse } from 'next/server';

// Fallback para os slugs mais acessados
const FALLBACK_SLUGS = {
  '9507': 'avenida-antonio-joaquim-de-moura-andrade-597',
  // Adicione outros mapeamentos necessários
};

export async function middleware(request) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Debug: verifique se o middleware está sendo executado
  console.log(`Middleware processing: ${pathname}`);

  const imovelPattern = /^\/imovel-(\d+)(\/)?$/;
  const match = pathname.match(imovelPattern);

  if (match && !match[2]) {
    const id = match[1];
    console.log(`Tentando redirecionar imóvel ID: ${id}`);

    // 1. Tenta usar o fallback primeiro
    if (FALLBACK_SLUGS[id]) {
      console.log(`Usando fallback para ID ${id}`);
      return NextResponse.redirect(
        new URL(`/imovel-${id}/${FALLBACK_SLUGS[id]}`, request.url),
        301
      );
    }

    // 2. Tenta chamar a API
    try {
      const apiUrl = new URL(`/api/get-slug-by-id/${id}`, request.url);
      console.log(`Chamando API: ${apiUrl.toString()}`);
      
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Resposta da API:', data);
        
        if (data?.slug) {
          return NextResponse.redirect(
            new URL(`/imovel-${id}/${data.slug}`, request.url),
            301
          );
        }
      }
    } catch (error) {
      console.error('Erro na chamada da API:', error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/imovel-:id*'],
};
