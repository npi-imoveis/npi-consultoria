// middleware.js
import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname, origin } = request.nextUrl;

  // Trata URLs que possuem apenas o ID e estão sem slug
  // Ex: /imovel-9507
  if (pathname.match(/^\/imovel-([^/]+)$/)) {
    const [, id] = pathname.match(/^\/imovel-([^/]+)$/);

    try {
      // Faz a chamada para a mesma API já utilizada na renderização
      const apiResponse = await fetch(`${origin}/api/get-slug/${id}`);
      if (apiResponse.ok) {
        const { slug } = await apiResponse.json();

        if (slug) {
          // Constrói a URL final com o slug correto e redireciona (301)
          const newUrl = `${origin}/imovel-${id}/${slug}`;
          return NextResponse.redirect(newUrl, 301);
        }
      }
    } catch (error) {
      console.error(`Erro ao buscar slug para o ID ${id}:`, error);
    }
    // Se a API falhar, continua o fluxo padrão, resultando em 404
    return NextResponse.next();
  }

  // Verifica se a URL segue o padrão correto /imovel-:id/:slug
  if (pathname.match(/^\/imovel-([^/]+)\/(.+)$/)) {
    const [, id, slug] = pathname.match(/^\/imovel-([^/]+)\/(.+)$/);

    // Serve a página diretamente, reescrevendo para a rota interna
    const url = request.nextUrl.clone();
    url.pathname = `/imovel/${id}/${slug}`;
    return NextResponse.rewrite(url);
  }

  // Regras possíveis: ajusta URLs no formato histórico (/imovel/:id/:slug)
  if (pathname.match(/^\/imovel\/([^/]+)\/(.+)$/)) {
    const [, id, slug] = pathname.match(/^\/imovel\/([^/]+)\/(.+)$/);

    const url = request.nextUrl.clone();
    url.pathname = `/imovel-${id}/${slug}`;
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Intercepta URLs como /imovel-:id (sem slug)
    "/imovel-:id",
    // Intercepta URLs completas como /imovel-:id/:slug
    "/imovel-:id/:slug*",
    // Intercepta URLs históricas como /imovel/:id/:slug
    "/imovel/:id/:slug*",
  ],
};
