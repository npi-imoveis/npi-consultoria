// middleware.js
import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/imovel-:id*'], // Captura apenas URLs iniciando com /imovel-
};

export async function middleware(request) {
  const { pathname, origin } = request.nextUrl;

  // 1️⃣ Checa se já existe slug (tem mais de uma /)
  const match = pathname.match(/^\/imovel-(\d+)(?:\/([^/]+))?\/?$/);

  if (match) {
    const id = match[1];
    const existingSlug = match[2];

    // ✅ Se já existe slug, NÃO redireciona
    if (existingSlug) {
      return NextResponse.next();
    }

    try {
      const apiUrl = `${origin}/api/get-slug-by-id/${id}`;
      const response = await fetch(apiUrl, { cache: 'no-store' });

      if (response.ok) {
        const data = await response.json();

        if (data?.slug) {
          // Redireciona somente se slug foi encontrado
          const redirectUrl = `${origin}/imovel-${id}/${data.slug}`;
          return NextResponse.redirect(redirectUrl, 301);
        }
      }
    } catch (error) {
      console.error(`Erro no middleware para ID ${id}:`, error);
    }

    // Se não encontrar slug, redireciona para a busca como fallback
    return NextResponse.redirect(`${origin}/busca`, 302);
  }

  return NextResponse.next();
}
