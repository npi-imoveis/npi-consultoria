import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/imovel-:id*'], // Captura todas as URLs /imovel-XXXX
};

export async function middleware(request) {
  const { pathname, origin } = request.nextUrl;
  const match = pathname.match(/^\/imovel-(\d+)\/?$/);

  if (match) {
    const id = match[1];

    try {
      const apiUrl = `${origin}/api/get-slug-by-id/${id}`;
      const response = await fetch(apiUrl, { cache: 'no-store' });

      if (response.ok) {
        const data = await response.json();

        if (data?.slug) {
          // Redireciona para a URL correta
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
