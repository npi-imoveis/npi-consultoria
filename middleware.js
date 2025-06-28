// middleware.js
import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Captura URLs SEM slug (ex: /imovel-9507)
  if (pathname.match(/^\/imovel-([^\/]+)$/)) {
    const [, id] = pathname.match(/^\/imovel-([^\/]+)$/);
    const slugCorreto = await getSlugPorId(id); // Implemente esta função!

    if (slugCorreto) {
      const url = request.nextUrl.clone();
      url.pathname = `/imovel-${id}/${slugCorreto}`;
      return NextResponse.redirect(url, 301); // Use 301 para SEO
    }
  }

  // 2. Rotas com slug (mantenha seu código existente)
  if (pathname.match(/^\/imovel-([^\/]+)\/(.+)$/)) {
    const [, id, slug] = pathname.match(/^\/imovel-([^\/]+)\/(.+)$/);
    const url = request.nextUrl.clone();
    url.pathname = `/imovel/${id}/${slug}`;
    return NextResponse.rewrite(url);
  }

  // 3. Redireciona /imovel/:id/:slug para /imovel-:id/:slug
  if (pathname.match(/^\/imovel\/([^\/]+)\/(.+)$/)) {
    const [, id, slug] = pathname.match(/^\/imovel\/([^\/]+)\/(.+)$/);
    const url = request.nextUrl.clone();
    url.pathname = `/imovel-${id}/${slug}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/imovel-:id",          // ✅ Novo: captura /imovel-9507
    "/imovel-:id/:slug*",   // Mantido
    "/imovel/:id/:slug*"    // Mantido
  ],
};

// Implementação exemplo (substitua pela sua lógica real)
async function getSlugPorId(id) {
  // Exemplo: buscar slug de uma API ou banco de dados
  const slugs = {
    "9507": "avenida-antonio-joaquim-de-moura-andrade-597",
    // Adicione outros IDs e slugs conforme necessário
  };
  return slugs[id] || null;
}
