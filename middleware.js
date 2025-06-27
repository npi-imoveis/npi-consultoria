import { NextResponse } from 'next/server';

export async function middleware(request) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Verifica se é uma rota de imóvel sem slug (ex: /imovel-9507)
  const imovelPattern = /^\/imovel-(\d+)(\/)?$/;
  const match = pathname.match(imovelPattern);

  if (match && !match[2]) { // Se tem número mas não tem barra no final
    const id = match[1];
    
    try {
      // Faz a chamada para a API interna para obter o slug completo
      const apiUrl = new URL(`/api/get-slug-by-id/${id}`, request.url);
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.slug) {
          // Redireciona para a URL completa
          return NextResponse.redirect(new URL(`/imovel-${id}/${data.slug}`, request.url));
        }
      }
    } catch (error) {
      console.error('Error fetching slug:', error);
      // Pode redirecionar para uma página genérica ou manter o 404
    }
  }

  // Se não for uma rota de imóvel ou ocorrer erro, continua normalmente
  return NextResponse.next();
}

export const config = {
  matcher: ['/imovel-:id*'], // Aplica apenas a rotas que começam com /imovel-
};
