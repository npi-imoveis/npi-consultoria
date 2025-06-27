import { NextResponse } from 'next/server';

export async function middleware(request) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Padrão para URLs de imóvel
  const imovelPattern = /^\/imovel-(\d+)(\/)?$/;
  const match = pathname.match(imovelPattern);

  if (match && !match[2]) {
    const id = match[1];
    
    try {
      const apiUrl = new URL(`/api/get-slug-by-id/${id}`, request.url);
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.slug) {
          return NextResponse.redirect(
            new URL(`/imovel-${id}/${data.slug}`, request.url),
            301 // Redirecionamento permanente
          );
        }
      }
    } catch (error) {
      console.error('Erro no middleware:', error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/imovel-:id*']
};
