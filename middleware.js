// middleware.js
import { NextResponse } from 'next/server';

// Cache simples em memória (opcional para URLs prioritárias)
const CACHE_REDIRECTS = new Map([
  ['9507', 'avenida-antonio-joaquim-de-moura-andrade-597'],
  ['80867', 'edificio-searpa']
  // Adicione outros IDs críticos
]);

export async function middleware(request) {
  const url = request.nextUrl;
  const path = url.pathname;

  // Captura padrão /imovel-XXXX
  const match = path.match(/^\/imovel-(\d+)(?:\/|$)/);
  
  if (!match) return NextResponse.next();

  const id = match[1];
  
  // 1. Verifica cache de emergência
  if (CACHE_REDIRECTS.has(id)) {
    return NextResponse.redirect(
      new URL(`/imovel-${id}/${CACHE_REDIRECTS.get(id)}`, url),
      301
    );
  }

  // 2. Consulta API dinâmica
  try {
    const apiUrl = new URL(`/api/get-slug-by-id/${id}`, url.origin);
    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 } // Cache de 1h
    });

    if (response.ok) {
      const { slug } = await response.json();
      if (slug) {
        return NextResponse.redirect(
          new URL(`/imovel-${id}/${slug}`, url),
          301
        );
      }
    }
  } catch (error) {
    console.error(`Middleware error for ID ${id}:`, error);
  }

  // 3. Fallback para página de busca
  return NextResponse.rewrite(new URL('/busca', url));
}

export const config = {
  matcher: ['/imovel-:id*']
};
