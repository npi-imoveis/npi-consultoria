// middleware.js

import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname, origin } = request.nextUrl;

  // Detecta URLs no formato /imovel-9507
  const match = pathname.match(/^\/imovel-(\d+)\/?$/);

  if (match) {
    const id = match[1];

    // Consulta o slug correto no seu endpoint
    const res = await fetch(`${origin}/api/get-slug-by-id?id=${id}`);

    if (res.ok) {
      const data = await res.json();
      const slug = data.slug;

      if (slug) {
        // Redireciona para a URL completa e funcional
        return NextResponse.redirect(`${origin}/imovel/${id}/${slug}`);
      }
    }

    // Se não encontrar slug, redireciona para home ou página de erro amigável
    return NextResponse.redirect(origin);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/imovel-:path*'],
};
