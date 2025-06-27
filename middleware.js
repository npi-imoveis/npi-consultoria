import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/imovel-:id*'],
};

export async function middleware(request) {
  const { pathname, origin } = request.nextUrl;

  // Novo regex: intercepte apenas se NÃO houver slug após o ID
  const match = pathname.match(/^\/imovel-(\d+)\/?$/);

  if (match) {
    const id = match[1];

    try {
      const apiUrl = `${origin}/api/get-slug-by-id/${id}`;
      const response = await fetch(apiUrl, { cache: 'no-store' });

      if (response.ok) {
        const data = await response.json();

        if (data?.slug) {
          const redirectUrl = `${origin}/imovel-${id}/${data.slug}`;
          return NextResponse.redirect(redirectUrl, 301);
        }
      }
    } catch (error) {
      console.error(`Erro no middleware para ID ${id}:`, error);
    }

    return NextResponse.redirect(`${origin}/busca`, 302);
  }

  // Se a URL já contém o slug (ex: /imovel-9507/slug), NÃO faz nada
  return NextResponse.next();
}
